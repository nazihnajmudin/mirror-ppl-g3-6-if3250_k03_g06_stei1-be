import JSZip from 'jszip';

interface LEDFormExportInput {
  template: string;
  content: Record<string, string>;
  prodiName: string;
  periode: string;
}

/**
 * @param input 
 * @returns Promise<Buffer>
 */
export const generateLEDFormDocxBuffer = async (input: LEDFormExportInput): Promise<Buffer> => {
  const { content, prodiName, periode } = input;

  let docContent = `Dokumen LED - ${prodiName}\n`;
  docContent += `Periode: ${periode}\n\n`;

  Object.entries(content).forEach(([key, value]) => {
    docContent += `${key}\n`;
    const plainText = htmlToPlainText(value);
    docContent += `${plainText || '(kosong)'}\n\n`;
  });

  const xmlContent = createWordXml(docContent);

  const zip = new JSZip();
  
  zip.file('[Content_Types].xml', getContentTypesXml());
  
  zip.folder('_rels')!.file('.rels', getRelsXml());
  
  zip.folder('word')!.file('document.xml', xmlContent);
  
  zip.folder('word/_rels')!.file('document.xml.rels', getDocumentRelsXml());

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return buffer as Buffer;
};

/**
 * @param html 
 * @returns 
 */
const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return text;
};

const createWordXml = (content: string): string => {
  const escapedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map((line) => `<w:p><w:r><w:t>${line || ' '}</w:t></w:r></w:p>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${escapedContent}
  </w:body>
</w:document>`;
};

/**
 * Membuat [Content_Types].xml
 */
const getContentTypesXml = (): string => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
};

const getRelsXml = (): string => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
};

const getDocumentRelsXml = (): string => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
};

/**
 * @param prodiName 
 * @param versionNumber 
 * @param periode 
 * @returns 
 */
export const buildLEDFormFilename = (
  prodiName: string,
  versionNumber: number,
  periode: string
): string => {
  const sanitizedProdiName = prodiName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  return `LED_${sanitizedProdiName}v${versionNumber}_${periode}.docx`;
};
