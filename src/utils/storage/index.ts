import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.provider';

const storageType = process.env.STORAGE_TYPE || 'local';

let storageProvider: IStorageProvider;

if (storageType === 'local') {
    storageProvider = new LocalStorageProvider();
} else {
    // TODO: Implementasi Cloud Storage
    // storageProvider = new CloudStorageProvider();

    // Fallback sementara ke lokal
    console.warn("Cloudinary provider belum diimplementasi, fallback ke Local Storage.");
    storageProvider = new LocalStorageProvider(); 
}

export { storageProvider };