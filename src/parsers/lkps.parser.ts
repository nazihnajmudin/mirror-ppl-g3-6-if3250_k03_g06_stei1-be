import ExcelJS from 'exceljs';

export interface LKPSParsedData {
  [sheetName: string]: any[][];
}

interface TableParseConfig {
  startRow: number;
  startCol: number;
  colCount: number;
}

const PARSE_CONFIGS: Record<string, TableParseConfig> = {
  'PS': { startRow: 17, startCol: 2, colCount: 7 },
  'PSPPI': { startRow: 14, startCol: 2, colCount: 6 },
  '2a1': { startRow: 13, startCol: 2, colCount: 12 },
  '3a1': { startRow: 10, startCol: 2, colCount: 11 },
  // Add others as needed, or use a default
};

const DEFAULT_CONFIG: TableParseConfig = { startRow: 10, startCol: 2, colCount: 10 };

export const parseLKPSExcel = async (buffer: Buffer): Promise<LKPSParsedData> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const result: LKPSParsedData = {};
  
  const SHEETS = [
    'PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', 
    '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', 
    '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', 
    '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b'
  ];

  SHEETS.forEach(sheetName => {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      result[sheetName] = [];
      return;
    }

    const config = PARSE_CONFIGS[sheetName] || DEFAULT_CONFIG;
    const sheetData: any[][] = [];
    
    // Iterate through rows starting from startRow
    let rowNum = config.startRow;
    while (true) {
      const row = worksheet.getRow(rowNum);
      
      // Stop if the first few cells are empty (suggesting end of table)
      const firstCell = row.getCell(config.startCol).value;
      const secondCell = row.getCell(config.startCol + 1).value;
      
      if (!firstCell && !secondCell && rowNum > config.startRow + 5) {
        break; 
      }
      
      // Also stop if we've reached a very high row number (safety)
      if (rowNum > 500) break;

      const rowData: any[] = [];
      let hasData = false;
      
      for (let i = 0; i < config.colCount; i++) {
        const cell = row.getCell(config.startCol + i);
        let value = cell.value;
        
        // Handle ExcelJS value objects (like dates, formulas)
        if (value && typeof value === 'object') {
          if (value instanceof Date) {
            // Keep as Date, it will be JSON stringified correctly
          } else if ((value as any).result !== undefined) {
            value = (value as any).result;
          } else if ((value as any).richText) {
            value = (value as any).richText.map((rt: any) => rt.text).join('');
          }
        }
        
        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
        }
        
        rowData.push(value === null ? '' : value);
      }
      
      if (hasData) {
        sheetData.push(rowData);
      } else if (rowNum > config.startRow + 2) {
        // Stop if we hit an empty row after some initial data
        break;
      }
      
      rowNum++;
    }
    
    result[sheetName] = sheetData;
  });

  return result;
};
