const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 安全解析 JSON 字段
function safeParseJSON(str, defaultValue = []) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

// AI 规划生成接口
router.post('/plan/generate', async (req, res) => {
  try {
    const { days = 3, mealsPerDay = 3, preferences = [] } = req.body;

    if (days < 1 || days > 30) {
      return res.json({ code: 400, message: '天数应在1-30之间' });
    }
    if (mealsPerDay < 1 || mealsPerDay > 6) {
      return res.json({ code: 400, message: '每天餐数应在1-6之间' });
    }

    // 获取所有菜谱
    const recipes = db.prepare('SELECT * FROM recipes').all();
    
    if (recipes.length === 0) {
      return res.json({ code: 404, message: '暂无菜谱数据' });
    }

    // 解析 ingredients 并按分类组织
    const recipesByCategory = {};
    recipes.forEach(recipe => {
      const parsed = {
        ...recipe,
        ingredients: safeParseJSON(recipe.ingredients),
        steps: safeParseJSON(recipe.steps)
      };
      const cat = parsed.category || '其他';
      if (!recipesByCategory[cat]) {
        recipesByCategory[cat] = [];
      }
      recipesByCategory[cat].push(parsed);
    });

    const categories = Object.keys(recipesByCategory);
    
    // 生成每日菜谱安排
    const dailyPlans = [];
    const usedRecipeIds = new Set(); // 记录已使用的菜谱ID，避免长期重复
    
    for (let day = 1; day <= days; day++) {
      const dayMeals = [];
      const dayUsedCategories = new Set(); // 记录当天已使用的分类
      
      for (let meal = 1; meal <= mealsPerDay; meal++) {
        // 优先选择当天未使用的分类
        const availableCategories = categories.filter(cat => !dayUsedCategories.has(cat));
        
        if (availableCategories.length === 0) {
          // 如果所有分类都用过了，重置（避免连续同类菜）
          dayUsedCategories.clear();
        }
        
        const targetCategories = availableCategories.length > 0 
          ? availableCategories 
          : categories;
        
        // 随机选择一个分类
        const selectedCategory = targetCategories[Math.floor(Math.random() * targetCategories.length)];
        
        // 从选中分类中随机选择菜谱（排除今天已用过的）
        const categoryRecipes = recipesByCategory[selectedCategory].filter(
          r => !usedRecipeIds.has(r.id)
        );
        
        // 如果该分类菜谱都用过了，使用所有可用菜谱
        const pool = categoryRecipes.length > 0 
          ? categoryRecipes 
          : recipesByCategory[selectedCategory];
        
        const selectedRecipe = pool[Math.floor(Math.random() * pool.length)];
        
        // 标记为已使用
        usedRecipeIds.add(selectedRecipe.id);
        dayUsedCategories.add(selectedCategory);
        
        // 确定餐次类型
        const mealTypes = ['早餐', '午餐', '晚餐', '上午茶', '下午茶', '夜宵'];
        const mealType = mealTypes[Math.min(meal - 1, mealTypes.length - 1)];
        
        dayMeals.push({
          mealType,
          recipe: {
            id: selectedRecipe.id,
            name: selectedRecipe.name,
            category: selectedRecipe.category,
            coverImage: selectedRecipe.cover_image,
            servings: selectedRecipe.servings,
            ingredients: selectedRecipe.ingredients,
            steps: selectedRecipe.steps
          }
        });
      }
      
      dailyPlans.push({
        day,
        date: getDateString(day),
        meals: dayMeals
      });
    }

    // 生成采购清单
    const shoppingList = generateShoppingList(dailyPlans);

    // 返回结果
    res.json({
      code: 200,
      data: {
        days,
        mealsPerDay,
        dailyPlans,
        shoppingList
      }
    });
  } catch (error) {
    res.json({ code: 500, message: error.message });
  }
});

// 获取日期字符串（从今天开始）
function getDateString(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}-${month}-${day} ${weekday}`;
}

// 生成采购清单（合并相同食材）
function generateShoppingList(dailyPlans) {
  const ingredientMap = new Map();
  
  dailyPlans.forEach(dayPlan => {
    dayPlan.meals.forEach(meal => {
      const recipe = meal.recipe;
      const servings = recipe.servings || 2;
      
      (recipe.ingredients || []).forEach(ing => {
        const name = ing.name || '';
        if (!name) return;
        
        // 标准化食材名称（去除空格、统一单位）
        const key = name.trim();
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.totalAmount += (ing.amount || 0);
          existing.recipes.push(recipe.name);
        } else {
          ingredientMap.set(key, {
            name: key,
            totalAmount: ing.amount || 0,
            unit: ing.unit || '适量',
            category: guessIngredientCategory(key),
            recipes: [recipe.name]
          });
        }
      });
    });
  });
  
  // 转换为数组并按分类排序
  const shoppingArray = Array.from(ingredientMap.values());
  
  // 分类
  const categoryOrder = ['肉类', '蔬菜类', '豆制品', '主食', '调味品', '其他'];
  const categoryMap = {
    '肉类': [],
    '蔬菜类': [],
    '豆制品': [],
    '主食': [],
    '调味品': [],
    '其他': []
  };
  
  shoppingArray.forEach(item => {
    const cat = item.category || '其他';
    if (categoryMap[cat]) {
      categoryMap[cat].push(item);
    } else {
      categoryMap['其他'].push(item);
    }
  });
  
  // 按分类顺序输出
  const result = [];
  categoryOrder.forEach(cat => {
    if (categoryMap[cat] && categoryMap[cat].length > 0) {
      // 按食材名称排序
      categoryMap[cat].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      result.push(...categoryMap[cat]);
    }
  });
  
  return result;
}

// 猜测食材分类
function guessIngredientCategory(name) {
  const rules = {
    '肉类': ['肉', '鸡', '鸭', '鹅', '鱼', '虾', '蟹', '牛', '羊', '猪', '排骨', '五花', '里脊', '肉丸', '腊肉', '火腿', '肠'],
    '蔬菜类': ['菜', '蔬', '番茄', '土豆', '胡萝卜', '洋葱', '蒜', '姜', '葱', '青椒', '红椒', '黄瓜', '茄子', '豆角', '菠菜', '白菜', '萝卜', '莲藕', '蘑菇', '木耳', '香菇'],
    '豆制品': ['豆腐', '豆浆', '豆皮', '豆芽', '腐竹', '千张', '豆干'],
    '主食': ['米', '面', '粉', '面条', '馒头', '面包', '饺子', '包子', '粥', '淀粉'],
    '调味品': ['盐', '酱', '油', '醋', '糖', '味', '鸡精', '胡椒', '淀粉', '料酒', '生抽', '老抽', '蚝油', '八角', '桂皮', '香叶', '花椒', '辣椒']
  };
  
  for (const [cat, keywords] of Object.entries(rules)) {
    if (keywords.some(k => name.includes(k))) {
      return cat;
    }
  }
  return '其他';
}

module.exports = router;
