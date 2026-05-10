import { z } from "zod";

export const qualitativeEntrySchema = z.object({
  code: z.string().min(1, "Kode indikator tidak boleh kosong"),
  qualitativeScore: z.number().min(0, "Skor kualitatif minimal 0").max(100, "Skor kualitatif maksimal 100").optional(),
  qualitativeNote: z.string().max(500, "Catatan maksimal 500 karakter").nullable().optional(),
}).refine(
  (data) => data.qualitativeScore !== undefined || (data.qualitativeNote && data.qualitativeNote.trim().length > 0),
  {
    message: "Minimal skor atau catatan harus diisi",
  }
);

export const updateSimulationQualitativeSchema = z.object({
  qualitativeScores: z.array(qualitativeEntrySchema).min(1, "Minimal satu skor kualitatif harus dikirim"),
});
