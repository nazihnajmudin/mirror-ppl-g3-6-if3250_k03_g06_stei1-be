import prisma from '../config/database.config';
import { DocumentStatus } from '@prisma/client';

export const createLKPSDocument = async (
  prodiId: string,
  content: any,
  name?: string,
  filePath?: string,
  originalFilename?: string
) => {
  return await prisma.documentLKPS.create({
    data: {
      prodiId,
      content,
      name: name || `LKPS ${new Date().getFullYear()}`,
      status: DocumentStatus.DRAFT,
      filePath,
      originalFilename,
    },
  });
};

export const getLKPSHistoryByProdi = async (prodiId: string) => {
  return await prisma.documentLKPS.findMany({
    where: {
      prodiId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      prodi: {
        select: {
          fullname: true,
        },
      },
    },
  });
};

export const getLKPSDocumentById = async (id: string) => {
  return await prisma.documentLKPS.findUnique({
    where: { id },
    include: {
      prodi: true,
    },
  });
};
