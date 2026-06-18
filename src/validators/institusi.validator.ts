import { z } from 'zod';

export const upsertInstitusiSchema = z.object({
    body: z.object({
        periode: z.string().regex(/^\d{4}$/, 'Periode harus berupa 4 digit tahun (contoh: 2025)'),
        prodiId: z.string().optional(),
        sheetName: z.string().min(1, 'Sheet name wajib diisi'),
        data: z.array(z.any()),
    }),
});