import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';

export interface IMessage {
  question: string;
  answer: string;
}

export interface IConversation extends Document {
  user: IUser['_id'];
  summary: string; // short summary of the conversation
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    summary: { type: String, default: '' },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;