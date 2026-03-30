import prisma from '../config/database.config';
import { storageProvider } from '../utils/storage';

interface ImportLEDInput {
  prodiId: number;
  pengunggahId: number;
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
    // Validasi Prodi dan Pengunggah
    const prodi = await prisma.prodi.findUnique({ where: { id: data.prodiId } });
    if (!prodi) throw new Error('Program studi tidak ditemukan');

    const user = await prisma.user.findUnique({ where: { id: data.pengunggahId } });
    if (!user) throw new Error('Pengunggah tidak ditemukan');

    // Cari versi tertinggi
    const latestDoc = await prisma.dokumenLED.findFirst({
        where: {
            prodiId: data.prodiId,
            periode: data.periode,
        },
        orderBy: {
            versi: 'desc',
        },
    });

    // Versi Baru
    const newVersi = latestDoc ? latestDoc.versi + 1 : 1;

    // Simpan file
    const savedFileName = await storageProvider.upload(data.file, 'led');

    // Simpan metadata ke database
    const dokumen = await prisma.dokumenLED.create({
    data: {
        namaFile: data.file.originalname,
        pathFile: savedFileName,
        ukuran: data.file.size,
        periode: data.periode,
        versi: newVersi,
        prodiId: data.prodiId,
        pengunggahId: data.pengunggahId,
    },
    // Untuk response
    include: {
        prodi: { select: { nama: true } },
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
export const exportLED = async (prodiId: number, periode: string) => {
    // Cari dokumen versi terbaru
    const latestDoc = await prisma.dokumenLED.findFirst({
        where: {
            prodiId,
            periode,
        },
        orderBy: {
            versi: 'desc',
        },
    });

    if (!latestDoc) {
    throw new Error(`Dokumen LED untuk periode ${periode} belum tersedia.`);
    }

    const filePath = storageProvider.getFilePath(latestDoc.pathFile, 'led');

    return {
        dokumen: latestDoc,
        filePath,
    };
};

/**
 * Upload History
 * Mendapatkan riwayat versi dokumen LED
 * @param prodiId 
 * @param periode 
 * @returns 
 */
export const getLEDHistory = async (prodiId: number, periode: string) => {
    return prisma.dokumenLED.findMany({
        where: {
            prodiId,
            periode,
        },
        orderBy: {
            versi: 'desc',
        },
        include: {
            pengunggah: { select: { name: true, role: true } },
        }
    });
};