export type NoteType = 'dsa' | 'qa' | 'general';

export interface DSAData {
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pattern: string;
  problemStatement: string;
  implementations: {
    language: string;
    code: string;
  }[];
  timeComplexity: string;
  spaceComplexity: string;
  notes: string;
}

export interface QAData {
  topic: string;
  question: string;
  answer: string;
  importantPoints: string[];
}

export interface Note {
  id: string;
  userId: string;
  type: NoteType;
  title: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  content?: string;
  dsa?: DSAData;
  qa?: QAData;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
}
