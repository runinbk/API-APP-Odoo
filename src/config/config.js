import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  odooConfig: {
    baseUrl: process.env.ODOO_URL || 'http://localhost:8069',
    db: process.env.ODOO_DB || 'odoo',
  },
  openaiApiKey: process.env.OPENAI_API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};