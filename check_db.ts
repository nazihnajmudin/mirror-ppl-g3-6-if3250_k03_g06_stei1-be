
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lkpsCount = await prisma.documentLKPS.count();
  const lkps = await prisma.documentLKPS.findMany({ select: { id: true, name: true, periode: true } });
  const prodis = await prisma.prodi.findMany({ select: { id: true, fullname: true } });

  console.log('DocumentLKPS count:', lkpsCount);
  console.log('DocumentLKPS sample:', lkps);
  console.log('Prodis count:', prodis.length);
  console.log('Prodis sample:', prodis);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
