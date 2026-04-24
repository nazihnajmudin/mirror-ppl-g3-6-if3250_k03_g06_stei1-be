import prisma from '../config/database.config';
import { storageProvider } from '../utils/storage';
import { getProdiForUser } from './prodi.service';
import { Role, LamCategory, TemplateType } from '@prisma/client';

const INFOKOM_ABBREVIATIONS = ['IF', 'II'];

export const uploadTemplate = async (
    name: string,
    type: TemplateType,
    category: LamCategory,
    file: Express.Multer.File,
    userId: string
) => {
    // Cek apakah template untuk tipe dan kategori yang sama sudah ada, hapus yang lama
    const existing = await prisma.documentTemplate.findFirst({ where: { type, category } });
    if (existing) {
        await storageProvider.delete(existing.content, 'templates');
        await prisma.documentTemplate.delete({ where: { id: existing.id } });
    }

    const savedFileName = await storageProvider.upload(file, 'templates');

    return prisma.documentTemplate.create({
        data: {
            name,
            type,
            category,
            content: savedFileName,
            uploadedById: userId,
        }
    });
};

export const getTemplatesForUser = async (userId: string, userRole: Role) => {
    // Super Admin & Pimpinan dapat melihat semua template
    if (userRole === Role.SUPER_ADMIN || userRole === Role.PIMPINAN) {
        return prisma.documentTemplate.findMany({
            orderBy: [{ category: 'asc' }, { type: 'asc' }]
        });
    }

    // Untuk Kaprodi & Tim Prodi: Cek afiliasi prodi
    const userProdis = await getProdiForUser(userId);
    const allowedCategories = new Set<LamCategory>();

    userProdis.forEach(prodi => {
        if (prodi.abbreviation && INFOKOM_ABBREVIATIONS.includes(prodi.abbreviation.toUpperCase())) {
            allowedCategories.add(LamCategory.INFOKOM);
        } else {
            allowedCategories.add(LamCategory.TEKNIK);
        }
    });

    return prisma.documentTemplate.findMany({
        where: {
            category: { in: Array.from(allowedCategories) }
        },
        orderBy: [{ category: 'asc' }, { type: 'asc' }]
    });
};

export const getTemplateById = async (id: string) => {
    const template = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new Error('Template tidak ditemukan');
    
    const filePath = storageProvider.getFilePath(template.content, 'templates');
    return { template, filePath };
};

export const deleteTemplate = async (id: string) => {
    const template = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new Error('Template tidak ditemukan');

    // Hapus fisik
    await storageProvider.delete(template.content, 'templates');
    // Hapus dari DB
    await prisma.documentTemplate.delete({ where: { id } });
    
    return true;
};