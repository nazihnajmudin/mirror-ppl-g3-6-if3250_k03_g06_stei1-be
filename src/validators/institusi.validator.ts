import { z } from 'zod';

export const upsertInstitusiSchema = z.object({
    body: z.object({
        periode: z.string().min(1, 'Periode wajib diisi'),
        sheetName: z.string().min(1, 'Sheet name wajib diisi'),
        data: z.array(z.any()).min(1, 'Data institusi tidak boleh kosong'),
    }),
});