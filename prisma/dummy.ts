import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.deleteMany({
    where: {
      email: { in: ['admin@itb.ac.id', 'kaprodi.if@itb.ac.id'] }
    }
  });

  // 2. Buat Data SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@itb.ac.id' },
    update: {},
    create: {
      email: 'admin@itb.ac.id',
      name: 'Super Admin STEI',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const prodiIF = await prisma.prodi.findFirst({
    where: { fullname: 'Teknik Informatika' }
  }) || await prisma.prodi.create({
    data: {
      fullname: 'Teknik Informatika',
      abbreviation: 'IF',
      degree: 'S1',
      accreditation: {
        create: {
          grade: 'Unggul',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2027-01-01'),
        }
      }
    },
  });

  // 4. Buat Data KAPRODI (Menghubungkan ke prodiId)
  const kaprodi = await prisma.user.upsert({
    where: { email: 'kaprodi.if@itb.ac.id' },
    update: {},
    create: {
      email: 'kaprodi.if@itb.ac.id',
      name: 'Dr. Budi Santoso',
      password: hashedPassword,
      role: 'KAPRODI',
      isActive: true,
      prodiId: prodiIF.id, // Menghubungkan Kaprodi ke prodi yang dibuat di atas
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });