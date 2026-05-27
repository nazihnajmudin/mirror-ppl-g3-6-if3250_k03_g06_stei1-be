import { PrismaClient, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type ProdiSeed = {
  key: string;
  fullname: string;
  abbreviation: string;
  degree: string;
  category: 'INFOKOM' | 'TEKNIK';
  accreditation: {
    grade: string;
    startDate: Date;
    endDate: Date;
    certificateUrl: string;
  };
};

type UserSeed = {
  id: string;
  email: string;
  name: string;
  role: Role;
  prodiKey: string | null;
};

type LkpsSheetSeed = {
  criteriaCode: string;
  criteriaName: string;
  sheetName: string;
  sheetTitle: string;
  data: Prisma.InputJsonValue;
  isCompleted: boolean;
};

const prodiSeeds: ProdiSeed[] = [
  {
    key: 'if',
    fullname: 'Sarjana Teknik Informatika',
    abbreviation: 'IF',
    degree: 'S1',
    category: 'INFOKOM',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2029-12-31'),
      certificateUrl: 'https://example.com/certificates/if.pdf',
    },
  },
  {
    key: 'ii',
    fullname: 'Sarjana Sistem dan Teknologi Informasi',
    abbreviation: 'STI',
    degree: 'S1',
    category: 'INFOKOM',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2029-12-31'),
      certificateUrl: 'https://example.com/certificates/sti.pdf',
    },
  },
  {
    key: 'el',
    fullname: 'Sarjana Teknik Elektro',
    abbreviation: 'EL',
    degree: 'S1',
    category: 'TEKNIK',
    accreditation: {
      grade: 'A',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2028-06-30'),
      certificateUrl: 'https://example.com/certificates/el.pdf',
    },
  },
  {
    key: 'ep',
    fullname: 'Sarjana Teknik Tenaga Listrik',
    abbreviation: 'EP',
    degree: 'S1',
    category: 'TEKNIK',
    accreditation: {
      grade: 'A',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2026-04-15'),
      certificateUrl: 'https://example.com/certificates/ep.pdf',
    },
  },
  {
    key: 'et',
    fullname: 'Sarjana Teknik Telekomunikasi',
    abbreviation: 'ET',
    degree: 'S1',
    category: 'TEKNIK',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2029-12-31'),
      certificateUrl: 'https://example.com/certificates/et.pdf',
    },
  },
  {
    key: 'eb',
    fullname: 'Sarjana Teknik Biomedis',
    abbreviation: 'EB',
    degree: 'S1',
    category: 'TEKNIK',
    accreditation: {
      grade: 'Baik Sekali',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2026-07-15'),
      certificateUrl: 'https://example.com/certificates/eb.pdf',
    },
  },
  {
    key: 'mel',
    fullname: 'Magister Teknik Elektro',
    abbreviation: 'MTE',
    degree: 'S2',
    category: 'TEKNIK',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2030-12-31'),
      certificateUrl: 'https://example.com/certificates/mte.pdf',
    },
  },
  {
    key: 'mif',
    fullname: 'Magister Informatika',
    abbreviation: 'MI',
    degree: 'S2',
    category: 'INFOKOM',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2030-12-31'),
      certificateUrl: 'https://example.com/certificates/mi.pdf',
    },
  },
  {
    key: 'mii',
    fullname: 'Magister Sistem dan Teknologi Informasi',
    abbreviation: 'MSTI',
    degree: 'S2',
    category: 'INFOKOM',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2030-12-31'),
      certificateUrl: 'https://example.com/certificates/msti.pdf',
    },
  },
  {
    key: 'mai',
    fullname: 'Magister Kecerdasan Artifisial',
    abbreviation: 'MKA',
    degree: 'S2',
    category: 'INFOKOM',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2030-12-31'),
      certificateUrl: 'https://example.com/certificates/mka.pdf',
    },
  },
  {
    key: 'dtei',
    fullname: 'Doktor Teknik Elektro dan Informatika',
    abbreviation: 'DTEI',
    degree: 'S3',
    category: 'TEKNIK',
    accreditation: {
      grade: 'Unggul',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2031-12-31'),
      certificateUrl: 'https://example.com/certificates/dtei.pdf',
    },
  },
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

