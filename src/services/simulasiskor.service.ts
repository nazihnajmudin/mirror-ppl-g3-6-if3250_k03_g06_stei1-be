import prisma from '../config/database.config';
import { LKPS_KRITERIA } from '../config/lkps.config';

export interface SimulationIndicator {
  code: string;
  name: string;
  quantitativeScore: number;
  qualitativeScore: number | null;
  qualitativeNote?: string | null;
  totalScore: number;
  evidenceCount: number;
  sheetCompletion: number;
}

const normalizeIndicatorText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().trim();
};

const buildIndicatorTemplate = () =>
  Object.entries(LKPS_KRITERIA).map(([criteriaCode, criteriaInfo]) => ({
    code: `C.${criteriaCode}`,
    name: criteriaInfo.name,
  }));

const calculateIndicatorQuantitative = async (prodiId: string) => {
  const latestLKPS = await prisma.documentLKPS.findFirst({
    where: { prodiId },
    orderBy: { updatedAt: 'desc' },
    include: {
      criterias: {
        include: {
          sheets: true,
        },
      },
    },
  });

  const evidenDocs = await prisma.dokumenEviden.findMany({
    where: { prodiId },
    select: {
      indikator: true,
    },
  });

  const evidenceCountByCriteria = Object.keys(LKPS_KRITERIA).reduce<Record<string, number>>((acc, code) => {
    acc[code] = 0;
    return acc;
  }, {});

  evidenDocs.forEach((doc) => {
    const indicators = Array.isArray(doc.indikator) ? doc.indikator : [];
    indicators.forEach((indicator) => {
      const normalized = normalizeIndicatorText(indicator);
      Object.entries(LKPS_KRITERIA).forEach(([criteriaCode, criteriaInfo]) => {
        const codeToken = criteriaCode.toLowerCase();
        const nameToken = criteriaInfo.name.toLowerCase();
        if (
          normalized.includes(codeToken) ||
          normalized.includes(nameToken) ||
          normalized.includes(nameToken.split(' ')[0])
        ) {
          evidenceCountByCriteria[criteriaCode] = Math.min(evidenceCountByCriteria[criteriaCode] + 1, 10);
        }
      });
    });
  });

  const criteriaCompletion: Record<string, number> = {};
  if (latestLKPS) {
    latestLKPS.criterias.forEach((criteria) => {
      const totalSheets = criteria.sheets.length || 1;
      const completedSheets = criteria.sheets.filter((sheet) => sheet.isCompleted).length;
      criteriaCompletion[criteria.criteriaCode] = criteria.isCompleted
        ? 1
        : completedSheets / totalSheets;
    });
  }

  const indicatorTemplates = buildIndicatorTemplate();

  const indicators: SimulationIndicator[] = indicatorTemplates.map((indicator) => {
    const criteriaCode = indicator.code.replace('C.', '');
    const sheetCompletion = Math.round((criteriaCompletion[criteriaCode] ?? 0) * 100);
    const evidenceCount = evidenceCountByCriteria[criteriaCode] ?? 0;
    const evidenceRatio = Math.min(evidenceCount / 3, 1);
    const quantitativeScore = Math.round((sheetCompletion / 100) * 0.7 * 100 + evidenceRatio * 0.3 * 100);
    const totalScore = quantitativeScore;

    return {
      ...indicator,
      quantitativeScore,
      qualitativeScore: null,
      qualitativeNote: null,
      totalScore,
      evidenceCount,
      sheetCompletion,
    };
  });

  const totalQuantitativeScore = indicators.length
    ? Math.round(indicators.reduce((sum, indicator) => sum + indicator.quantitativeScore, 0) / indicators.length)
    : 0;

  return {
    indicators,
    quantitativeScore: totalQuantitativeScore,
  };
};

