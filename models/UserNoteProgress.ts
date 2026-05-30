import mongoose, { Document, Schema } from 'mongoose';

export interface IUserNoteProgress extends Document {
  userId: string;
  noteId: string;
  topicId: string;
  completed: boolean;
  completedAt?: Date;
}

const UserNoteProgressSchema = new Schema<IUserNoteProgress>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  noteId: {
    type: String,
    required: true,
  },
  topicId: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

UserNoteProgressSchema.index({ userId: 1, topicId: 1, noteId: 1 }, { unique: true });

if (mongoose.models.UserNoteProgress) {
  delete mongoose.models.UserNoteProgress;
}

export default mongoose.models.UserNoteProgress || mongoose.model<IUserNoteProgress>('UserNoteProgress', UserNoteProgressSchema);
