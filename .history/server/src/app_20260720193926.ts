import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import bookmarkRoutes from './routes/bookmarks';
import { initDatabase } from './database/sqlite';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Initialize database after app setup
initDatabase().catch(console.error);

export default app;