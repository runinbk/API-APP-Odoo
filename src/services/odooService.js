import axios from 'axios';
import config from '../config/config.js';

class OdooService {
    constructor() {
        this.baseUrl = config.odooConfig.baseUrl;
        this.db = config.odooConfig.db;
    }

    async authenticate(login, password) {
        try {
            console.log('Intentando autenticar:', {
                url: this.baseUrl,
                db: this.db,
                login
            });

            const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'common',
                    method: 'authenticate',
                    args: [
                        this.db,
                        login,
                        password,
                        {}
                    ]
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error.data?.message || 'Error de autenticación');
            }

            const uid = response.data.result;
            if (!uid) {
                throw new Error('Credenciales inválidas');
            }

            // Obtener información del usuario y sus grupos
            const userInfo = await this.execute(
                uid,
                password,
                'res.users',
                'read',
                [[uid]],
                { 
                    fields: ['name', 'login', 'email', 'groups_id']
                }
            );

            // Obtener el rol basado en los grupos
            const role = await this.determineRoleFromGroups(uid, password, userInfo[0].groups_id);

            return {
                uid,
                ...userInfo[0],
                role
            };
        } catch (error) {
            console.error('Error de autenticación:', error);
            throw error;
        }
    }

    async determineRoleFromGroups(uid, password, groupIds) {
        try {
            // Obtener los nombres externos (xml_id) de los grupos
            const groups = await this.execute(
                uid,
                password,
                'res.groups',
                'read',
                [groupIds],
                { fields: ['name'] }
            );

            const groupNames = groups.map(g => g.name.toLowerCase());

            // Determinar rol basado en los grupos
            if (groupNames.some(name => name.includes('administrativo'))) {
                return 'admin';
            }
            if (groupNames.some(name => name.includes('profesor'))) {
                return 'teacher';
            }
            if (groupNames.some(name => name.includes('tutor'))) {
                return 'tutor';
            }
            if (groupNames.some(name => name.includes('alumno'))) {
                return 'student';
            }

            return 'user';
        } catch (error) {
            console.error('Error determinando rol:', error);
            return 'user';
        }
    }

    async execute(uid, password, model, method, args = [], kwargs = {}) {
        try {
            const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [
                        this.db,
                        uid,
                        password,
                        model,
                        method,
                        args,
                        kwargs
                    ]
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error.data?.message || 'Error en Odoo');
            }

            return response.data.result;
        } catch (error) {
            console.error('Error en execute:', error);
            throw error;
        }
    }
}

export default new OdooService();