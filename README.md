# SpeakeaCOOL

Plataforma de tutorías de inglés creada con React, TypeScript, Vite y Firebase. Incluye inscripción, cuentas de estudiantes, espacio de tutor, material de práctica original, videollamadas Jitsi y almacenamiento privado por cuenta.

## Desarrollo

1. Instala Node.js 20 o posterior y ejecuta `npm install`.
2. La configuración de la app web Firebase está en `src/firebaseApp.ts`; puedes sobreescribirla con variables de `.env.local` copiando `.env.example`.
3. En Firebase Console, habilita Authentication → Email/Password, crea Firestore y configura Firebase Storage.
4. Publica reglas de Firestore y Storage con Firebase CLI: `firebase deploy --only firestore:rules,storage`.
5. Despliega el asistente gratuito de Cloudflare Workers desde `worker/`; instrucciones abajo.
6. Ejecuta `npm run dev`.

Las variables `VITE_FIREBASE_*` son configuración pública del cliente, no secretos. Toda cuenta nueva se crea como `student`; para habilitar el panel de tutoría, el propietario del proyecto debe crear/iniciar sesión con su cuenta y cambiar manualmente `users/{uid}.role` a `owner` en Firebase Console. Las reglas impiden que una cuenta se otorgue ese rol desde la web. El rol `owner` es un permiso de la aplicación configurado por una persona con acceso administrativo a Firebase; Firebase Rules no comprueban automáticamente el rol IAM de Google Cloud.

## Videollamadas

El Meet Room integra Jitsi Meet en una página propia. La videollamada y la opción de compartir pantalla dependen del navegador, permisos del dispositivo y del servicio Jitsi. El código de sala funciona como enlace de acceso; compártelo solo con las personas invitadas. Para clases privadas con autenticación reforzada, configura una instancia Jitsi propia o un proveedor con tokens de acceso.

## Archivos y asistente de estudio

Solo el perfil `owner` puede cargar materiales, y las reglas de Firestore y Storage también verifican ese rol. Estudiantes autenticados pueden consultar materiales publicados dentro del aula. La interfaz no ofrece descarga ni impresión y muestra PDF, DOCX, texto e imágenes compatibles. La aplicación web no puede impedir capturas del sistema, fotografías de pantalla, herramientas de desarrollo u otras copias desde el dispositivo; el visor y su marca de agua son solo disuasorios. Configura CORS en el bucket para el origen publicado y `http://localhost:5173` durante el desarrollo.

El panel `GESTIONAR AULA` permite crear, editar, publicar o eliminar rutas y prácticas. Los ejercicios y sus respuestas se almacenan en Firestore; los estudiantes pueden completarlos y ver la clave después de revisar sus respuestas. Despliega las reglas con `firebase deploy --only firestore:rules,storage` antes de usarlo.

## Backend gratuito del asistente

El backend (`worker/`) usa Cloudflare Workers y no Firebase Cloud Functions. El plan gratuito de Workers tiene límites de uso; Firebase Authentication, Firestore y Storage permanecen como servicios de datos y tienen sus propias cuotas.

1. Crea una cuenta Cloudflare y activa Workers (plan Free).
2. Desde la carpeta `worker/`, ejecuta `npm install`.
3. Inicia sesión en Cloudflare con `npx wrangler login`.
4. Añade tu clave nueva de Google AI Studio como secreto privado: `npx wrangler secret put GEMINI_API_KEY`.
5. Ejecuta `npm run deploy`. El frontend ya apunta a `https://speakeacool-study-assistant.speakeacool.workers.dev`.

El Worker valida criptográficamente los ID tokens de Firebase, aplica los permisos de Firestore/Storage al recuperar documentos, y llama a Gemini desde el servidor. Recupera las guías y archivos TXT; también puede enviar un PDF pequeño (hasta 4 MB) al modelo. DOC/DOCX e imágenes se pueden almacenar, pero no se incluyen en el contexto del RAG. La recuperación de texto usa coincidencia de términos, sin embeddings ni base vectorial. Gemini responde con personalidad Spanglish, humor irreverente moderado y voz del navegador mediante SpeechSynthesis. Nunca guardes la clave Gemini en la app web ni en Git. La URL del Worker es pública y no requiere un secreto de GitHub.

La personalidad está diseñada como grosera y divertida sin dirigir insultos ni humillar al estudiante. El Worker aplica un límite básico por instancia y los proveedores gratuitos pueden cambiar sus límites, disponibilidad o condiciones; comprueba el panel de uso de Cloudflare y Google AI Studio.

La configuración web de Firebase en `src/firebaseApp.ts` es pública, no es credencial de administrador; la seguridad depende de las reglas Firestore/Storage. Activa Email/Password en Firebase Authentication. Para habilitar al tutor, crea/inicia sesión con su cuenta, localiza su UID en Authentication y cambia `users/{uid}.role` a `owner` en Firebase Console.

## Publicación

Al publicar, revisa que las reglas Firestore y Storage estén aplicadas al proyecto correcto. Habilita Firebase App Check y considera un backend con límites de uso para las inscripciones y el asistente.