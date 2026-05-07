import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();
const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

// Filter khusus untuk LED (.doc, .docx)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/msword',                                                       // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak valid. Hanya menerima file Word (.doc atau .docx)'));
    }
};

export const uploadLEDMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 }, 
});


// Filter Khusus LKPS (RAM only)

const excelFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel'                                           // .xls
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak valid. Hanya menerima file Excel (.xlsx atau .xls)'));
    }
};

export const uploadLKPSMiddleware = multer({
    storage: multer.memoryStorage(), // Memory Storage untuk parsing Exceljs
    fileFilter: excelFileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 }, 
});


// Filter Khusus Template (Word & Excel)
const templateFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak valid. Hanya menerima Word (.docx) atau Excel (.xlsx)'));
    }
};

export const uploadTemplateMiddleware = multer({
    storage: multer.memoryStorage(),
    fileFilter: templateFileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 }, 
});

// Filter Khusus Eviden (Menerima PDF, Office, Gambar, Audio, Video, ZIP)
const evidenFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/x-msdownload' || file.mimetype.includes('exe')) {
        cb(new Error('Format file berbahaya tidak diizinkan.'));
    } else {
        cb(null, true);
    }
};

const evidenMaxFileSizeMB = 50; 

export const uploadEvidenMiddleware = multer({
    storage: multer.memoryStorage(),
    fileFilter: evidenFileFilter,
    limits: { fileSize: evidenMaxFileSizeMB * 1024 * 1024 },
});

const certificateFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak valid. Hanya menerima PDF, JPEG, atau PNG'));
    }
};

export const uploadCertificateMiddleware = multer({
    storage: multer.memoryStorage(),
    fileFilter: certificateFileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
});

const ledImageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak valid. Hanya menerima gambar (JPEG, PNG, WebP, GIF)'));
    }
};

const ledImageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'led');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `LED-IMG-${uniqueSuffix}${ext}`);
    },
});

export const uploadLEDImageMiddleware = multer({
    storage: ledImageStorage,
    fileFilter: ledImageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});