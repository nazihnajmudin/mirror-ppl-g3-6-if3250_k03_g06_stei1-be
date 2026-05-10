import cron from 'node-cron';
import { generateEarlyWarnings } from '../services/notification.service';

export const initCronJobs = () => {
  // Run daily at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Menjalankan pengecekan early warning harian...');
    try {
      await generateEarlyWarnings();
    } catch (error) {
      console.error('[Cron] Error saat pengecekan early warning:', error);
    }
  });

  // Untuk keperluan development, jalankan sekali saat startup
  if (process.env.NODE_ENV === 'development') {
    console.log('[Cron] Menjalankan pengecekan early warning saat startup (Dev Mode)...');
    generateEarlyWarnings().catch(err => console.error('[Cron] Error startup check:', err));
  }

  console.log('[Cron] Cron jobs berhasil diinisialisasi');
};
