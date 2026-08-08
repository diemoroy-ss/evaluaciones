import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export interface Subject {
  id: string;
  name: string;
  color: string; // hex color code
  colorName: string; // name of the color in Spanish
}

export interface Evaluation {
  id: string;
  subjectId: string;
  date: string; // format YYYY-MM-DD
  type: "Sumativa" | "Acumulativa" | string;
  category?: "Evaluación" | "Actividad";
  contents: string; // bullet points/details
  fileUrl?: string; // Optional attached file URL
  fileName?: string; // Optional attached file name
  createdAt?: any;
}

export interface EventNotification {
  id: string;
  title: string;
  contents: string; // supports multiline list of shares or general message
  date: string; // YYYY-MM-DD
  createdAt?: any;
}

const SUBJECTS_COLLECTION = "subjects";
const EVALUATIONS_COLLECTION = "evaluations";
const NOTIFICATIONS_COLLECTION = "notifications";

// Timeout Helper
const TIMEOUT_MS = 3500; // 3.5 seconds timeout to prevent long loading delays

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de conexión a Firestore")), timeoutMs)
    )
  ]);
}

// Check if we are in client browser
const isBrowser = typeof window !== "undefined";

// Cache/Local DB helper
export const getLocalData = <T>(key: string): T[] => {
  if (!isBrowser) return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setLocalData = <T>(key: string, data: T[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getCachedSubjects = (): Subject[] => getLocalData<Subject>("local_subjects");
export const getCachedEvaluations = (): Evaluation[] => getLocalData<Evaluation>("local_evaluations");
export const getCachedNotifications = (): EventNotification[] => getLocalData<EventNotification>("local_notifications");

// Global indicator for offline mode
export let isOfflineMode = false;

export function setOfflineMode(value: boolean) {
  isOfflineMode = value;
  if (isBrowser) {
    if (value) {
      localStorage.setItem("db_offline_mode", "true");
    } else {
      localStorage.removeItem("db_offline_mode");
    }
  }
}

// Initial Data templates
export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "matematicas", name: "Matemáticas", color: "#2563eb", colorName: "Azul" },
  { id: "lenguaje", name: "Lenguaje", color: "#dc2626", colorName: "Rojo" },
  { id: "ciencias", name: "Ciencias", color: "#16a34a", colorName: "Verde" },
  { id: "musica", name: "Música", color: "#854d0e", colorName: "Café" },
  { id: "historia", name: "Historia", color: "#7c3aed", colorName: "Morado" },
  { id: "ingles", name: "Inglés", color: "#eab308", colorName: "Amarillo" },
  { id: "religion", name: "Religión", color: "#06b6d4", colorName: "Celeste" },
  { id: "educacion-fisica", name: "Educación Física", color: "#ea580c", colorName: "Naranjo" },
  { id: "tecnologia", name: "Tecnología", color: "#db2777", colorName: "Rosado" },
  { id: "artes-visuales", name: "Artes Visuales", color: "#4b5563", colorName: "Gris" },
  { id: "orientacion", name: "Orientación", color: "#64748b", colorName: "Gris Pizarra" }
];

export const INITIAL_EVALUATIONS = [
  {
    id: "eval-1",
    subjectId: "ciencias",
    date: "2026-08-05",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Partes de las plantas y sus funciones.\n- Partes de la flor.\n- Polinización.\n- Polinizadores."
  },
  {
    id: "eval-2",
    subjectId: "lenguaje",
    date: "2026-08-06",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Texto informativo.\n- Comprensión lectora.\n- Prefijos y sufijos.\n- Diminutivos.\n- Uso de \"s\" y \"z\".\n- Escritura creativa."
  },
  {
    id: "eval-3",
    subjectId: "matematicas",
    date: "2026-08-06",
    type: "Acumulativa",
    contents: "Control de tablas de multiplicar 2, 3, 4, 5 y 10."
  },
  {
    id: "eval-4",
    subjectId: "matematicas",
    date: "2026-08-13",
    type: "Acumulativa",
    contents: "Control de tablas de multiplicar 4, 5, 6 y 7."
  },
  {
    id: "eval-5",
    subjectId: "historia",
    date: "2026-08-14",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Continentes y océanos (qué son, ubicación y nombres).\n- Diferencias y semejanzas del globo terráqueo y del planisferio.\n- Zonas climáticas.\n- Líneas paralelas principales."
  },
  {
    id: "eval-6",
    subjectId: "matematicas",
    date: "2026-08-17",
    type: "Acumulativa",
    contents: "Control tablas de multiplicar 6, 7, 8 y 9"
  },
  {
    id: "eval-7",
    subjectId: "artes-visuales",
    date: "2026-08-18",
    type: "Sumativa",
    contents: "Evaluación de libro acerca de las plantas y flores."
  },
  {
    id: "eval-8",
    subjectId: "matematicas",
    date: "2026-08-20",
    type: "Sumativa",
    contents: "Evaluación Parcial Unidad 3\n* Secuencias numéricas\n* Resolución de ejercicios de suma (con y sin reserva) y resta (con y sin canje) Ámbito numérico hasta el 100.000\n* Multiplicación y división en la resolución de situaciones."
  },
  {
    id: "eval-9",
    subjectId: "ingles",
    date: "2026-08-20",
    type: "Sumativa",
    contents: "Presentación Oral Plants\nSe enviará Rúbrica"
  },
  {
    id: "eval-10",
    subjectId: "tecnologia",
    date: "2026-08-24",
    type: "Sumativa",
    contents: "Experimento de la luz.\nSe enviará rúbrica."
  },
  {
    id: "eval-11",
    subjectId: "matematicas",
    date: "2026-08-26",
    type: "Sumativa",
    contents: "Control de tablas de multiplicar del 1 al 10."
  },
  {
    id: "eval-12",
    subjectId: "lenguaje",
    date: "2026-08-27",
    type: "Sumativa",
    contents: "Prueba de lectura domiciliaria \"El zorrito abandonado\" de Irina Korschunow."
  },
  {
    id: "eval-13",
    subjectId: "educacion-fisica",
    date: "2026-08-28",
    type: "Sumativa",
    contents: "Evaluación práctica de la ejecución de la danza folclórica \"Taquirari\", considerando la coordinación motriz, el ritmo, la secuencia de pasos, la expresión corporal y el trabajo colaborativo."
  },
  {
    id: "eval-14",
    subjectId: "matematicas",
    date: "2026-09-02",
    type: "Sumativa",
    contents: "Control \"La hora\"\n* Identificar: horas en punto, horas y media y horas con minutos.\n* Dibujar horas en un reloj análogo y digital.\n* Resolución de situaciones con la hora."
  },
  {
    id: "eval-15",
    subjectId: "musica",
    date: "2026-09-04",
    type: "Sumativa",
    contents: "Los estudiantes ejecutan musicograma (polirritmia) y cantan ejercicio de Solfeo de los solfeos 1A Número 18 y 19."
  },
  {
    id: "act-1",
    subjectId: "ingles",
    date: "2026-08-03",
    category: "Actividad",
    type: "Materiales",
    contents: "Los estudiantes deberán traer el workbook del 2° semestre ya que se comenzará a utilizar."
  },
  {
    id: "act-2",
    subjectId: "artes-visuales",
    date: "2026-08-04",
    category: "Actividad",
    type: "Materiales",
    contents: "Se solicita que los estudiantes tengan sus cotonas para la actividad.\nCada estudiante debe entregar su guía de Tutén terminada."
  },
  {
    id: "act-3",
    subjectId: "orientacion",
    date: "2026-08-05",
    category: "Actividad",
    type: "Convivencia",
    contents: "La hora del chocolate: Se solicita traer algo para compartir (considerar 13 niños). Tienen leches de chocolate suficientes para las próximas \"horas del chocolate\"."
  },
  {
    id: "act-4",
    subjectId: "ingles",
    date: "2026-08-06",
    category: "Actividad",
    type: "Tarea",
    contents: "Tarea Unit 2, ficha 10, ejercicio 6."
  }
];

export const INITIAL_NOTIFICATIONS: EventNotification[] = [
  {
    id: "notif-1",
    title: "Hora del Chocolate 🥯☕",
    date: "2026-08-05", // Primer compartir de Agosto
    contents: `Planificación de compartir:
08.07 - Trini Aliaga
15.07 - Isi Castillo
22.07 - Bastián Jiménez
29.07 - Isi Martinez
05.08 - León Mendez
12.08 - Santino Moroni
19.08 - Thiago Muñoz
26.08 - Gaspar Rozas
02.09 - Paloma Silva
09.09 - Angela Taquides
16.09 - Elisa Trigo
23.09 - Leyla Zúñiga`
  }
];

// Initialize LocalStorage if empty
const initializeLocalStorageIfEmpty = () => {
  if (!isBrowser) return;
  const subs = localStorage.getItem("local_subjects");
  const evs = localStorage.getItem("local_evaluations");
  const notifs = localStorage.getItem("local_notifications");
  
  if (!subs) {
    setLocalData("local_subjects", DEFAULT_SUBJECTS);
  }
  if (!evs) {
    setLocalData("local_evaluations", INITIAL_EVALUATIONS);
  }
  if (!notifs) {
    setLocalData("local_notifications", INITIAL_NOTIFICATIONS);
  }
};

// Call initialization
initializeLocalStorageIfEmpty();

// --- Subject CRUD ---
export async function getSubjects(): Promise<Subject[]> {
  try {
    const q = query(collection(db, SUBJECTS_COLLECTION), orderBy("name", "asc"));
    const querySnapshot = await withTimeout(getDocs(q), TIMEOUT_MS);
    const subjects: Subject[] = [];
    querySnapshot.forEach((doc) => {
      subjects.push({ id: doc.id, ...doc.data() } as Subject);
    });
    // Cache locally & clear offline mode
    setLocalData("local_subjects", subjects);
    setOfflineMode(false);
    return subjects;
  } catch (error) {
    console.warn("Firestore connection failed. Falling back to LocalStorage.", error);
    setOfflineMode(true);
    return getLocalData<Subject>("local_subjects");
  }
}

export async function saveSubject(subject: Omit<Subject, "id">, id?: string): Promise<string> {
  const generatedId = id || subject.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  const fullSubject: Subject = { id: generatedId, ...subject };

  // Always update LocalStorage
  const localSubjects = getLocalData<Subject>("local_subjects");
  const idx = localSubjects.findIndex(s => s.id === generatedId);
  if (idx >= 0) {
    localSubjects[idx] = fullSubject;
  } else {
    localSubjects.push(fullSubject);
  }
  setLocalData("local_subjects", localSubjects);

  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, generatedId);
    await withTimeout(setDoc(docRef, subject, { merge: true }), TIMEOUT_MS);
    setOfflineMode(false);
    return generatedId;
  } catch (error) {
    console.warn("Firestore write failed, saved locally", error);
    setOfflineMode(true);
    return generatedId;
  }
}

