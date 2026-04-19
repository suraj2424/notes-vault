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
  content: string;
  importantPoints: string[];
}

export interface Note {
  id: string;
  userId: string;
  type: NoteType;
  title: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  content?: string;
  dsa?: DSAData;
  qa?: QAData;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
}
