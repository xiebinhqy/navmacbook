import { Router, Request, Response } from 'express';
import { db } from '../database/sqlite';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const bookmarks = await db.all('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY sort_order, id', [req.userId!]);
  res.json(bookmarks);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, url, category, sort_order, is_favorite } = req.body;
  if (!name || !url) return res.status(400).json({ message: 'Name and URL are required' });
  const favicon_url = 'https://www.google.com/s2/favicons?domain=news.qq.com';
  const result = await db.run(
    'INSERT INTO bookmarks (user_id, name, url, favicon_url, category, sort_order, is_favorite) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.userId!, name, url, favicon_url, category || 'default', sort_order || 0, is_favorite ? 1 : 0]
  );
  const bookmark = await db.get('SELECT * FROM bookmarks WHERE id = ?', [(result as any).lastID]);
  res.status(201).json(bookmark);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, url, category, sort_order, is_favorite } = req.body;
  const existing = await db.get('SELECT * FROM bookmarks WHERE id = ? AND user_id = ?', [id, req.userId]);
  if (!existing) return res.status(404).json({ message: 'Bookmark not found' });
  await db.run('UPDATE bookmarks SET name = COALESCE(?, name), url = COALESCE(?, url), category = COALESCE(?, category), sort_order = COALESCE(?, sort_order), is_favorite = COALESCE(?, is_favorite) WHERE id = ? AND user_id = ?', [name, url, category, sort_order, is_favorite ? 1 : 0, id, req.userId]);
  const bookmark = await db.get('SELECT * FROM bookmarks WHERE id = ?', [id]);
  res.json(bookmark);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await db.run('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, req.userId]);
  if ((result as any).changes === 0) return res.status(404).json({ message: 'Bookmark not found' });
  res.json({ message: 'Deleted' });
});

router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const bookmarks = await db.all('SELECT * FROM bookmarks WHERE user_id = ? AND name LIKE ? ORDER BY sort_order, id', [req.userId!, `%${q}%`]);
  res.json(bookmarks);
});

export default router;