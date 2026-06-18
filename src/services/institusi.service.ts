import prisma from '../config/database.config';
import { generateEarlyWarnings } from './notification.service';
import { getFormatFromProdiName, getSheetConfig } from '../config/lkps.config';

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

  const documents = await prisma.documentLKPS.findMany({
    where: {
      periode,
      status: 'DRAFT',
      ...(prodiId ? { prodiId } : {}),
    },
    orderBy: { versi: 'desc' },
    include: {
      prodi: true,
      criterias: {
        include: {
          sheets: true
        }
      }
    }
  });

  const latestDocsMap = new Map<string, any>();
  for (const doc of documents) {
    if (!latestDocsMap.has(doc.prodiId)) {
      latestDocsMap.set(doc.prodiId, doc);
    }
  }
  const latestDocs = Array.from(latestDocsMap.values());

  for (const doc of latestDocs) {
    const targetSheetName = sheetName;

    if (!targetSheetName) continue; 

    let finalDataToSave = uppsDataPayload;

    for (const criteria of doc.criterias) {
      const sheet = criteria.sheets.find(s => s.sheetName === targetSheetName);
      if (sheet) {
        let currentData: any[] = (sheet.data as any[]) || [];

        const isMatch = (u: any, row: any) => {
          if (u.no !== undefined && u.no !== null && row.no !== undefined && row.no !== null) {
            return String(u.no) === String(row.no);
          }
          return false;
        };

        const mergedData = currentData.map((row) => {
          const uppsRow = uppsDataPayload.find((u) => isMatch(u, row));
          if (uppsRow) {
            return { ...row, ...uppsRow };
          }
          return row;
        });

        // Temukan baris baru dari UPPS yang belum ada di LKPS
        const newRows = uppsDataPayload.filter(
          (u) => !currentData.some((row) => isMatch(u, row))
        );

        finalDataToSave = currentData.length > 0 ? [...mergedData, ...newRows] : uppsDataPayload;

        await prisma.lKPSSheetData.update({
          where: { id: sheet.id },
          data: { data: finalDataToSave },
        });
      } else {
        const format = getFormatFromProdiName(doc.prodi.fullname);
        const sheetConfig = getSheetConfig(targetSheetName, format);
        if (sheetConfig && sheetConfig.criteriaCode === criteria.criteriaCode) {
          finalDataToSave = uppsDataPayload;
          await prisma.lKPSSheetData.create({
            data: {
              criteriaId: criteria.id,
              sheetName: targetSheetName,
              sheetTitle: sheetConfig.sheetTitle,
              data: finalDataToSave,
              isCompleted: false,
            }
          });
        }
      }
    }

    const currentDocContent = (doc.content as any) || {};
    currentDocContent[targetSheetName] = finalDataToSave;

    await prisma.documentLKPS.update({
      where: { id: doc.id },
      data: { content: currentDocContent },
    });
  }

  generateEarlyWarnings(prodiId || undefined).catch(err => console.error('Failed to trigger early warnings after institusi sync:', err));

  return dataInstitusi;
};

export const getDataInstitusi = async (periode: string, sheetName?: string, prodiId?: string) => {
  const whereClause: any = { periode };
  if (sheetName) whereClause.sheetName = sheetName;
  if (prodiId) whereClause.prodiId = prodiId;
  
  const dataInstitusi = await prisma.dataInstitusi.findMany({
    where: whereClause,
  });

  if (dataInstitusi.length > 0) {
    return dataInstitusi;
  }

  if (prodiId && sheetName) {
    const lkpsDoc = await prisma.documentLKPS.findFirst({
      where: {
        periode,
        prodiId,
        status: 'DRAFT'
      },
      orderBy: { versi: 'desc' },
      include: {
        criterias: {
          include: {
            sheets: {
              where: { sheetName }
            }
          }
        }
      }
    });

    if (lkpsDoc) {
      for (const crit of lkpsDoc.criterias) {
        if (crit.sheets && crit.sheets.length > 0) {
           return [{
             periode,
             sheetName,
             prodiId,
             data: crit.sheets[0].data
           }];
        }
      }
    }
  }

  return [];
};

export const syncAllInstitusiToDocument = async (documentId: string, tx?: any) => {
  const client = tx || prisma;
  const document = await client.documentLKPS.findUnique({
    where: { id: documentId },
    include: {
      prodi: true,
      criterias: {
        include: {
          sheets: true
        }
      }
    }
  });

  if (!document) return;

  const periode = document.periode;
  if (!periode) return;

  // Tarik semua data institusi untuk periode ini (global UPPS atau spesifik prodi)
  const institusiDatas = await client.dataInstitusi.findMany({
    where: {
      periode,
      OR: [
        { prodiId: null },
        { prodiId: document.prodiId }
      ]
    }
  });

  for (const instData of institusiDatas) {
    const sheetName = instData.sheetName;
    const uppsDataPayload = Array.isArray(instData.data) ? instData.data : [];
    
    const targetSheetName = sheetName;

    if (!targetSheetName) continue;

    for (const criteria of document.criterias) {
      const sheet = criteria.sheets.find((s: any) => s.sheetName === targetSheetName);
      if (sheet) {
        let currentData: any[] = (sheet.data as any[]) || [];

        const isMatch = (u: any, row: any) => {
          if (u.no !== undefined && u.no !== null && row.no !== undefined && row.no !== null) {
            return String(u.no) === String(row.no);
          }
          return false;
        };

        const mergedData = currentData.map((row) => {
          const uppsRow = uppsDataPayload.find((u) => isMatch(u, row));
          if (uppsRow) {
            return { ...row, ...uppsRow };
          }
          return row;
        });

        const newRows = uppsDataPayload.filter(
          (u) => !currentData.some((row) => isMatch(u, row))
        );

        const finalDataToSave = currentData.length > 0 ? [...mergedData, ...newRows] : uppsDataPayload;

        await client.lKPSSheetData.update({
          where: { id: sheet.id },
          data: { data: finalDataToSave },
        });
      }
    }
  }
};