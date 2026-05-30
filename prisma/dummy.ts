import { PrismaClient, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// 1. DATA SEEDS CONSTANTS
// ==========================================
const prodiSeeds = [
  { key: 'if', fullname: 'Sarjana Teknik Informatika', abbreviation: 'IF', degree: 'S1', category: 'INFOKOM' as const, grade: 'Unggul' },
  { key: 'el', fullname: 'Sarjana Teknik Elektro', abbreviation: 'EL', degree: 'S1', category: 'TEKNIK' as const, grade: 'A' },
  { key: 'mte', fullname: 'Magister Teknik Elektro', abbreviation: 'MTE', degree: 'S2', category: 'TEKNIK' as const, grade: 'Unggul' },
  { key: 'dtei', fullname: 'Doktor Teknik Elektro dan Informatika', abbreviation: 'DTEI', degree: 'S3', category: 'TEKNIK' as const, grade: 'Unggul' },
];

const criteriaDefinitions = [
  { code: '1', name: 'Visi Misi Tujuan Strategi' },
  { code: '2', name: 'Tata Pamong, Tata Kelola, dan Kerjasama' },
  { code: '3', name: 'Relevansi Pendidikan dan Penelitian/PkM' },
  { code: '4', name: 'Sumber Daya Manusia' },
  { code: '5', name: 'Sarana dan Prasarana' },
  { code: '6', name: 'Mahasiswa dan Luaran Mahasiswa' },
  { code: '7', name: 'Sistem Penjaminan Mutu' },
];

const ALL_LKPS_SHEETS = [
  'PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', 
  '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', 
  '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', 
  '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b'
];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
const buildLkpsSheets = (prodi: any) => ([
  { criteriaCode: '1', sheetName: '1', sheetTitle: 'Visi Misi Tujuan Strategi', isCompleted: true, data: [
    { no: 1, jenis_vmts: 'Visi PT', pernyataan: 'Menjadi perguruan tinggi yang unggul', no_sk: 'SK-01/2024' },
    { no: 2, jenis_vmts: 'Misi PT', pernyataan: 'Menyelenggarakan pendidikan berkualitas', no_sk: 'SK-02/2024' },
  ]},
  { criteriaCode: '2', sheetName: '2a1', sheetTitle: 'Kerjasama Pendidikan', isCompleted: true, data: [
    { no: 1, lembaga_mitra: 'Universitas Teknologi Malaysia', tingkat_internasional: true, tingkat_nasional: false, tingkat_lokal: false, judul_kerjasama: 'Pertukaran Mahasiswa', manfaat: 'Meningkatkan kompetensi', tgl_awal: '2024-01-15', tgl_akhir: '2027-01-14', durasi: 3, status_kerjasama: 'Aktif' },
  ]},
  { criteriaCode: '3', sheetName: '3a1', sheetTitle: 'Kurikulum dan Rencana Pembelajaran', isCompleted: false, data: [
    { no: 1, semester: 1, kode_mk: `${prodi.abbreviation}101`, nama_mk: 'Algoritma Dasar', mk_kompetensi: 'Pemrograman', sks_kuliah: 3, sks_seminar: 0, sks_praktikum: 1, unit_penyelenggara: 'Prodi' },
  ]},
  { criteriaCode: '4', sheetName: '4a', sheetTitle: 'Profil Dosen', isCompleted: true, data: [
    { no: 1, nama_dosen: 'Prof. Dr. Budi Santoso, ST., MT.', nidn: '0015026703', kategori_dosen: 'Tetap', prodi_s1: 'Teknik', prodi_s2: 'Teknik', prodi_s3: 'Teknik', jabatan_akademik: 'Guru Besar' },
  ]},
  { criteriaCode: '5', sheetName: '5a', sheetTitle: 'Prasarana dan Peralatan', isCompleted: true, data: [
    { no: 1, nama_prasarana: `Lab ${prodi.abbreviation}`, jumlah_prasarana: 1, nama_sarana: 'Komputer', jumlah_alat_standar: 20, jumlah_alat_dimiliki: 22, kepemilikan_sendiri: true, kondisi_terawat: true },
  ]},
  { criteriaCode: '6', sheetName: '6a', sheetTitle: 'Jumlah Mahasiswa', isCompleted: true, data: [
    { no: 1, program_studi: prodi.fullname, aktif_ts_minus2: 650, aktif_ts_minus1: 680, aktif_ts: 720, asing_ft_ts: 12 },
  ]},
  { criteriaCode: '7', sheetName: '7a', sheetTitle: 'Ketersediaan Dokumen SPMI', isCompleted: false, data: [
    { no: 1, jenis_dokumen: 'Kebijakan SPMI', no_dokumen: 'POL-SPMI-2024-01', tanggal_dokumen: '2024-03-15' },
  ]}
]);

// ==========================================
// 3. SEEDING FUNCTIONS
// ==========================================
async function seedUsers(prodiIds: Record<string, string>) {
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { id: 'user-admin', email: 'admin@email.com', name: 'Super Admin', role: 'SUPER_ADMIN' as Role, prodiId: null },
    { id: 'user-pimpinan', email: 'pimpinan@email.com', name: 'Pimpinan', role: 'PIMPINAN' as Role, prodiId: null },
    { id: 'user-tim-pusat', email: 'tim.pusat@email.com', name: 'Tim Prodi Pusat', role: 'TIM_PRODI' as Role, prodiId: prodiIds['if'] },
    ...prodiSeeds.map(p => ({ id: `user-kaprodi-${p.key}`, email: `kaprodi.${p.key}@email.com`, name: `Kaprodi ${p.abbreviation}`, role: 'KAPRODI' as Role, prodiId: prodiIds[p.key] }))
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id }, update: u,
      create: { ...u, password, isActive: true }
    });
  }
  return users[0].id; // Return admin ID
}

