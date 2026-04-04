import multer from 'multer';

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