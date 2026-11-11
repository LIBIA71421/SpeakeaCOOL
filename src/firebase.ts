import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getBytes,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirebaseApp } from "./firebaseApp";

export type LearningContent = {
  id: string;
  level: string;
  title: string;
  goal: string;
  topics: string[];
  focus: string;
  instructions: string;
  exercises: string[];
  answerKey: string[];
  speakingPrompt: string;
  published: boolean;
  ownerUid: string;
};

export type AccountProfile = {
  uid: string;
  displayName: string;
  email: string;
  role: "student" | "owner";
};

export type StoredFile = {
  id: string;
  name: string;
  ownerUid: string;
  uploadedBy: string;
  category: "owner" | "teacher" | "student";
  storagePath: string;
  contentType: string;
  createdAt: string;
};

export type StudentAccount = Pick<AccountProfile, "uid" | "displayName" | "email">;

function getServices() {
  const app = getFirebaseApp();
  return {
    auth: getAuth(app),
    database: getFirestore(app),
    storage: getStorage(app),
  };
}

export async function registerStudent(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const { auth, database } = getServices();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(database, "users", credential.user.uid), {
    displayName: name,
    email,
    role: "student",
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function signInStudent(email: string, password: string): Promise<User> {
  const { auth } = getServices();
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function signOutAccount(): Promise<void> {
  const { auth } = getServices();
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const { auth } = getServices();
  return onAuthStateChanged(auth, callback);
}

export async function getAccountProfile(user: User): Promise<AccountProfile> {
  const { database } = getServices();
  const profileRef = doc(database, "users", user.uid);
  const profileSnapshot = await getDoc(profileRef);

  if (!profileSnapshot.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      role: "student",
      createdAt: serverTimestamp(),
    });
    return {
      uid: user.uid,
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      role: "student",
    };
  }

  const data = profileSnapshot.data();
  if (data.role === "teacher") {
    throw new Error("La cuenta conserva el rol anterior de tutor. El propietario del proyecto debe cambiar users/{uid}.role a owner en Firebase Console.");
  }
  if (data.role !== "student" && data.role !== "owner") {
    throw new Error("La cuenta no tiene un rol válido. Contacta al tutor.");
  }

  return {
    uid: user.uid,
    displayName: typeof data.displayName === "string" ? data.displayName : user.displayName ?? "",
    email: typeof data.email === "string" ? data.email : user.email ?? "",
    role: data.role,
  };
}

export async function listStoredFiles(profile: AccountProfile): Promise<StoredFile[]> {
  const { database } = getServices();
  const filesCollection = collection(database, "userFiles");
  const snapshots =
    profile.role === "owner"
      ? [await getDocs(query(filesCollection, limit(100)))]
      : await Promise.all([
          getDocs(query(filesCollection, where("category", "in", ["owner", "teacher"]), limit(100))),
          getDocs(query(filesCollection, where("ownerUid", "==", profile.uid), limit(100))),
        ]);
  const files = new Map(
    snapshots.flatMap((snapshot) =>
      snapshot.docs.map((fileDocument) => {
        const data = fileDocument.data();
        return [
          fileDocument.id,
          {
            id: fileDocument.id,
            name: String(data.name),
            ownerUid: String(data.ownerUid),
            uploadedBy: String(data.uploadedBy),
            category: data.category === "owner" || data.category === "teacher"
              ? data.category
              : "student",
            storagePath: String(data.storagePath),
            contentType: String(data.contentType),
            createdAt: data.createdAt?.toDate?.().toISOString?.() ?? "",
          },
        ] as const;
      }),
    ),
  );
  return [...files.values()].slice(0, 100);
}

export async function listStudentAccounts(): Promise<StudentAccount[]> {
  const { database } = getServices();
  const studentsQuery = query(
    collection(database, "users"),
    where("role", "==", "student"),
    limit(100),
  );
  const snapshot = await getDocs(studentsQuery);
  return snapshot.docs.map((student) => ({
    uid: student.id,
    displayName: String(student.data().displayName ?? ""),
    email: String(student.data().email ?? ""),
  }));
}

export async function uploadAccountFile(
  file: File,
  ownerUid: string,
  uploadedBy: string,
): Promise<void> {
  const { database, storage } = getServices();
  const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(0, 120);
  const storagePath = `files/${ownerUid}/${crypto.randomUUID()}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
    customMetadata: { uploadedBy, category: "owner" },
  });

  try {
    await addDoc(collection(database, "userFiles"), {
      ownerUid,
      uploadedBy,
      category: "owner",
      name: file.name,
      contentType: file.type || "application/octet-stream",
      storagePath,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    await deleteObject(storageRef);
    throw error;
  }
}

export async function downloadAccountFile(file: StoredFile): Promise<Blob> {
  const { storage } = getServices();
  const bytes = await getBytes(ref(storage, file.storagePath));
  return new Blob([bytes], { type: file.contentType });
}

export async function listLearningContent(profile: AccountProfile): Promise<LearningContent[]> {
  const { database } = getServices();
  const contentCollection = collection(database, "learningContent");
  const contentQuery =
    profile.role === "owner"
      ? query(contentCollection, limit(100))
      : query(contentCollection, where("published", "==", true), limit(100));
  const snapshot = await getDocs(contentQuery);
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<LearningContent, "id">),
  }));
}

export async function saveLearningContent(
  profile: AccountProfile,
  content: Omit<LearningContent, "id" | "ownerUid">,
  id?: string,
): Promise<void> {
  if (profile.role !== "owner") throw new Error("Solo el propietario puede editar los materiales.");
  const { database } = getServices();
  const contentRef = id
    ? doc(database, "learningContent", id)
    : doc(collection(database, "learningContent"));
  const payload = {
    ...content,
    ownerUid: profile.uid,
    updatedAt: serverTimestamp(),
  };
  if (id) {
    await setDoc(contentRef, payload, { merge: true });
  } else {
    await setDoc(contentRef, { ...payload, createdAt: serverTimestamp() });
  }
}

export async function deleteLearningContent(
  profile: AccountProfile,
  id: string,
): Promise<void> {
  if (profile.role !== "owner") throw new Error("Solo el propietario puede eliminar materiales.");
  const { database } = getServices();
  await deleteDoc(doc(database, "learningContent", id));
}

export async function removeAccountFile(file: StoredFile): Promise<void> {
  const { database, storage } = getServices();
  await deleteObject(ref(storage, file.storagePath));
  await deleteDoc(doc(database, "userFiles", file.id));
}
