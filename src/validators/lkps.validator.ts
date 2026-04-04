import { z } from 'zod';

export const importLKPSSchema = z.object({
    prodiId: z.string('prodiId wajib diisi')
        .uuid('prodiId harus berupa format UUID yang valid'),
});

export type ImportLKPSInput = z.infer<typeof importLKPSSchema>;