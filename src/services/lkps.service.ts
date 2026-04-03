import ExcelJS from 'exceljs';
import prisma from '../config/database.config';
import { DocumentStatus } from '@prisma/client';

const TEMPLATE_PATH = '/home/wiweka/ppl/laporan-kinerja-program-studi-aps-akademik-vokasi-dan-psppi.xlsx';

export const getLKPSById = async (id: string) => {
  const doc = await prisma.documentLKPS.findUnique({
    where: { id }, // Filter DocumentType dihapus
  });
  if (!doc) throw new Error('Dokumen LKPS tidak ditemukan');
  return doc;
};

export const importLKPS = async (buffer: any, prodiId: string) => {
  const workbook = new ExcelJS.Workbook();
  // Using any to bypass strict Buffer type mismatch in different Node versions
  await workbook.xlsx.load(buffer as any);

  const data: any = {};

  // Table 2.1: Kerjasama Pendidikan (Sheet '2a1')
  const sheet2a1 = workbook.getWorksheet('2a1');
  if (sheet2a1) {
    const table2_1: any[] = [];
    // Data starts at row 13 based on peek
    sheet2a1.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber >= 13) {
        const rowData = {
          no: row.getCell(1).value,
          lembagaMitra: row.getCell(2).value,
          internasional: row.getCell(3).value === 'V' || row.getCell(3).value === 'v',
          nasional: row.getCell(4).value === 'V' || row.getCell(4).value === 'v',
          lokal: row.getCell(5).value === 'V' || row.getCell(5).value === 'v',
          judulKegiatan: row.getCell(6).value,
          manfaat: row.getCell(7).value,
          tanggalAwal: row.getCell(8).value,
          tanggalAkhir: row.getCell(9).value,
          durasi: row.getCell(10).value,
        };
        // Only add if there's a lembagaMitra
        if (rowData.lembagaMitra) {
          table2_1.push(rowData);
        }
      }
    });
    data['table_2_1'] = table2_1;
  }

  // Create or Update Document
  const doc = await prisma.documentLKPS.create({
    data: {
      prodiId,
      status: DocumentStatus.DRAFT,
      content: data,
    },
  });

  return doc;
};

export const exportLKPS = async (id: string) => {
  const doc = await getLKPSById(id);
  const content = doc.content as any;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);

  // Table 2.1: Kerjasama Pendidikan
  const sheet2a1 = workbook.getWorksheet('2a1');
  if (sheet2a1 && content.table_2_1) {
    content.table_2_1.forEach((item: any, index: number) => {
      const rowNumber = 13 + index;
      const row = sheet2a1.getRow(rowNumber);
      row.getCell(1).value = item.no || (index + 1);
      row.getCell(2).value = item.lembagaMitra;
      row.getCell(3).value = item.internasional ? 'V' : '';
      row.getCell(4).value = item.nasional ? 'V' : '';
      row.getCell(5).value = item.lokal ? 'V' : '';
      row.getCell(6).value = item.judulKegiatan;
      row.getCell(7).value = item.manfaat;
      row.getCell(8).value = item.tanggalAwal;
      row.getCell(9).value = item.tanggalAkhir;
      row.getCell(10).value = item.durasi;
      row.commit();
    });
  }

  const exportBuffer = await workbook.xlsx.writeBuffer();
  const filename = `LKPS_Export_${id}.xlsx`;

  // Explicit cast to any then Buffer to satisfy TS
  return { buffer: exportBuffer as any as Buffer, filename };
};
