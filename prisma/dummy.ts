import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const email = 'dummyadmin@email.com';

  await prisma.user.deleteMany({ where: { email } });

  const admin = await prisma.user.create({
    data: {
      email: email,
      name: "Admin Dummy", 
      password: hashedPassword,
      role: 'ADMIN_INSTITUSI', 
      isActive: true,
    },
  });

  console.log(admin.email);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());