export async function deleteSubject(id: string): Promise<void> {
  // Always update LocalStorage
  const localSubjects = getLocalData<Subject>("local_subjects");
  setLocalData("local_subjects", localSubjects.filter(s => s.id !== id));

  // Also remove evaluations associated locally
  const localEvals = getLocalData<Evaluation>("local_evaluations");
  setLocalData("local_evaluations", localEvals.filter(e => e.subjectId !== id));

  try {
    await withTimeout(deleteDoc(doc(db, SUBJECTS_COLLECTION, id)), TIMEOUT_MS);
    setOfflineMode(false);
  } catch (error) {
    console.warn("Firestore delete failed, updated locally", error);
    setOfflineMode(true);
  }
}

// --- Evaluation CRUD ---
export async function getEvaluations(): Promise<Evaluation[]> {
  try {
    const q = query(collection(db, EVALUATIONS_COLLECTION), orderBy("date", "asc"));
    const querySnapshot = await withTimeout(getDocs(q), TIMEOUT_MS);
    const evaluations: Evaluation[] = [];
    querySnapshot.forEach((doc) => {
      evaluations.push({ id: doc.id, ...doc.data() } as Evaluation);
    });
    // Cache locally & clear offline mode
    setLocalData("local_evaluations", evaluations);
    setOfflineMode(false);
    return evaluations;
  } catch (error) {
    console.warn("Firestore connection failed. Falling back to LocalStorage.", error);
    setOfflineMode(true);
    return getLocalData<Evaluation>("local_evaluations");
  }
}

