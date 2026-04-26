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
  // Validate data against sheet config
  const validation = validateSheetData(sheetName, data);
  if (!validation.valid) {
    throw new Error(`Validasi data sheet "${sheetName}" gagal:\n${validation.errors.join('\n')}`);
  }

  return await prisma.lKPSSheetData.create({
    data: {
      criteriaId,
      sheetName,
      sheetTitle,
      data, // JSON data from parser (array of objects)
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
  // Get all criteria for this document
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
    
    // Get corresponding criteria
    const kriteria = criteriaByCodes[sheetConfig.criteriaCode];
    if (!kriteria) {
      console.warn(`Criteria ${sheetConfig.criteriaCode} not found for sheet ${sheetName}`);
      continue;
    }
    
    // Create sheet data
    const created = await createLKPSSheetData(
      kriteria.id,
      sheetName,
      sheetConfig.sheetTitle,
      sheetData
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
  // Validate data against sheet config
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
  // Minimal validation - just ensure it's array
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
