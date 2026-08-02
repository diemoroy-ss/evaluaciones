import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTov2kXYDy8DpYXWGkox9FbTtJSU37vs4",
  authDomain: "evaluaciones-81e2f.firebaseapp.com",
  projectId: "evaluaciones-81e2f",
  storageBucket: "evaluaciones-81e2f.firebasestorage.app",
  messagingSenderId: "296572649775",
  appId: "1:296572649775:web:c812eb82c2dc3678b3a1da",
  measurementId: "G-RBCMH3N755"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_SUBJECTS = [
  { name: "Matemáticas", color: "#2563eb", colorName: "Azul" },
  { name: "Lenguaje", color: "#dc2626", colorName: "Rojo" },
  { name: "Ciencias", color: "#16a34a", colorName: "Verde" },
  { name: "Música", color: "#854d0e", colorName: "Café" },
  { name: "Historia", color: "#7c3aed", colorName: "Morado" },
  { name: "Inglés", color: "#eab308", colorName: "Amarillo" },
  { name: "Religión", color: "#06b6d4", colorName: "Celeste" },
  { name: "Educación Física", color: "#ea580c", colorName: "Naranjo" },
  { name: "Tecnología", color: "#db2777", colorName: "Rosado" },
  { name: "Artes Visuales", color: "#4b5563", colorName: "Gris" }
];

const INITIAL_EVALUATIONS = [
  {
    subjectId: "ciencias",
    date: "2026-08-05",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Partes de las plantas y sus funciones.\n- Partes de la flor.\n- Polinización.\n- Polinizadores."
  },
  {
    subjectId: "lenguaje",
    date: "2026-08-06",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Texto informativo.\n- Comprensión lectora.\n- Prefijos y sufijos.\n- Diminutivos.\n- Uso de \"s\" y \"z\".\n- Escritura creativa."
  },
  {
    subjectId: "matematicas",
    date: "2026-08-06",
    type: "Acumulativa",
    contents: "Control de tablas de multiplicar 2, 3, 4, 5 y 10."
  },
  {
    subjectId: "matematicas",
    date: "2026-08-13",
    type: "Acumulativa",
    contents: "Control de tablas de multiplicar 4, 5, 6 y 7."
  },
  {
    subjectId: "historia",
    date: "2026-08-14",
    type: "Sumativa",
    contents: "Evaluación final U.2\n- Continentes y océanos (qué son, ubicación y nombres).\n- Diferencias y semejanzas del globo terráqueo y del planisferio.\n- Zonas climáticas.\n- Líneas paralelas principales."
  },
  {
    subjectId: "matematicas",
    date: "2026-08-17",
    type: "Acumulativa",
    contents: "Control tablas de multiplicar 6, 7, 8 y 9"
  },
  {
    subjectId: "artes-visuales",
    date: "2026-08-18",
    type: "Sumativa",
    contents: "Evaluación de libro acerca de las plantas y flores."
  },
  {
    subjectId: "matematicas",
    date: "2026-08-20",
    type: "Sumativa",
    contents: "Evaluación Parcial Unidad 3\n* Secuencias numéricas\n* Resolución de ejercicios de suma (con y sin reserva) y resta (con y sin canje) Ámbito numérico hasta el 100.000\n* Multiplicación y división en la resolución de situaciones."
  },
  {
    subjectId: "ingles",
    date: "2026-08-20",
    type: "Sumativa",
    contents: "Presentación Oral Plants\nSe enviará Rúbrica"
  },
  {
    subjectId: "tecnologia",
    date: "2026-08-24",
    type: "Sumativa",
    contents: "Experimento de la luz.\nSe enviará rúbrica."
  },
  {
    subjectId: "matematicas",
    date: "2026-08-26",
    type: "Sumativa",
    contents: "Control de tablas de multiplicar del 1 al 10."
  },
  {
    subjectId: "lenguaje",
    date: "2026-08-27",
    type: "Sumativa",
    contents: "Prueba de lectura domiciliaria \"El zorrito abandonado\" de Irina Korschunow."
  },
  {
    subjectId: "educacion-fisica",
    date: "2026-08-28",
    type: "Sumativa",
    contents: "Evaluación práctica de la ejecución de la danza folclórica \"Taquirari\", considerando la coordinación motriz, el ritmo, la secuencia de pasos, la expresión corporal y el trabajo colaborativo."
  },
  {
    subjectId: "matematicas",
    date: "2026-09-02",
    type: "Sumativa",
    contents: "Control \"La hora\"\n* Identificar: horas en punto, horas y media y horas con minutos.\n* Dibujar horas en un reloj análogo y digital.\n* Resolución de situaciones con la hora."
  },
  {
    subjectId: "musica",
    date: "2026-09-04",
    type: "Sumativa",
    contents: "Los estudiantes ejecutan musicograma (polirritmia) y cantan ejercicio de Solfeo de los solfeos 1A Número 18 y 19."
  }
];

async function seed() {
  console.log("Starting seed script...");
  try {
    // 1. Seed subjects
    for (const sub of DEFAULT_SUBJECTS) {
      const generatedId = sub.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
      const docRef = doc(db, "subjects", generatedId);
      await setDoc(docRef, sub, { merge: true });
      console.log(`Seeded subject: ${sub.name} -> ${generatedId}`);
    }

    // 2. Clear existing evaluations
    const evRefs = await getDocs(collection(db, "evaluations"));
    for (const d of evRefs.docs) {
      await deleteDoc(doc(db, "evaluations", d.id));
    }
    console.log("Cleared old evaluations.");

    // 3. Seed evaluations
    for (const ev of INITIAL_EVALUATIONS) {
      const docRef = await addDoc(collection(db, "evaluations"), {
        ...ev,
        createdAt: new Date().toISOString()
      });
      console.log(`Seeded evaluation on ${ev.date} for ${ev.subjectId}: ${docRef.id}`);
    }

    console.log("All data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running seed script:", error);
    process.exit(1);
  }
}

seed();