export async function saveEvaluation(evaluation: Omit<Evaluation, "id">, id?: string): Promise<string> {
  const generatedId = id || Math.random().toString(36).substring(2, 9);
  const fullEvaluation: Evaluation = { id: generatedId, ...evaluation };

  // Always update LocalStorage
  const localEvals = getLocalData<Evaluation>("local_evaluations");
  const idx = localEvals.findIndex(e => e.id === generatedId);
  if (idx >= 0) {
    localEvals[idx] = fullEvaluation;
  } else {
    localEvals.push(fullEvaluation);
  }
  setLocalData("local_evaluations", localEvals);

  try {
    const docRef = doc(db, EVALUATIONS_COLLECTION, generatedId);
    await withTimeout(setDoc(docRef, evaluation, { merge: true }), TIMEOUT_MS);
    setOfflineMode(false);
    return generatedId;
  } catch (error) {
    console.warn("Firestore write failed, saved locally", error);
    setOfflineMode(true);
    return generatedId;
  }
}

export async function deleteEvaluation(id: string): Promise<void> {
  // Always update LocalStorage
  const localEvals = getLocalData<Evaluation>("local_evaluations");
  setLocalData("local_evaluations", localEvals.filter(e => e.id !== id));

  try {
    await withTimeout(deleteDoc(doc(db, EVALUATIONS_COLLECTION, id)), TIMEOUT_MS);
    setOfflineMode(false);
  } catch (error) {
    console.warn("Firestore delete failed, updated locally", error);
    setOfflineMode(true);
  }
}

