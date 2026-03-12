const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const { v4: uuidv4 } = require('uuid');

// 获取库存列表
router.get('/pantry', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT id, name, amount, unit, category, expiry_date, created_at
      FROM pantry_items
      ORDER BY created_at DESC
    `).all();
    
    res.json({
      code: 200,
      data: items
    });
  } catch (error) {
    console.error('获取库存失败:', error);
    res.status(500).json({ code: 500, message: '获取库存失败' });
  }
});

// 添加食材
router.post('/pantry', (req, res) => {
  try {
    const { name, amount, unit, category, expiry_date } = req.body;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '食材名称不能为空' });
    }
    
    const id = uuidv4();
    const now = Date.now();
    
    db.prepare(`
      INSERT INTO pantry_items (id, name, amount, unit, category, expiry_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, amount || 0, unit || 'g', category || 'other', expiry_date || null, now);
    
    const item = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
    
    res.json({
      code: 200,
      data: item,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加食材失败:', error);
    res.status(500).json({ code: 500, message: '添加食材失败' });
  }
});

// 更新食材
router.put('/pantry/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, unit, category, expiry_date } = req.body;
    
    const existing = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '食材不存在' });
    }
    
    db.prepare(`
      UPDATE pantry_items
      SET name = ?, amount = ?, unit = ?, category = ?, expiry_date = ?
      WHERE id = ?
    `).run(
      name ?? existing.name,
      amount ?? existing.amount,
      unit ?? existing.unit,
      category ?? existing.category,
      expiry_date ?? existing.expiry_date,
      id
    );
    
    const item = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
    
    res.json({
      code: 200,
      data: item,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新食材失败:', error);
    res.status(500).json({ code: 500, message: '更新食材失败' });
  }
});

// 删除食材
router.delete('/pantry/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '食材不存在' });
    }
    
    db.prepare('DELETE FROM pantry_items WHERE id = ?').run(id);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除食材失败:', error);
    res.status(500).json({ code: 500, message: '删除食材失败' });
  }
});

// 清空库存
router.post('/pantry/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM pantry_items').run();
    
    res.json({
      code: 200,
      message: '清空成功'
    });
  } catch (error) {
    console.error('清空库存失败:', error);
    res.status(500).json({ code: 500, message: '清空库存失败' });
  }
});

// 获取库存列表（用于AI规划排除）
router.get('/pantry/list', (req, res) => {
  try {
    const items = db.prepare('SELECT name FROM pantry_items WHERE amount > 0').all();
    res.json({
      code: 200,
      data: items.map(i => i.name)
    });
  } catch (error) {
    console.error('获取库存名称失败:', error);
    res.status(500).json({ code: 500, message: '获取库存名称失败' });
  }
});

module.exports = router;
