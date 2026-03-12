const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/recipe.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('🌱 开始初始化数据库...\n');

// ==================== 插入分类数据 ====================
const categories = [
  { name: '家常菜', icon: '🍳', description: '日常烹饪的家常美味', sort_order: 1 },
  { name: '快手菜', icon: '⚡', description: '15分钟内完成的快捷菜品', sort_order: 2 },
  { name: '早餐', icon: '🍳', description: '营养丰富的早餐选择', sort_order: 3 },
  { name: '午餐', icon: '🍱', description: '午餐便当或简餐', sort_order: 4 },
  { name: '晚餐', icon: '🍲', description: '丰盛的家庭晚餐', sort_order: 5 },
  { name: '甜点', icon: '🍰', description: '美味的甜品和小吃', sort_order: 6 },
  { name: '素食', icon: '🥬', description: '健康素食菜品', sort_order: 7 },
  { name: '汤品', icon: '🍲', description: '暖胃养生汤品', sort_order: 8 },
];

const insertCategory = db.prepare(`
  INSERT INTO categories (name, icon, description, sort_order)
  VALUES (@name, @icon, @description, @sort_order)
`);

for (const cat of categories) {
  try {
    insertCategory.run(cat);
    console.log(`✅ 插入分类: ${cat.name}`);
  } catch (e) {
    if (e.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`⚠️ 分类 ${cat.name} 已存在，跳过`);
    }
  }
}

console.log('');

// ==================== 插入食材数据 ====================
const ingredients = [
  // 主食类
  { name: '米饭', category: '主食', unit: 'g', calories_per_100g: 130 },
  { name: '面条', category: '主食', unit: 'g', calories_per_100g: 138 },
  { name: '面粉', category: '主食', unit: 'g', calories_per_100g: 364 },
  { name: '面包', category: '主食', unit: '片', calories_per_100g: 265 },
  
  // 肉类
  { name: '猪肉', category: '肉类', unit: 'g', calories_per_100g: 242 },
  { name: '牛肉', category: '肉类', unit: 'g', calories_per_100g: 250 },
  { name: '鸡肉', category: '肉类', unit: 'g', calories_per_100g: 165 },
  { name: '鸡蛋', category: '肉类', unit: '个', calories_per_100g: 155 },
  
  // 蔬菜类
  { name: '番茄', category: '蔬菜', unit: 'g', calories_per_100g: 18 },
  { name: '土豆', category: '蔬菜', unit: 'g', calories_per_100g: 77 },
  { name: '胡萝卜', category: '蔬菜', unit: 'g', calories_per_100g: 41 },
  { name: '洋葱', category: '蔬菜', unit: 'g', calories_per_100g: 40 },
  { name: '青椒', category: '蔬菜', unit: 'g', calories_per_100g: 20 },
  { name: '黄瓜', category: '蔬菜', unit: 'g', calories_per_100g: 15 },
  { name: '菠菜', category: '蔬菜', unit: 'g', calories_per_100g: 23 },
  { name: '西兰花', category: '蔬菜', unit: 'g', calories_per_100g: 34 },
  
  // 调料类
  { name: '食用油', category: '调料', unit: 'ml', calories_per_100g: 884 },
  { name: '盐', category: '调料', unit: 'g', calories_per_100g: 0 },
  { name: '酱油', category: '调料', unit: 'ml', calories_per_100g: 53 },
  { name: '糖', category: '调料', unit: 'g', calories_per_100g: 387 },
  { name: '大蒜', category: '调料', unit: '瓣', calories_per_100g: 143 },
  { name: '姜', category: '调料', unit: 'g', calories_per_100g: 80 },
];

const insertIngredient = db.prepare(`
  INSERT INTO ingredients (name, category, unit, calories_per_100g)
  VALUES (@name, @category, @unit, @calories_per_100g)
`);

for (const ing of ingredients) {
  try {
    insertIngredient.run(ing);
    console.log(`✅ 插入食材: ${ing.name}`);
  } catch (e) {
    if (e.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`⚠️ 食材 ${ing.name} 已存在，跳过`);
    }
  }
}

console.log('');

