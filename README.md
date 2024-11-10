# API - Odoo - Backend

## API REST en Node.js con Express y TypeScript

Este proyecto es una API REST construida con Node.js, Express y TypeScript. La API está diseñada para ser escalable y fácil de mantener, utilizando TypeScript para aprovechar los beneficios de tipado estático.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Comandos Disponibles](#comandos-disponibles)
- [Dependencias](#dependencias)
- [Licencia](#licencia)
- [Autor](#autor)

### Tambien puede consultar

- [Documento de **pasos para crear este preycto**](/docs/creacion-configuraciones-inciales.md)

## Requisitos

- **Node.js** v14 o superior
- **npm** v6 o superior (incluido con Node.js)
- **TypeScript** (instalado globalmente si se prefiere)

## Instalación

1. Clona el repositorio:

    ```bash
    git clone <URL-del-repositorio>
    ```

2. Entra en el directorio del proyecto:

    ```bash
    cd api-app-odoo
    ```

3. Instala las dependencias:

    ```bash
    npm install
    ```

4. Asegúrate de tener TypeScript instalado globalmente:

    ```bash
    npm install -g typescript
    ```

## Configuración

1. Genera el archivo `tsconfig.json` si no lo tienes:

    ```bash
    tsc --init
    ```

2. Crea un archivo `.env` en la raíz del proyecto para manejar las variables de entorno. Un ejemplo de configuración en `.env` podría incluir:

    ```bash
    PORT=3000
    DB_HOST=localhost
    DB_USER=usuario
    DB_PASSWORD=contraseña
    DB_NAME=nombre_base_datos
    ```

3. Verifica las configuraciones en el archivo `tsconfig.json`. Las configuraciones esenciales incluyen:

    ```json
    {
        "compilerOptions": {
            "target": "es2016",
            "module": "commonjs",
            "outDir": "./dist",
            "sourceMap": true,
            "strict": true,
            "moduleResolution": "node",
            "esModuleInterop": true
        }
    }
    ```

## Estructura del Proyecto

```plaintext
api-app-odoo/
├── db/                   # Archivos de configuración y modelos de base de datos
├── docs/                 # Documentación de la API
├── helpers/              # Funciones auxiliares y utilidades
├── middlewares/          # Middlewares para la API (validación, autenticación, etc.)
├── public/               # Archivos estáticos
├── server/               # Archivos de configuración del servidor y rutas principales
├── .env                  # Variables de entorno
├── package.json          # Configuración del proyecto y dependencias
├── tsconfig.json         # Configuración de TypeScript
└── README.md             # Documentación del proyecto
```

### Explicación de las Carpetas

- **db**: Almacena archivos relacionados con la base de datos, como modelos y configuraciones de conexión.
- **docs**: Documentación del proyecto, incluyendo especificaciones API y guías de uso.
- **helpers**: Funciones auxiliares para tareas comunes en la API.
- **middlewares**: Middlewares personalizados para el manejo de autenticación, validación, etc.
- **public**: Archivos estáticos servidos por la API.
- **server**: Archivos de configuración del servidor, incluidas rutas y controladores de la API.

## Comandos Disponibles

- **Iniciar el servidor de desarrollo**:

    ```bash
    npm run dev
    ```

- **Compilar TypeScript**:

    ```bash
    npm run build
    ```

- **Ejecutar tests**:

    ```bash
    npm test
    ```

## Dependencias

Estas son algunas de las principales dependencias de este proyecto:

- **[dotenv](https://www.npmjs.com/package/dotenv)**: Para gestionar variables de entorno.
- **[express](https://www.npmjs.com/package/express)**: Framework minimalista para construir aplicaciones web y APIs.
- **[cors](https://www.npmjs.com/package/cors)**: Middleware para habilitar CORS en la API.
- **[bcrypt](https://www.npmjs.com/package/bcrypt)**: Biblioteca para encriptar contraseñas.
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)**: Biblioteca para autenticación y verificación de tokens.
- **[sequelize](https://www.npmjs.com/package/sequelize)** y **[pg](https://www.npmjs.com/package/pg)**: ORM y cliente de PostgreSQL.

Para una lista completa, consulta el archivo `package.json`.

## Autor

***Kevin B. Gomez R.*** 😎💻🔥, y todos los derechos reservados.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.