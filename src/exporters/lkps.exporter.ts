import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { LKPSFormat, getSheetConfig } from '../config/lkps.config';

export const generateLKPSExcel = async (
  data: Record<string, any[]>, 
  baseBuffer?: Buffer,
  format: LKPSFormat = 'INFOKOM'
): Promise<Buffer> => {
  const templatePath = path.resolve(__dirname, '../../../laporan-kinerja-program-studi-aps-akademik-vokasi-dan-psppi.xlsx');
  
  const workbook = new ExcelJS.Workbook();
  
  if (baseBuffer) {
    await workbook.xlsx.load(baseBuffer as any);
  } else {
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template file not found at ' + templatePath);
    }
    await workbook.xlsx.readFile(templatePath);
  }

  // Inject data into each sheet based on dynamic configuration
  for (const sheetName of Object.keys(data)) {
    const sheetData = data[sheetName];
    if (!Array.isArray(sheetData) || sheetData.length === 0) continue;

    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) continue;

    const sheetConfig = getSheetConfig(sheetName, format);
    if (!sheetConfig) continue;

    // Start row based on header rows config (assuming data starts exactly after header)
    const startRow = sheetConfig.headerRows + 1;
    
    sheetData.forEach((item: any, index: number) => {
      const rowNumber = startRow + index;
      const row = worksheet.getRow(rowNumber);
      
      sheetConfig.columns.forEach((colConfig, colIndex) => {
        const excelColIndex = colIndex + 1; // 1-indexed in ExcelJS
        
        // Skip writing formulas (autoCalculated) so we don't break existing Excel equations
        if (colConfig.autoCalculated) return;
        
        if (item[colConfig.key] !== undefined && item[colConfig.key] !== null) {
          row.getCell(excelColIndex).value = item[colConfig.key];
        }
      });
      row.commit();
    });
  }

  // Remove password protection globally to ensure the exported file is editable
  workbook.eachSheet((sheet: any) => {
    if (sheet.properties) {
      delete sheet.properties.sheetProtection;
    }
    if (sheet.views) {
      sheet.views = sheet.views.map((view: any) => ({ ...view, state: 'normal' }));
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};
