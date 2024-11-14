# Te ayudo a desplegar tu proyecto Odoo en AWS

Vamos a usar EC2 para alojar tu aplicación. Te guiaré paso a paso:

## 1. Primero, vamos a crear una instancia EC2:
   - Ve a EC2 en la consola de AWS
   - Haz clic en "Create instance"
   - Selecciona Ubuntu Server 22.04 LTS
   - Para Odoo, recomiendo al menos una t2.medium (2 vCPU, 4GB RAM)
   - Crea o selecciona un key pair para SSH

2. Configuración de seguridad (Security Group):

    En la sección "Reglas de grupos de seguridad de entrada", haz clic en "Agregar regla del grupo de seguridad" y añade las siguientes reglas una por una:

    1. Para HTTP (ya deberías tener SSH configurado):
        - Tipo: HTTP
        - Protocolo: TCP
        - Puerto: 80
        - Origen: Anywhere (0.0.0.0/0)
        - Descripción: HTTP access

    2. Para HTTPS:
        - Tipo: HTTPS
        - Protocolo: TCP
        - Puerto: 443
        - Origen: Anywhere (0.0.0.0/0)
        - Descripción: HTTPS access

    3. Para Odoo:
        - Tipo: Custom TCP
        - Protocolo: TCP
        - Puerto: 8069
        - Origen: Anywhere (0.0.0.0/0)
        - Descripción: Odoo access

    Al final deberías tener 4 reglas de entrada:
    - Puerto 22 (SSH)
    - Puerto 80 (HTTP)
    - Puerto 443 (HTTPS)
    - Puerto 8069 (Odoo)

3. Lanzar instancia
    - Te pedira que elijas en que formato quieres descargar tu clave de acceso. Esto depende del sistema operativo en el que este:
        - Si estas en linux o mac, elige el formato ´.pem´.
        - Si estas en Windows elige el formato ´.ppk´.
    - Despues de esto ya tendras tu instancia en linea.

## 2. Conectarnos al servidor desde nuestra PC

Si estás en Windows 10, necesitaremos usar PuTTY para conectarnos a la instancia EC2. Vamos paso a paso:

1. Primero, descarga e instala PuTTY:
   - Ve a https://www.putty.org/
   - Descarga e instala la versión más reciente para Windows

2. Como tienes tu clave en formato .pem, necesitas convertirla a formato .ppk:
   - Abre PuTTYgen (viene con PuTTY, búscalo en el menú inicio)
   - Click en "Load"
   - En el diálogo de archivo, selecciona "All Files (*.*)" 
   - Busca y selecciona tu archivo .pem
   - Click en "Save private key"
   - Guarda el archivo .ppk en una ubicación segura

3. Para conectarte a la instancia:
   - Abre PuTTY
   - En "Host Name": ubuntu@3.143.242.114 (usa la IP pública de tu instancia)
   - En el menú izquierdo, ve a: Connection > SSH > Auth > Credentials
   - En "Private key file for authentication" busca y selecciona el archivo .ppk que creaste
   - Regresa a Session en el menú izquierdo
   - En "Saved Sessions" escribe un nombre (ejemplo: "Odoo-AWS")
   - Click en "Save" para guardar esta configuración
   - Click en "Open" para conectarte

4. La primera vez que te conectes, PuTTY mostrará una alerta de seguridad. Click en "Accept" para continuar.

## 3. Preparar y configurar el entorno

Perfecto, ahora vamos a instalar Docker y preparar el entorno. Copia y pega estos comandos en orden:

1. Actualiza el sistema:
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

2. Instala Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. Añade tu usuario al grupo docker (escribe el comando tal cual esta aqui):
```bash
sudo usermod -aG docker $USER
exec sudo su -l $USER
```

4. Instala Docker Compose:
```bash
sudo apt-get install docker-compose -y
```

## 4. Sube el proyecto y despliega

Lo que hice aqui fue lo siguiente:

1. Crear Repositorio para despliegue
    - Desde tu PC, subir a un repositorio de github todo los archivos requeridos para iniciar los servicios del docker-compose.

2. Descargar el repositorio en el servidor
    - En la raiz, ejecutar el siguiente comando para descargar el repositorio preparado anteriormente:
```bash
git clone <tu enlace del repositorio>
```

3. Ingresa a la carpeta descargada
```bash
cd <carpeta descargada>
```

4. Verificar que se encuentre los archivos nesesarios para despliegue (docker-compose.yml, Dockerfile, etc.)
    - Para esto ejecutar el siguinete comando, el cual te listara los archivos que se encuentran en esta carpeta.
```bash
ls
```

## 5. Pon en marcha el proyecto - Inicia los servicios con Docker Compose

Perfecto, ahora vamos a iniciar los servicios con Docker Compose. Sigue estos pasos:

1. Inicia los servicios:
```bash
docker-compose up -d
```

2. Verifica que los contenedores estén corriendo:
```bash
docker-compose ps
```

3. Puedes ver los logs para asegurarte que todo está funcionando correctamente:
```bash
docker-compose logs -f
```
(Para salir de los logs presiona Ctrl + C)

4. Ahora deberías poder acceder a Odoo usando la IP pública de tu instancia:
- Abre tu navegador
- Ingresa: http://3.143.242.114:8069
  (Reemplaza la IP con la IP pública de tu instancia EC2)

Deberías ver la pantalla de inicio de Odoo donde puedes:
- Crear una nueva base de datos
- Configurar el sistema por primera vez
