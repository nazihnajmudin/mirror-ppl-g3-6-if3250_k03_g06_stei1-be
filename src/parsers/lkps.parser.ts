import ExcelJS from 'exceljs';

export interface LKPSParsedData {
  [sheetName: string]: any[][];
}

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

    let startRow = 10; 
    let startCol = 2;
    let colCount = 10;
    let foundHeader = false;
    
    // Scan rows to find the numbering row (1, 2, 3...)
    for (let r = 1; r <= 30; r++) {
      const row = worksheet.getRow(r);
      // Check Col A (1) and Col B (2) for the '1'
      const valA = row.getCell(1).value;
      const valB = row.getCell(2).value;
      
      if (valA === 1 || valB === 1) {
        foundHeader = true;
        startRow = r + 1;
        startCol = (valA === 1) ? 1 : 2;
        
        // Count columns
        let c = startCol;
        while (true) {
          const v = row.getCell(c).value;
          if (v === null || v === undefined || v === '') break;
          c++;
        }
        colCount = c - startCol;
        break;
      }
    }

    const sheetData: any[][] = [];
    if (foundHeader) {
      let rowNum = startRow;
      let consecutiveEmptyRows = 0;
      
      while (true) {
        const row = worksheet.getRow(rowNum);
        const rowData: any[] = [];
        let hasData = false;
        
        for (let i = 0; i < colCount; i++) {
          const cell = row.getCell(startCol + i);
          let value = cell.value;
          
          if (value && typeof value === 'object') {
            if (value instanceof Date) {
              // keep date
            } else if ((value as any).result !== undefined) {
              value = (value as any).result;
            } else if ((value as any).richText) {
              value = (value as any).richText.map((rt: any) => rt.text).join('');
            } else {
              value = value.toString();
            }
          }
          
          if (value !== null && value !== undefined && value !== '') {
            hasData = true;
          }
          rowData.push(value === null || value === undefined ? '' : value);
        }
        
        if (hasData) {
          sheetData.push(rowData);
          consecutiveEmptyRows = 0;
        } else {
          consecutiveEmptyRows++;
        }
        
        if (consecutiveEmptyRows >= 10 || rowNum > 1000) break;
        rowNum++;
      }
    }
    result[sheetName] = sheetData;
  });

  return result;
};
