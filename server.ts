import dotenv from 'dotenv';
dotenv.config();

import app from './src/app';
import { initializeDynamoDB } from './src/config/initDb';

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize DynamoDB tables on startup
    await initializeDynamoDB();

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
