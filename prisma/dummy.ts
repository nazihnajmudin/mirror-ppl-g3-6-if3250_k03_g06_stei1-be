const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const email = 'dummyadmin@email.com';

  // 1. Ensure a Prodi exists
  const prodiId = "prodi-dummy-1";
  await prisma.prodi.upsert({
    where: { id: prodiId },
    update: {},
    create: {
      id: prodiId,
      fullname: "Teknik Informatika",
      abbreviation: "IF",
      degree: "S1"
    }
  });

  // 2. Clean up
  await prisma.user.deleteMany({ where: { email } });

  // 3. Create User
  const admin = await prisma.user.create({
    data: {
      id: "user-dummy-admin",
      email: email,
      name: "Admin Dummy", 
      password: hashedPassword,
      role: 'SUPER_ADMIN', 
      isActive: true,
      prodiId: prodiId
    },
  });

  console.log(`Successfully created dummy user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
