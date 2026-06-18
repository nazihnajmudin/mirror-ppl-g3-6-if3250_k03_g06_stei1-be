import { z } from 'zod';

export const importLEDSchema = z.object({
    prodiId: z.string().min(1, 'Prodi ID wajib diisi'),
    periode: z.string().regex(/^\d{4}$/, 'Periode harus berupa 4 digit tahun (contoh: 2025)'),
});

export const createLEDFormSchema = z.object({
    template: z.string().min(1, 'Template LED wajib diisi'),
    periode: z.string().regex(/^\d{4}$/, 'Periode harus berupa 4 digit tahun (contoh: 2025)'),
    content: z.string().min(1, 'Konten LED wajib diisi'),
});

export type ImportLEDInput = z.infer<typeof importLEDSchema>;
export type CreateLEDFormInput = z.infer<typeof createLEDFormSchema>;