// --- Notification CRUD ---
export async function getNotifications(): Promise<EventNotification[]> {
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy("date", "asc"));
    const querySnapshot = await withTimeout(getDocs(q), TIMEOUT_MS);
    const notifications: EventNotification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as EventNotification);
    });
    // Cache locally & clear offline mode
    setLocalData("local_notifications", notifications);
    setOfflineMode(false);
    return notifications;
  } catch (error) {
    console.warn("Firestore connection failed. Falling back to LocalStorage.", error);
    setOfflineMode(true);
    return getLocalData<EventNotification>("local_notifications");
  }
}

export async function saveNotification(notification: Omit<EventNotification, "id">, id?: string): Promise<string> {
  const generatedId = id || Math.random().toString(36).substring(2, 9);
  const fullNotification: EventNotification = { id: generatedId, ...notification };

  // Always update LocalStorage
  const localNotifs = getLocalData<EventNotification>("local_notifications");
  const idx = localNotifs.findIndex(n => n.id === generatedId);
  if (idx >= 0) {
    localNotifs[idx] = fullNotification;
  } else {
    localNotifs.push(fullNotification);
  }
  setLocalData("local_notifications", localNotifs);

  if (isOfflineMode) {
    return generatedId;
  }

  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, generatedId);
    await withTimeout(setDoc(docRef, notification, { merge: true }), TIMEOUT_MS);
    return generatedId;
  } catch (error) {
    console.warn("Firestore write failed, saved locally", error);
    setOfflineMode(true);
    return generatedId;
  }
}

export async function deleteNotification(id: string): Promise<void> {
  // Always update LocalStorage
  const localNotifs = getLocalData<EventNotification>("local_notifications");
  setLocalData("local_notifications", localNotifs.filter(n => n.id !== id));

  if (isOfflineMode) {
    return;
  }

  try {
    await withTimeout(deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id)), TIMEOUT_MS);
  } catch (error) {
    console.warn("Firestore delete failed, updated locally", error);
    setOfflineMode(true);
  }
}

// --- Seeding Script ---
export async function seedDatabase(): Promise<void> {
  // Seed LocalStorage
  setLocalData("local_subjects", DEFAULT_SUBJECTS);
  setLocalData("local_evaluations", INITIAL_EVALUATIONS);
  setLocalData("local_notifications", INITIAL_NOTIFICATIONS);

  if (isOfflineMode) {
    console.log("LocalStorage seeded successfully.");
    return;
  }

  try {
    // Try to seed Firestore
    for (const sub of DEFAULT_SUBJECTS) {
      const docRef = doc(db, SUBJECTS_COLLECTION, sub.id);
      await withTimeout(setDoc(docRef, { name: sub.name, color: sub.color, colorName: sub.colorName }), TIMEOUT_MS);
    }

    // Clear and seed evaluations in Firestore
    const evRefs = await withTimeout(getDocs(collection(db, EVALUATIONS_COLLECTION)), TIMEOUT_MS);
    for (const d of evRefs.docs) {
      await withTimeout(deleteDoc(doc(db, EVALUATIONS_COLLECTION, d.id)), TIMEOUT_MS);
    }

    for (const ev of INITIAL_EVALUATIONS) {
      const docRef = doc(db, EVALUATIONS_COLLECTION, ev.id);
      await withTimeout(setDoc(docRef, {
        subjectId: ev.subjectId,
        date: ev.date,
        type: ev.type,
        contents: ev.contents,
        createdAt: new Date().toISOString()
      }), TIMEOUT_MS);
    }

    // Clear and seed notifications in Firestore
    const notifRefs = await withTimeout(getDocs(collection(db, NOTIFICATIONS_COLLECTION)), TIMEOUT_MS);
    for (const d of notifRefs.docs) {
      await withTimeout(deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, d.id)), TIMEOUT_MS);
    }

    for (const notif of INITIAL_NOTIFICATIONS) {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
      await withTimeout(setDoc(docRef, {
        title: notif.title,
        date: notif.date,
        contents: notif.contents,
        createdAt: new Date().toISOString()
      }), TIMEOUT_MS);
    }
    
    console.log("Firestore and LocalStorage seeded successfully!");
  } catch (error) {
    console.warn("Firestore seed failed, local seed completed", error);
    setOfflineMode(true);
    throw error;
  }
}

// --- File Upload Helper ---
export async function uploadFileToStorage(file: File): Promise<{ url: string; name: string }> {
  // Removido el check de isOfflineMode: 
  // Permitimos intentar subir a Storage independientemente del estado de Firestore,
  // ya que puede que Firestore esté offline pero la conexión a internet sí funcione.
  try {
    // Generate a unique filename to prevent overwrites
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `uploads/${uniqueFileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return {
      url: downloadUrl,
      name: file.name
    };
  } catch (error) {
    console.error("Error al subir archivo a Firebase Storage:", error);
    throw new Error("Error al subir el archivo. Verifica tu conexión a internet.");
  }
}
