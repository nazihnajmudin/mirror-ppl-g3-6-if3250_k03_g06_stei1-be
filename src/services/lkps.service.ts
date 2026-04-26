import prisma from '../config/database.config';
import { DocumentStatus } from '@prisma/client';
import { LKPS_KRITERIA } from '@/config/lkps.config';
import { validateSheetData } from '../validators/lkps.validator';

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
      criterias: {
        include: {
          sheets: true,
        },
      },
    },
  });
};

/**
 * Create single LKPS Kriteria
 */
export const createLKPSCriteria = async (
  documentId: string,
  criteriaCode: string,
  criteriaName: string,
  subCriteriaCode?: string | null,
  subCriteriaName?: string | null
) => {
  return await prisma.lKPSCriteria.create({
    data: {
      documentId,
      criteriaCode,
      criteriaName,
      subCriteriaCode: subCriteriaCode || null,
      subCriteriaName: subCriteriaName || null,
      isCompleted: false,
    },
  });
};

/**
 * Create all 7 LKPS Kriteria for a document
 */
export const createAllLKPSCriteria = async (documentId: string) => {
  const kriteriaIds: Record<string, string> = {};
  
  for (const [code, kriteriaInfo] of Object.entries(LKPS_KRITERIA)) {
    const created = await createLKPSCriteria(
      documentId,
      code,
      kriteriaInfo.name,
      null,
      null
    );
    kriteriaIds[code] = created.id;
  }
  
  return kriteriaIds;
};

/**
 * Create single LKPS Sheet Data
 */
export const createLKPSSheetData = async (
  criteriaId: string,
  sheetName: string,
  sheetTitle: string,
  data: any[]
) => {
  const validation = validateSheetData(sheetName, data);
  if (!validation.valid) {
    throw new Error(`Validasi data sheet "${sheetName}" gagal:\n${validation.errors.join('\n')}`);
  }

  return await prisma.lKPSSheetData.create({
    data: {
      criteriaId,
      sheetName,
      sheetTitle,
      data,
      isCompleted: false,
    },
  });
};

/**
 * Create multiple sheet data entries from parsed data
 * @param documentId - Document ID (to get criteria mapping)
 * @param parsedData - Output from parser: { sheetName: [{...}, {...}] }
 */
export const createMultipleSheetsData = async (
  documentId: string,
  parsedData: Record<string, any[]>
) => {
  const criterias = await prisma.lKPSCriteria.findMany({
    where: { documentId },
  });

  const criteriaByCodes: Record<string, any> = {};
  criterias.forEach(c => {
    criteriaByCodes[c.criteriaCode] = c;
  });

  const { getSheetConfig } = await import('@/config/lkps.config');
  const createdSheets = [];

  for (const [sheetName, sheetData] of Object.entries(parsedData)) {
    const sheetConfig = getSheetConfig(sheetName);
    if (!sheetConfig) {
      console.warn(`Sheet config not found for ${sheetName}`);
      continue;
    }

    const kriteria = criteriaByCodes[sheetConfig.criteriaCode];
    if (!kriteria) {
      if (sheetConfig.criteriaCode !== '0') {
        console.warn(`Criteria ${sheetConfig.criteriaCode} not found for sheet ${sheetName}`);
      }
      continue;
    }

    let cleanedData = sheetData.filter((row) => {
      if (!row) return false;

      const hasHeaderArtifacts = Object.values(row).some(val => {
        if (typeof val === 'string') {
          const text = val.toLowerCase().replace(/\s+/g, '');

          return text === 'jumlah' || 
                 text === 'total' || 
                 text === 'ratarata' || 
                 text === 'rata-rata' ||
                 text === '(a)' || 
                 text === '(b)' || 
                 text === '(c)' ||
                 text.includes('jumlahmahasiswa') ||
                 text.includes('dalamsemester') ||
                 text.includes('≤ms≤') ||
                 text.includes('<ms≤') ||
                 text.includes('ms>');
        }
        return false;
      });
      if (hasHeaderArtifacts) return false;

      const noKey = Object.keys(row).find(key => key.toLowerCase() === 'no') || Object.keys(row)[0];
      if (noKey && row[noKey]) {
        const noVal = String(row[noKey]).trim().toUpperCase();
        if (/^(I{1,3}|IV|V|VI{0,3}|IX|X|[A-Z])$/.test(noVal)) {
          return false; 
        }
      }

      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (String(val).trim() === '') return false; 
        return true;
      });
    }).map((row) => {
      const sanitizedRow = { ...row };
      
      for (const colConfig of sheetConfig.columns) {
        const key = colConfig.key;
        let val = sanitizedRow[key];

        if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
           if ('result' in val) {
             val = typeof val.result === 'object' && val.result?.error ? '' : val.result;
           } else if ('error' in val) {
             val = ''; 
           } else if ('hyperlink' in val && 'text' in val) {
             val = val.text;
           } else if ('richText' in val) {
             val = val.richText.map((rt: any) => rt.text).join('');
           } else {
             val = ''; 
           }
        }

        if (typeof val === 'string') {
          val = val.trim();
        }

        if ((colConfig.type === 'text' || colConfig.type === 'textarea') && typeof val === 'number') {
           val = String(val);
        }

        sanitizedRow[key] = val;
      }
      return sanitizedRow;
    });

    if (sheetConfig.rowType === 'fixed' && sheetConfig.fixedRows) {
      const requiredLength = sheetConfig.fixedRows.length;
      
      if (cleanedData.length > requiredLength) {
        cleanedData = cleanedData.slice(0, requiredLength);
      } else if (cleanedData.length < requiredLength) {
        const kekurangan = requiredLength - cleanedData.length;
        for (let i = 0; i < kekurangan; i++) {
          cleanedData.push({}); 
        }
      }
    }

    const created = await createLKPSSheetData(
      kriteria.id,
      sheetName,
      sheetConfig.sheetTitle,
      cleanedData
    );
    createdSheets.push(created);
  }

  return createdSheets;
};