const buildLkpsSheets = (prodi: ProdiSeed, index: number): LkpsSheetSeed[] => {
  const baseStudents = 180 + index * 35;

  return [
    {
      criteriaCode: '1',
      criteriaName: 'Visi Misi Tujuan Strategi',
      sheetName: '1',
      sheetTitle: 'Visi Misi Tujuan Strategi',
      data: [
        {
          no: 1,
          jenis_vmts: 'Visi PT',
          pernyataan: `Menjadi program studi ${prodi.fullname} yang unggul dan berdaya saing`,
          no_sk: `SK-${prodi.abbreviation}-01/2025`,
          link_dokumen: `https://example.com/vmts/${prodi.key}-visi-pt.pdf`,
        },
        {
          no: 2,
          jenis_vmts: 'Misi PT',
          pernyataan: `Menyelenggarakan pendidikan, penelitian, dan pengabdian untuk ${prodi.fullname}`,
          no_sk: `SK-${prodi.abbreviation}-02/2025`,
          link_dokumen: `https://example.com/vmts/${prodi.key}-misi-pt.pdf`,
        },
        {
          no: 3,
          jenis_vmts: 'Visi UPPS',
          pernyataan: `Menjadi unit pengelola yang adaptif bagi ${prodi.fullname}`,
          no_sk: `SK-${prodi.abbreviation}-03/2025`,
          link_dokumen: `https://example.com/vmts/${prodi.key}-visi-upps.pdf`,
        },
      ],
      isCompleted: true,
    },
    {
      criteriaCode: '2',
      criteriaName: 'Tata Pamong, Tata Kelola, dan Kerjasama',
      sheetName: '2a1',
      sheetTitle: 'Kerjasama Pendidikan',
      data: [
        {
          no: 1,
          lembaga_mitra: `Universitas Mitra ${prodi.abbreviation}`,
          tingkat_internasional: prodi.category === 'INFOKOM',
          tingkat_nasional: true,
          tingkat_lokal: false,
          judul_kerjasama: `Kolaborasi akademik ${prodi.fullname}`,
          manfaat: `Meningkatkan kualitas pendidikan dan riset ${prodi.fullname}`,
          tgl_awal: '2024-01-15',
          tgl_akhir: '2027-01-14',
          durasi: 3,
          status_kerjasama: 'Aktif',
          bukti_kerjasama: `https://example.com/kerjasama/${prodi.key}-1.pdf`,
        },
        {
          no: 2,
          lembaga_mitra: `Industri Mitra ${prodi.abbreviation}`,
          tingkat_internasional: false,
          tingkat_nasional: true,
          tingkat_lokal: true,
          judul_kerjasama: `Magang dan proyek capstone ${prodi.fullname}`,
          manfaat: `Menambah pengalaman praktis untuk mahasiswa ${prodi.fullname}`,
          tgl_awal: '2023-06-01',
          tgl_akhir: '2026-05-31',
          durasi: 3,
          status_kerjasama: 'Aktif',
          bukti_kerjasama: `https://example.com/kerjasama/${prodi.key}-2.pdf`,
        },
      ],
      isCompleted: true,
    },
    {
      criteriaCode: '3',
      criteriaName: 'Relevansi Pendidikan dan Penelitian/PkM',
      sheetName: '3a1',
      sheetTitle: 'Kurikulum dan Rencana Pembelajaran',
      data: [
        {
          no: 1,
          semester: 1,
          kode_mk: `${prodi.abbreviation}101`,
          nama_mk: `Pengantar ${prodi.fullname}`,
          mk_kompetensi: 'Dasar',
          sks_kuliah: 3,
          sks_seminar: 0,
          sks_praktikum: 1,
          dok_rps: `https://example.com/rps/${prodi.key}-101.pdf`,
          unit_penyelenggara: 'Prodi',
        },
        {
          no: 2,
          semester: 2,
          kode_mk: `${prodi.abbreviation}201`,
          nama_mk: `Metodologi Riset ${prodi.fullname}`,
          mk_kompetensi: 'Pendalaman',
          sks_kuliah: 3,
          sks_seminar: 1,
          sks_praktikum: 0,
          dok_rps: `https://example.com/rps/${prodi.key}-201.pdf`,
          unit_penyelenggara: 'Prodi',
        },
      ],
      isCompleted: true,
    },
    {
      criteriaCode: '4',
      criteriaName: 'Sumber Daya Manusia',
      sheetName: '4a',
      sheetTitle: 'Profil Dosen',
      data: [
        {
          no: 1,
          nama_dosen: `Prof. Dr. ${prodi.fullname} 1`,
          nidn: `${1000000000 + index}`,
          kategori_dosen: 'Tetap',
          prodi_s1: prodi.fullname,
          prodi_s2: prodi.fullname,
          prodi_s3: prodi.category === 'TEKNIK' ? 'Teknik Elektro' : 'Informatika',
          bidang_keahlian: `Bidang keahlian ${prodi.fullname}`,
          jabatan_akademik: 'Lektor Kepala',
          mk_diampu_ps: `${prodi.abbreviation}101, ${prodi.abbreviation}201`,
        },
      ],
      isCompleted: prodi.key !== 'ii' && prodi.key !== 'mii',
    },
    {
      criteriaCode: '5',
      criteriaName: 'Sarana dan Prasarana',
      sheetName: '5a',
      sheetTitle: 'Prasarana dan Peralatan',
      data: [
        {
          no: 1,
          nama_prasarana: `Laboratorium ${prodi.abbreviation}`,
          jumlah_prasarana: 1,
          nama_sarana: 'Komputer Desktop',
          jumlah_alat_standar: 20,
          jumlah_alat_dimiliki: 24,
          kepemilikan_sendiri: true,
          kondisi_terawat: true,
          waktu_penggunaan: 16,
        },
      ],
      isCompleted: prodi.key !== 'ii' && prodi.key !== 'mii',
    },
    {
      criteriaCode: '6',
      criteriaName: 'Mahasiswa dan Luaran Mahasiswa',
      sheetName: '6a',
      sheetTitle: 'Jumlah Mahasiswa',
      data: [
        {
          no: 1,
          program_studi: prodi.fullname,
          aktif_ts_minus2: baseStudents - 20,
          aktif_ts_minus1: baseStudents - 5,
          aktif_ts: baseStudents,
          asing_ft_ts_minus2: 3,
          asing_ft_ts_minus1: 5,
          asing_ft_ts: 7,
          asing_pt_ts_minus2: 0,
          asing_pt_ts_minus1: 1,
          asing_pt_ts: 1,
        },
      ],
      isCompleted: prodi.key !== 'ii' && prodi.key !== 'mii',
    },
    {
      criteriaCode: '7',
      criteriaName: 'Sistem Penjaminan Mutu',
      sheetName: '7a',
      sheetTitle: 'Ketersediaan Dokumen SPMI',
      data: [
        {
          no: 1,
          jenis_dokumen: 'Kebijakan SPMI',
          no_dokumen: `POL-${prodi.abbreviation}-SPMI-01`,
          tanggal_dokumen: '2024-03-15',
        },
        {
          no: 2,
          jenis_dokumen: 'Pedoman penerapan siklus PPEPP',
          no_dokumen: `PED-${prodi.abbreviation}-PPEPP-01`,
          tanggal_dokumen: '2024-04-01',
        },
      ],
      isCompleted: prodi.key !== 'ii' && prodi.key !== 'mii',
    },
  ];
};

