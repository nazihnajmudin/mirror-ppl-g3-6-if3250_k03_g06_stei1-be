import prisma from '../config/database.config';

export const upsertAndSyncInstitusi = async (
  periode: string,
  sheetName: string,
  uppsDataPayload: any[],
  userId: string
) => {
  const dataInstitusi = await prisma.dataInstitusi.upsert({
    where: {
      periode_sheetName: { periode, sheetName },
    },
    update: { data: uppsDataPayload, createdById: userId }, 
    create: { periode, sheetName, data: uppsDataPayload, createdById: userId },
  });

  const targetSheets = await prisma.lKPSSheetData.findMany({
    where: {
      sheetName: sheetName,
      criteria: {
        document: {
          periode: periode,
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

  return dataInstitusi;
};

export const getDataInstitusi = async (periode: string, sheetName?: string) => {
  const whereClause: any = { periode };
  if (sheetName) whereClause.sheetName = sheetName;
  
  return await prisma.dataInstitusi.findMany({
    where: whereClause,
  });
};