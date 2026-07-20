import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/sqlite';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'navmacbook_secret_key';

router.post('/register', async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email || null]);
    const token = jwt.sign({ id: (result as any).lastID }, JWT_SECRET, { expiresIn: '7d' });
    const user = await db.get('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?', [(result as any).lastID]);
    res.status(201).json({ token, user });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Username already exists' });
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await db.get('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?', [req.userId!]);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;