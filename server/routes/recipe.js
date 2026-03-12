const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// 安全解析 JSON 字段（兼容旧数据）
function safeParseJSON(str, defaultValue = []) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    // 如果是逗号分隔的字符串，转换为数组
    if (typeof str === 'string' && str.includes(',')) {
      return str.split(',').map(s => s.trim());
    }
    return defaultValue;
  }
}

// 搜索菜谱
router.get('/recipes/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ code: 400, message: '请提供搜索关键词' });
    }
    
    const stmt = db.prepare(`
      SELECT * FROM recipes 
      WHERE name LIKE ? OR category LIKE ? OR tags LIKE ?
      ORDER BY created_at DESC
    `);
    const searchTerm = `%${q}%`;
    const recipes = stmt.all(searchTerm, searchTerm, searchTerm);
    
    const result = recipes.map(r => ({
      ...r,
      tags: safeParseJSON(r.tags),
      ingredients: safeParseJSON(r.ingredients),
      steps: safeParseJSON(r.steps)
    }));
    
    res.json({ code: 200, data: result });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 获取所有菜谱
router.get('/recipes', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC');
    const recipes = stmt.all();
    
    // 解析 JSON 字段
    const result = recipes.map(r => ({
      ...r,
      tags: safeParseJSON(r.tags),
      ingredients: safeParseJSON(r.ingredients),
      steps: safeParseJSON(r.steps)
    }));
    
    res.json({ code: 200, data: result });
  } catch (error) {
    res.json({ code: 500, message: error.message });
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
    
    res.json({
      code: 200,
      data: {
        ...recipe,
        tags: safeParseJSON(recipe.tags),
        ingredients: safeParseJSON(recipe.ingredients),
        steps: safeParseJSON(recipe.steps)
      }
    });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 创建菜谱
router.post('/recipes', (req, res) => {
  try {
    const { name, coverImage, servings, category, tags, ingredients, steps } = req.body;
    const id = uuidv4();
    const now = Date.now();
    
    const stmt = db.prepare(`
      INSERT INTO recipes (id, name, cover_image, servings, category, tags, ingredients, steps, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
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
    
    res.json({ code: 200, data: { id } });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 更新菜谱
router.put('/recipes/:id', (req, res) => {
  try {
    const { name, coverImage, servings, category, tags, ingredients, steps } = req.body;
    const now = Date.now();
    
    const stmt = db.prepare(`
      UPDATE recipes 
      SET name = ?, cover_image = ?, servings = ?, category = ?, tags = ?, ingredients = ?, steps = ?, updated_at = ?
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
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 删除菜谱
router.delete('/recipes/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 收藏菜谱
router.post('/recipes/:id/favorite', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE recipes SET is_favorite = 1 WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    res.json({ code: 200, message: '收藏成功' });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 取消收藏
router.delete('/recipes/:id/favorite', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE recipes SET is_favorite = 0 WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    res.json({ code: 200, message: '取消收藏成功' });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

module.exports = router;
