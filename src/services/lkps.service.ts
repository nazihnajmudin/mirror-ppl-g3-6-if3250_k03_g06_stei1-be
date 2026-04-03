import { PrismaClient, DocumentType, DocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createLKPSDocument = async (
  prodiId: string,
  content: any,
  name?: string,
  filePath?: string,
  originalFilename?: string
) => {
  return await prisma.document.create({
    data: {
      prodiId,
      content,
      name: name || `LKPS ${new Date().getFullYear()}`,
      type: DocumentType.LKPS,
      status: DocumentStatus.DRAFT,
      filePath,
      originalFilename,
    },
  });
};

export const getLKPSHistoryByProdi = async (prodiId: string) => {
  return await prisma.document.findMany({
    where: {
      prodiId,
      type: DocumentType.LKPS,
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
  return await prisma.document.findUnique({
    where: { id },
    include: {
      prodi: true,
    },
  });
};
