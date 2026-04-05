import prisma from '../config/database.config';
import { DocumentStatus } from '@prisma/client';

export const createLKPSDocument = async (
  prodiId: string,
  content: any,
  name?: string,
  filePath?: string,
  originalFilename?: string,
  periode?: string
) => {
  return await prisma.documentLKPS.create({
    data: {
      prodiId,
      content,
      name: name || `LKPS ${periode || new Date().getFullYear()}`,
      status: DocumentStatus.DRAFT,
      filePath,
      originalFilename,
      periode,
    } as any,
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
