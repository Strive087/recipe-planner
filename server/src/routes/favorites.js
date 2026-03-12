const express = require('express');
const router = express.Router();
const db = require('../../models/db');

// 获取收藏夹列表
router.get('/favorites', (req, res) => {
  try {
    const userId = req.query.user_id || 'default_user';
    const stmt = db.prepare(`
      SELECT * FROM favorite_folders 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const folders = stmt.all(userId);
    res.json({ code: 200, data: folders });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 创建收藏夹
router.post('/favorites', (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.body.user_id || 'default_user';
    
    if (!name || name.trim() === '') {
      return res.json({ code: 400, message: '收藏夹名称不能为空' });
    }
    
    const now = Date.now();
    const id = `folder_${now}`;
    const stmt = db.prepare(`
      INSERT INTO favorite_folders (id, name, user_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, name.trim(), userId, now);
    
    res.json({ code: 200, message: '创建成功', data: { id, name: name.trim(), user_id: userId, created_at: now } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 添加菜谱到收藏夹
router.post('/favorites/:folderId/add', (req, res) => {
  try {
    const { folderId } = req.params;
    const { recipe_id } = req.body;
    
    if (!recipe_id) {
      return res.json({ code: 400, message: '菜谱ID不能为空' });
    }
    
    // 检查收藏夹是否存在
    const folderStmt = db.prepare('SELECT id FROM favorite_folders WHERE id = ?');
    const folder = folderStmt.get(folderId);
    if (!folder) {
      return res.json({ code: 404, message: '收藏夹不存在' });
    }
    
    // 检查菜谱是否存在
    const recipeStmt = db.prepare('SELECT id FROM recipes WHERE id = ?');
    const recipe = recipeStmt.get(recipe_id);
    if (!recipe) {
      return res.json({ code: 404, message: '菜谱不存在' });
    }
    
    // 检查是否已存在
    const checkStmt = db.prepare('SELECT id FROM recipe_favorites WHERE recipe_id = ? AND folder_id = ?');
    const existing = checkStmt.get(recipe_id, folderId);
    if (existing) {
      return res.json({ code: 200, message: '菜谱已在收藏夹中', data: { exists: true } });
    }
    
    // 添加收藏
    const now = Date.now();
    const id = `fav_${now}`;
    const insertStmt = db.prepare(`
      INSERT INTO recipe_favorites (id, recipe_id, folder_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(id, recipe_id, folderId, now);
    
    res.json({ code: 200, message: '添加成功', data: { id, recipe_id, folder_id: folderId, created_at: now } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 从收藏夹移除菜谱
router.delete('/favorites/:folderId/remove/:recipeId', (req, res) => {
  try {
    const { folderId, recipeId } = req.params;
    
    const stmt = db.prepare('DELETE FROM recipe_favorites WHERE recipe_id = ? AND folder_id = ?');
    const result = stmt.run(recipeId, folderId);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '收藏记录不存在' });
    }
    
    res.json({ code: 200, message: '移除成功', data: { removed: true } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 获取收藏夹中的菜谱列表
router.get('/favorites/:folderId', (req, res) => {
  try {
    const { folderId } = req.params;
    
    // 检查收藏夹是否存在
    const folderStmt = db.prepare('SELECT * FROM favorite_folders WHERE id = ?');
    const folder = folderStmt.get(folderId);
    if (!folder) {
      return res.json({ code: 404, message: '收藏夹不存在' });
    }
    
    // 获取收藏夹中的菜谱
    const stmt = db.prepare(`
      SELECT r.*, rf.created_at as favorited_at
      FROM recipe_favorites rf
      JOIN recipes r ON rf.recipe_id = r.id
      WHERE rf.folder_id = ?
      ORDER BY rf.created_at DESC
    `);
    const recipes = stmt.all(folderId);
    
    // 转换 JSON 字段
    const parseRecipe = (r) => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
      ingredients: r.ingredients ? JSON.parse(r.ingredients) : [],
      steps: r.steps ? JSON.parse(r.steps) : [],
    });
    
    const result = recipes.map(r => {
      const { favorited_at, ...rest } = r;
      return {
        ...parseRecipe(rest),
        favorited_at
      };
    });
    
    res.json({ code: 200, data: { folder, recipes: result } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 删除收藏夹
router.delete('/favorites/:folderId', (req, res) => {
  try {
    const { folderId } = req.params;
    
    const stmt = db.prepare('DELETE FROM favorite_folders WHERE id = ?');
    const result = stmt.run(folderId);
    
    if (result.changes === 0) {
      return res.json({ code: 404, message: '收藏夹不存在' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

module.exports = router;
