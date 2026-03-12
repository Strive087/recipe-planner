const express = require('express');
const router = express.Router();
const axios = require('axios');

// AI 规划生成接口
router.post('/plan/generate', async (req, res) => {
  try {
    const { recipes, config } = req.body;
    
    if (!recipes || recipes.length === 0) {
      return res.json({ code: 400, message: '请选择至少一道菜谱' });
    }

    // 模拟 AI 生成（实际可接入 DeepSeek/ChatGPT）
    // 这里实现简单的本地算法
    const result = generatePlan(recipes, config);
    
    res.json({ code: 200, data: result });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 本地规划生成算法
function generatePlan(recipes, config) {
  const { servings, appetite, avoidFoods } = config;
  
  // 胃口系数
  const appetiteCoeff = appetite === 'large' ? 1.2 : appetite === 'small' ? 0.8 : 1.0;
  
  // 忌口列表
  const avoidList = avoidFoods ? avoidFoods.split(/[,，、]/).map(s => s.trim()).filter(Boolean) : [];
  
  // 合并食材
  const ingredientMap = new Map();
  
  recipes.forEach(recipe => {
    const recipeServings = recipe.servings || 2;
    const scale = (servings * appetiteCoeff) / recipeServings;
    
    (recipe.ingredients || []).forEach(ing => {
      // 检查忌口
      if (avoidList.some(avoid => ing.name.includes(avoid))) {
        return;
      }
      
      const key = ing.name;
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        existing.totalAmount += (ing.amount || 0) * scale;
      } else {
        ingredientMap.set(key, {
          name: ing.name,
          totalAmount: Math.round((ing.amount || 0) * scale * 10) / 10,
          unit: ing.unit || 'g',
          category: guessCategory(ing.name)
        });
      }
    });
  });
  
  // 转换为数组并分类
  const shoppingList = Array.from(ingredientMap.values());
  
  // 生成烹饪指南
  const cookingGuide = recipes.map((recipe, index) => ({
    order: index + 1,
    title: recipe.name,
    duration: `${15 + index * 10}分钟`,
    actions: (recipe.steps || []).slice(0, 3).map(s => s.desc).filter(Boolean),
    parallel: index > 0 ? `可以提前准备${recipes[index - 1].name}` : null
  }));
  
  return {
    shopping_list: shoppingList,
    cooking_guide: cookingGuide
  };
}

// 猜测食材分类
function guessCategory(name) {
  const categoryRules = {
    meat: ['肉', '鸡', '鸭', '鹅', '鱼', '虾', '蟹', '牛', '羊', '猪', '排骨', '五花', '里脊'],
    vegetable: ['菜', '蔬', '番茄', '土豆', '胡萝卜', '洋葱', '蒜', '姜', '葱', '青椒', '红椒'],
    seasoning: ['盐', '酱', '油', '醋', '糖', '味', '鸡精', '胡椒', '淀粉', '料酒'],
    dry: ['米', '面', '粉', '豆', '木耳', '香菇', '干', '紫菜']
  };
  
  for (const [cat, keywords] of Object.entries(categoryRules)) {
    if (keywords.some(k => name.includes(k))) {
      return cat;
    }
  }
  return 'other';
}

module.exports = router;
