const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const { v4: uuidv4 } = require('uuid');

// 获取购物清单
router.get('/shopping', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT id, name, amount, unit, category, checked, source_plan_id, source_recipe_id, created_at
      FROM shopping_list
      ORDER BY created_at DESC
    `).all();
    
    res.json({
      code: 200,
      data: items
    });
  } catch (error) {
    console.error('获取购物清单失败:', error);
    res.status(500).json({ code: 500, message: '获取购物清单失败' });
  }
});

// 从规划添加食材
router.post('/shopping/add', (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: 400, message: '食材列表不能为空' });
    }
    
    const now = Date.now();
    const addedItems = [];
    
    const insertStmt = db.prepare(`
      INSERT INTO shopping_list (id, name, amount, unit, category, checked, source_plan_id, source_recipe_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        // 检查是否已存在相同食材
        const existing = db.prepare(`
          SELECT * FROM shopping_list WHERE name = ? AND checked = 0
        `).get(item.name);
        
        if (existing) {
          // 累加数量
          db.prepare(`
            UPDATE shopping_list SET amount = amount + ? WHERE id = ?
          `).run(item.amount || 1, existing.id);
          addedItems.push({ ...existing, amount: existing.amount + (item.amount || 1) });
        } else {
          const id = uuidv4();
          insertStmt.run(
            id,
            item.name,
            item.amount || 1,
            item.unit || '份',
            item.category || 'other',
            0,
            item.source_plan_id || null,
            item.source_recipe_id || null,
            now
          );
          addedItems.push({
            id,
            name: item.name,
            amount: item.amount || 1,
            unit: item.unit || '份',
            category: item.category || 'other',
            checked: 0,
            source_plan_id: item.source_plan_id || null,
            source_recipe_id: item.source_recipe_id || null,
            created_at: now
          });
        }
      }
    });
    
    insertMany(items);
    
    res.json({
      code: 200,
      data: addedItems,
      message: `成功添加 ${addedItems.length} 项食材`
    });
  } catch (error) {
    console.error('添加食材到购物清单失败:', error);
    res.status(500).json({ code: 500, message: '添加食材到购物清单失败' });
  }
});

// 添加单个食材到购物清单
router.post('/shopping', (req, res) => {
  try {
    const { name, amount, unit, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '食材名称不能为空' });
    }
    
    const id = uuidv4();
    const now = Date.now();
    
    // 检查是否已存在相同食材
    const existing = db.prepare(`
      SELECT * FROM shopping_list WHERE name = ? AND checked = 0
    `).get(name);
    
    if (existing) {
      // 累加数量
      db.prepare(`
        UPDATE shopping_list SET amount = amount + ? WHERE id = ?
      `).run(amount || 1, existing.id);
      
      const item = db.prepare('SELECT * FROM shopping_list WHERE id = ?').get(existing.id);
      
      return res.json({
        code: 200,
        data: item,
        message: '已累加到现有食材'
      });
    }
    
    db.prepare(`
      INSERT INTO shopping_list (id, name, amount, unit, category, checked, source_plan_id, source_recipe_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, amount || 1, unit || '份', category || 'other', 0, null, null, now);
    
    const item = db.prepare('SELECT * FROM shopping_list WHERE id = ?').get(id);
    
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

// 删除清单项
router.delete('/shopping/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM shopping_list WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '食材不存在' });
    }
    
    db.prepare('DELETE FROM shopping_list WHERE id = ?').run(id);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除食材失败:', error);
    res.status(500).json({ code: 500, message: '删除食材失败' });
  }
});

// 切换勾选状态
router.put('/shopping/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM shopping_list WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '食材不存在' });
    }
    
    const newChecked = existing.checked ? 0 : 1;
    db.prepare('UPDATE shopping_list SET checked = ? WHERE id = ?').run(newChecked, id);
    
    const item = db.prepare('SELECT * FROM shopping_list WHERE id = ?').get(id);
    
    res.json({
      code: 200,
      data: item,
      message: newChecked ? '已标记为已购买' : '已取消勾选'
    });
  } catch (error) {
    console.error('切换状态失败:', error);
    res.status(500).json({ code: 500, message: '切换状态失败' });
  }
});

// 清空清单
router.post('/shopping/clear', (req, res) => {
  try {
    const { clear_checked } = req.body; // 可选：只清空已勾选的
    
    if (clear_checked) {
      db.prepare('DELETE FROM shopping_list WHERE checked = 1').run();
      res.json({
        code: 200,
        message: '已清空已购买的食材'
      });
    } else {
      db.prepare('DELETE FROM shopping_list').run();
      res.json({
        code: 200,
        message: '清空成功'
      });
    }
  } catch (error) {
    console.error('清空购物清单失败:', error);
    res.status(500).json({ code: 500, message: '清空购物清单失败' });
  }
});

module.exports = router;
