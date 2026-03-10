import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 8000;


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

export default app;
