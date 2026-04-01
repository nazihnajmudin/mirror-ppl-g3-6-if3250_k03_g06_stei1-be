import { z } from 'zod';

export const importLEDSchema = z.object({
    prodiId: z.string('prodiId wajib diisi')
        .uuid('prodiId harus berupa format UUID yang valid'),
    periode: z.string()
        .min(4, 'Periode minimal 4 karakter (contoh: 2025)'),
});

export type ImportLEDInput = z.infer<typeof importLEDSchema>;