const buildLedContent = (prodi: ProdiSeed) => ({
  bab1: `Ringkasan LED dummy untuk ${prodi.fullname}`,
  bab2: `Capaian utama dan praktik baik ${prodi.fullname}`,
  bab3: `Tindak lanjut peningkatan mutu ${prodi.fullname}`,
});

async function seedProdiAndAccreditation() {
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

  return prodiIdByKey;
}

async function seedUsers(prodiIdByKey: Record<string, string>) {
  const userSeeds: UserSeed[] = [
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
    ...prodiSeeds.map((prodi) => ({
      id: `user-dummy-kaprodi-${prodi.key}`,
      email: `kaprodi.${prodi.key}@email.com`,
      name: `Kaprodi ${prodi.fullname} Dummy`,
      role: 'KAPRODI' as Role,
      prodiKey: prodi.key,
    })),
    {
      id: 'user-dummy-tim-prodi',
      email: 'tim.prodi@email.com',
      name: 'Tim Prodi Dummy',
      role: 'TIM_PRODI',
      prodiKey: 'if',
    },
    ...prodiSeeds.flatMap((prodi) => [1, 2].map((index) => ({
      id: `user-dummy-tim-${prodi.key}-${index}`,
      email: `tim.${prodi.key}.${index}@email.com`,
      name: `Tim Prodi ${prodi.fullname} ${index}`,
      role: 'TIM_PRODI' as Role,
      prodiKey: prodi.key,
    }))),
  ];

  const usersByKey = new Map<string, { id: string; email: string; name: string; role: Role; prodiId: string | null }>();

  for (const user of userSeeds) {
    const resolvedProdiId = user.prodiKey ? prodiIdByKey[user.prodiKey] ?? null : null;

    const savedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
        password: await bcrypt.hash('password123', 10),
        role: user.role,
        isActive: true,
        prodiId: resolvedProdiId,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: await bcrypt.hash('password123', 10),
        role: user.role,
        isActive: true,
        prodiId: resolvedProdiId,
      },
    });

    usersByKey.set(user.id, {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      prodiId: resolvedProdiId,
    });
  }

  for (const user of userSeeds.filter((entry) => entry.role === 'TIM_PRODI')) {
    const prodiId = user.prodiKey ? prodiIdByKey[user.prodiKey] : null;
    if (!prodiId) continue;

    await prisma.prodiAssignment.upsert({
      where: {
        userId_prodiId: {
          userId: user.id,
          prodiId,
        },
      },
      update: {},
      create: {
        id: `assignment-${user.id}-${prodiId}`,
        userId: user.id,
        prodiId,
        kriteria: [],
      },
    });
  }

  const centralTeamUser = usersByKey.get('user-dummy-tim-prodi');
  if (centralTeamUser) {
    for (const prodi of ['if', 'ii', 'el']) {
      const prodiId = prodiIdByKey[prodi];
      if (!prodiId) continue;

      await prisma.prodiAssignment.upsert({
        where: {
          userId_prodiId: {
            userId: centralTeamUser.id,
            prodiId,
          },
        },
        update: {},
        create: {
          id: `assignment-${centralTeamUser.id}-${prodiId}`,
          userId: centralTeamUser.id,
          prodiId,
          kriteria: [],
        },
      });
    }
  }

  return usersByKey;
}

