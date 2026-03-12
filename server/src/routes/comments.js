const express = require('express');
const router = express.Router();
const db = require('../../models/db');

// 获取菜谱的评论列表
router.get('/recipes/:id/comments', (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // 检查菜谱是否存在
    const checkStmt = db.prepare('SELECT id FROM recipes WHERE id = ?');
    const recipe = checkStmt.get(recipeId);
    if (!recipe) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    // 获取评论列表
    const stmt = db.prepare(`
      SELECT * FROM recipe_comments 
      WHERE recipe_id = ?
      ORDER BY created_at DESC
    `);
    const comments = stmt.all(recipeId);
    
    // 计算平均评分
    let avgRating = 0;
    if (comments.length > 0) {
      const totalRating = comments.reduce((sum, c) => sum + c.rating, 0);
      avgRating = (totalRating / comments.length).toFixed(1);
    }
    
    res.json({ 
      code: 200, 
      data: {
        comments,
        total: comments.length,
        avgRating: parseFloat(avgRating)
      }
    });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 添加评论
router.post('/recipes/:id/comments', (req, res) => {
  try {
    const recipeId = req.params.id;
    const { rating, comment, user_id } = req.body;
    const userId = user_id || 'default_user';
    
    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
      return res.json({ code: 400, message: '评分必须在1-5之间' });
    }
    
    // 检查菜谱是否存在
    const checkStmt = db.prepare('SELECT id FROM recipes WHERE id = ?');
    const recipe = checkStmt.get(recipeId);
    if (!recipe) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    // 添加评论
    const now = Date.now();
    const id = `comment_${now}`;
    const insertStmt = db.prepare(`
      INSERT INTO recipe_comments (id, recipe_id, rating, comment, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, recipeId, rating, comment || '', userId, now);
    
    res.json({ 
      code: 200, 
      message: '评论添加成功',
      data: {
        id,
        recipe_id: recipeId,
        rating,
        comment: comment || '',
        user_id: userId,
        created_at: now
      }
    });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 删除评论
router.delete('/comments/:id', (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.query.user_id || 'default_user';
    
    const stmt = db.prepare('DELETE FROM recipe_comments WHERE id = ? AND user_id = ?');
    const result = stmt.run(commentId, userId);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '评论不存在或无权限删除' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

module.exports = router;
