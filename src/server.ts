import app from './app';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
