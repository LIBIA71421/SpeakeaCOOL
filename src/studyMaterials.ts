export type StudyUnit = {
  id: string;
  level: string;
  title: string;
  goal: string;
  topics: string[];
  practiceId: string;
};

export type PracticeSheet = {
  id: string;
  title: string;
  level: string;
  focus: string;
  instructions: string;
  exercises: string[];
  answerKey: string[];
  speakingPrompt: string;
};

export const studyUnits: StudyUnit[] = [
  {
    id: "unit-01",
    level: "A1 · INICIAL",
    title: "Presentarte y hablar de tu rutina",
    goal: "Saludar, dar información personal y describir hábitos cotidianos.",
    topics: ["Verb to be", "Present simple", "Preguntas con what / where / when", "Rutinas"],
    practiceId: "practice-a1",
  },
  {
    id: "unit-02",
    level: "A2 · BÁSICO",
    title: "Contar experiencias pasadas",
    goal: "Narrar actividades terminadas y hacer preguntas sobre el pasado.",
    topics: ["Past simple", "Verbos regulares e irregulares", "Expresiones de tiempo", "Storytelling"],
    practiceId: "practice-a2",
  },
  {
    id: "unit-03",
    level: "B1 · INTERMEDIO",
    title: "Conectar ideas y hablar de experiencias",
    goal: "Explicar experiencias y planes con ideas conectadas y ejemplos.",
    topics: ["Present perfect", "Conectores", "Opiniones", "Conversación extendida"],
    practiceId: "practice-b1",
  },
];

export const practiceSheets: PracticeSheet[] = [
  {
    id: "practice-a1",
    title: "Una semana en mi vida",
    level: "A1 · INICIAL",
    focus: "Present simple + rutinas",
    instructions: "Completa cada oración con la forma correcta del verbo entre paréntesis.",
    exercises: [
      "I ___ (study) English after lunch.",
      "My sister ___ (work) near the university.",
      "We ___ (not / watch) TV in the morning.",
      "___ you ___ (listen) to music every day?",
      "Leonardo ___ (teach) English on Saturdays.",
    ],
    answerKey: [
      "study",
      "works",
      "do not / don't watch",
      "Do / listen",
      "teaches",
    ],
    speakingPrompt:
      "Habla durante un minuto sobre tu rutina. Incluye tres actividades que haces y una que no haces.",
  },
  {
    id: "practice-a2",
    title: "El día que aprendí algo nuevo",
    level: "A2 · BÁSICO",
    focus: "Past simple",
    instructions: "Completa usando el pasado simple de los verbos entre paréntesis.",
    exercises: [
      "Last weekend, I ___ (visit) my cousin.",
      "We ___ (go) to a small café and ___ (talk) for hours.",
      "She ___ (not / bring) her notebook.",
      "Where ___ you ___ (meet) your best friend?",
      "I ___ (learn) a new English expression yesterday.",
    ],
    answerKey: [
      "visited",
      "went / talked",
      "did not / didn't bring",
      "did / meet",
      "learned",
    ],
    speakingPrompt:
      "Cuenta una anécdota breve. ¿Dónde estabas, qué pasó y cómo te sentiste?",
  },
  {
    id: "practice-b1",
    title: "Experiencias que me cambiaron",
    level: "B1 · INTERMEDIO",
    focus: "Present perfect + past simple",
    instructions: "Elige la forma correcta y explica por qué encaja con la idea.",
    exercises: [
      "I (have started / started) learning English three years ago.",
      "She (has never tried / never tried) speaking in public before.",
      "We (have finished / finished) the activity, so we can compare answers now.",
      "When (have you visited / did you visit) Sucre?",
      "He (has lived / lived) here since 2022.",
    ],
    answerKey: [
      "started — un momento concreto del pasado",
      "has never tried — experiencia hasta ahora",
      "have finished — resultado relevante ahora",
      "did you visit — pregunta por un momento pasado",
      "has lived — situación que continúa desde 2022",
    ],
    speakingPrompt:
      "Describe algo nuevo que hayas aprendido. ¿Cuándo lo empezaste y qué has descubierto desde entonces?",
  },
];
