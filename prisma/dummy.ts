import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const prodiSeeds = [
    {
      key: 'if',
      fullname: 'Teknik Informatika',
      abbreviation: 'IF',
      degree: 'S1',
      accreditation: {
        grade: 'Unggul',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2029-12-31'),
        certificateUrl: 'https://example.com/certificates/if.pdf',
      },
    },
    {
      key: 'ii',
      fullname: 'Sistem dan Teknologi Informasi',
      abbreviation: 'II',
      degree: 'S1',
      accreditation: {
        grade: 'Unggul',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2029-12-31'),
        certificateUrl: 'https://example.com/certificates/ii.pdf',
      },
    },
    {
      key: 'el',
      fullname: 'Teknik Elektro',
      abbreviation: 'EL',
      degree: 'S1',
      accreditation: {
        grade: 'A',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2028-06-30'),
        certificateUrl: 'https://example.com/certificates/el.pdf',
      },
    },
    {
      key: 'ep',
      fullname: 'Teknik Tenaga Listrik',
      abbreviation: 'EP',
      degree: 'S1',
      accreditation: {
        grade: 'A',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2028-06-30'),
        certificateUrl: 'https://example.com/certificates/ep.pdf',
      },
    },
    {
      key: 'et',
      fullname: 'Teknik Telekomunikasi',
      abbreviation: 'ET',
      degree: 'S1',
      accreditation: {
        grade: 'Unggul',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2029-12-31'),
        certificateUrl: 'https://example.com/certificates/et.pdf',
      },
    },
    {
      key: 'eb',
      fullname: 'Teknik Biomedis',
      abbreviation: 'EB',
      degree: 'S1',
      accreditation: {
        grade: 'Baik Sekali',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2027-12-31'),
        certificateUrl: 'https://example.com/certificates/eb.pdf',
      },
    },
  ];

  const prodiIdByKey: Record<string, string> = {};

  for (const prodi of prodiSeeds) {
    const savedProdi = await prisma.prodi.upsert({
      where: { id: `prodi-${prodi.key}` },
      update: {
        fullname: prodi.fullname,
        abbreviation: prodi.abbreviation,
        degree: prodi.degree,
      },
      create: {
        id: `prodi-${prodi.key}`,
        fullname: prodi.fullname,
        abbreviation: prodi.abbreviation,
        degree: prodi.degree,
      },
    });

    prodiIdByKey[prodi.key] = savedProdi.id;

    await prisma.accreditationInfo.upsert({
      where: { prodiId: savedProdi.id },
      update: {
        grade: prodi.accreditation.grade,
        startDate: prodi.accreditation.startDate,
        endDate: prodi.accreditation.endDate,
        certificateUrl: prodi.accreditation.certificateUrl,
      },
      create: {
        prodiId: savedProdi.id,
        grade: prodi.accreditation.grade,
        startDate: prodi.accreditation.startDate,
        endDate: prodi.accreditation.endDate,
        certificateUrl: prodi.accreditation.certificateUrl,
      },
    });
  }

  const userSeeds: Array<{
    id: string;
    email: string;
    name: string;
    role: Role;
    prodiKey: string | null;
  }> = [
    {
      id: 'user-dummy-super-admin',
      email: 'dummyadmin@email.com',
      name: 'Admin Dummy',
      role: 'SUPER_ADMIN',
      prodiKey: null,
    },
    {
      id: 'user-dummy-pimpinan',
      email: 'dummypimpinan@email.com',
      name: 'Pimpinan Dummy',
      role: 'PIMPINAN',
      prodiKey: null,
    },
    {
      id: 'user-dummy-kaprodi-if',
      email: 'kaprodi.if@email.com',
      name: 'Kaprodi IF Dummy',
      role: 'KAPRODI',
      prodiKey: 'if',
    },
    {
      id: 'user-dummy-kaprodi-sti',
      email: 'kaprodi.ii@email.com',
      name: 'Kaprodi STI Dummy',
      role: 'KAPRODI',
      prodiKey: 'ii',
    },
    {
      id: 'user-dummy-kaprodi-el',
      email: 'kaprodi.el@email.com',
      name: 'Kaprodi EL Dummy',
      role: 'KAPRODI',
      prodiKey: 'el',
    },
    {
      id: 'user-dummy-kaprodi-tl',
      email: 'kaprodi.ep@email.com',
      name: 'Kaprodi EP Dummy',
      role: 'KAPRODI',
      prodiKey: 'ep',
    },
    {
      id: 'user-dummy-kaprodi-tt',
      email: 'kaprodi.et@email.com',
      name: 'Kaprodi ET Dummy',
      role: 'KAPRODI',
      prodiKey: 'et',
    },
    {
      id: 'user-dummy-kaprodi-bm',
      email: 'kaprodi.eb@email.com',
      name: 'Kaprodi EB Dummy',
      role: 'KAPRODI',
      prodiKey: 'eb',
    },
    {
      id: 'user-dummy-tim-prodi',
      email: 'tim.prodi@email.com',
      name: 'Tim Prodi Dummy',
      role: 'TIM_PRODI',
      prodiKey: 'if',
    }
  ];

  for (const user of userSeeds) {
    const resolvedProdiId = user.prodiKey ? prodiIdByKey[user.prodiKey] : null;

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
        isActive: true,
        prodiId: resolvedProdiId,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
        isActive: true,
        prodiId: resolvedProdiId,
      },
    });
  }

  const timProdi = await prisma.user.findUnique({
    where: { email: 'tim.prodi@email.com' },
    select: { id: true },
  });

  if (timProdi) {
    const assignedProdiKeys = ['if', 'ii', 'el'];

    for (const prodiKey of assignedProdiKeys) {
      const prodiId = prodiIdByKey[prodiKey];
      if (!prodiId) continue;

      await prisma.prodiAssignment.upsert({
        where: {
          userId_prodiId: {
            userId: timProdi.id,
            prodiId,
          },
        },
        update: {},
        create: {
          userId: timProdi.id,
          prodiId,
        },
      });
    }
  }

  console.log('Dummy seed completed.');
  console.log('Default password for all dummy users: password123');

  // ==========================================
  // SEEDING DUMMY: DOKUMEN LED
  // ==========================================
  console.log('Seeding Document LED dummy data...');
  
  const kaprodiIf = await prisma.user.findUnique({ where: { email: 'kaprodi.if@email.com' } });
  const prodiIfId = prodiIdByKey['if'];

  if (kaprodiIf && prodiIfId) {
    const dummyLEDs = [
      {
        name: 'dummy1.docx',
        status: 'DRAFT' as any,
        content: 'dummy1.docx',
        ukuran: 1024 * 33,
        periode: '2025',
        versi: 1,
        pengunggahId: kaprodiIf.id,
        prodiId: prodiIfId,
      },
      {
        name: 'dummy2.docx',
        status: 'DRAFT' as any,
        content: 'dummy2.docx',
        ukuran: 1024 * 751,
        periode: '2025',
        versi: 2,
        pengunggahId: kaprodiIf.id,
        prodiId: prodiIfId,
      },
      {
        name: 'dummy3.docx',
        status: 'FINAL' as any,
        content: 'dummy3.docx',
        ukuran: 1024 * 19,
        periode: '2025',
        versi: 3,
        pengunggahId: kaprodiIf.id,
        prodiId: prodiIfId,
      },
      {
        name: 'dummy4.docx',
        status: 'FINAL' as any,
        content: 'dummy4.docx',
        ukuran: 1024 * 892,
        periode: '2020',
        versi: 1,
        pengunggahId: kaprodiIf.id,
        prodiId: prodiIfId,
      }
    ];

    for (const led of dummyLEDs) {
      await prisma.documentLED.upsert({
        where: {
          prodiId_periode_versi: {
            prodiId: led.prodiId,
            periode: led.periode,
            versi: led.versi
          }
        },
        update: led,
        create: led,
      });
    }
  }

  // ==========================================
  // SEEDING DUMMY: DOKUMEN TEMPLATE
  // ==========================================
  console.log('Seeding Document Template dummy data...');

  const superAdmin = await prisma.user.findUnique({ where: { email: 'dummyadmin@email.com' } });

  if (superAdmin) {
    const dummyTemplates = [
      {
        id: 'template-dummy-infokom-led',
        name: 'Template LED LAM Infokom',
        type: 'LED' as any,
        category: 'INFOKOM' as any,
        content: 'dummy.docx',
        uploadedById: superAdmin.id,
      },
      {
        id: 'template-dummy-teknik-lkps',
        name: 'Template LKPS LAM Teknik',
        type: 'LKPS' as any,
        category: 'TEKNIK' as any,
        content: 'dummy.xlsx',
        uploadedById: superAdmin.id,
      }
    ];

    for (const template of dummyTemplates) {
      await prisma.documentTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template,
      });
    }
  }

  console.log('Seeding Document LKPS with Criteria and Sheet Data...');

  // Create dummy LKPS Document for IF Prodi
  const dummyLKPSDoc = await prisma.documentLKPS.create({
    data: {
      id: 'lkps-dummy-if-2025-v1',
      prodiId: prodiIdByKey['if'],
      name: 'LKPS IF 2025 Semester Genap',
      status: 'DRAFT',
      periode: '2025',
      content: { menu: 'Laporan Kinerja Program Studi' },
      originalFilename: 'LKPS_IF_2025.xlsx',
      filePath: '/uploads/lkps/LKPS_IF_2025.xlsx',
    },
  });

  console.log(`Created LKPS Document: ${dummyLKPSDoc.id}`);

  // Create 7 LKPS Kriteria for this document
  const kriteria = [
    { code: '1', name: 'Visi Misi Tujuan Strategi' },
    { code: '2', name: 'Tata Pamong, Tata Kelola, dan Kerjasama' },
    { code: '3', name: 'Relevansi Pendidikan dan Penelitian/PkM' },
    { code: '4', name: 'Sumber Daya Manusia' },
    { code: '5', name: 'Sarana dan Prasarana' },
    { code: '6', name: 'Mahasiswa dan Luaran Mahasiswa' },
    { code: '7', name: 'Sistem Penjaminan Mutu' },
  ];

  const kriteriaIds: Record<string, string> = {};

  for (const k of kriteria) {
    const savedKriteria = await prisma.lKPSCriteria.create({
      data: {
        documentId: dummyLKPSDoc.id,
        criteriaCode: k.code,
        criteriaName: k.name,
        subCriteriaCode: null,
        subCriteriaName: null,
        isCompleted: false,
      },
    });
    kriteriaIds[k.code] = savedKriteria.id;
    console.log(`Created Kriteria ${k.code}: ${savedKriteria.id}`);
  }

  // Create sample LKPSSheetData for some sheets
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['1'],
      sheetName: '1',
      sheetTitle: 'Visi Misi Tujuan Strategi',
      data: [
        {
          no: 1,
          jenis_vmts: 'Visi PT',
          pernyataan: 'Menjadi perguruan tinggi yang unggul dalam iptek dan akhlak',
          no_sk: 'SK-01/2024',
          link_dokumen: 'https://example.com/vmts/visi-pt.pdf',
        },
        {
          no: 2,
          jenis_vmts: 'Misi PT',
          pernyataan: 'Menyelenggarakan pendidikan berkualitas dan berdampak',
          no_sk: 'SK-02/2024',
          link_dokumen: 'https://example.com/vmts/misi-pt.pdf',
        },
        {
          no: 3,
          jenis_vmts: 'Visi UPPS',
          pernyataan: 'Menjadi unit pengelola program studi terdepan',
          no_sk: 'SK-03/2024',
          link_dokumen: 'https://example.com/vmts/visi-upps.pdf',
        },
        {
          no: 4,
          jenis_vmts: 'Misi UPPS',
          pernyataan: 'Mengelola program studi dengan akuntabilitas dan inovasi',
          no_sk: 'SK-04/2024',
          link_dokumen: 'https://example.com/vmts/misi-upps.pdf',
        },
        {
          no: 5,
          jenis_vmts: 'Visi Keilmuan PS',
          pernyataan: 'Menghasilkan lulusan kompeten di bidang informatika',
          no_sk: 'SK-05/2024',
          link_dokumen: 'https://example.com/vmts/visi-keilmuan.pdf',
        },
      ],
      isCompleted: true,
    },
  });
  console.log('Created Sheet 1: VMTS (Kriteria 1) - Fixed 5 rows');

  // SHEET 2a1: Kerjasama Pendidikan (Kriteria 2)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['2'],
      sheetName: '2a1',
      sheetTitle: 'Kerjasama Pendidikan',
      data: [
        {
          no: 1,
          lembaga_mitra: 'Universitas Teknologi Malaysia',
          tingkat_internasional: true,
          tingkat_nasional: false,
          tingkat_lokal: false,
          judul_kerjasama: 'Program Pertukaran Mahasiswa dan Dosen',
          manfaat: 'Meningkatkan kompetensi internasional mahasiswa dan dosen',
          tgl_awal: '2024-01-15',
          tgl_akhir: '2027-01-14',
          durasi: 3,
          status_kerjasama: 'Aktif',
          bukti_kerjasama: 'https://example.com/kerjasama/utm-agreement.pdf',
        },
        {
          no: 2,
          lembaga_mitra: 'Institut Teknologi Bandung',
          tingkat_internasional: false,
          tingkat_nasional: true,
          tingkat_lokal: false,
          judul_kerjasama: 'Kolaborasi Riset Teknik Informatika',
          manfaat: 'Sinergi riset dan pengembangan kurikulum',
          tgl_awal: '2023-06-01',
          tgl_akhir: '2025-05-31',
          durasi: 2,
          status_kerjasama: 'Aktif',
          bukti_kerjasama: 'https://example.com/kerjasama/itb-agreement.pdf',
        },
      ],
      isCompleted: true,
    },
  });
  console.log('Created Sheet 2a1: Kerjasama Pendidikan (Kriteria 2)');

  // SHEET 3a1: Kurikulum dan Rencana Pembelajaran (Kriteria 3)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['3'],
      sheetName: '3a1',
      sheetTitle: 'Kurikulum dan Rencana Pembelajaran',
      data: [
        {
          no: 1,
          semester: 1,
          kode_mk: 'IF101',
          nama_mk: 'Algoritma Dasar',
          mk_kompetensi: 'Pemrograman',
          sks_kuliah: 3,
          sks_seminar: 0,
          sks_praktikum: 1,
          dok_rps: 'https://example.com/rps/IF101-RPS.pdf',
          unit_penyelenggara: 'Prodi',
        },
        {
          no: 2,
          semester: 1,
          kode_mk: 'IF102',
          nama_mk: 'Logika Matematis',
          mk_kompetensi: 'Dasar',
          sks_kuliah: 2,
          sks_seminar: 0,
          sks_praktikum: 0,
          dok_rps: 'https://example.com/rps/IF102-RPS.pdf',
          unit_penyelenggara: 'Universitas',
        },
        {
          no: 3,
          semester: 2,
          kode_mk: 'IF201',
          nama_mk: 'Struktur Data',
          mk_kompetensi: 'Pemrograman',
          sks_kuliah: 3,
          sks_seminar: 0,
          sks_praktikum: 1,
          dok_rps: 'https://example.com/rps/IF201-RPS.pdf',
          unit_penyelenggara: 'Prodi',
        },
      ],
      isCompleted: false,
    },
  });
  console.log('Created Sheet 3a1: Kurikulum (Kriteria 3) - 3 courses');

  // SHEET 4a: Profil Dosen (Kriteria 4)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['4'],
      sheetName: '4a',
      sheetTitle: 'Profil Dosen',
      data: [
        {
          no: 1,
          nama_dosen: 'Prof. Dr. Budi Santoso, ST., MT.',
          nidn: '0015026703',
          kategori_dosen: 'Tetap',
          prodi_s1: 'Teknik Informatika',
          prodi_s2: 'Ilmu Komputer',
          prodi_s3: 'Ilmu Komputer',
          bidang_keahlian: 'Algoritma dan Komputasi',
          jabatan_akademik: 'Guru Besar',
          mk_diampu_ps: 'IF101 Algoritma Dasar, IF201 Struktur Data',
        },
      ],
      isCompleted: true,
    },
  });
  console.log('Created Sheet 4a: Profil Dosen (Kriteria 4) - 1 lecturer');

  // SHEET 5a: Prasarana dan Peralatan (Kriteria 5)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['5'],
      sheetName: '5a',
      sheetTitle: 'Prasarana dan Peralatan',
      data: [
        {
          no: 1,
          nama_prasarana: 'Lab Pemrograman A',
          jumlah_prasarana: 1,
          nama_sarana: 'Komputer Desktop',
          jumlah_alat_standar: 20,
          jumlah_alat_dimiliki: 22,
          kepemilikan_sendiri: true,
          kondisi_terawat: true,
          waktu_penggunaan: 16,
        },
      ],
      isCompleted: true,
    },
  });
  console.log('Created Sheet 5a: Prasarana (Kriteria 5) - 1 facility');

  // SHEET 6a: Jumlah Mahasiswa (Kriteria 6)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['6'],
      sheetName: '6a',
      sheetTitle: 'Jumlah Mahasiswa',
      data: [
        {
          no: 1,
          program_studi: 'Teknik Informatika',
          aktif_ts_minus2: 650,
          aktif_ts_minus1: 680,
          aktif_ts: 720,
          asing_ft_ts_minus2: 5,
          asing_ft_ts_minus1: 8,
          asing_ft_ts: 12,
          asing_pt_ts_minus2: 0,
          asing_pt_ts_minus1: 0,
          asing_pt_ts: 2,
        },
      ],
      isCompleted: true,
    },
  });
  console.log('Created Sheet 6a: Jumlah Mahasiswa (Kriteria 6) - 720 active + 14 foreign');

  // SHEET 7a: Dokumen SPMI (Kriteria 7)
  await prisma.lKPSSheetData.create({
    data: {
      criteriaId: kriteriaIds['7'],
      sheetName: '7a',
      sheetTitle: 'Ketersediaan Dokumen SPMI',
      data: [
        {
          no: 1,
          jenis_dokumen: 'Kebijakan SPMI',
          no_dokumen: 'POL-SPMI-2024-01',
          tanggal_dokumen: '2024-03-15',
        },
        {
          no: 2,
          jenis_dokumen: 'Pedoman penerapan siklus PPEPP',
          no_dokumen: 'PED-PPEPP-2024-01',
          tanggal_dokumen: '2024-04-01',
        },
        {
          no: 3,
          jenis_dokumen: 'Standar dan/atau kriteria, norma, acuan mutu',
          no_dokumen: 'STD-MUTU-2024-01',
          tanggal_dokumen: '2024-03-20',
        },
        {
          no: 4,
          jenis_dokumen: 'Tata cara pendokumentasian implementasi SPMI',
          no_dokumen: 'TAT-DOK-2024-01',
          tanggal_dokumen: '2024-04-10',
        },
      ],
      isCompleted: false,
    },
  });
  console.log('Created Sheet 7a: Dokumen SPMI (Kriteria 7)');

  console.log('LKPS seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
