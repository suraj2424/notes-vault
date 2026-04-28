import mongoose, { Document, Schema } from 'mongoose';
import { NoteType, DSAData, QAData } from '../types';

export interface INote extends Document {
  userId: string;
  type: NoteType;
  title: string;
  isFavorite: boolean;
  tags: string[];
  topicId?: string;
  content?: string;
  dsa?: DSAData;
  qa?: QAData;
  createdAt: Date;
  updatedAt: Date;
}

const DSASchema: Schema = new Schema({
  platform: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  pattern: { type: String, required: true },
  problemStatement: { type: String, required: true },
  implementations: [{
    language: { type: String, required: true },
    code: { type: String, required: true },
    timeComplexity: { type: String, required: true },
    spaceComplexity: { type: String, required: true },
  }],
  notes: { type: String }, // optional
}, { _id: false });

const QASchema: Schema = new Schema({
  topic: { type: String, required: true },
  content: { type: String, required: true },
  importantPoints: [{ type: String }],
}, { _id: false });

const NoteSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by user
  },
  type: {
    type: String,
    enum: ['dsa', 'qa', 'general'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  topicId: {
    type: String,
    default: null,
  },
  content: {
    type: String,
  },
  dsa: DSASchema,
  qa: QASchema,
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

// Indexes for optimized queries
NoteSchema.index({ userId: 1, updatedAt: -1 }); // For user notes sorted by recent
NoteSchema.index({ userId: 1, type: 1, updatedAt: -1 }); // For filtered queries
NoteSchema.index({ userId: 1, isFavorite: 1, updatedAt: -1 }); // For favorites filter
NoteSchema.index({ userId: 1, topicId: 1, updatedAt: -1 }); // For notes within a topic

// Index for search functionality - covers all note types
NoteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  'dsa.problemStatement': 'text',
  'dsa.notes': 'text',
  'qa.content': 'text',
  'qa.topic': 'text'
});

// Handle hot reload in development - delete cached model before redefining
if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
