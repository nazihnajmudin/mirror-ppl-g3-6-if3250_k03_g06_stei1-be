import JSZip from 'jszip';

interface LEDFormExportInput {
  template: string;
  content: Record<string, string>;
  prodiName: string;
  periode: string;
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

const inlineToRuns = (html: string): string => {
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

const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const getAlignment = (attrs: string): string => {
  const m = attrs.match(/text-align\s*:\s*(center|right|left|justify)/i);
  if (!m) return '';
  const val = m[1].toLowerCase() === 'justify' ? 'both' : m[1].toLowerCase();
  return `<w:jc w:val="${val}"/>`;
};

const makePara = (innerHtml: string, attrs = ''): string => {
  const runs = inlineToRuns(innerHtml);
  const jc = getAlignment(attrs);
  return `<w:p><w:pPr>${jc}<w:spacing w:after="120"/></w:pPr>${runs}</w:p>`;
};

const makeHeading = (innerHtml: string, level: number): string => {
  const sizes: Record<number, string> = { 1: '40', 2: '32', 3: '26', 4: '24' };
  const sz = sizes[level] ?? '24';
  const text = xmlEsc(decodeEntities(innerHtml.replace(/<[^>]+>/g, '')));
  return `<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
};

const makeTable = (tableHtml: string): string => {
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

const htmlToDocxXml = (html: string): string => {
  if (!html) return '<w:p/>';
  let result = '';

  const segments = html.split(/(<table[\s\S]*?<\/table>)/gi);

  for (const seg of segments) {
    if (/^<table/i.test(seg.trim())) {
      result += makeTable(seg);
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
        result += makeHeading(inner, parseInt(tag[1]));
      } else {
        const attrs = match[2] ?? '';
        if (inner.trim() || inner.includes('&nbsp;')) {
          result += makePara(inner, attrs);
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

export const generateLEDFormDocxBuffer = async (input: LEDFormExportInput): Promise<Buffer> => {
  const { template, content, prodiName, periode } = input;

  let bodyXml = '';
  
  const sectionOrder = template === 'INFOKOM' ? LAM_INFOKOM_SECTION_ORDER : LAM_TEKNIK_SECTION_ORDER;

  const orderedKeys: string[] = [...sectionOrder];
  for (const key of Object.keys(content)) {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }

  let prevPrefix = '';
  let firstSection = true;

  for (const key of orderedKeys) {
    const html = content[key] ?? (key === 'halaman_muka' ? DEFAULT_HALAMAN_MUKA : '');

    const strippedText = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    if (!strippedText && key !== 'halaman_muka') continue;

    const prefix = getSectionPrefix(key);
    if (!firstSection && prefix !== prevPrefix) {
      bodyXml += PAGE_BREAK;
    }

    bodyXml += htmlToDocxXml(html);
    prevPrefix = prefix;
    firstSection = false;
  }

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', getContentTypesXml());
  zip.folder('_rels')!.file('.rels', getRelsXml());
  zip.folder('word')!.file('document.xml', docXml);
  zip.folder('word/_rels')!.file('document.xml.rels', getDocumentRelsXml());

  return zip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
};

const getContentTypesXml = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const getRelsXml = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const getDocumentRelsXml = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

export const buildLEDFormFilename = (
  prodiName: string,
  versionNumber: number,
  periode: string
): string => {
  const sanitized = prodiName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  return `LED_${sanitized}_v${versionNumber}_${periode}.docx`;
};
