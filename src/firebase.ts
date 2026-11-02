import { initializeApp, type FirebaseApp } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

export type Enrollment = {
  name: string;
  email: string;
  phone: string;
  program: "ingles-conversacion" | "tutorias-escolares" | "ingles-personalizado";
  modality: "online" | "presencial" | "flexible";
  schedule: "manana" | "tarde" | "flexible";
  message: string;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | undefined;

export async function saveEnrollment(enrollment: Enrollment): Promise<void> {
  if (Object.values(firebaseConfig).some((value) => !value)) {
    throw new Error(
      "La conexión con Firebase aún no está configurada. Añade las credenciales en el archivo .env.",
    );
  }

  firebaseApp ??= initializeApp(firebaseConfig);
  const database = getFirestore(firebaseApp);
  await addDoc(collection(database, "enrollments"), {
    ...enrollment,
    createdAt: serverTimestamp(),
    status: "new",
  });
}