async function seedTemplates(uploaderId: string) {
  const templates = [
    {
      id: 'template-led-infokom',
      name: 'Template LED LAM Infokom',
      type: 'LED' as const,
      category: 'INFOKOM' as const,
      content: 'templates/led-infokom.docx',
    },
    {
      id: 'template-led-teknik',
      name: 'Template LED LAM Teknik',
      type: 'LED' as const,
      category: 'TEKNIK' as const,
      content: 'templates/led-teknik.docx',
    },
    {
      id: 'template-lkps-infokom',
      name: 'Template LKPS LAM Infokom',
      type: 'LKPS' as const,
      category: 'INFOKOM' as const,
      content: 'templates/lkps-infokom.xlsx',
    },
    {
      id: 'template-lkps-teknik',
      name: 'Template LKPS LAM Teknik',
      type: 'LKPS' as const,
      category: 'TEKNIK' as const,
      content: 'templates/lkps-teknik.xlsx',
    },
  ];

  for (const template of templates) {
    await prisma.documentTemplate.upsert({
      where: {
        type_category: {
          type: template.type,
          category: template.category,
        },
      },
      update: {
        name: template.name,
        content: template.content,
        uploadedById: uploaderId,
      },
      create: {
        id: template.id,
        name: template.name,
        type: template.type,
        category: template.category,
        content: template.content,
        uploadedById: uploaderId,
      },
    });
  }
}

async function seedThresholds() {
  const thresholds = [
    { name: 'MIN_FINAL_SCORE', value: 75 },
    { name: 'MIN_DOC_COUNT', value: 3 },
    { name: 'MAX_EVIDEN_SIZE_MB', value: 50 },
  ];

  for (const threshold of thresholds) {
    await prisma.thresholdConfig.upsert({
      where: { name: threshold.name },
      update: { value: threshold.value },
      create: threshold,
    });
  }
}

async function seedDataInstitusi(usersByKey: Map<string, { id: string }>) {
  const superAdmin = usersByKey.get('user-dummy-super-admin');
  if (!superAdmin) return;

  const dataInstitusiSeeds = [
    {
      id: 'data-institusi-2025-2026-2b',
      periode: '2025/2026',
      sheetName: '2b',
      data: [
        {
          no: 1,
          nama_mitra: 'Universitas Mitra Nasional',
          bentuk_kerja_sama: 'Pendidikan dan penelitian',
          tahun_mulai: 2024,
          tahun_selesai: 2027,
        },
      ],
    },
    {
      id: 'data-institusi-2025-2026-3b',
      periode: '2025/2026',
      sheetName: '3b',
      data: [
        {
          no: 1,
          nama_kebijakan: 'Kebijakan kurikulum berbasis OBE',
          status: 'Aktif',
          keterangan: 'Digunakan sebagai acuan penyusunan kurikulum semua prodi',
        },
      ],
    },
  ];

  for (const item of dataInstitusiSeeds) {
    const existing = await prisma.dataInstitusi.findFirst({
      where: {
        periode: item.periode,
        sheetName: item.sheetName,
        prodiId: null,
      },
    });

    if (existing) {
      await prisma.dataInstitusi.update({
        where: { id: existing.id },
        data: {
          data: item.data,
          createdById: superAdmin.id,
        },
      });
    } else {
      await prisma.dataInstitusi.create({
        data: {
          id: item.id,
          periode: item.periode,
          sheetName: item.sheetName,
          prodiId: null,
          data: item.data,
          createdById: superAdmin.id,
        },
      });
    }
  }
}

async function seedNotifications(prodiIdByKey: Record<string, string>) {
  await prisma.notification.upsert({
    where: { id: 'notification-global-seed' },
    update: {
      title: 'Seed dummy siap',
      message: 'Seluruh data dummy sudah disiapkan untuk semua prodi.',
      type: 'INFO',
      isRead: false,
      targetUrl: '/dashboard',
    },
    create: {
      id: 'notification-global-seed',
      title: 'Seed dummy siap',
      message: 'Seluruh data dummy sudah disiapkan untuk semua prodi.',
      type: 'INFO',
      isRead: false,
      targetUrl: '/dashboard',
    },
  });

  for (const prodi of prodiSeeds) {
    await prisma.notification.upsert({
      where: { id: `notification-${prodi.key}` },
      update: {
        prodiId: prodiIdByKey[prodi.key],
        title: `Dummy ${prodi.fullname}`,
        message: `Data seed LED, LKPS, eviden, dan tim prodi untuk ${prodi.fullname} sudah tersedia.`,
        type: prodi.degree === 'S3' ? 'WARNING' : 'INFO',
        isRead: false,
        targetUrl: `/prodi/${prodi.key}`,
      },
      create: {
        id: `notification-${prodi.key}`,
        prodiId: prodiIdByKey[prodi.key],
        title: `Dummy ${prodi.fullname}`,
        message: `Data seed LED, LKPS, eviden, dan tim prodi untuk ${prodi.fullname} sudah tersedia.`,
        type: prodi.degree === 'S3' ? 'WARNING' : 'INFO',
        isRead: false,
        targetUrl: `/prodi/${prodi.key}`,
      },
    });
  }
}

