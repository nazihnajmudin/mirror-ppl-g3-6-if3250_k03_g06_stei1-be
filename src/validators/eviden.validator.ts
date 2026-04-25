import { z } from 'zod';

export const evidenSchema = z.object({
    prodiId: z.string().min(1, 'Program Studi wajib dipilih'),
    judul: z.string().min(1, 'Judul wajib diisi'),
    deskripsi: z.string().optional(),
    indikator: z.string().optional(),       // Akan diparsing dari JSON Stringified Array di controller
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    deletedFileIds: z.string().optional(),  // Array ID file lama yang dihapus saat Edit (JSON Stringified)
});

export type EvidenInput = z.infer<typeof evidenSchema>;