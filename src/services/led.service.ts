import prisma from '../config/database.config';
import { storageProvider } from '../utils/storage';
import { DocumentStatus } from '@prisma/client';
import { generateLEDFormDocxBuffer, buildLEDFormFilename } from '../exporters/ledForm.exporter';

interface ImportLEDInput {
    prodiId: string;
    pengunggahId: string;
    periode: string;
    file: Express.Multer.File;
}

interface CreateLEDFormInput {
  prodiId: string;
  template: 'INFOKOM' | 'LAM_TEKNIK';
  periode: string;
  content: Record<string, any>;
  createdById: string;
}

interface ExportLEDFormResult {
  buffer: Buffer;
  filename: string;
}

/**
 * Import LED Functionality
 * Menyimpan file fisik via StorageProvider, mencatat ke DB, dan menentukan versi otomatis.
 * @param data 
 * @returns 
 */
export const importLED = async (data: ImportLEDInput) => {
    const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
    if (!prodi) throw new Error('Program studi tidak ditemukan');

    const isLocked = await prisma.documentLED.findFirst({
        where: { prodiId: data.prodiId, periode: data.periode, status: 'FINAL', deletedAt: null } as any
    });
    if (isLocked) throw new Error('Terdapat Dokumen LED berstatus FINAL pada periode ini. Buka kunci terlebih dahulu untuk mengunggah versi baru.');

    const user = await prisma.user.findUnique({ where: { id: data.pengunggahId } });
    if (!user) throw new Error('Pengunggah tidak ditemukan');

    const latestDoc = await prisma.documentLED.findFirst({
        where: { prodiId: data.prodiId, periode: data.periode },
        orderBy: { versi: 'desc' },
    });

    const newVersi = latestDoc ? latestDoc.versi + 1 : 1;
    const savedFileName = await storageProvider.upload(data.file, 'led');

    const dokumen = await prisma.documentLED.create({
        data: {
            name: data.file.originalname, 
            content: savedFileName,       // path/key dari file
            ukuran: data.file.size,
            periode: data.periode,
            versi: newVersi,
            status: DocumentStatus.DRAFT,
            prodiId: data.prodiId,
            pengunggahId: data.pengunggahId,
        },
        include: {
            prodi: { select: { fullname: true } }, 
            pengunggah: { select: { name: true, email: true } },
        }
    });

    return dokumen;
};

/**
 * Export LED Functionality
 * Mencari dokumen versi terbaru berdasarkan Prodi dan Periode untuk diunduh.
 * @param prodiId 
 * @param periode 
 * @returns 
 */
export const exportLED = async (prodiId: string, periode: string) => {
    const latestDoc = await prisma.documentLED.findFirst({
        where: { prodiId, periode },
        orderBy: { versi: 'desc' },
    });

    if (!latestDoc || !latestDoc.content) {
        throw new Error(`Dokumen LED untuk periode ${periode} belum tersedia.`);
    }

    const filePath = storageProvider.getFilePath(latestDoc.content, 'led');

    return { dokumen: latestDoc, filePath };
};

/**
 * Upload History
 * Mendapatkan riwayat versi dokumen LED
 * @param prodiId 
 * @param periode 
 * @returns 
 */
export const getLEDHistory = async (prodiId: string, periode: string) => {
    return prisma.documentLED.findMany({
        where: { prodiId, periode, deletedAt: null } as any,
        orderBy: { versi: 'desc' },
        include: { pengunggah: { select: { name: true, role: true } } }
    });
};

/**
 * Mendapatkan daftar periode yang tersedia untuk sebuah Prodi
 * Diambil dari riwayat dokumen yang ada + periode aktif dari Akreditasi
 * @param prodiId 
 * @returns 
 */
