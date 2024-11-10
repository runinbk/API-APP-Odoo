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

### También puede consultar

- [Documento de **pasos para crear este proyecto**](/docs/creacion-configuraciones-inciales.md)

## Requisitos

- **Node.js** v20 o superior
- **npm** v10 o superior (incluido con Node.js)
- **TypeScript** (instalado globalmente si se prefiere)

## Instalación

1. Clona el repositorio:

    ```bash
    git clone https://github.com/runinbk/API-APP-Odoo.git
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

    Este comando ejecutará `tsc --watch` y el servidor en paralelo usando `concurrently`, lo cual facilita el desarrollo al recargar automáticamente cada vez que hay cambios.

    ```bash
    npm run dev
    ```

- **Compilar TypeScript**:

    ```bash
    npm run build
    ```
    Tambien puedes usar el siguiente comando:
    ```bash
    tsc --watch
    ```

- **Ejecutar el servidor**:

    ```bash
    npm run start
    ```

- **Ejecutar tests**:

    ```bash
    npm test
    ```

### Recomendaciones adicionales

Parece que tienes un buen flujo de trabajo al usar `tsc --watch` para compilar automáticamente los archivos TypeScript. Sin embargo, te sigue dando el error `Cannot find module 'dist/app.js'`. Esto indica que algo aún impide que el archivo JavaScript se genere correctamente en la carpeta `dist`.

A continuación, algunos pasos adicionales que pueden ayudar a resolver el problema:

1. **Verifica la ubicación de los archivos compilados**:
   Después de ejecutar `tsc --watch`, asegúrate de que los archivos generados estén realmente en la carpeta `dist`. Si no están allí, podría haber un problema con la configuración en `tsconfig.json`.

2. **Confirma que el archivo principal esté siendo compilado**:
   Asegúrate de que el archivo principal (por ejemplo, `app.ts` o `server.ts`) esté dentro de la carpeta `src` o en la raíz del proyecto, según hayas configurado `rootDir` en `tsconfig.json`.

3. **Configura `package.json` para `start` y `dev` scripts**:
   Si `tsc --watch` está corriendo, puedes simplificar tu flujo de trabajo agregando un script de desarrollo en `package.json` que ejecute `tsc --watch` y `node dist/app.js` simultáneamente.

   Aquí tienes un ejemplo usando [concurrently](https://www.npmjs.com/package/concurrently), que permite ejecutar múltiples comandos en paralelo:

   ```bash
   npm install concurrently --save-dev
   ```

   Luego, en tu `package.json`, configura los scripts así:

   ```json
   "scripts": {
       "build": "tsc",
       "start": "node dist/app.js",
       "dev": "concurrently \"tsc --watch\" \"nodemon dist/app.js\""
   }
   ```

   Esto te permitirá correr `npm run dev`, que compilará en modo `watch` y ejecutará `nodemon` para reiniciar automáticamente el servidor cada vez que se compile el código.

4. **Verifica si el archivo `app.js` se genera**:
   Tras hacer estos cambios, ejecuta el siguiente comando en la terminal:

   ```bash
   npm run dev
   ```

   Deberías ver tanto la compilación en tiempo real de `tsc --watch` como la ejecución del servidor. Si el archivo `dist/app.js` aún no se genera, puede haber un error de configuración en `tsconfig.json` o en la estructura de tu proyecto.


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