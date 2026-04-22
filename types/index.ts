export type NoteType = 'dsa' | 'qa' | 'general';

export interface DSAData {
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pattern: string;
  problemStatement: string;
  implementations: {
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
  }[];
  notes: string;
  // Backward compatibility: old notes may have complexity at top level
  timeComplexity?: string;
  spaceComplexity?: string;
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
  createdAt: string;
  updatedAt: string;
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
