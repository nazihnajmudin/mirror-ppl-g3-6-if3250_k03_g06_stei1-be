import { z } from 'zod';
import { getSheetConfig } from '../config/lkps.config';

export const importLKPSSchema = z.object({
    prodiId: z.string('prodiId wajib diisi')
        .uuid('prodiId harus berupa format UUID yang valid'),
});

export type ImportLKPSInput = z.infer<typeof importLKPSSchema>;

/**
 * Validate sheet data against config definition
 * @param sheetName - Name of the sheet (e.g., "1", "2a1", "3a1")
 * @param data - Array of data objects to validate
 * @returns { valid: boolean, errors: string[] }
 */
export const validateSheetData = (sheetName: string, data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    const sheetConfig = getSheetConfig(sheetName);
    if (!sheetConfig) {
      errors.push(`Sheet "${sheetName}" tidak ditemukan dalam konfigurasi`);
      return { valid: false, errors };
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      errors.push('Data harus berupa array');
      return { valid: false, errors };
    }

    // Validate fixed rows count if applicable
    if (sheetConfig.rowType === 'fixed' && sheetConfig.fixedRows) {
      if (data.length !== sheetConfig.fixedRows.length) {
        errors.push(
          `Sheet "${sheetName}" memerlukan ${sheetConfig.fixedRows.length} baris tetap, ` +
          `tetapi diterima ${data.length} baris`
        );
      }
    }

    // Validate each row
    data.forEach((row, rowIndex) => {
      const rowErrors = validateRowData(row, sheetConfig, rowIndex);
      errors.push(...rowErrors);
    });

    return { valid: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`Error validasi sheet: ${error.message}`);
    return { valid: false, errors };
  }
};

/**
 * Validate individual row data
 */
const validateRowData = (row: any, sheetConfig: any, rowIndex: number): string[] => {
  const errors: string[] = [];

  sheetConfig.columns.forEach((col: any) => {
    const value = row[col.key];

    // Skip if autoCalculated
    if (col.autoCalculated) return;

    // Validate type
    const typeError = validateColumnType(col.key, value, col.type, rowIndex);
    if (typeError) errors.push(typeError);

    // Validate select options
    if (col.type === 'select' && col.options && value !== null && value !== undefined && value !== '') {
      if (!col.options.includes(value)) {
        errors.push(
          `Baris ${rowIndex + 1}, kolom "${col.label}": nilai "${value}" tidak valid. ` +
          `Pilihan: ${col.options.join(', ')}`
        );
      }
    }
  });

  return errors;
};

/**
 * Validate column type
 */
const validateColumnType = (key: string, value: any, type: string, rowIndex: number): string | null => {
  // Allow empty/null for optional fields
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (type) {
    case 'number':
      if (isNaN(Number(value))) {
        return `Baris ${rowIndex + 1}, kolom "${key}": nilai harus berupa angka, diterima "${value}"`;
      }
      break;

    case 'date':
      // Accept various date formats: YYYY-MM-DD, HH/BB/TTTT, ISO string
      if (!(value instanceof Date || typeof value === 'string' || typeof value === 'number')) {
        return `Baris ${rowIndex + 1}, kolom "${key}": format tanggal tidak valid`;
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch {
        return `Baris ${rowIndex + 1}, kolom "${key}": URL tidak valid, diterima "${value}"`;
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 1 && value !== 0 && value !== 'true' && value !== 'false') {
        return `Baris ${rowIndex + 1}, kolom "${key}": nilai harus boolean, diterima "${value}"`;
      }
      break;

    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return `Baris ${rowIndex + 1}, kolom "${key}": nilai harus teks, diterima tipe ${typeof value}`;
      }
      break;
  }

  return null;
};