async function seedProdis() {
  const ids: Record<string, string> = {};
  for (const p of prodiSeeds) {
    const prodi = await prisma.prodi.upsert({
      where: { id: `prodi-${p.key}` },
      update: { fullname: p.fullname, abbreviation: p.abbreviation, degree: p.degree },
      create: { id: `prodi-${p.key}`, fullname: p.fullname, abbreviation: p.abbreviation, degree: p.degree },
    });
    ids[p.key] = prodi.id;

    await prisma.accreditationInfo.upsert({
      where: { prodiId: prodi.id },
      update: { grade: p.grade },
      create: { prodiId: prodi.id, grade: p.grade, startDate: new Date('2024-01-01'), endDate: new Date('2029-12-31'), certificateUrl: '#' },
    });
  }
  return ids;
}

async function seedSettingsAndTemplates(adminId: string) {
  const thresholds = [
    { name: 'MIN_FINAL_SCORE', value: 75 },
    { name: 'MIN_DOC_COUNT', value: 3 },
    { name: 'MAX_EVIDEN_SIZE_MB', value: 50 },
    { name: 'accreditation_expiry_warning_days', value: 90 },
    { name: 'indicator_passing_grade', value: 25 }
  ];
  for (const t of thresholds) await prisma.thresholdConfig.upsert({ where: { name: t.name }, update: { value: t.value }, create: t });

  const templates = [
    { id: 'tpl-led-info', name: 'LED LAM Infokom', type: 'LED' as any, category: 'INFOKOM' as any, content: 'led-infokom.docx' },
    { id: 'tpl-lkps-tek', name: 'LKPS LAM Teknik', type: 'LKPS' as any, category: 'TEKNIK' as any, content: 'lkps-teknik.xlsx' }
  ];
  for (const t of templates) await prisma.documentTemplate.upsert({ where: { id: t.id }, update: { ...t, uploadedById: adminId }, create: { ...t, uploadedById: adminId } });
}

