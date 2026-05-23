import prisma from '../config/database.config';
import { MonitoringDocumentType, MonitoringStatus, Role } from '@prisma/client';
import { getProdiForUser } from './prodi.service';

type DocumentTarget = {
  id: string;
  prodiId: string;
  label: string;
};

type CreateMonitoringInput = {
  documentType: MonitoringDocumentType;
  documentId: string;
  indicatorCode?: string | null;
  indicatorName: string;
  note: string;
  evaluation?: string | null;
  recommendation?: string | null;
  status?: MonitoringStatus;
  reviewedAt?: string | Date | null;
  createdById: string;
};

type UpdateMonitoringInput = Partial<Omit<CreateMonitoringInput, 'documentType' | 'documentId' | 'createdById'>> & {
  status?: MonitoringStatus;
};

const resolveDocument = async (documentType: MonitoringDocumentType, documentId: string): Promise<DocumentTarget> => {
  if (documentType === 'LKPS') {
    const document = await prisma.documentLKPS.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Dokumen LKPS tidak ditemukan');
    return { id: document.id, prodiId: document.prodiId, label: document.name || 'LKPS' };
  }

  if (documentType === 'LED') {
    const document = await prisma.documentLED.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Dokumen LED tidak ditemukan');
    return { id: document.id, prodiId: document.prodiId, label: document.name || 'LED' };
  }

  const document = await prisma.dokumenEviden.findUnique({ where: { id: documentId } });
  if (!document) throw new Error('Dokumen Eviden tidak ditemukan');
  return { id: document.id, prodiId: document.prodiId, label: document.judul };
};

const ensureUserCanAccessDocument = async (userId: string, documentProdiId: string, role?: Role) => {
  if (role === Role.SUPER_ADMIN || role === Role.PIMPINAN) {
    return;
  }

  const prodis = await getProdiForUser(userId);
  if (!prodis.some((prodi) => prodi.id === documentProdiId)) {
    throw new Error('Akses ditolak untuk program studi ini');
  }
};

export const createMonitoringEvaluation = async (input: CreateMonitoringInput) => {
  const document = await resolveDocument(input.documentType, input.documentId);
  const user = await prisma.user.findUnique({ where: { id: input.createdById } });
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  await ensureUserCanAccessDocument(input.createdById, document.prodiId, user.role);

  return prisma.monitoringEvaluation.create({
    data: {
      documentType: input.documentType,
      documentRefId: document.id,
      documentLabel: document.label,
        prodiId: document.prodiId,
      indicatorCode: input.indicatorCode?.trim() || null,
      indicatorName: input.indicatorName.trim(),
      note: input.note.trim(),
      evaluation: input.evaluation?.trim() || null,
      recommendation: input.recommendation?.trim() || null,
      status: input.status || MonitoringStatus.OPEN,
      reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : null,
      createdById: input.createdById,
      lkpsId: input.documentType === 'LKPS' ? document.id : null,
      ledId: input.documentType === 'LED' ? document.id : null,
      evidenId: input.documentType === 'EVIDEN' ? document.id : null,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const getMonitoringHistory = async (documentType: MonitoringDocumentType, documentId: string, userId: string) => {
  const document = await resolveDocument(documentType, documentId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  await ensureUserCanAccessDocument(userId, document.prodiId, user.role);

  return prisma.monitoringEvaluation.findMany({
    where: {
      documentType,
      documentRefId: document.id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const updateMonitoringEvaluation = async (id: string, input: UpdateMonitoringInput, userId: string) => {
  const existing = await prisma.monitoringEvaluation.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Catatan monitoring tidak ditemukan');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const document = await resolveDocument(existing.documentType, existing.documentRefId);
  await ensureUserCanAccessDocument(userId, document.prodiId, user.role);

  return prisma.monitoringEvaluation.update({
    where: { id },
    data: {
      indicatorCode: input.indicatorCode === undefined ? undefined : input.indicatorCode?.trim() || null,
      indicatorName: input.indicatorName === undefined ? undefined : input.indicatorName.trim(),
      note: input.note === undefined ? undefined : input.note.trim(),
      evaluation: input.evaluation === undefined ? undefined : input.evaluation?.trim() || null,
      recommendation: input.recommendation === undefined ? undefined : input.recommendation?.trim() || null,
      status: input.status,
      reviewedAt: input.reviewedAt === undefined ? undefined : input.reviewedAt ? new Date(input.reviewedAt) : null,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const deleteMonitoringEvaluation = async (id: string, userId: string) => {
  const existing = await prisma.monitoringEvaluation.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Catatan monitoring tidak ditemukan');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const document = await resolveDocument(existing.documentType, existing.documentRefId);
  await ensureUserCanAccessDocument(userId, document.prodiId, user.role);

  await prisma.monitoringEvaluation.delete({ where: { id } });
  return true;
};
