import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const agentQuerySchema = z.object({
  question: z.string().min(1),
});
