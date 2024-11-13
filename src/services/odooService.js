import axios from 'axios';
import config from '../config/config.js';

class OdooService {
    constructor() {
        this.baseUrl = config.odooConfig.baseUrl;
        this.db = config.odooConfig.db;
    }

    async authenticate(login, password) {
        try {
            console.log('Intentando autenticar con:', {
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
                console.error('Error de autenticación Odoo:', response.data.error);
                throw new Error(response.data.error.data?.message || 'Error de autenticación');
            }

            if (!response.data.result) {
                throw new Error('Credenciales inválidas');
            }

            // Obtener información adicional del usuario
            const uid = response.data.result;
            const userInfo = await this.getUserInfo(uid, password);

            return {
                uid,
                ...userInfo
            };

        } catch (error) {
            console.error('Error detallado de autenticación:', error);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('No se puede conectar al servidor Odoo');
            }

            throw new Error(error.message || 'Error de autenticación');
        }
    }

    async getUserInfo(uid, password) {
        try {
            const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'object',
                    method: 'execute',
                    args: [
                        this.db,
                        uid,
                        password,
                        'res.users',
                        'read',
                        [uid],
                        ['name', 'email', 'login']
                    ]
                }
            });

            return response.data.result[0];
        } catch (error) {
            console.error('Error obteniendo información del usuario:', error);
            return {};
        }
    }
}

export default new OdooService();