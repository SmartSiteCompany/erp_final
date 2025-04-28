# Documentacion necesaria para la implementacion del backend con el frontend y el proceso de QA

## Codigos de estado HTTP

Código	
* 200	OK - Solicitud exitosa.
* 201	Created - Recurso creado exitosamente.
* 400	Bad Request - Datos inválidos o faltantes.
* 401	Unauthorized - Autenticación requerida o inválida.
* 404	Not Found - Recurso no encontrado.
* 500	Internal Server Error - Error en el servidor.

- La documentacion diseñada para esta API esta alojada en Swagger, dentro de la misma

# Proceso de inicialización de la API

- npm install -y
- npm update 
- node app.js / node start 
- Click en el servidor creado Servidor corriendo en http://localhost:8000
- Ingresar al URL http://localhost:8000/api-docs

* Swagger permite la interaccion directa con las solicitudes GET/POST/DELETE/PUT

# La base de datos

- MongoDB en su ultima edición y Mongo Compass para visualizacion dinamica de datos
- Nombre de la base de datos en archivo .env

# En caso de exclusición del .env crear uno y copiar lo siguiente

´´´
MONGO_URI=mongodb://localhost:27017/SSC_intCRM
JWT_SECRET=sec_key
JWT_EXPIRES_IN=1h
EMAIL_USER=correo@gmail.com
EMAIL_PASSWORD=password
PORT=8000
´´´