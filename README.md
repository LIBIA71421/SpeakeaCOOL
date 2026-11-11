# SpeakeaCOOL

Plataforma de tutorías de inglés creada con React, TypeScript, Vite y Firebase. Incluye inscripción, cuentas de estudiantes, espacio de tutor, material de práctica original, videollamadas Jitsi y almacenamiento privado por cuenta.

## Desarrollo

1. Instala Node.js 20 o posterior y ejecuta `npm install`.
2. La configuración de la app web Firebase está en `src/firebaseApp.ts`; puedes sobreescribirla con variables de `.env.local` copiando `.env.example`.
3. En Firebase Console, habilita Authentication → Email/Password, crea Firestore y configura Firebase Storage.
4. Publica reglas de Firestore y Storage con Firebase CLI: `firebase deploy --only firestore:rules,storage`.
5. Despliega el asistente gratuito de Cloudflare Workers desde `worker/`; instrucciones abajo.
6. Ejecuta `npm run dev`.

Las variables `VITE_FIREBASE_*` son configuración pública del cliente, no secretos. Las reglas autorizan a estudiantes a leer sus propios archivos y al tutor a gestionar el material. Un ********usuario nuevo solo puede crear un perfil con rol `student`; para habilitar la cuenta del tutor, crea primero su cuenta desde la interfaz y cambia `users/{uid}.role` a `teacher` en Firebase Console. No habilites al tutor permitiendo que una persona cambie su propio rol desde el cliente.

## Videollamadas

El Meet Room integra Jitsi Meet en una página propia. La videollamada y la opción de compartir pantalla dependen del navegador, permisos del dispositivo y del servicio Jitsi. El código de sala funciona como enlace de acceso; compártelo solo con las personas invitadas. Para clases privadas con autenticación reforzada, configura una instancia Jitsi propia o un proveedor con tokens de acceso.

## Archivos y asistente de estudio

Los archivos se guardan en Firebase Storage, con registros privados en Firestore y descargas autenticadas por Firebase SDK (no se exponen enlaces públicos de descarga). Se aceptan PDF, Word, texto e imágenes de hasta 20 MB. Configura CORS en el bucket de Cloud Storage para permitir el origen donde publiques la app y `http://localhost:5173` durante el desarrollo; sin ello, el SDK del navegador no podrá transferir archivos.

## Backend gratuito del asistente

El backend (`worker/`) usa Cloudflare Workers y no Firebase Cloud Functions. El plan gratuito de Workers tiene límites de uso; Firebase Authentication, Firestore y Storage permanecen como servicios de datos y tienen sus propias cuotas.

1. Crea una cuenta Cloudflare y activa Workers (plan Free).
2. Desde la carpeta `worker/`, ejecuta `npm install`.
3. Inicia sesión en Cloudflare con `npx wrangler login`.
4. Añade tu clave de Google AI Studio con cuota gratuita como secreto privado: `npx wrangler secret put GEMINI_API_KEY`.
5. Ejecuta `npm run deploy`. Cloudflare imprimirá una URL `https://speakeacool-study-assistant.<tu-subdominio>.workers.dev`.
6. En GitHub → Settings → Secrets and variables → Actions, crea el secreto `VITE_STUDY_ASSISTANT_URL` con esa URL y vuelve a publicar `main`. El workflow de Pages la inyecta al compilar el front.

El Worker valida criptográficamente los ID tokens de Firebase, aplica los permisos de Firestore/Storage al recuperar documentos, y llama a Gemini desde el servidor. Recupera las guías y archivos TXT; también puede enviar un PDF pequeño (hasta 4 MB) al modelo. DOC/DOCX e imágenes se pueden almacenar, pero no se incluyen en el contexto del RAG. La recuperación de texto usa coincidencia de términos, sin embeddings ni base vectorial. Gemini responde con personalidad Spanglish, humor irreverente moderado y voz del navegador mediante SpeechSynthesis. Nunca guardes la clave Gemini en la app web ni en Git.

La personalidad está diseñada como grosera y divertida sin dirigir insultos ni humillar al estudiante. El Worker aplica un límite básico por instancia y los proveedores gratuitos pueden cambiar sus límites, disponibilidad o condiciones; comprueba el panel de uso de Cloudflare y Google AI Studio.

La configuración web de Firebase en `src/firebaseApp.ts` es pública, no es credencial de administrador; la seguridad depende de las reglas Firestore/Storage. Activa Email/Password en Firebase Authentication. Para que el tutor tenga permisos, crea su cuenta de estudiante y luego cambia `users/{uid}.role` a `teacher` en Firebase Console.

## Publicación

Al publicar, revisa que las reglas Firestore y Storage estén aplicadas al proyecto correcto. Habilita Firebase App Check y considera un backend con límites de uso para las inscripciones y el asistente.