const mergeManualQualitative = (
  autoIndicators: SimulationIndicator[],
  savedIndicators: Array<Partial<SimulationIndicator>> = []
): SimulationIndicator[] => {
  const manualMap = new Map<string, Partial<SimulationIndicator>>();
  savedIndicators.forEach((item) => {
    if (item.code) {
      manualMap.set(item.code, item);
    }
  });

  return autoIndicators.map((item) => {
    const manual = manualMap.get(item.code);
    const qualitativeScore = manual?.qualitativeScore ?? null;
    const qualitativeNote = manual?.qualitativeNote ?? null;
    const totalScore = qualitativeScore !== null
      ? Math.round(item.quantitativeScore * 0.6 + qualitativeScore * 0.4)
      : item.quantitativeScore;

    return {
      ...item,
      qualitativeScore,
      qualitativeNote,
      totalScore,
    };
  });
};

const buildSimulationSummary = (indicators: SimulationIndicator[]) => {
  const totalQuantitative = indicators.reduce((sum, item) => sum + item.quantitativeScore, 0);
  const totalQualitative = indicators.reduce((sum, item) => sum + (item.qualitativeScore ?? 0), 0);
  const countWithQualitative = indicators.filter((item) => item.qualitativeScore !== null).length;
  const totalFinal = indicators.reduce((sum, item) => sum + item.totalScore, 0);

  return {
    quantitativeScore: indicators.length ? Math.round(totalQuantitative / indicators.length) : 0,
    qualitativeScore: countWithQualitative ? Math.round(totalQualitative / countWithQualitative) : 0,
    totalScore: indicators.length ? Math.round(totalFinal / indicators.length) : 0,
  };
};

export const getSimulationByProdi = async (prodiId: string) => {
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  const autoSimulation = await calculateIndicatorQuantitative(prodiId);
  const existing = await prisma.accreditationSimulation.findUnique({ where: { prodiId } });

  const indicators = mergeManualQualitative(autoSimulation.indicators, (existing?.indicators as any) ?? []);
  const summary = buildSimulationSummary(indicators);

  const result = await prisma.accreditationSimulation.upsert({
    where: { prodiId },
    update: {
      indicators: indicators as any,
      quantitativeScore: summary.quantitativeScore,
      qualitativeScore: summary.qualitativeScore,
      totalScore: summary.totalScore,
    },
    create: {
      prodiId,
      indicators: indicators as any,
      quantitativeScore: summary.quantitativeScore,
      qualitativeScore: summary.qualitativeScore,
      totalScore: summary.totalScore,
    },
  });

  return {
    prodiId,
    indicators,
    quantitativeScore: summary.quantitativeScore,
    qualitativeScore: summary.qualitativeScore,
    totalScore: summary.totalScore,
    updatedAt: result.updatedAt.toISOString(),
  };
};

export const updateSimulationQualitative = async (
  prodiId: string,
  qualitativeScores: Array<{ code: string; qualitativeScore: number; qualitativeNote?: string | null }>
) => {
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error('Program studi tidak ditemukan');

  const autoSimulation = await calculateIndicatorQuantitative(prodiId);
  const mergedIndicators = autoSimulation.indicators.map((indicator) => {
    const manual = qualitativeScores.find((item) => item.code === indicator.code);
    const qualitativeScore = manual?.qualitativeScore ?? null;
    const qualitativeNote = manual?.qualitativeNote ?? null;
    const totalScore = qualitativeScore !== null
      ? Math.round(indicator.quantitativeScore * 0.6 + qualitativeScore * 0.4)
      : indicator.quantitativeScore;

    return {
      ...indicator,
      qualitativeScore,
      qualitativeNote,
      totalScore,
    };
  });

  const summary = buildSimulationSummary(mergedIndicators);

  const result = await prisma.accreditationSimulation.upsert({
    where: { prodiId },
    update: {
      indicators: mergedIndicators as any,
      quantitativeScore: summary.quantitativeScore,
      qualitativeScore: summary.qualitativeScore,
      totalScore: summary.totalScore,
    },
    create: {
      prodiId,
      indicators: mergedIndicators as any,
      quantitativeScore: summary.quantitativeScore,
      qualitativeScore: summary.qualitativeScore,
      totalScore: summary.totalScore,
    },
  });

  return {
    prodiId,
    indicators: mergedIndicators,
    quantitativeScore: summary.quantitativeScore,
    qualitativeScore: summary.qualitativeScore,
    totalScore: summary.totalScore,
    updatedAt: result.updatedAt.toISOString(),
  };
};