async function seedSimulations(prodiIdByKey: Record<string, string>) {
  for (const [index, prodi] of prodiSeeds.entries()) {
    await prisma.accreditationSimulation.upsert({
      where: { prodiId: prodiIdByKey[prodi.key] },
      update: {
        indicators: {
          prodi: prodi.fullname,
          level: prodi.degree,
          notes: `Simulasi akreditasi dummy untuk ${prodi.fullname}`,
        },
        quantitativeScore: 72 + index,
        qualitativeScore: 74 + index,
        totalScore: 73 + index,
      },
      create: {
        id: `simulation-${prodi.key}`,
        prodiId: prodiIdByKey[prodi.key],
        indicators: {
          prodi: prodi.fullname,
          level: prodi.degree,
          notes: `Simulasi akreditasi dummy untuk ${prodi.fullname}`,
        },
        quantitativeScore: 72 + index,
        qualitativeScore: 74 + index,
        totalScore: 73 + index,
      },
    });
  }
}

async function seedLedAndLkpsDocuments(prodiIdByKey: Record<string, string>, usersByKey: Map<string, { id: string }>) {
  for (const [index, prodi] of prodiSeeds.entries()) {
    const prodiId = prodiIdByKey[prodi.key];
    const kaprodi = usersByKey.get(`user-dummy-kaprodi-${prodi.key}`);

    if (!prodiId || !kaprodi) continue;

    const ledTemplate = prodi.category === 'INFOKOM' ? 'INFOKOM' : 'LAM_TEKNIK';

    await prisma.documentLED.upsert({
      where: {
        prodiId_periode_versi: {
          prodiId,
          periode: '2025',
          versi: 1,
        },
      },
      update: {
        name: `LED ${prodi.abbreviation} 2025`,
        status: 'FINAL',
        content: `Konten LED dummy untuk ${prodi.fullname}`,
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
        ukuran: 1024 * (50 + index * 5),
        pengunggahId: kaprodi.id,
      },
      create: {
        id: `led-doc-${prodi.key}`,
        prodiId,
        name: `LED ${prodi.abbreviation} 2025`,
        status: 'FINAL',
        content: `Konten LED dummy untuk ${prodi.fullname}`,
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
        ukuran: 1024 * (50 + index * 5),
        periode: '2025',
        versi: 1,
        pengunggahId: kaprodi.id,
      },
    });

    await prisma.ledForm.upsert({
      where: {
        prodiId_periode_template_versi: {
          prodiId,
          periode: '2025',
          template: ledTemplate,
          versi: 1,
        },
      },
      update: {
        status: 'FINAL',
        content: buildLedContent(prodi),
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
        createdById: kaprodi.id,
      },
      create: {
        id: `led-form-${prodi.key}`,
        prodiId,
        template: ledTemplate,
        periode: '2025',
        versi: 1,
        status: 'FINAL',
        content: buildLedContent(prodi),
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
        createdById: kaprodi.id,
      },
    });

    await prisma.documentLKPS.upsert({
      where: {
        prodiId_periode_versi: {
          prodiId,
          periode: '2025',
          versi: 1,
        },
      },
      update: {
        name: `LKPS ${prodi.abbreviation} 2025`,
        status: 'FINAL',
        content: { prodi: prodi.fullname, level: prodi.degree },
        filePath: `/uploads/lkps/LKPS_${prodi.abbreviation}_2025.xlsx`,
        originalFilename: `LKPS_${prodi.abbreviation}_2025.xlsx`,
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
      },
      create: {
        id: `lkps-doc-${prodi.key}`,
        prodiId,
        name: `LKPS ${prodi.abbreviation} 2025`,
        status: 'FINAL',
        content: { prodi: prodi.fullname, level: prodi.degree },
        filePath: `/uploads/lkps/LKPS_${prodi.abbreviation}_2025.xlsx`,
        originalFilename: `LKPS_${prodi.abbreviation}_2025.xlsx`,
        lockedAt: new Date('2026-05-21T00:00:00.000Z'),
        lockedBy: kaprodi.id,
        periode: '2025',
        versi: 1,
      },
    });

    const sheets = buildLkpsSheets(prodi, index);
    const criteriaIdByCode: Record<string, string> = {};

    for (const criteria of criteriaDefinitions) {
      const criteriaId = `lkps-criteria-${prodi.key}-${criteria.code}`;
      criteriaIdByCode[criteria.code] = criteriaId;

      await prisma.lKPSCriteria.upsert({
        where: { id: criteriaId },
        update: {
          documentId: `lkps-doc-${prodi.key}`,
          criteriaCode: criteria.code,
          criteriaName: criteria.name,
          subCriteriaCode: null,
          subCriteriaName: null,
          isCompleted: criteria.code === '1' || criteria.code === '2' || criteria.code === '3',
        },
        create: {
          id: criteriaId,
          documentId: `lkps-doc-${prodi.key}`,
          criteriaCode: criteria.code,
          criteriaName: criteria.name,
          subCriteriaCode: null,
          subCriteriaName: null,
          isCompleted: criteria.code === '1' || criteria.code === '2' || criteria.code === '3',
        },
      });
    }

    for (const sheet of sheets) {
      const sheetId = `lkps-sheet-${prodi.key}-${sheet.sheetName}`;
      const criteriaId = criteriaIdByCode[sheet.criteriaCode] ?? criteriaIdByCode['1'];

      await prisma.lKPSSheetData.upsert({
        where: { id: sheetId },
        update: {
          criteriaId,
          sheetName: sheet.sheetName,
          sheetTitle: sheet.sheetTitle,
          data: sheet.data,
          isCompleted: sheet.isCompleted,
        },
        create: {
          id: sheetId,
          criteriaId,
          sheetName: sheet.sheetName,
          sheetTitle: sheet.sheetTitle,
          data: sheet.data,
          isCompleted: sheet.isCompleted,
        },
      });
    }
  }
}

