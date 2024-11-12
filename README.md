# ODOO - MOBILE - GATEWAY

## Estructura de carpetas:
```
odoo-mobile-gateway/
├── .env
├── package.json
├── src/
│   ├── config/
│   │   └── config.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── teacher.routes.js
│   │   ├── student.routes.js
│   │   └── tutor.routes.js
│   ├── services/
│   │   ├── odooService.js
│   │   └── openaiService.js
│   └── index.js
└── README.md
```

## Para inicializar el proyecto

Sigue estos pasos:

1. Crear el directorio y inicializar el proyecto:
```bash
mkdir odoo-mobile-gateway
cd odoo-mobile-gateway
npm init -y
```

2. Instalar las dependencias:
```bash
npm install express dotenv cors morgan jsonwebtoken multer openai axios winston
npm install --save-dev nodemon jest
```

3. Crear un archivo `.env` en la raíz del proyecto:
```env
PORT=3000
ODOO_URL=http://localhost:8069
ODOO_DB=your_database_name
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret_key
```

4. Crear la estructura de carpetas y archivos:
```bash
mkdir -p src/{config,middleware,routes,services}
touch src/index.js
```

5. Copiar el código de cada archivo a su ubicación correspondiente.

6. Modificar el `package.json` para agregar los scripts y configurar el tipo de módulo:
```json
{
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

7. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

## Esta API Gateway maneja:
- Autenticación con Odoo y generación de JWT
- Comunicación con la API de Odoo usando JSON-RPC
- Integración con OpenAI para transcripción y generación de contenido
- Rutas específicas para cada rol (profesor, estudiante, tutor)
- Manejo de archivos de audio para transcripción
- Middleware de autenticación
- Manejo de errores
