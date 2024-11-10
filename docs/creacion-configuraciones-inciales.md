# Esta sera una guia de pasos para la creacion de esta API REST en node con Express usando TS

## Generacion de Archivos Iniciales

Lo primero y como en toda API de Node creamos el `package.json` para dar inicio a nuestro proyecto

```bash
npm init -y
```

Seguido de esto creamos como de constumbre nuestro archivo raiz, y instanciamos el contenido inicial para que nuestro API funcione.
En este momento marcara errores, puesto que al trabajar en **_TS_** si o si nesecitamos crear el archivo de configuracion de ts: el `tsconfig.json`, este archivo es para que se realice la traduccion de **_TS_** a **_JS_**.

Esto se genera de la siguiente manera:

```bash
tsc --init
```

### Error al ejecutar el comando anterior

El error indica que el comando `tsc` no está disponible globalmente, probablemente porque TypeScript no está instalado globalmente en tu sistema o no está agregado a tu PATH.

Para resolverlo, sigue estos pasos:

1. **Instalar TypeScript globalmente**:

   Ejecuta el siguiente comando para instalar TypeScript de manera global, lo que hará que `tsc` esté disponible en cualquier parte del sistema:

   ```bash
   npm install -g typescript
   ```

   Esto debería permitirte usar `tsc --init` en cualquier directorio.

2. **Verificar la instalación**:

   Una vez que la instalación haya terminado, verifica que el comando `tsc` esté disponible ejecutando:

   ```bash
   tsc -v
   ```

   Esto debería mostrar la versión de TypeScript instalada. Si ves la versión, intenta nuevamente el comando `tsc --init` para crear el archivo `tsconfig.json`.

3. **Si persiste el problema**:

   Si aún no reconoce `tsc`, asegúrate de que el directorio de paquetes globales de npm esté en el PATH de tu sistema. Puedes verificar la ubicación de tus paquetes globales ejecutando:

   ```bash
   npm root -g
   ```

   Añade esa ruta al PATH del sistema (en la configuración de variables de entorno), luego reinicia la terminal y vuelve a intentar el comando `tsc --init`.

Con esto, deberías poder generar el archivo `tsconfig.json` sin problemas.

## Configuracion del `tsconfig.json`

Ingresando en el archivo `tsconfig.json` debemos de confirmar que existan las siguientes configuraciones:

```json
"target": "es2016",         //Version de TS que reconocera la aplicacion al momento de compilar a codigo base
"module": "commonjs",
"outDir": "./dist",         //Especifica en que archivo se guardara el compilado de codigo base eb JS
"sourceMap": true,          //Si ocurre un error en JS, esta configuracion nos ayudara a ver en que lugar del codigo en TS esta el error
"strict": true,
"moduleResolution": "node",
"esModuleInterop": true,
```

Luego de verificar que existan estas configuraciones instalamos la libreria de **_TS_** en nustro proyecto

```bash
npm i typescript --save-dev
```

Ahora instalamos la libreria de **_TS_** llamada `tslint` en nustro proyecto, esto justamente para añadir nuevas configuraciones al proyecto

```bash
npm i tslint --save-dev
```

Para que esta libreria funcione, debemos de hacer una pequeña configuracion a travez de la consola para generar el archivo de configuracion `tslint.json`

```bash
./node_modules/.bin/tslint --init
```

Una vez generado el archivo, ingresamos al mismo y hacemos la siguiente configuracion

```json
"rules": {
        "no-console": false
        },
```

Despues de esto realizamos las intalaciones de las librerias que utilizaremos en este proyecto

```bash
npm i dotenv express cors bcrypt jsonwebtoken pg pg-hstore sequelize express-fileupload express-validator
```

donde:

- [dotenv](https://www.npmjs.com/package/dotenv) es una herramienta para manejar variables de entorno. Dotenv es un módulo de _dependencia cero_ que carga variables de entorno desde un `.env` archivo a `process.env`.
- [express](https://www.npmjs.com/package/express) es un marco web rápido, minimalista y sin opiniones para Node.js
- [cors](https://www.npmjs.com/package/cors) CORS es un paquete node.js para proporcionar un middleware Connect / Express que se puede utilizar para habilitar CORS con varias opciones.
- [bcrypt](https://www.npmjs.com/package/bcrypt) es una biblioteca para ayudarle a codificar contraseñas.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) es una libreria para cifrado de extremo a extremo.
- [sequelize](https://www.npmjs.com/package/sequelize)
- [pg-hstore](https://www.npmjs.com/package/pg-hstore)
- [pg](https://www.npmjs.com/package/pg)
- [pbcryptg](https://www.npmjs.com/package/bcrypt)
- [express-validator](https://www.npmjs.com/package/express-validator) Un middleware express.js para validador .
- [express-fileupload](https://www.npmjs.com/package/express-fileupload) carga rápida de archivos

## Crear las carpetas iniciales

Ya que ya tenemos configurado la creacion del proyecto, ahora crearemos las carpetas iniciales, y que mejor que hacerlo de la siguiente manera:

1. **Abre la terminal** en la raiz de tu proyecto

2. **Ejecuta el** siguiente comando:

    ```bash
    mkdir db helpers middlewares public server docs
    ```

### Explicación de las carpetas creadas:

1. **db**: 
   - Esta carpeta almacenará los archivos relacionados con la base de datos. Aquí puedes definir modelos, migraciones y configuraciones de conexión, especialmente si estás utilizando un ORM como Sequelize.
   
2. **helpers**:
   - En esta carpeta irán funciones auxiliares o de ayuda que facilitan tareas recurrentes en tu API. Por ejemplo, puedes tener funciones para formateo de datos, generación de respuestas, manejo de fechas, etc.
   
3. **middlewares**:
   - Aquí se alojan los middlewares que tu API utilizará para procesar solicitudes antes de que lleguen a los controladores. Puedes incluir middlewares de autenticación, validación de datos y manejo de errores, entre otros.
   
4. **public**:
   - Esta carpeta es para archivos estáticos que tu API podría servir, como imágenes, archivos CSS, JavaScript u otros activos accesibles públicamente.
   
5. **server**:
   - Esta carpeta es para el código principal de la aplicación. Aquí puedes organizar el archivo de inicio de la aplicación (generalmente `index.ts` o `app.ts`), así como los archivos de configuración del servidor y las rutas principales de la API.
   
6. **docs**:
   - En `docs`, puedes guardar la documentación de la API. Esto puede incluir archivos Markdown con instrucciones, especificaciones en formato OpenAPI/Swagger, o cualquier documentación adicional para desarrolladores que interactúen con la API.

---

Con esta estructura, tendrás un proyecto organizado y fácil de mantener a medida que tu API crezca.

***Luego de todas estas configuraciones ya es hora de comenzar nuestra API Rest Full !!!***