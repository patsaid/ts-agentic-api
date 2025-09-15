import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  hashed_password: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    hashed_password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;