export const getAvailablePeriods = async (prodiId: string): Promise<string[]> => {
    const docs = await prisma.documentLED.findMany({
        where: { prodiId },
        select: { periode: true },
        distinct: ['periode'],
    });

    const periods = new Set(docs.map((d) => d.periode));

    const akreditasi = await prisma.accreditationInfo.findUnique({
        where: { prodiId },
    });

    if (akreditasi && akreditasi.startDate) {
        const startYear = new Date(akreditasi.startDate).getFullYear().toString();
        periods.add(startYear);
    }

    return Array.from(periods).sort();
};

/**
 * Mengambil dokumen LED spesifik berdasarkan ID (buat liat versi lama)
 * @param id 
 * @returns 
 */
export const exportLEDById = async (id: string) => {
    const doc = await prisma.documentLED.findUnique({
        where: { id },
    });

    if (!doc || !doc.content) {
        throw new Error(`Dokumen LED tidak ditemukan.`);
    }

    const filePath = storageProvider.getFilePath(doc.content, 'led');

    return { dokumen: doc, filePath };
};

export const createLEDFormVersion = async (data: CreateLEDFormInput) => {
    const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
    if (!prodi) throw new Error('Program studi tidak ditemukan');

    const isLocked = await (prisma as any).ledForm.findFirst({
        where: { prodiId: data.prodiId, periode: data.periode, template: data.template, status: 'FINAL' }
    });
    if (isLocked) throw new Error('Terdapat Form LED berstatus FINAL pada periode ini. Buka kunci terlebih dahulu untuk menyimpan form versi baru.');

    const user = await prisma.user.findUnique({ where: { id: data.createdById } });
    if (!user) throw new Error('Pengguna tidak ditemukan');

    const latestForm = await (prisma as any).ledForm.findFirst({
        where: { 
            prodiId: data.prodiId, 
            periode: data.periode,
            template: data.template 
        },
        orderBy: { versi: 'desc' },
    });

    const newVersi = latestForm ? latestForm.versi + 1 : 1;

    return (prisma as any).ledForm.create({
        data: {
            prodiId: data.prodiId,
            template: data.template,
            periode: data.periode,
            versi: newVersi,
            status: DocumentStatus.DRAFT,
            content: data.content,
            createdById: data.createdById,
        },
        include: {
            prodi: { select: { fullname: true } },
            createdBy: { select: { name: true, email: true } },
        },
    });
};

export const getLEDFormHistory = async (prodiId: string, periode: string, template?: string) => {
  const where: any = { prodiId, periode };
  if (template) where.template = template;
  return (prisma as any).ledForm.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  });
};

