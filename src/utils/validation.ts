import { z } from 'zod';

// ✅ User creation schema
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // plain password, will be hashed before saving
});

// ✅ Agent ask schema
export const agentAskSchema = z.object({
  userId: z.string(),
  question: z.string(),
  conversationId: z.string().optional(),
});
