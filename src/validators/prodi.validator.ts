import { z } from 'zod';

export const updateProdiSchema = z.object({
  fullname: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(200).optional(),
  abbreviation: z.string().min(1, 'Singkatan tidak boleh kosong').max(10).optional(),
  degree: z.string().min(1, 'Jenjang tidak boleh kosong').max(10).optional(),
});

export const upsertAccreditationSchema = z.object({
  grade: z.string().min(1, 'Nilai akreditasi tidak boleh kosong').max(50).optional(),
  startDate: z.string().datetime({ message: 'Format tanggal mulai tidak valid' }).optional(),
  endDate: z.string().datetime({ message: 'Format tanggal akhir tidak valid' }).optional(),
  certificateUrl: z.string().url('Format URL sertifikat tidak valid').optional(),
});

export type UpdateProdiInput = z.infer<typeof updateProdiSchema>;
export type UpsertAccreditationInput = z.infer<typeof upsertAccreditationSchema>;