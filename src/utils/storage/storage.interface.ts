export interface IStorageProvider {
    /**
     * Mengunggah file dan mengembalikan path/key unik penyimpanannya
     * @param file 
     * @param folder 
     */
    upload(file: Express.Multer.File, folder: string): Promise<string>;

    /**
     * Mengambil path absolut atau URL file untuk keperluan download
     * @param fileName 
     * @param folder 
     */
    getFilePath(fileName: string, folder: string): string;
}