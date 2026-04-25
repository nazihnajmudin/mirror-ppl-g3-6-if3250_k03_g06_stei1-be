import prisma from '../config/database.config';
import { storageProvider } from '../utils/storage';
import { Role } from '@prisma/client';
import { getProdiForUser } from './prodi.service';

export const createEviden = async (data: any, files: Express.Multer.File[], userId: string) => {
    // Upload semua file secara paralel
    const fileRecords = await Promise.all(files.map(async (file) => {
        const savedFilename = await storageProvider.upload(file, 'eviden');
        return {
            originalFilename: file.originalname,
            savedFilename,
            mimeType: file.mimetype,
            size: file.size
        };
    }));

    return prisma.dokumenEviden.create({
        data: {
            prodiId: data.prodiId,
            judul: data.judul,
            deskripsi: data.deskripsi,
            indikator: data.indikator, // Array of strings
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            uploaderId: userId,
            files: {
                create: fileRecords
            }
        },
        include: { files: true, prodi: true }
    });
};

export const getEvidenList = async (userId: string, role: Role) => {
    let prodiFilter = {};

    if (role === Role.KAPRODI || role === Role.TIM_PRODI) {
        const myProdis = await getProdiForUser(userId);
        const myProdiIds = myProdis.map(p => p.id);
        prodiFilter = { prodiId: { in: myProdiIds } };
    }

    return prisma.dokumenEviden.findMany({
        where: prodiFilter,
        orderBy: { createdAt: 'desc' },
        include: {
            prodi: { select: { fullname: true, abbreviation: true } },
            files: { select: { id: true, size: true } }, // ambil metadata untuk hitung total size di frontend
        }
    });
};

export const getEvidenById = async (id: string) => {
    return prisma.dokumenEviden.findUnique({
        where: { id },
        include: { 
            files: true,
            prodi: { select: { fullname: true } }
        }
    });
};

export const updateEviden = async (id: string, data: any, newFiles: Express.Multer.File[], deletedFileIds: string[]) => {
    // 1. Hapus file lama yang diminta dihapus oleh user
    if (deletedFileIds && deletedFileIds.length > 0) {
        const filesToDelete = await prisma.evidenFile.findMany({
            where: { id: { in: deletedFileIds }, evidenId: id }
        });
        
        for (const file of filesToDelete) {
            await storageProvider.delete(file.savedFilename, 'eviden');
        }
        await prisma.evidenFile.deleteMany({ where: { id: { in: deletedFileIds } } });
    }

    // 2. Upload file baru
    let newFileRecords: any[] = [];
    if (newFiles && newFiles.length > 0) {
        newFileRecords = await Promise.all(newFiles.map(async (file) => {
            const savedFilename = await storageProvider.upload(file, 'eviden');
            return {
                originalFilename: file.originalname,
                savedFilename,
                mimeType: file.mimetype,
                size: file.size
            };
        }));
    }

    // 3. Update record Eviden
    return prisma.dokumenEviden.update({
        where: { id },
        data: {
            prodiId: data.prodiId,
            judul: data.judul,
            deskripsi: data.deskripsi,
            indikator: data.indikator,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            ...(newFileRecords.length > 0 && {
                files: {
                    create: newFileRecords
                }
            })
        },
        include: { files: true }
    });
};

export const deleteEviden = async (id: string) => {
    // Ambil file fisik
    const eviden = await prisma.dokumenEviden.findUnique({
        where: { id },
        include: { files: true }
    });

    if (!eviden) throw new Error('Eviden tidak ditemukan');

    // Hapus fisik
    for (const file of eviden.files) {
        await storageProvider.delete(file.savedFilename, 'eviden');
    }

    // Hapus dari DB (Relasi EvidenFile akan cascade)
    await prisma.dokumenEviden.delete({ where: { id } });
    return true;
};

export const getEvidenFile = async (fileId: string) => {
    const file = await prisma.evidenFile.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File tidak ditemukan');
    
    const filePath = storageProvider.getFilePath(file.savedFilename, 'eviden');
    return { file, filePath };
};