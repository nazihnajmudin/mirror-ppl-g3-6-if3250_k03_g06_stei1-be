import { z } from 'zod';

export const updateDashboardSchema = z
  .object({
    documentLKPS: z
      .array(
        z.object({
          id: z.string().min(1, 'Document ID tidak boleh kosong'),
          status: z.enum(['DRAFT', 'FINAL', 'SUBMITTED']).optional(),
          content: z.any().optional(), // LKPS content berupa JSON
        })
      )
      .optional(),
    documentLED: z
      .array(
        z.object({
          id: z.string().min(1, 'Document ID tidak boleh kosong'),
          status: z.enum(['DRAFT', 'FINAL', 'SUBMITTED']).optional(),
          content: z.string().optional(), // LED content berupa String (path file)
        })
      )
      .optional(),
    accreditationInfo: z
      .object({
        grade: z.string().max(2, 'Grade maksimal 2 karakter').optional(),
        startDate: z
          .string()
          .datetime('Format tanggal tidak valid')
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
        endDate: z
          .string()
          .datetime('Format tanggal tidak valid')
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
      })
      .optional(),
  })
  .refine(
    (data) => {
      return data.documentLKPS || data.documentLED || data.accreditationInfo;
    },
    { message: 'Minimal salah satu field harus diupdate (documents atau accreditationInfo)' }
  );

export type UpdateDashboardInput = z.infer<typeof updateDashboardSchema>;