import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "./firebaseApp";

export type Enrollment = {
  name: string;
  email: string;
  phone: string;
  program: "ingles-conversacion" | "tutorias-escolares" | "ingles-personalizado";
  modality: "online" | "presencial" | "flexible";
  schedule: "manana" | "tarde" | "flexible";
  message: string;
};

export async function saveEnrollment(enrollment: Enrollment): Promise<void> {
  const database = getFirestore(getFirebaseApp());
  await addDoc(collection(database, "enrollments"), {
    ...enrollment,
    createdAt: serverTimestamp(),
    status: "new",
  });
}
