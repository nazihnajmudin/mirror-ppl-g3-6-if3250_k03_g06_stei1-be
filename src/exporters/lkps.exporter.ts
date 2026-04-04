import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export const generateLKPSExcel = async (data: any): Promise<Buffer> => {
  const templatePath = path.resolve(__dirname, '../../../laporan-kinerja-program-studi-aps-akademik-vokasi-dan-psppi.xlsx');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template file not found at ' + templatePath);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  
  // --- Inject Data into Sheet 3a1 ---
  const mhsRegulerSheet = workbook.getWorksheet('3a1');
  if (mhsRegulerSheet && data.mhs_reguler) {
    // Standard template usually starts data at row 7 or 8. Let's find the first empty data row.
    // Based on the provided template, data starts at row 7.
    data.mhs_reguler.forEach((item: any, index: number) => {
      const rowNumber = 7 + index; 
      const row = mhsRegulerSheet.getRow(rowNumber);
      
      row.getCell(2).value = item.tahun;
      row.getCell(3).value = item.dayaTampung;
      row.getCell(4).value = item.pendaftar;
      row.getCell(5).value = item.lulusSeleksi;
      row.getCell(6).value = item.mhsBaruReguler;
      row.getCell(7).value = item.mhsBaruTransfer;
      row.getCell(8).value = item.mhsAktifReguler;
      row.getCell(9).value = item.mhsAktifTransfer;
      row.commit();
    });
  }

  // --- Inject Data into Sheet 3a2 ---
  const mhsAsingSheet = workbook.getWorksheet('3a2');
  if (mhsAsingSheet && data.mhs_asing) {
    data.mhs_asing.forEach((item: any, index: number) => {
      const rowNumber = 7 + index;
      const row = mhsAsingSheet.getRow(rowNumber);
      
      row.getCell(2).value = item.prodi;
      row.getCell(3).value = item.mhsAsingFullTimeTS2;
      row.getCell(4).value = item.mhsAsingFullTimeTS1;
      row.getCell(5).value = item.mhsAsingFullTimeTS;
      row.getCell(6).value = item.mhsAsingPartTimeTS2;
      row.getCell(7).value = item.mhsAsingPartTimeTS1;
      row.getCell(8).value = item.mhsAsingPartTimeTS;
      row.commit();
    });
  }

  // Add more injection points here as we expand the parser...

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};
