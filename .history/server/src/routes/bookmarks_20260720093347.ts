import { Router } from 'express';
import { db } from '../database/sqlite';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all bookmarks
router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const bookmarks = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY sort_order, id').all(req.userId!);
  res.json(bookmarks);
});

// Create bookmark
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { name, url, category, sort_order, is_favorite } = req.body;
  
  if (!name || !url) {
    return res.status(400).json({ message: 'Name and URL are required' });
  }
  
  const favicon_url = `https://www.google.com/s2/favicons?domain=news.qq.com`;
  const stmt = db.prepare('INSERT INTO bookmarks (user_id, name, url, favicon_url, category, sort_order, is_favorite) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(req.userId!, name, url, favicon_url, category || 'default', sort_order || 0, is_favorite ? 1 : 0);
  
  const bookmark = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bookmark);
});

// Update bookmark
router.put('/:id', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, url, category, sort_order, is_favorite } = req.body;
  
  const existing = db.prepare('SELECT * FROM bookmarks WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Bookmark not found' });
  }
  
  db.prepare(`
    UPDATE bookmarks 
    SET name = COALESCE(?, name), url = COALESCE(?, url), category = COALESCE(?, category), sort_order = COALESCE(?, sort_order), is_favorite = COALESCE(?, is_favorite)
    WHERE id = ? AND user_id = ?
  `).run(name, url, category, sort_order, is_favorite ? 1 : 0, id, req.userId);
  
  const bookmark = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id);
  res.json(bookmark);
});

// Delete bookmark
router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?').run(id, req.userId);
  
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Bookmark not found' });
  }
  
  res.json({ message: 'Deleted' });
});

// Search bookmarks
router.get('/search', authMiddleware, (req: AuthRequest, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }
  const bookmarks = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? AND name LIKE ? ORDER BY sort_order, id').all(req.userId!, `%${q}%`);
  res.json(bookmarks);
});

export default router;