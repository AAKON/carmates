import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const PORT = env.PORT ?? 5000;

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

void start();

