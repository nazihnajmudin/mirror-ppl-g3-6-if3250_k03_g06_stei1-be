import prisma from '../config/database.config';
import { generateEarlyWarnings } from './notification.service';

export const upsertAndSyncInstitusi = async (
  periode: string,
  sheetName: string,
  prodiId: string | null,
  uppsDataPayload: any[],
  userId: string
) => {
  const existingInstitusi = await prisma.dataInstitusi.findFirst({
    where: {
      periode,
      sheetName,
      prodiId,
    },
  });

  const dataInstitusi = existingInstitusi
    ? await prisma.dataInstitusi.update({
        where: { id: existingInstitusi.id },
        data: { data: uppsDataPayload, createdById: userId },
      })
    : await prisma.dataInstitusi.create({
        data: {
          periode,
          sheetName,
          prodiId,
          data: uppsDataPayload,
          createdById: userId,
        },
      });

  const targetSheets = await prisma.lKPSSheetData.findMany({
    where: {
      sheetName: sheetName,
      criteria: {
        document: {
          periode: periode,
          ...(prodiId ? { prodiId } : {}),
        },
      },
    },
  });

  for (const sheet of targetSheets) {
    let currentData: any[] = (sheet.data as any[]) || [];

    const mergedData = currentData.map((row) => {
      const uppsRow = uppsDataPayload.find((u) => u.no === row.no);
      
      if (uppsRow) {
        return {
          ...row, 
          ...uppsRow,
        };
      }
      return row;
    });

    const finalDataToSave = currentData.length > 0 ? mergedData : uppsDataPayload;

    await prisma.lKPSSheetData.update({
      where: { id: sheet.id },
      data: { data: finalDataToSave },
    });
  }

  generateEarlyWarnings(prodiId || undefined).catch(err => console.error('Failed to trigger early warnings after institusi sync:', err));

  return dataInstitusi;
};

export const getDataInstitusi = async (periode: string, sheetName?: string, prodiId?: string) => {
  const whereClause: any = { periode };
  if (sheetName) whereClause.sheetName = sheetName;
  if (prodiId) whereClause.prodiId = prodiId;
  
  return await prisma.dataInstitusi.findMany({
    where: whereClause,
  });
};