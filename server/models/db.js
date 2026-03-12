const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/recipe.db');
console.log('数据库路径:', dbPath);

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表（简单 schema）
db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cover_image TEXT,
    servings INTEGER DEFAULT 2,
    category TEXT,
    tags TEXT,
    ingredients TEXT,
    steps TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS recipe_favorites (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    folder_id TEXT NOT NULL,
    created_at INTEGER,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES favorite_folders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorite_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT DEFAULT 'default_user',
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    selected_recipe_ids TEXT,
    config TEXT,
    result TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS pantry_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL DEFAULT 0,
    unit TEXT DEFAULT 'g',
    category TEXT DEFAULT 'other',
    expiry_date INTEGER,
    created_at INTEGER
  );
`);

// 创建索引
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name)`);
} catch (e) {}
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category)`);
} catch (e) {}
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_recipe_favorites_recipe ON recipe_favorites(recipe_id)`);
} catch (e) {}
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_recipe_favorites_folder ON recipe_favorites(folder_id)`);
} catch (e) {}
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_favorite_folders_user ON favorite_folders(user_id)`);
} catch (e) {}

// 初始化默认分类
const initCategories = [
  { id: 'cat_1', name: '早餐', icon: '🍳', sort_order: 1 },
  { id: 'cat_2', name: '午餐', icon: '🍱', sort_order: 2 },
  { id: 'cat_3', name: '晚餐', icon: '🍲', sort_order: 3 },
  { id: 'cat_4', name: '小吃', icon: '🍟', sort_order: 4 },
  { id: 'cat_5', name: '甜点', icon: '🍰', sort_order: 5 },
  { id: 'cat_6', name: '饮品', icon: '🥤', sort_order: 6 },
];

const insertCat = db.prepare(`
  INSERT OR IGNORE INTO categories (id, name, icon, sort_order, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
const now = Date.now();
for (const cat of initCategories) {
  insertCat.run(cat.id, cat.name, cat.icon, cat.sort_order, now);
}

module.exports = db;
