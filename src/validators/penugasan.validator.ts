import { z } from 'zod';

export const createPenugasanSchema = z.object({
  userId: z.string().uuid('Format userId tidak valid (harus UUID)'),
  prodiId: z.string().uuid('Format prodiId tidak valid (harus UUID)'),
});

export type CreatePenugasanInput = z.infer<typeof createPenugasanSchema>;