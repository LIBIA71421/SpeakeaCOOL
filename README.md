# SpeakeaCOOL

Plataforma de tutorías de inglés creada con React, TypeScript, Vite y Firebase. Incluye inscripción, cuentas de estudiantes, espacio de tutor, material de práctica original, videollamadas Jitsi y almacenamiento privado por cuenta.

## Desarrollo

1. Instala Node.js 20 o posterior y ejecuta `npm install`.
2. Copia `.env.example` a `.env` y completa la configuración web de Firebase.
3. En Firebase Console, habilita Authentication → Email/Password, crea Firestore y configura Firebase Storage.
4. Publica las reglas con Firebase CLI: `firebase deploy --only firestore:rules,storage`.
5. Ejecuta `npm run dev`.

Las variables `VITE_FIREBASE_*` son configuración pública del cliente, no secretos. Las reglas autorizan a estudiantes a leer sus propios archivos y al tutor a gestionar el material. Un usuario nuevo solo puede crear un perfil con rol `student`; para habilitar la cuenta del tutor, crea primero su cuenta desde la interfaz y cambia `users/{uid}.role` a `teacher` en Firebase Console. No habilites al tutor permitiendo que una persona cambie su propio rol desde el cliente.

## Videollamadas

El Meet Room integra Jitsi Meet en una página propia. La videollamada y la opción de compartir pantalla dependen del navegador, permisos del dispositivo y del servicio Jitsi. El código de sala funciona como enlace de acceso; compártelo solo con las personas invitadas. Para clases privadas con autenticación reforzada, configura una instancia Jitsi propia o un proveedor con tokens de acceso.

## Archivos y asistente de estudio

Los archivos se guardan en Firebase Storage, con registros privados en Firestore y descargas autenticadas por Firebase SDK (no se exponen enlaces públicos de descarga). Se aceptan PDF, Word, texto e imágenes de hasta 20 MB. Configura CORS en el bucket de Cloud Storage para permitir el origen donde publiques la app y `http://localhost:5173` durante el desarrollo; sin ello, el SDK del navegador no podrá transferir archivos.

La interfaz del asistente solo consulta un RAG cuando se configura `VITE_STUDY_ASSISTANT_URL`. El backend debe validar el token Firebase recibido en `Authorization: Bearer <token>`, aplicar permisos por usuario antes de recuperar documentos, y responder `{ "answer": "..." }` al POST `{ "question": "...", "documentIds": ["..."] }`. La extracción, embeddings y llamada al modelo deben hacerse en ese backend; nunca incluyas claves de IA en el navegador. Sin ese endpoint, la página informa que el asistente aún no está conectado y no presenta respuestas como si fueran consultas reales.

## Publicación

Al publicar, revisa que las reglas Firestore y Storage estén aplicadas al proyecto correcto. Habilita Firebase App Check y considera un backend con límites de uso para las inscripciones y el asistente.