async function seedEviden(prodiIdByKey: Record<string, string>, usersByKey: Map<string, { id: string }>) {
  for (const [index, prodi] of prodiSeeds.entries()) {
    const prodiId = prodiIdByKey[prodi.key];
    const kaprodi = usersByKey.get(`user-dummy-kaprodi-${prodi.key}`);

    if (!prodiId || !kaprodi) continue;

    await prisma.dokumenEviden.upsert({
      where: { id: `eviden-${prodi.key}` },
      update: {
        prodiId,
        judul: `Dokumentasi Kegiatan ${prodi.fullname}`,
        deskripsi: `<p>Bukti kegiatan dummy untuk ${prodi.fullname}.</p>`,
        indikator: ['C3', 'C6'],
        periode: '2025',
        status: index % 2 === 0 ? 'FINAL' : 'DRAFT',
        lockedAt: index % 2 === 0 ? new Date('2026-05-21T00:00:00.000Z') : null,
        lockedBy: index % 2 === 0 ? kaprodi.id : null,
        uploaderId: kaprodi.id,
      },
      create: {
        id: `eviden-${prodi.key}`,
        prodiId,
        judul: `Dokumentasi Kegiatan ${prodi.fullname}`,
        deskripsi: `<p>Bukti kegiatan dummy untuk ${prodi.fullname}.</p>`,
        indikator: ['C3', 'C6'],
        periode: '2025',
        status: index % 2 === 0 ? 'FINAL' : 'DRAFT',
        lockedAt: index % 2 === 0 ? new Date('2026-05-21T00:00:00.000Z') : null,
        lockedBy: index % 2 === 0 ? kaprodi.id : null,
        uploaderId: kaprodi.id,
      },
    });

    await prisma.evidenFile.upsert({
      where: { id: `eviden-file-${prodi.key}` },
      update: {
        evidenId: `eviden-${prodi.key}`,
        originalFilename: `${prodi.abbreviation}_Dokumentasi.pdf`,
        savedFilename: `${prodi.key}-dokumentasi.pdf`,
        mimeType: 'application/pdf',
        size: 1024 * 1024 * (10 + index),
      },
      create: {
        id: `eviden-file-${prodi.key}`,
        evidenId: `eviden-${prodi.key}`,
        originalFilename: `${prodi.abbreviation}_Dokumentasi.pdf`,
        savedFilename: `${prodi.key}-dokumentasi.pdf`,
        mimeType: 'application/pdf',
        size: 1024 * 1024 * (10 + index),
      },
    });
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const prodiIdByKey = await seedProdiAndAccreditation();

  const userSeeds: UserSeed[] = [
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
    ...prodiSeeds.map((prodi) => ({
      id: `user-dummy-kaprodi-${prodi.key}`,
      email: `kaprodi.${prodi.key}@email.com`,
      name: `Kaprodi ${prodi.fullname} Dummy`,
      role: 'KAPRODI' as Role,
      prodiKey: prodi.key,
    })),
    {
      id: 'user-dummy-tim-prodi',
      email: 'tim.prodi@email.com',
      name: 'Tim Prodi Dummy',
      role: 'TIM_PRODI',
      prodiKey: 'if',
    },
    ...prodiSeeds.flatMap((prodi) => [1, 2].map((index) => ({
      id: `user-dummy-tim-${prodi.key}-${index}`,
      email: `tim.${prodi.key}.${index}@email.com`,
      name: `Tim Prodi ${prodi.fullname} ${index}`,
      role: 'TIM_PRODI' as Role,
      prodiKey: prodi.key,
    }))),
  ];

  const usersByKey = new Map<string, { id: string }>();

  for (const user of userSeeds) {
    const resolvedProdiId = user.prodiKey ? prodiIdByKey[user.prodiKey] ?? null : null;

    const savedUser = await prisma.user.upsert({
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

    usersByKey.set(user.id, { id: savedUser.id });
  }

  for (const user of userSeeds.filter((entry) => entry.role === 'TIM_PRODI')) {
    const prodiId = user.prodiKey ? prodiIdByKey[user.prodiKey] : null;
    if (!prodiId) continue;

    await prisma.prodiAssignment.upsert({
      where: {
        userId_prodiId: {
          userId: user.id,
          prodiId,
        },
      },
      update: {},
      create: {
        id: `assignment-${user.id}-${prodiId}`,
        userId: user.id,
        prodiId,
        kriteria: [],
      },
    });
  }

  const centralTeamUser = usersByKey.get('user-dummy-tim-prodi');
  if (centralTeamUser) {
    for (const prodiKey of ['if', 'ii', 'el']) {
      const prodiId = prodiIdByKey[prodiKey];
      if (!prodiId) continue;

      await prisma.prodiAssignment.upsert({
        where: {
          userId_prodiId: {
            userId: centralTeamUser.id,
            prodiId,
          },
        },
        update: {},
        create: {
          id: `assignment-${centralTeamUser.id}-${prodiId}`,
          userId: centralTeamUser.id,
          prodiId,
          kriteria: [],
        },
      });
    }
  }

  await seedTemplates('user-dummy-super-admin');
  await seedThresholds();
  await seedDataInstitusi(usersByKey);
  // seedNotifications is disabled to prevent leaked development messages in the inbox
  // await seedNotifications(prodiIdByKey);
  await seedSimulations(prodiIdByKey);
  await seedLedAndLkpsDocuments(prodiIdByKey, usersByKey);
  await seedEviden(prodiIdByKey, usersByKey);

  console.log('Dummy seed completed.');
  console.log('Default password for all dummy users: password123');

  // ==========================================
  // SEEDING DUMMY: DOKUMEN LED (UPLOAD)
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
        lockedAt: new Date(),
        lockedBy: kaprodiIf.id,
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
        lockedAt: new Date(),
        lockedBy: kaprodiIf.id,
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

    // ==========================================
    // SEEDING DUMMY: LED FORM
    // ==========================================
    console.log('Seeding LED Form dummy data...');
    await prisma.ledForm.upsert({
      where: {
        prodiId_periode_template_versi: {
            prodiId: prodiIfId,
            periode: '2025',
            template: 'INFOKOM',
            versi: 1
        }
      },
      update: {},
      create: {
          prodiId: prodiIfId,
          template: 'INFOKOM',
          periode: '2025',
          versi: 1,
          status: 'FINAL',
          content: { "bab1": "Isi pendahuluan dari form LED" },
          createdById: kaprodiIf.id,
          lockedAt: new Date(),
          lockedBy: kaprodiIf.id,
      }
    });
  }

  // ==========================================
  // SEEDING DUMMY: DOKUMEN EVIDEN
  // ==========================================
  console.log('Seeding Dokumen Eviden dummy data...');
  if (kaprodiIf && prodiIfId) {
    await prisma.dokumenEviden.upsert({
      where: { id: 'eviden-dummy-1' },
      update: {},
      create: {
        id: 'eviden-dummy-1',
        prodiId: prodiIfId,
        judul: 'Dokumentasi Kegiatan Hackathon 2025',
        deskripsi: '<p>Ini adalah bukti dokumentasi kegiatan perlombaan mahasiswa.</p>',
        indikator: ['C3', 'C6'],
        periode: '2025',
        status: 'FINAL', // Tes dokumen yang dikunci
        lockedAt: new Date(),
        lockedBy: kaprodiIf.id,
        uploaderId: kaprodiIf.id,
        files: {
          create: [
            {
              id: 'file-dummy-1',
              originalFilename: 'Video_Dokumentasi.mp4',
              savedFilename: 'dummy-1.mp4',
              mimeType: 'video/mp4',
              size: 1024 * 1024 * 45, // 45 MB
            }
          ]
        }
      }
    });

    await prisma.dokumenEviden.upsert({
      where: { id: 'eviden-dummy-2' },
      update: {},
      create: {
        id: 'eviden-dummy-2',
        prodiId: prodiIfId,
        judul: 'Daftar Hadir Dosen 2024',
        deskripsi: '<p>Rekap kehadiran dan RPS.</p>',
        indikator: ['C4', 'C5'],
        periode: '2024',
        status: 'DRAFT', // Tes dokumen yang masih terbuka
        uploaderId: kaprodiIf.id,
        files: {
          create: [
            {
              id: 'file-dummy-2',
              originalFilename: 'Rekap_Hadir_2024.xlsx',
              savedFilename: 'dummy-2.xlsx',
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              size: 1024 * 850, // 850 KB
            }
          ]
        }
      }
    });
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
        where: {
          type_category: {
            type: template.type,
            category: template.category,
          },
        },
        update: template,
        create: template,
      });
    }
  }

  // ==========================================
  // SEEDING DUMMY: DOKUMEN LKPS & SHEET
  // ==========================================
  console.log('Seeding Document LKPS with Criteria and Sheet Data...');

  // Mengecek apakah LKPS versi 1 periode 2025 untuk IF sudah ada agar tidak bentrok @@unique
  let dummyLKPSDoc = await prisma.documentLKPS.findFirst({
    where: { prodiId: prodiIdByKey['if'], periode: '2025', versi: 1 }
  });

  if (!dummyLKPSDoc) {
      // Create dummy LKPS Document for IF Prodi
      dummyLKPSDoc = await prisma.documentLKPS.create({
        data: {
          prodiId: prodiIdByKey['if'],
          name: 'LKPS IF 2025 Semester Genap',
          status: 'FINAL',
          lockedAt: new Date(),
          lockedBy: superAdmin?.id,
          versi: 1,
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

      // Auto-seed remaining sheets with empty data
      const { getAllSheetNames } = await import('../src/config/lkps.config');
      const allSheetNames = getAllSheetNames();
      const seededSheets = new Set(['1', '2a1', '3a1', '4a', '5a', '6a', '7a', 'PS', 'PSPPI']);

      console.log(`Auto-seeding remaining sheets (${allSheetNames.length - seededSheets.size} sheets)...`);

      for (const sheetName of allSheetNames) {
        if (seededSheets.has(sheetName)) continue; // Skip already seeded sheets

        // Determine criteria ID based on sheet name
        let criteriaCode = '0';
        if (sheetName === '1') criteriaCode = '1';
        else if (sheetName.startsWith('2')) criteriaCode = '2';
        else if (sheetName.startsWith('3')) criteriaCode = '3';
        else if (sheetName.startsWith('4')) criteriaCode = '4';
        else if (sheetName.startsWith('5')) criteriaCode = '5';
        else if (sheetName.startsWith('6')) criteriaCode = '6';
        else if (sheetName.startsWith('7')) criteriaCode = '7';

        const criteriaId = kriteriaIds[criteriaCode] || kriteriaIds['1'];

        // Import config to get sheet details
        const { getSheetConfig } = await import('../src/config/lkps.config');
        const sheetConfig = getSheetConfig(sheetName);

        if (!sheetConfig) continue;

        try {
          await prisma.lKPSSheetData.create({
            data: {
              criteriaId,
              sheetName,
              sheetTitle: sheetConfig.sheetTitle,
              data: [], // Empty data for now
              isCompleted: false,
            },
          });
          console.log(`✓ Created Sheet ${sheetName}: ${sheetConfig.sheetTitle} (empty)`);
        } catch (error: any) {
          // Silently skip if already exists (unique constraint)
          if (error.code === 'P2002') {
            console.log(`⊘ Sheet ${sheetName} already exists, skipping...`);
          } else {
            console.error(`✗ Error creating sheet ${sheetName}:`, error.message);
          }
        }
      }
  } else {
      console.log('LKPS Document already exists, skipping seed to prevent unique constraint error.');
  }

  console.log('LKPS seeding completed successfully!');

  // ==========================================
  // SEEDING DEFAULT: THRESHOLD CONFIGS
  // ==========================================
  console.log('Seeding default ThresholdConfig values...');
  const defaultThresholds = [
    { name: 'accreditation_expiry_warning_days', value: 90 },
    { name: 'indicator_passing_grade', value: 25 },
  ];
  for (const t of defaultThresholds) {
    await prisma.thresholdConfig.upsert({
      where: { name: t.name },
      update: {},
      create: { name: t.name, value: t.value },
    });
  }
  console.log('ThresholdConfig seeding completed!');

  // ==========================================
  // TRIGGER EARLY WARNING GENERATION
  // ==========================================
  console.log('Triggering early warning generation...');
  const { generateEarlyWarnings } = await import('../src/services/notification.service');
  await generateEarlyWarnings();
  console.log('Early warning generation completed!');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });