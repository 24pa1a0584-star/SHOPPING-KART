import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { bootstrapAdmin } from './bootstrap/adminBootstrap';

const startServer = async () => {
  try {
    await connectDB();
    await bootstrapAdmin();

    const PORT = parseInt(env.PORT, 10) || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
  ══════════════════════════════════════════════════════════════════
  🚀  LUMORA E-Commerce Engine Running Successfully!
  📍  Environment : ${env.NODE_ENV.toUpperCase()}
  🌐  Server URL  : http://localhost:${PORT}
  📡  API Health  : http://localhost:${PORT}/api/health
  🏬  Storefront  : ${env.NODE_ENV === 'production' ? `http://localhost:${PORT}` : env.CLIENT_URL}
  ══════════════════════════════════════════════════════════════════
      `);
    });

    const shutdown = async () => {
      console.log('🛑 Gracefully shutting down LUMORA server...');
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
