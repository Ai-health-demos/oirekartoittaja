// Jaetut kysymykset jotka voidaan käyttää useissa kyselyissä
export interface SharedQuestion {
  id: string;
  question: string;
  answers: Array<{
    text: string;
  }>;
  isShared: true; // Merkitsee että tämä on jaettu kysymys
}

// Oletuskysymykset jotka toistuvat usein kyselyissä
export const defaultSharedQuestions: SharedQuestion[] = [
  {
    id: 'shared_medications',
    question: 'Mitä lääkkeitä käytät säännöllisesti?',
    answers: [
      { text: 'Ei mitään' },
      { text: 'Verenpainelääkkeet' },
      { text: 'Diabeteslääkkeet' },
      { text: 'Kivunlievityslääkkeet' },
      { text: 'Muu, mikä?' }
    ],
    isShared: true
  },
  {
    id: 'shared_allergies',
    question: 'Onko sinulla allergiaa lääkkeille?',
    answers: [
      { text: 'Ei' },
      { text: 'Kyllä, penisilliini' },
      { text: 'Kyllä, muu antibiootti' },
      { text: 'Kyllä, jokin muu lääke' }
    ],
    isShared: true
  },
  {
    id: 'shared_previous_surgeries',
    question: 'Onko sinulle tehty leikkauksia aikaisemmin?',
    answers: [
      { text: 'Ei' },
      { text: 'Kyllä, sydänleikkaus' },
      { text: 'Kyllä, vatsaleikkaus' },
      { text: 'Kyllä, ortopedinen leikkaus' },
      { text: 'Kyllä, muu leikkaus' }
    ],
    isShared: true
  },
  {
    id: 'shared_smoking',
    question: 'Tupakoitko?',
    answers: [
      { text: 'En' },
      { text: 'Kyllä, säännöllisesti' },
      { text: 'Kyllä, satunnaisesti' },
      { text: 'Olen lopettanut' }
    ],
    isShared: true
  }
];

// Funktiot jaetulle kysymysten hallinnalle
export const getSharedQuestions = (): SharedQuestion[] => {
  if (typeof window === 'undefined') return defaultSharedQuestions;
  
  const stored = localStorage.getItem('sharedQuestions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultSharedQuestions;
    }
  }
  return defaultSharedQuestions;
};

export const saveSharedQuestions = (questions: SharedQuestion[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sharedQuestions', JSON.stringify(questions));
};

export const getSharedQuestionById = (id: string): SharedQuestion | null => {
  const questions = getSharedQuestions();
  return questions.find(q => q.id === id) || null;
};