async function seedDocuments(prodiIds: Record<string, string>) {
  for (const p of prodiSeeds) {
    const prodiId = prodiIds[p.key];
    const kaprodiId = `user-kaprodi-${p.key}`;

    // 1. Simulasi
    await prisma.accreditationSimulation.upsert({
      where: { prodiId }, update: { totalScore: 320 },
      create: { id: `sim-${p.key}`, prodiId, quantitativeScore: 300, qualitativeScore: 340, totalScore: 320, indicators: {} }
    });

    // 2. LED & LKPS Doc
    await prisma.documentLED.upsert({
      where: { prodiId_periode_versi: { prodiId, periode: '2025', versi: 1 } },
      update: {}, create: { id: `led-${p.key}`, prodiId, name: `LED ${p.abbreviation} 2025`, status: 'FINAL', content: 'dummy', periode: '2025', versi: 1, pengunggahId: kaprodiId }
    });

    const lkpsDoc = await prisma.documentLKPS.upsert({
      where: { prodiId_periode_versi: { prodiId, periode: '2025', versi: 1 } },
      update: {}, create: { id: `lkps-${p.key}`, prodiId, name: `LKPS ${p.abbreviation} 2025`, status: 'FINAL', content: {}, periode: '2025', versi: 1, originalFilename: `LKPS_${p.abbreviation}.xlsx`, filePath: '#' }
    });

    // 3. LKPS Criteria & Sheets
    const critIds: Record<string, string> = {};
    for (const c of criteriaDefinitions) {
      const crit = await prisma.lKPSCriteria.upsert({
        where: { id: `crit-${p.key}-${c.code}` }, update: {},
        create: { id: `crit-${p.key}-${c.code}`, documentId: lkpsDoc.id, criteriaCode: c.code, criteriaName: c.name, isCompleted: true }
      });
      critIds[c.code] = crit.id;
    }

    const populatedSheets = buildLkpsSheets(p);
    const populatedNames = new Set(populatedSheets.map(s => s.sheetName));

    for (const sheet of populatedSheets) {
      await prisma.lKPSSheetData.upsert({
        where: { id: `sheet-${p.key}-${sheet.sheetName}` }, update: {},
        create: { id: `sheet-${p.key}-${sheet.sheetName}`, criteriaId: critIds[sheet.criteriaCode], sheetName: sheet.sheetName, sheetTitle: sheet.sheetTitle, data: sheet.data, isCompleted: sheet.isCompleted }
      });
    }

    // Auto-fill sisa sheet yang kosong
    for (const sheetName of ALL_LKPS_SHEETS) {
      if (!populatedNames.has(sheetName)) {
        await prisma.lKPSSheetData.upsert({
          where: { id: `sheet-${p.key}-${sheetName}` }, update: {},
          create: { id: `sheet-${p.key}-${sheetName}`, criteriaId: critIds['1'], sheetName, sheetTitle: `Tabel ${sheetName}`, data: [], isCompleted: false }
        });
      }
    }

    // 4. Eviden
    await prisma.dokumenEviden.upsert({
      where: { id: `eviden-${p.key}-1` }, update: {},
      create: { id: `eviden-${p.key}-1`, prodiId, judul: `Kegiatan Hackathon ${p.abbreviation}`, deskripsi: 'Bukti Lomba', indikator: ['C3', 'C6'], periode: '2025', status: 'FINAL', uploaderId: kaprodiId, files: { create: [{ id: `file-${p.key}-1`, originalFilename: 'Video.mp4', savedFilename: 'dummy.mp4', mimeType: 'video/mp4', size: 1024 * 1024 * 45 }] } }
    });
  }
}

// ==========================================
// MAIN EXECUTION
// ==========================================
async function main() {
  console.log('Memulai proses seeding...');
  
  const prodiIds = await seedProdis();
  const adminId = await seedUsers(prodiIds);
  await seedSettingsAndTemplates(adminId);
  await seedDocuments(prodiIds);

  console.log('✅ Seeding selesai! Password default semua user: password123');
}

main()
  .catch((e) => { console.error('✗ Error:', e.message); process.exit(1); })
  .finally(async () => await prisma.$disconnect());