// ==================== 插入示例菜谱 ====================
const recipes = [
  {
    name: '番茄炒蛋',
    cover_image: 'https://example.com/tomato-egg.jpg',
    description: '经典家常菜，酸甜可口，简单易做',
    servings: 2,
    prep_time: 5,
    cook_time: 10,
    difficulty: 'easy',
    category_name: '家常菜',
    tags: '下饭,快手菜,家常',
    calories: 150,
  },
  {
    name: '青椒肉丝',
    cover_image: 'https://example.com/pepper-pork.jpg',
    description: '色泽诱人，口感爽脆的家常菜',
    servings: 2,
    prep_time: 10,
    cook_time: 15,
    difficulty: 'easy',
    category_name: '家常菜',
    tags: '下饭,快手菜',
    calories: 220,
  },
  {
    name: '蒜蓉西兰花',
    cover_image: 'https://example.com/garlic-broccoli.jpg',
    description: '健康素菜，蒜香浓郁',
    servings: 2,
    prep_time: 5,
    cook_time: 8,
    difficulty: 'easy',
    category_name: '素食',
    tags: '健康,快手菜,素食',
    calories: 50,
  },
];

const insertRecipe = db.prepare(`
  INSERT INTO recipes (name, cover_image, description, servings, prep_time, cook_time, difficulty, category_id, tags, calories)
  VALUES (@name, @cover_image, @description, @servings, @prep_time, @cook_time, @difficulty, @category_id, @tags, @calories)
`);

const getCategoryId = db.prepare('SELECT id FROM categories WHERE name = ?');

for (const recipe of recipes) {
  const cat = getCategoryId.get(recipe.category_name);
  try {
    const result = insertRecipe.run({
      ...recipe,
      category_id: cat ? cat.id : null,
    });
    console.log(`✅ 插入菜谱: ${recipe.name} (ID: ${result.lastInsertRowid})`);
  } catch (e) {
    console.log(`⚠️ 菜谱 ${recipe.name} 插入失败: ${e.message}`);
  }
}

console.log('');

// ==================== 插入菜谱步骤 ====================
const steps = [
  // 番茄炒蛋步骤
  { recipe_name: '番茄炒蛋', step_number: 1, description: '番茄切块，鸡蛋打散备用', duration_minutes: 3 },
  { recipe_name: '番茄炒蛋', step_number: 2, description: '热锅热油，倒入鸡蛋液翻炒至凝固', duration_minutes: 2 },
  { recipe_name: '番茄炒蛋', step_number: 3, description: '加入番茄块翻炒，加盐糖调味', duration_minutes: 3 },
  { recipe_name: '番茄炒蛋', step_number: 4, description: '番茄出汁后与鸡蛋混合均匀即可出锅', duration_minutes: 2 },
  
  // 青椒肉丝步骤
  { recipe_name: '青椒肉丝', step_number: 1, description: '猪肉切丝，青椒切丝，蒜切末', duration_minutes: 5 },
  { recipe_name: '青椒肉丝', step_number: 2, description: '肉丝加生抽、淀粉腌制5分钟', duration_minutes: 5 },
  { recipe_name: '青椒肉丝', step_number: 3, description: '热锅热油，下肉丝翻炒变色', duration_minutes: 3 },
  { recipe_name: '青椒肉丝', step_number: 4, description: '加入青椒丝和蒜末翻炒，加盐调味', duration_minutes: 4 },
  { recipe_name: '青椒肉丝', step_number: 5, description: '翻炒均匀即可出锅', duration_minutes: 1 },
  
  // 蒜蓉西兰花步骤
  { recipe_name: '蒜蓉西兰花', step_number: 1, description: '西兰花切成小朵，洗净备用', duration_minutes: 2 },
  { recipe_name: '蒜蓉西兰花', step_number: 2, description: '大蒜切末', duration_minutes: 1 },
  { recipe_name: '蒜蓉西兰花', step_number: 3, description: '烧开水，加盐和油，下西兰花焯水1分钟', duration_minutes: 3 },
  { recipe_name: '蒜蓉西兰花', step_number: 4, description: '热锅热油，爆香蒜末', duration_minutes: 1 },
  { recipe_name: '蒜蓉西兰花', step_number: 5, description: '加入西兰花快速翻炒，加盐调味即可', duration_minutes: 2 },
];

