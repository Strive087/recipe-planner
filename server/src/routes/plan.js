const express = require('express');
const router = express.Router();

// 获取库存中已有的食材名称
function getPantryItems() {
  const db = require('../../models/db');
  try {
    const items = db.prepare('SELECT name FROM pantry_items WHERE amount > 0').all();
    return new Set(items.map(i => i.name));
  } catch (e) {
    return new Set();
  }
}

// 模拟 AI 生成规划
router.post('/plan/generate', (req, res) => {
  const { recipes, config } = req.body;
  const { servings, appetite, avoidFoods } = config || {};
  
  const appetiteCoeff = appetite === 'large' ? 1.2 : appetite === 'small' ? 0.8 : 1.0;
  
  // 获取库存中已有的食材
  const pantryItems = getPantryItems();
  
  // 模拟采购清单生成
  const shoppingList = [];
  const categoryMap = {
    '肉类': 'meat', '荤菜': 'meat', '猪肉': 'meat', '牛肉': 'meat', '鸡肉': 'meat',
    '蔬菜': 'vegetable', '素菜': 'vegetable',
    '调料': 'seasoning', '酱油': 'seasoning', '盐': 'seasoning', '糖': 'seasoning',
  };
  
  recipes.forEach(recipe => {
    const ingredients = recipe.ingredients || [];
    ingredients.forEach(ing => {
      // 排除用户指定不吃的食物
      if (avoidFoods && ing.name.includes(avoidFoods)) return;
      // 排除库存中已有的食材
      if (pantryItems.has(ing.name)) return;
      
      const existing = shoppingList.find(i => i.name === ing.name);
      if (existing) {
        existing.totalAmount += (ing.amount || 0) * appetiteCoeff;
      } else {
        let category = 'other';
        for (const [key, val] of Object.entries(categoryMap)) {
          if (ing.name.includes(key)) { category = val; break; }
        }
        shoppingList.push({
          name: ing.name,
          totalAmount: Math.round((ing.amount || 0) * appetiteCoeff),
          unit: ing.unit || 'g',
          category
        });
      }
    });
  });
  
  // 模拟烹饪指南
  const cookingGuide = [
    {
      order: 1,
      title: '食材准备',
      duration: '15分钟',
      actions: ['清洗所有食材', '切配备用', '肉类提前解冻'],
      parallel: '处理食材期间可以准备调料'
    },
    {
      order: 2,
      title: '主菜烹饪',
      duration: '20分钟',
      actions: ['热锅下油', '按菜品顺序炒制'],
      parallel: '可同时烧开水'
    },
    {
      order: 3,
      title: '收汁装盘',
      duration: '5分钟',
      actions: ['大火收汁', '装盘美化'],
      parallel: null
    }
  ];
  
  // 模拟延迟
  setTimeout(() => {
    res.json({
      code: 200,
      data: {
        shopping_list: shoppingList,
        cooking_guide: cookingGuide
      }
    });
  }, 1500);
});

module.exports = router;
