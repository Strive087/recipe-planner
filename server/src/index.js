const express = require('express');
const cors = require('cors');
const path = require('path');

// 初始化数据库
require('../models/db');

const recipeRoutes = require('./routes/recipe');
const planRoutes = require('./routes/plan');
const favoritesRoutes = require('./routes/favorites');
const pantryRoutes = require('./routes/pantry');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由（必须在前，静态文件和 fallback 之前）
app.use('/api', recipeRoutes);
app.use('/api', planRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', pantryRoutes);
app.use('/api', commentsRoutes);

// 静态文件服务 - 前端页面
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback - 只处理非 API 请求
app.get(/^\/(?!api)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍳 菜谱规划助手服务已启动: http://0.0.0.0:${PORT}`);
});
