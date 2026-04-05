import prisma from '../config/database.config';
import { storageProvider } from '../utils/storage';
import { DocumentStatus } from '@prisma/client';

interface ImportLEDInput {
    prodiId: string;
    pengunggahId: string;
    periode: string;
    file: Express.Multer.File;
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

/**
 * Soft Delete Single
 * @param id 
 * @returns 
 */
export const softDeleteDocument = async (id: string) => {
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