/**
 * Get LKPS Sheet Data
 */
export const getLKPSSheetData = async (
  criteriaId: string,
  sheetName: string
) => {
  return await prisma.lKPSSheetData.findUnique({
    where: {
      criteriaId_sheetName: {
        criteriaId,
        sheetName,
      },
    },
  });
};

/**
 * Update LKPS Sheet Data
 */
export const updateLKPSSheetData = async (
  criteriaId: string,
  sheetName: string,
  data: any[]
) => {
  const validation = validateSheetData(sheetName, data);
  if (!validation.valid) {
    throw new Error(`Validasi data sheet "${sheetName}" gagal:\n${validation.errors.join('\n')}`);
  }

  return await prisma.lKPSSheetData.update({
    where: {
      criteriaId_sheetName: {
        criteriaId,
        sheetName,
      },
    },
    data: { data },
  });
};

/**
 * Mark sheet as completed
 */
export const markSheetCompleted = async (
  criteriaId: string,
  sheetName: string
) => {
  return await prisma.lKPSSheetData.update({
    where: {
      criteriaId_sheetName: {
        criteriaId,
        sheetName,
      },
    },
    data: { isCompleted: true },
  });
};

/**
 * Auto-save sheet data (lightweight, skip full validation)
 * Used for real-time auto-save without blocking UX
 */
export const autoSaveLKPSSheetData = async (
  criteriaId: string,
  sheetName: string,
  data: any[]
) => {
  if (!Array.isArray(data)) {
    throw new Error('Data harus berupa array');
  }

  return await prisma.lKPSSheetData.update({
    where: {
      criteriaId_sheetName: {
        criteriaId,
        sheetName,
      },
    },
    data: { data, updatedAt: new Date() },
  });
};

/**
 * Save document as draft
 */
export const saveLKPSDocumentAsDraft = async (documentId: string) => {
  return await prisma.documentLKPS.update({
    where: { id: documentId },
    data: {
      status: 'DRAFT',
      updatedAt: new Date(),
    },
  });
};

/**
 * Finalize document (submit as final)
 */
export const finalizeLKPSDocument = async (documentId: string) => {
  return await prisma.documentLKPS.update({
    where: { id: documentId },
    data: {
      status: 'FINAL',
      updatedAt: new Date(),
    },
  });
};
