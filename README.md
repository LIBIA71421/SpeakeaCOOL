# SpeakeaCOOL

Plataforma de tutorías de inglés creada con React, TypeScript, Vite y Firebase. Incluye inscripción, cuentas de estudiantes, espacio de tutor, material de práctica original, videollamadas Jitsi y almacenamiento privado por cuenta.

## Desarrollo

1. Instala Node.js 20 o posterior y ejecuta `npm install`.
2. La configuración de la app web Firebase está en `src/firebaseApp.ts`; puedes sobreescribirla con variables de `.env.local` copiando `.env.example`.
3. En Firebase Console, habilita Authentication → Email/Password, crea Firestore y configura Firebase Storage.
4. Configura la clave de Gemini con `firebase functions:secrets:set GEMINI_API_KEY`, luego publica reglas y backend con `firebase deploy --only firestore:rules,storage,functions`.
5. Ejecuta `npm run dev`.

Las variables `VITE_FIREBASE_*` son configuración pública del cliente, no secretos. Las reglas autorizan a estudiantes a leer sus propios archivos y al tutor a gestionar el material. Un usuario nuevo solo puede crear un perfil con rol `student`; para habilitar la cuenta del tutor, crea primero su cuenta desde la interfaz y cambia `users/{uid}.role` a `teacher` en Firebase Console. No habilites al tutor permitiendo que una persona cambie su propio rol desde el cliente.

## Videollamadas

El Meet Room integra Jitsi Meet en una página propia. La videollamada y la opción de compartir pantalla dependen del navegador, permisos del dispositivo y del servicio Jitsi. El código de sala funciona como enlace de acceso; compártelo solo con las personas invitadas. Para clases privadas con autenticación reforzada, configura una instancia Jitsi propia o un proveedor con tokens de acceso.

## Archivos y asistente de estudio

Los archivos se guardan en Firebase Storage, con registros privados en Firestore y descargas autenticadas por Firebase SDK (no se exponen enlaces públicos de descarga). Se aceptan PDF, Word, texto e imágenes de hasta 20 MB. Configura CORS en el bucket de Cloud Storage para permitir el origen donde publiques la app y `http://localhost:5173` durante el desarrollo; sin ello, el SDK del navegador no podrá transferir archivos.

El asistente corre en Firebase Cloud Functions (`functions/`) y verifica el token Firebase antes de leer archivos autorizados. Recupera fragmentos relevantes de las guías incluidas y de documentos TXT, PDF y DOCX del estudiante; imágenes y archivos Word antiguos no se usan como contexto. Gemini genera las respuestas con una personalidad Spanglish, bromista y ligeramente grosera, sin dirigir insultos a la persona. El navegador puede leer respuestas usando SpeechSynthesis.

Antes de desplegar la función, configura una clave privada de Google AI en Secret Manager: `firebase functions:secrets:set GEMINI_API_KEY`. No guardes esa clave en `.env` del frontend ni en Git. La función vive en `us-central1`; si cambias la región o el dominio de GitHub Pages, actualiza `src/LearningPlatform.tsx` (`assistantEndpoint` y la lista CORS en `functions/index.js`).

La configuración web de Firebase en `src/firebaseApp.ts` corresponde a la app web pública y no es una credencial de administrador; la seguridad depende de las reglas Firestore/Storage. Activa Email/Password en Firebase Authentication. Para que el tutor tenga permisos, crea su cuenta de estudiante y luego cambia `users/{uid}.role` a `teacher` en Firebase Console.

## Publicación

Al publicar, revisa que las reglas Firestore y Storage estén aplicadas al proyecto correcto. Habilita Firebase App Check y considera un backend con límites de uso para las inscripciones y el asistente.
