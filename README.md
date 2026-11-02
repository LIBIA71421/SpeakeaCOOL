# SpeakeaCOOL

Sitio de inscripción para una escuela de tutorías, creado con React, TypeScript y Vite. Las solicitudes se guardan en la colección `enrollments` de Cloud Firestore.

## Desarrollo

1. Instala Node.js 20 o posterior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env` y completa la configuración de tu aplicación Firebase.
4. Crea una base de datos de Cloud Firestore en tu proyecto Firebase y publica las reglas de `firestore.rules`.
5. Ejecuta `npm run dev`.

Puedes obtener la configuración web en Firebase Console → Configuración del proyecto → Tus apps. Las variables `VITE_FIREBASE_*` se incluyen en el cliente, por lo que no deben tratarse como secretos. Las reglas de Firestore limitan la creación de registros y bloquean la lectura, actualización y eliminación desde el cliente.

Antes de poner el formulario en producción, habilita Firebase App Check y considera añadir una Cloud Function o un servicio de backend con limitación de solicitudes para proteger el endpoint público de inscripciones contra spam.
