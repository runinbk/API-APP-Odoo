import axios from 'axios';
import config from '../config/config.js';

class OdooService {
  constructor() {
    this.baseUrl = config.odooConfig.baseUrl;
    this.db = config.odooConfig.db;
  }

  async authenticate(login, password) {
    try {
      const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'authenticate',
          args: [this.db, login, password, {}]
        }
      });

      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('Authentication failed');
    } catch (error) {
      throw new Error(`Odoo authentication error: ${error.message}`);
    }
  }

  async executeKw(uid, password, model, method, args = [], kwargs = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [this.db, uid, password, model, method, args, kwargs]
        }
      });

      return response.data.result;
    } catch (error) {
      throw new Error(`Odoo execution error: ${error.message}`);
    }
  }
}

export default new OdooService();