const getRecipeId = db.prepare('SELECT id FROM recipes WHERE name = ?');
const insertStep = db.prepare(`
  INSERT INTO steps (recipe_id, step_number, description, duration_minutes)
  VALUES (@recipe_id, @step_number, @description, @duration_minutes)
`);

for (const step of steps) {
  const recipe = getRecipeId.get(step.recipe_name);
  if (recipe) {
    try {
      insertStep.run({
        recipe_id: recipe.id,
        step_number: step.step_number,
        description: step.description,
        duration_minutes: step.duration_minutes,
      });
      console.log(`✅ 插入步骤: ${step.recipe_name} - 第${step.step_number}步`);
    } catch (e) {
      console.log(`⚠️ 步骤插入失败: ${e.message}`);
    }
  }
}

console.log('');

// ==================== 插入菜谱食材关联 ====================
const recipeIngredients = [
  // 番茄炒蛋
  { recipe_name: '番茄炒蛋', ingredient_name: '番茄', quantity: '2个' },
  { recipe_name: '番茄炒蛋', ingredient_name: '鸡蛋', quantity: '3个' },
  { recipe_name: '番茄炒蛋', ingredient_name: '食用油', quantity: '15ml' },
  { recipe_name: '番茄炒蛋', ingredient_name: '盐', quantity: '3g' },
  { recipe_name: '番茄炒蛋', ingredient_name: '糖', quantity: '5g' },
  
  // 青椒肉丝
  { recipe_name: '青椒肉丝', ingredient_name: '猪肉', quantity: '150g' },
  { recipe_name: '青椒肉丝', ingredient_name: '青椒', quantity: '2个' },
  { recipe_name: '青椒肉丝', ingredient_name: '大蒜', quantity: '2瓣' },
  { recipe_name: '青椒肉丝', ingredient_name: '酱油', quantity: '15ml' },
  { recipe_name: '青椒肉丝', ingredient_name: '食用油', quantity: '20ml' },
  { recipe_name: '青椒肉丝', ingredient_name: '盐', quantity: '3g' },
  
  // 蒜蓉西兰花
  { recipe_name: '蒜蓉西兰花', ingredient_name: '西兰花', quantity: '300g' },
  { recipe_name: '蒜蓉西兰花', ingredient_name: '大蒜', quantity: '3瓣' },
  { recipe_name: '蒜蓉西兰花', ingredient_name: '食用油', quantity: '15ml' },
  { recipe_name: '蒜蓉西兰花', ingredient_name: '盐', quantity: '2g' },
];

const getIngredientId = db.prepare('SELECT id FROM ingredients WHERE name = ?');
const insertRecipeIngredient = db.prepare(`
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
  VALUES (@recipe_id, @ingredient_id, @quantity)
`);

for (const ri of recipeIngredients) {
  const recipe = getRecipeId.get(ri.recipe_name);
  const ingredient = getIngredientId.get(ri.ingredient_name);
  
  if (recipe && ingredient) {
    try {
      insertRecipeIngredient.run({
        recipe_id: recipe.id,
        ingredient_id: ingredient.id,
        quantity: ri.quantity,
      });
      console.log(`✅ 关联食材: ${ri.recipe_name} - ${ri.ingredient_name}`);
    } catch (e) {
      if (e.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`⚠️ 关联失败: ${e.message}`);
      }
    }
  }
}

console.log('\n🎉 数据库初始化完成！\n');

// 打印统计信息
const stats = {
  categories: db.prepare('SELECT COUNT(*) as count FROM categories').get(),
  recipes: db.prepare('SELECT COUNT(*) as count FROM recipes').get(),
  ingredients: db.prepare('SELECT COUNT(*) as count FROM ingredients').get(),
  steps: db.prepare('SELECT COUNT(*) as count FROM steps').get(),
  recipe_ingredients: db.prepare('SELECT COUNT(*) as count FROM recipe_ingredients').get(),
};

console.log('📊 数据统计:');
console.log(`  - 分类: ${stats.categories.count} 条`);
console.log(`  - 菜谱: ${stats.recipes.count} 条`);
console.log(`  - 食材: ${stats.ingredients.count} 条`);
console.log(`  - 步骤: ${stats.steps.count} 条`);
console.log(`  - 菜谱食材关联: ${stats.recipe_ingredients.count} 条`);

db.close();