export const getLEDFormVersionById = async (versionId: string) => {
  return (prisma as any).ledForm.findUnique({
    where: { id: versionId },
    include: {
      prodi: { select: { fullname: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });
};

export const getLatestLEDFormVersion = async (prodiId: string, periode?: string, template?: string) => {
  const where: any = { prodiId };
  if (periode) where.periode = periode;
  if (template) where.template = template;

  return (prisma as any).ledForm.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      prodi: { select: { fullname: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });
};

export const exportLEDForm = async (rawId: string, periode?: string, template?: string): Promise<ExportLEDFormResult> => {
  let version = await (prisma as any).ledForm.findUnique({
    where: { id: rawId },
    include: {
      prodi: { select: { fullname: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!version) {
    const latestByProdi = await getLatestLEDFormVersion(rawId, periode, template);
    if (!latestByProdi) {
      throw new Error(`Dokumen LED form belum tersedia untuk prodi atau versi yang diminta.`);
    }
    version = latestByProdi;
  }

  const versionNumber = version.versi;

  const rawContent = version.content;
  const parsedContent: Record<string, string> = typeof rawContent === 'string'
    ? JSON.parse(rawContent)
    : ((rawContent as Record<string, string>) ?? {});

  const buffer = await generateLEDFormDocxBuffer({
    template: version.template,
    content: parsedContent,
    prodiName: version.prodi.fullname,
    periode: version.periode,
  });

  const filename = buildLEDFormFilename(version.prodi.fullname, versionNumber, version.periode);
  return { buffer, filename };
};

/**
 * Soft Delete Single
 * @param id 
 * @returns 
 */
export const softDeleteDocument = async (id: string) => {
    const doc = await prisma.documentLED.findUnique({ where: { id } });
    if (doc?.status === 'FINAL') {
        throw new Error('Dokumen LED yang berstatus FINAL tidak dapat dihapus.');
    }

    return prisma.documentLED.update({
        where: { id },
        data: { deletedAt: new Date() } as any
    });
};

/**
 * Fungsi Soft Delete All Drafts
 * @param prodiId 
 * @param periode 
 * @returns 
 */
export const softDeleteAllDrafts = async (prodiId: string, periode: string) => {
    // Cek apakah ada dokumen FINAL 
    const hasFinal = await prisma.documentLED.findFirst({
        where: { prodiId, periode, status: 'FINAL', deletedAt: null } as any
    });

    if (!hasFinal) {
        throw new Error('Penghapusan masal draft hanya diizinkan jika sudah ada minimal satu dokumen FINAL.');
    }

    return prisma.documentLED.updateMany({
        where: { 
            prodiId, 
            periode, 
            status: 'DRAFT', 
            deletedAt: null 
        } as any,
        data: { deletedAt: new Date() } as any
    });
};

export const toggleDocumentLEDStatus = async (id: string, targetStatus: DocumentStatus, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        const targetDoc = await tx.documentLED.findUnique({ where: { id } });
        if (!targetDoc) throw new Error('Dokumen LED tidak ditemukan');

        if (targetStatus === DocumentStatus.FINAL) {
            await tx.documentLED.updateMany({
                where: { prodiId: targetDoc.prodiId, periode: targetDoc.periode, status: DocumentStatus.FINAL, deletedAt: null, id: { not: id } } as any,
                data: { status: DocumentStatus.DRAFT, lockedAt: null, lockedBy: null } as any
            });
            return await tx.documentLED.update({
                where: { id },
                data: { status: DocumentStatus.FINAL, lockedAt: new Date(), lockedBy: userId } as any
            });
        } else {
            return await tx.documentLED.update({
                where: { id },
                data: { status: DocumentStatus.DRAFT, lockedAt: null, lockedBy: null } as any
            });
        }
    });
};

export const toggleLedFormStatus = async (id: string, targetStatus: DocumentStatus, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        const targetForm = await (tx as any).ledForm.findUnique({ where: { id } });
        if (!targetForm) throw new Error('LED Form tidak ditemukan');

        if (targetStatus === DocumentStatus.FINAL) {
            await (tx as any).ledForm.updateMany({
                where: { prodiId: targetForm.prodiId, periode: targetForm.periode, template: targetForm.template, status: DocumentStatus.FINAL, id: { not: id } },
                data: { status: DocumentStatus.DRAFT, lockedAt: null, lockedBy: null }
            });
            return await (tx as any).ledForm.update({
                where: { id },
                data: { status: DocumentStatus.FINAL, lockedAt: new Date(), lockedBy: userId }
            });
        } else {
            return await (tx as any).ledForm.update({
                where: { id },
                data: { status: DocumentStatus.DRAFT, lockedAt: null, lockedBy: null }
            });
        }
    });
};

/**
 * Update LED Form Content (Digunakan untuk Autosave)
 * Tidak mengubah versi, hanya menyimpan content ke ID yang sudah ada.
 */
export const updateLEDFormVersion = async (id: string, content: any) => {
  const form = await (prisma as any).ledForm.findUnique({ where: { id } });
  if (!form) throw new Error('Form LED tidak ditemukan');
  
  // Proteksi ganda (Bouncer Backend)
  if (form.status === 'FINAL') {
      throw new Error('Form LED telah dikunci (FINAL) dan tidak dapat diubah lagi.');
  }

  return await (prisma as any).ledForm.update({
      where: { id },
      data: { content }
  });
};