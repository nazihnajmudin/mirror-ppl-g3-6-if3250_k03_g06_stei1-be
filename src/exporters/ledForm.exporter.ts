import JSZip from 'jszip';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import sizeOf from 'image-size';

interface LEDFormExportInput {
  template: string;
  content: Record<string, string>;
  prodiName: string;
  periode: string;
}

interface DocxRel {
  id: string;
  type: string;
  target: string;
  targetMode?: string;
}

interface ImageEntry {
  rId: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
}

const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const xmlEsc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

import { IncomingMessage } from 'http';

const fetchBuffer = (url: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res: IncomingMessage) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });

const extToContentType: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};


const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const getAlignment = (attrs: string): string => {
  const m = attrs.match(/text-align\s*:\s*(center|right|left|justify)/i);
  if (!m) return '';
  const val = m[1].toLowerCase() === 'justify' ? 'both' : m[1].toLowerCase();
  return `<w:jc w:val="${val}"/>`;
};

const inlineToRuns = (html: string, rels: DocxRel[]): string => {
  let result = '';
  let remaining = html;

  while (remaining.length > 0) {
    const aMatch = remaining.match(/^([\s\S]*?)<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>([\s\S]*)$/i);
    if (aMatch) {
      const before = aMatch[1];
      const href = aMatch[2];
      const inner = aMatch[3];
      remaining = aMatch[4];

      if (before) result += plainInlineRuns(before);

      const rId = `rIdLink${rels.length + 1}`;
      rels.push({ id: rId, type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', target: href, targetMode: 'External' });
      const linkText = xmlEsc(decodeEntities(inner.replace(/<[^>]+>/g, '')));
      result += `<w:hyperlink r:id="${rId}"><w:r><w:rPr><w:color w:val="2563EB"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${linkText}</w:t></w:r></w:hyperlink>`;
    } else {
      result += plainInlineRuns(remaining);
      break;
    }
  }
  return result;
};

const plainInlineRuns = (html: string): string => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(strong|b)>/gi, '\x02')
    .replace(/<\/?(em|i)>/gi, '\x03')
    .replace(/<[^>]+>/g, '');

  const text = decodeEntities(normalized);
  let bold = false;
  let italic = false;
  let result = '';

  for (const part of text.split(/(\x02|\x03)/)) {
    if (part === '\x02') { bold = !bold; }
    else if (part === '\x03') { italic = !italic; }
    else if (part) {
      const escaped = xmlEsc(part);
      const rPr = [bold ? '<w:b/>' : '', italic ? '<w:i/>' : ''].join('');
      result += `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${escaped}</w:t></w:r>`;
    }
  }
  return result;
};

const makePara = (innerHtml: string, attrs = '', rels: DocxRel[]): string => {
  const runs = inlineToRuns(innerHtml, rels);
  const jc = getAlignment(attrs);
  return `<w:p><w:pPr>${jc}<w:spacing w:after="120"/></w:pPr>${runs}</w:p>`;
};

const makeHeading = (innerHtml: string, level: number, rels: DocxRel[]): string => {
  const sizes: Record<number, string> = { 1: '40', 2: '32', 3: '26', 4: '24' };
  const sz = sizes[level] ?? '24';
  const runs = inlineToRuns(innerHtml, rels);
  const wrappedRuns = runs.replace(/<w:r>/g, `<w:r><w:rPr><w:b/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`);
  return `<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>${wrappedRuns}</w:p>`;
};

