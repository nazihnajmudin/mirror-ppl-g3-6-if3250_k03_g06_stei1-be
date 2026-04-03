import { z } from 'zod';

export const createPenugasanSchema = z.object({
  userId: z.string().min(1, 'userId wajib diisi'),
  prodiId: z.string().min(1, 'prodiId wajib diisi'),
});

export type CreatePenugasanInput = z.infer<typeof createPenugasanSchema>;