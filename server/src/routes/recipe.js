const express = require('express');
const router = express.Router();
const db = require('../../models/db');

// 转换 JSON 字段的辅助函数
const parseRecipe = (r) => ({
  ...r,
  tags: r.tags ? JSON.parse(r.tags) : [],
  ingredients: r.ingredients ? JSON.parse(r.ingredients) : [],
  steps: r.steps ? JSON.parse(r.steps) : [],
});

// ===== 搜索和分类 API（放在 /recipes 前面） =====

// 搜索菜谱（按菜名、食材）
router.get('/recipes/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ code: 400, message: '搜索关键词不能为空' });
    }
    
    const keyword = `%${q.trim()}%`;
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE name LIKE ? OR ingredients LIKE ?
      ORDER BY created_at DESC
    `);
    const recipes = stmt.all(keyword, keyword);
    const result = recipes.map(parseRecipe);
    res.json({ code: 200, data: result, total: result.length });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 获取分类列表
router.get('/categories', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC');
    const categories = stmt.all();
    res.json({ code: 200, data: categories });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// ===== 菜谱 CRUD API =====

// 获取所有菜谱（支持分类筛选）
router.get('/recipes', (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM recipes';
    const params = [];
    
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(sql);
    const recipes = params.length > 0 ? stmt.all(...params) : stmt.all();
    const result = recipes.map(parseRecipe);
    res.json({ code: 200, data: result });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 获取单个菜谱
router.get('/recipes/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
    const recipe = stmt.get(req.params.id);
    if (!recipe) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    // 检查是否已收藏
    const favStmt = db.prepare('SELECT id FROM favorites WHERE recipe_id = ? AND user_id = ?');
    const fav = favStmt.get(req.params.id, 'default_user');
    
    res.json({
      code: 200,
      data: {
        ...parseRecipe(recipe),
        isFavorited: !!fav,
      }
    });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 收藏菜谱
router.post('/recipes/:id/favorite', (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.body.user_id || 'default_user';
    
    // 检查菜谱是否存在
    const checkStmt = db.prepare('SELECT id FROM recipes WHERE id = ?');
    const recipe = checkStmt.get(recipeId);
    if (!recipe) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    // 检查是否已收藏
    const checkFav = db.prepare('SELECT id FROM favorites WHERE recipe_id = ? AND user_id = ?');
    const existing = checkFav.get(recipeId, userId);
    
    if (existing) {
      return res.json({ code: 200, message: '已收藏', data: { isFavorited: true } });
    }
    
    // 添加收藏
    const now = Date.now();
    const insertStmt = db.prepare(`
      INSERT INTO favorites (id, recipe_id, user_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(`fav_${now}`, recipeId, userId, now);
    
    res.json({ code: 200, message: '收藏成功', data: { isFavorited: true } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 取消收藏
router.delete('/recipes/:id/favorite', (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.query.user_id || 'default_user';
    
    const stmt = db.prepare('DELETE FROM favorites WHERE recipe_id = ? AND user_id = ?');
    const result = stmt.run(recipeId, userId);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '收藏记录不存在' });
    }
    
    res.json({ code: 200, message: '取消收藏成功', data: { isFavorited: false } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 获取用户收藏列表
router.get('/favorites', (req, res) => {
  try {
    const userId = req.query.user_id || 'default_user';
    const stmt = db.prepare(`
      SELECT r.*, f.created_at as favorited_at
      FROM favorites f
      JOIN recipes r ON f.recipe_id = r.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `);
    const recipes = stmt.all(userId);
    const result = recipes.map(r => {
      const { favorited_at, ...rest } = r;
      return {
        ...parseRecipe(rest),
        favorited_at
      };
    });
    res.json({ code: 200, data: result });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 创建菜谱
router.post('/recipes', (req, res) => {
  try {
    const { id, name, coverImage, servings, category, tags, ingredients, steps } = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO recipes (id, name, cover_image, servings, category, tags, ingredients, steps, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id || `recipe_${now}`,
      name,
      coverImage || '',
      servings || 2,
      category || '其他',
      JSON.stringify(tags || []),
      JSON.stringify(ingredients || []),
      JSON.stringify(steps || []),
      now,
      now
    );
    res.json({ code: 200, message: '创建成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 更新菜谱
router.put('/recipes/:id', (req, res) => {
  try {
    const { name, coverImage, servings, category, tags, ingredients, steps } = req.body;
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE recipes SET name = ?, cover_image = ?, servings = ?, category = ?, tags = ?, ingredients = ?, steps = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      name,
      coverImage || '',
      servings || 2,
      category || '其他',
      JSON.stringify(tags || []),
      JSON.stringify(ingredients || []),
      JSON.stringify(steps || []),
      now,
      req.params.id
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 删除菜谱
router.delete('/recipes/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

module.exports = router;
