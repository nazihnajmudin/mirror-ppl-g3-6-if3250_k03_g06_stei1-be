import { z } from 'zod';

export const importLEDSchema = z.object({
    prodiId: z.string().min(1, 'Prodi ID wajib diisi'),
    periode: z.string().min(1, 'Periode wajib diisi'),
});

export type ImportLEDInput = z.infer<typeof importLEDSchema>;