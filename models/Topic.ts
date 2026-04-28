import mongoose, { Document, Schema } from "mongoose";

export interface ITopic extends Document {
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  color?: string;
  isArchived: boolean;
  noteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    noteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

TopicSchema.index({ userId: 1, updatedAt: -1 });
TopicSchema.index({ userId: 1, isArchived: 1 });

if (mongoose.models.Topic) {
  delete mongoose.models.Topic;
}

export default mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