const makeTable = (tableHtml: string, rels: DocxRel[]): string => {
  let rows = '';
  for (const rowMatch of tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    let cells = '';
    for (const cellMatch of rowMatch[1].matchAll(/<(td|th)([^>]*?)>([\s\S]*?)<\/\1>/gi)) {
      const isHeader = cellMatch[1].toLowerCase() === 'th';
      const cellText = xmlEsc(decodeEntities(cellMatch[3].replace(/<[^>]+>/g, '').trim()));
      const rPr = isHeader ? '<w:rPr><w:b/></w:rPr>' : '';
      const para = `<w:p><w:r>${rPr}<w:t xml:space="preserve">${cellText}</w:t></w:r></w:p>`;
      cells += `<w:tc><w:tcPr><w:tcW w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/></w:tcBorders></w:tcPr>${para}</w:tc>`;
    }
    if (cells) rows += `<w:tr>${cells}</w:tr>`;
  }
  if (!rows) return '';
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`;
};

const makeImageXml = (rId: string, widthEmu: number, heightEmu: number): string =>
  `<w:p><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="1" name="Image"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="Image"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

const htmlToDocxXml = async (
  html: string,
  rels: DocxRel[],
  images: ImageEntry[],
): Promise<string> => {
  if (!html) return '<w:p/>';
  let result = '';

  const segments = html.split(/(<table[\s\S]*?<\/table>|<img[^>]+>)/gi);

  for (const seg of segments) {
    if (/^<table/i.test(seg.trim())) {
      result += makeTable(seg, rels);
      continue;
    }

    if (/^<img/i.test(seg.trim())) {
      const srcMatch = seg.match(/src="([^"]+)"/i);
      if (srcMatch) {
        const src = srcMatch[1];
        try {
          let imgBuffer: Buffer;
          let ext = path.extname(src.split('?')[0]).toLowerCase();
          if (!ext || !extToContentType[ext]) ext = '.jpg';
          const contentType = extToContentType[ext] ?? 'image/jpeg';

          const uploadsBase = path.join(process.cwd(), 'uploads');

          if (src.includes('/uploads/')) {
            const relativeToUploads = src.replace(/^.*\/uploads\//, '');
            imgBuffer = await fs.promises.readFile(path.join(uploadsBase, relativeToUploads));
          } else if (src.startsWith('http://') || src.startsWith('https://')) {
            imgBuffer = await fetchBuffer(src);
          } else {
            imgBuffer = await fs.promises.readFile(path.join(uploadsBase, src.replace(/^\//, '')));
          }

          const rId = `rIdImg${images.length + 1}`;
          const filename = `image${images.length + 1}${ext}`;
          images.push({ rId, filename, contentType, buffer: imgBuffer });
          rels.push({ id: rId, type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', target: `media/${filename}` });

          let widthEmu = 5400000;
          let heightEmu = 3600000;

          try {
            const dimensions = sizeOf(imgBuffer);
            if (dimensions && dimensions.width && dimensions.height) {
              widthEmu = dimensions.width * 9525;
              heightEmu = dimensions.height * 9525;
            }
          } catch (e) {
          }

          const widthMatch = seg.match(/width="([^"]+)"/i) || seg.match(/width:\s*(\d+)px/i);
          const heightMatch = seg.match(/height="([^"]+)"/i) || seg.match(/height:\s*(\d+)px/i);

          let userWidth = 0;
          let userHeight = 0;

          if (widthMatch) {
            const w = parseInt(widthMatch[1]);
            if (!isNaN(w)) userWidth = w * 9525;
          }
          if (heightMatch) {
            const h = parseInt(heightMatch[1]);
            if (!isNaN(h)) userHeight = h * 9525;
          }

          if (userWidth > 0 && userHeight > 0) {
            widthEmu = userWidth;
            heightEmu = userHeight;
          } else if (userWidth > 0) {
            const ratio = heightEmu / widthEmu;
            widthEmu = userWidth;
            heightEmu = Math.round(userWidth * ratio);
          } else if (userHeight > 0) {
            const ratio = widthEmu / heightEmu;
            heightEmu = userHeight;
            widthEmu = Math.round(userHeight * ratio);
          }

          result += makeImageXml(rId, Math.round(widthEmu), Math.round(heightEmu));
        } catch {
          result += '<w:p><w:r><w:t>[Gambar tidak dapat dimuat]</w:t></w:r></w:p>';
        }
      }
      continue;
    }

    const blockRe = /<(h[1-6]|p)([^>]*)>([\s\S]*?)<\/\1>|<br\s*\/?>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRe.exec(seg)) !== null) {
      const tag = match[1]?.toLowerCase() ?? '';
      const inner = match[3] ?? '';

      if (!tag) {
        result += '<w:p/>';
      } else if (/^h[1-6]$/.test(tag)) {
        result += makeHeading(inner, parseInt(tag[1]), rels);
      } else {
        const attrs = match[2] ?? '';
        if (inner.trim() || inner.includes('&nbsp;')) {
          result += makePara(inner, attrs, rels);
        } else {
          result += '<w:p/>';
        }
      }
      lastIndex = match.index + match[0].length;
    }

    const trailing = seg.slice(lastIndex).replace(/<[^>]+>/g, '').trim();
    if (trailing) {
      result += `<w:p><w:r><w:t xml:space="preserve">${xmlEsc(decodeEntities(trailing))}</w:t></w:r></w:p>`;
    }
  }

  return result || '<w:p/>';
};

const getSectionPrefix = (key: string): string => {
  const m = key.match(/^(c\d+)_/);
  return m ? m[1] : key;
};

const LAM_TEKNIK_SECTION_ORDER = [
  'halaman_muka', 'identitas_pengusul', 'identitas_tim', 'kata_pengantar', 'ringkasan_eksekutif',
  'bab1', 'bab2a', 'bab2b',
  'c1_latar_belakang','c1_kebijakan','c1_iku','c1_analisis','c1_strategi',
  'c2_latar_belakang','c2_kebijakan','c2_iku','c2_analisis','c2_strategi',
  'c3_latar_belakang','c3_kebijakan','c3_iku','c3_analisis','c3_strategi',
  'c4_latar_belakang','c4_kebijakan','c4_iku','c4_analisis','c4_strategi',
  'c5_latar_belakang','c5_kebijakan','c5_iku','c5_analisis','c5_strategi',
  'c6_latar_belakang','c6_kebijakan','c6_iku','c6_analisis','c6_strategi',
  'c7_latar_belakang','c7_kebijakan','c7_iku','c7_analisis','c7_strategi',
  'bab3', 'bab4', 'lampiran',
];

const LAM_INFOKOM_SECTION_ORDER = [
  'halaman_muka', 'identitas_pengusul', 'identitas_tim', 'kata_pengantar', 'ringkasan_eksekutif',
  'bab1',
  'c1_penetapan','c1_pelaksanaan','c1_evaluasi','c1_pengendalian','c1_peningkatan',
  'c2_penetapan','c2_pelaksanaan','c2_evaluasi','c2_pengendalian','c2_peningkatan',
  'c3_penetapan','c3_pelaksanaan','c3_evaluasi','c3_pengendalian','c3_peningkatan',
  'c4_penetapan','c4_pelaksanaan','c4_evaluasi','c4_pengendalian','c4_peningkatan',
  'c5_penetapan','c5_pelaksanaan','c5_evaluasi','c5_pengendalian','c5_peningkatan',
  'c6_penetapan','c6_pelaksanaan','c6_evaluasi','c6_pengendalian','c6_peningkatan',
  'bab3', 'bab4', 'lampiran',
];

const DEFAULT_HALAMAN_MUKA = `<p style="text-align:center"><strong>HALAMAN MUKA</strong></p>
<p>&nbsp;</p><p style="text-align:center">[ Logo Perguruan Tinggi ]</p><p>&nbsp;</p>
<p style="text-align:center"><strong>LAPORAN EVALUASI DIRI PROGRAM STUDI</strong></p>
<p style="text-align:center"><strong>AKREDITASI PROGRAM STUDI</strong></p><p>&nbsp;</p>
<p style="text-align:center"><em><strong>PROGRAM DAN NAMA PROGRAM STUDI</strong></em></p><p>&nbsp;</p>
<p style="text-align:center"><strong>UNIVERSITAS/ INSTITUT/ SEKOLAH TINGGI/ POLITEKNIK/ AKADEMI/ AKADEMI KOMUNITAS</strong></p>
<p>&nbsp;</p><p style="text-align:center">..................................................</p><p>&nbsp;</p>
<p style="text-align:center"><strong>NAMA KOTA KEDUDUKAN PERGURUAN TINGGI</strong></p>
<p style="text-align:center"><strong>TAHUN ..............</strong></p><p>&nbsp;</p>
<p><em>Catatan: Kelengkapan isian setiap kriteria mengacu pada Pedoman Penyusunan Laporan Evaluasi Diri Program Studi</em></p>`;

const LAM_TEKNIK_CRITERIA_LABEL: Record<string, string> = {
  c1: 'C.1 Diferensiasi Misi (Visi, Misi, Tujuan, dan Strategi)',
  c2: 'C.2 Akuntabilitas (Tata Pamong, Tata Kelola, dan Kerja Sama)',
  c3: 'C.3 Relevansi (Pendidikan, Penelitian, dan PkM)',
  c4: 'C.4 Sumber Daya Manusia',
  c5: 'C.5 Sarana, Prasarana, dan K3L',
  c6: 'C.6 Mahasiswa dan Luaran Mahasiswa',
  c7: 'C.7 Sistem Penjaminan Mutu',
};

const LAM_INFOKOM_CRITERIA_LABEL: Record<string, string> = {
  c1: 'C.1 Budaya Mutu',
  c2: 'C.2 Relevansi Pendidikan',
  c3: 'C.3 Relevansi Penelitian',
  c4: 'C.4 Relevansi PkM',
  c5: 'C.5 Akuntabilitas',
  c6: 'C.6 Diferensiasi Misi',
};

const makeCriteriaGroupHeading = (label: string): string =>
  `<w:p><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr><w:t xml:space="preserve">${xmlEsc(label)}</w:t></w:r></w:p>`;

const makeSectionGroupHeading = (): string =>
  `<w:p><w:pPr><w:spacing w:before="480" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr><w:t>C. Kriteria Akreditasi</w:t></w:r></w:p>`;

export const generateLEDFormDocxBuffer = async (input: LEDFormExportInput): Promise<Buffer> => {
  const { template, content, prodiName, periode } = input;

  const rels: DocxRel[] = [];
  const images: ImageEntry[] = [];

  let bodyXml = '';

  const sectionOrder = template === 'INFOKOM' ? LAM_INFOKOM_SECTION_ORDER : LAM_TEKNIK_SECTION_ORDER;
  const criteriaLabels = template === 'INFOKOM' ? LAM_INFOKOM_CRITERIA_LABEL : LAM_TEKNIK_CRITERIA_LABEL;

  const orderedKeys: string[] = [...sectionOrder];
  for (const key of Object.keys(content)) {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }

  let prevPrefix = '';
  let firstSection = true;
  let criteriaGroupHeaderEmitted = false;
  let prevCriteriaId = '';

  for (const key of orderedKeys) {
    const html = content[key] ?? (key === 'halaman_muka' ? DEFAULT_HALAMAN_MUKA : '');

    const strippedText = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/\s+/g, '')
      .trim();
    if (!strippedText && key !== 'halaman_muka') continue;

    const prefix = getSectionPrefix(key);
    const isCriteria = /^c\d+$/.test(prefix);

    if (!firstSection && prefix !== prevPrefix) {
      bodyXml += PAGE_BREAK;

      if (isCriteria) {
        if (!criteriaGroupHeaderEmitted) {
          bodyXml += makeSectionGroupHeading();
          criteriaGroupHeaderEmitted = true;
        }
        if (prefix !== prevCriteriaId) {
          const criteriaLabel = criteriaLabels[prefix];
          if (criteriaLabel) {
            bodyXml += makeCriteriaGroupHeading(criteriaLabel);
          }
          prevCriteriaId = prefix;
        }
      }
    } else if (firstSection && isCriteria) {
      criteriaGroupHeaderEmitted = true;
      bodyXml += makeSectionGroupHeading();
      const criteriaLabel = criteriaLabels[prefix];
      if (criteriaLabel) {
        bodyXml += makeCriteriaGroupHeading(criteriaLabel);
      }
      prevCriteriaId = prefix;
    } else if (isCriteria && prefix !== prevCriteriaId) {
      const criteriaLabel = criteriaLabels[prefix];
      if (criteriaLabel) {
        bodyXml += makeCriteriaGroupHeading(criteriaLabel);
      }
      prevCriteriaId = prefix;
    }

    bodyXml += await htmlToDocxXml(html, rels, images);
    prevPrefix = prefix;
    firstSection = false;
  }

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const relEntries = rels
    .map((r) =>
      r.targetMode
        ? `<Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}" TargetMode="${r.targetMode}"/>`
        : `<Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}"/>`,
    )
    .join('\n');

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${relEntries}
</Relationships>`;

  const hasImages = images.length > 0;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImages ? '<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Default Extension="gif" ContentType="image/gif"/><Default Extension="webp" ContentType="image/webp"/>' : ''}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.folder('_rels')!.file('.rels', getRelsXml());
  zip.folder('word')!.file('document.xml', docXml);
  zip.folder('word/_rels')!.file('document.xml.rels', docRelsXml);

  if (hasImages) {
    const mediaFolder = zip.folder('word/media')!;
    for (const img of images) {
      mediaFolder.file(img.filename, img.buffer);
    }
  }

  return zip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
};

const getRelsXml = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

export const buildLEDFormFilename = (
  prodiName: string,
  versionNumber: number,
  periode: string,
): string => {
  const sanitized = prodiName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  return `LED_${sanitized}_v${versionNumber}_${periode}.docx`;
};
