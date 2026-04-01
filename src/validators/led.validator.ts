import { z } from 'zod';

export const importLEDSchema = z.object({
    prodiId: z.coerce
        .number()
        .int('prodiId harus berupa angka bulat')
        .positive('prodiId tidak valid (harus lebih besar dari 0)'),
    periode: z.string()
        .min(4, 'Periode minimal 4 karakter (contoh: 2025)'),
});

export type ImportLEDInput = z.infer<typeof importLEDSchema>;