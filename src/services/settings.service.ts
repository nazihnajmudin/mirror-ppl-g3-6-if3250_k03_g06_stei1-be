import prisma from '../config/database.config';

export const getThresholds = async () => {
  return await prisma.thresholdConfig.findMany({
    orderBy: { name: 'asc' }
  });
};

export const updateThreshold = async (name: string, value: number) => {
  return await prisma.thresholdConfig.upsert({
    where: { name },
    update: { value, updatedAt: new Date() },
    create: { name, value },
  });
};

export const getThresholdValue = async (name: string, defaultValue: number): Promise<number> => {
  const config = await prisma.thresholdConfig.findUnique({
    where: { name },
  });
  return config ? config.value : defaultValue;
};
