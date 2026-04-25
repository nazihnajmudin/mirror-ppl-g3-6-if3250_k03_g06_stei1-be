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
        indikator: ['K3', 'K9'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2029-12-31'),
        uploaderId: kaprodiIf.id,
        files: {
          create: [
            {
              id: 'file-dummy-1',
              originalFilename: 'Video_Dokumentasi.mp4',
              savedFilename: 'dummy-1.mp4',
              mimeType: 'video/mp4',
              size: 1024 * 1024 * 45, // 45 MB
            },
            {
              id: 'file-dummy-2',
              originalFilename: 'Laporan_Kegiatan.pdf',
              savedFilename: 'dummy-2.pdf',
              mimeType: 'application/pdf',
              size: 1024 * 1024 * 2.5, // 2.5 MB
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
        indikator: ['K4', 'K6'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2029-12-31'),
        uploaderId: kaprodiIf.id,
        files: {
          create: [
            {
              id: 'file-dummy-3',
              originalFilename: 'Rekap_Hadir_2024.xlsx',
              savedFilename: 'dummy-3.xlsx',
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              size: 1024 * 850, // 850 KB
            }
          ]
        }
      }
    });
  }
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
