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
}

export interface QAData {
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
  topicId?: string | null;
  createdAt: string;
  updatedAt: string;
  content?: string;
  dsa?: DSAData;
  qa?: QAData;
}

export interface Topic {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  color?: string;
  isArchived: boolean;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
}
