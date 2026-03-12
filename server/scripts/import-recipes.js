const db = require('../models/db');
const path = require('path');

// 中式菜谱数据
const recipes = [
  {
    name: '红烧肉',
    cover_image: '',
    servings: 4,
    category: '荤菜',
    tags: ['家常菜', '下饭菜', '肥而不腻'],
    ingredients: [
      { name: '五花肉', amount: 500, unit: 'g' },
      { name: '冰糖', amount: 30, unit: 'g' },
      { name: '生抽', amount: 30, unit: 'ml' },
      { name: '老抽', amount: 15, unit: 'ml' },
      { name: '料酒', amount: 20, unit: 'ml' },
      { name: '八角', amount: 2, unit: '个' },
      { name: '桂皮', amount: 1, unit: '小块' },
      { name: '香叶', amount: 2, unit: '片' },
      { name: '姜片', amount: 5, unit: '片' },
      { name: '葱段', amount: 2, unit: '根' }
    ],
    steps: [
      { order: 1, desc: '五花肉切块，冷水下锅加料酒焯水，捞出洗净备用' },
      { order: 2, desc: '锅中放少许油，放入冰糖小火炒至融化呈琥珀色' },
      { order: 3, desc: '放入五花肉快速翻炒，使其均匀裹上糖色' },
      { order: 4, desc: '加入生抽、老抽、料酒翻炒均匀' },
      { order: 5, desc: '加入八角、桂皮、香叶、姜片、葱段' },
      { order: 6, desc: '加入热水没过肉块，大火烧开后转小火炖1小时' },
      { order: 7, desc: '大火收汁至汤汁浓稠即可出锅' }
    ]
  },
  {
    name: '宫保鸡丁',
    cover_image: '',
    servings: 3,
    category: '荤菜',
    tags: ['川菜', '辣味', '下饭菜'],
    ingredients: [
      { name: '鸡胸肉', amount: 300, unit: 'g' },
      { name: '花生米', amount: 50, unit: 'g' },
      { name: '干辣椒', amount: 10, unit: 'g' },
      { name: '花椒', amount: 3, unit: 'g' },
      { name: '葱段', amount: 30, unit: 'g' },
      { name: '姜片', amount: 5, unit: '片' },
      { name: '蒜瓣', amount: 3, unit: '瓣' },
      { name: '生抽', amount: 20, unit: 'ml' },
      { name: '老抽', amount: 10, unit: 'ml' },
      { name: '醋', amount: 15, unit: 'ml' },
      { name: '糖', amount: 10, unit: 'g' },
      { name: '淀粉', amount: 15, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '鸡胸肉切丁，用料酒、淀粉、盐腌制15分钟' },
      { order: 2, desc: '调碗汁：生抽、老抽、醋、糖、淀粉加水调匀' },
      { order: 3, desc: '锅中油热后下花生米炸至金黄酥脆，捞出备用' },
      { order: 4, desc: '锅中留底油，下干辣椒、花椒炒香' },
      { order: 5, desc: '放入鸡丁快速翻炒至变色' },
      { order: 6, desc: '加入葱姜蒜翻炒，倒入碗汁' },
      { order: 7, desc: '放入炸好的花生米翻炒均匀即可' }
    ]
  },
  {
    name: '麻婆豆腐',
    cover_image: '',
    servings: 2,
    category: '荤菜',
    tags: ['川菜', '麻辣', '豆腐'],
    ingredients: [
      { name: '嫩豆腐', amount: 400, unit: 'g' },
      { name: '猪肉末', amount: 100, unit: 'g' },
      { name: '郫县豆瓣酱', amount: 30, unit: 'g' },
      { name: '花椒粉', amount: 3, unit: 'g' },
      { name: '蒜末', amount: 10, unit: 'g' },
      { name: '姜末', amount: 5, unit: 'g' },
      { name: '葱花', amount: 20, unit: 'g' },
      { name: '生抽', amount: 10, unit: 'ml' },
      { name: '淀粉', amount: 15, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '豆腐切块，用盐水浸泡备用' },
      { order: 2, desc: '锅中热油，下肉末煸炒至变色' },
      { order: 3, desc: '下郫县豆瓣酱炒出红油' },
      { order: 4, desc: '加入姜蒜末炒香' },
      { order: 5, desc: '加入适量清水，放豆腐块轻轻推动' },
      { order: 6, desc: '加入生抽调味，小火煮3-5分钟' },
      { order: 7, desc: '用水淀粉勾芡，撒上花椒粉和葱花' }
    ]
  },
  {
    name: '番茄炒蛋',
    cover_image: '',
    servings: 2,
    category: '荤菜',
    tags: ['家常菜', '快手菜', '简单'],
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 3, unit: '个' },
      { name: '盐', amount: 3, unit: 'g' },
      { name: '糖', amount: 5, unit: 'g' },
      { name: '葱花', amount: 10, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '番茄切块，鸡蛋打散加少许盐' },
      { order: 2, desc: '锅中热油，倒入鸡蛋液炒至凝固盛出' },
      { order: 3, desc: '锅中再加油，下番茄块翻炒' },
      { order: 4, desc: '番茄出汁后加入糖和盐调味' },
      { order: 5, desc: '放入炒好的鸡蛋翻炒均匀' },
      { order: 6, desc: '撒上葱花出锅' }
    ]
  },
  {
    name: '鱼香肉丝',
    cover_image: '',
    servings: 3,
    category: '荤菜',
    tags: ['川菜', '酸甜', '下饭菜'],
    ingredients: [
      { name: '猪里脊肉', amount: 250, unit: 'g' },
      { name: '木耳', amount: 50, unit: 'g' },
      { name: '胡萝卜', amount: 50, unit: 'g' },
      { name: '青椒', amount: 50, unit: 'g' },
      { name: '郫县豆瓣酱', amount: 20, unit: 'g' },
      { name: '醋', amount: 15, unit: 'ml' },
      { name: '糖', amount: 15, unit: 'g' },
      { name: '生抽', amount: 15, unit: 'ml' },
      { name: '淀粉', amount: 15, unit: 'g' },
      { name: '蒜末', amount: 10, unit: 'g' },
      { name: '姜末', amount: 5, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '肉切丝，用料酒、淀粉、盐腌制' },
      { order: 2, desc: '木耳、胡萝卜、青椒切丝备用' },
      { order: 3, desc: '调碗汁：醋、糖、生抽、淀粉、水调匀' },
      { order: 4, desc: '锅中热油，下肉丝炒至变色盛出' },
      { order: 5, desc: '下豆瓣酱、蒜姜末炒香' },
      { order: 6, desc: '放入配菜翻炒，倒入肉丝' },
      { order: 7, desc: '倒入碗汁翻炒均匀即可' }
    ]
  },
  {
    name: '青椒土豆丝',
    cover_image: '',
    servings: 2,
    category: '素菜',
    tags: ['家常菜', '快手菜', '清淡'],
    ingredients: [
      { name: '土豆', amount: 2, unit: '个' },
      { name: '青椒', amount: 1, unit: '个' },
      { name: '干辣椒', amount: 5, unit: '个' },
      { name: '花椒', amount: 2, unit: 'g' },
      { name: '盐', amount: 3, unit: 'g' },
      { name: '醋', amount: 10, unit: 'ml' }
    ],
    steps: [
      { order: 1, desc: '土豆切丝，用清水冲洗掉淀粉' },
      { order: 2, desc: '青椒切丝，干辣椒切段' },
      { order: 3, desc: '锅中热油，下花椒、干辣椒段爆香' },
      { order: 4, desc: '放入土豆丝大火翻炒' },
      { order: 5, desc: '加入醋和盐调味' },
      { order: 6, desc: '放入青椒丝翻炒均匀即可' }
    ]
  },
  {
    name: '蒜蓉西兰花',
    cover_image: '',
    servings: 2,
    category: '素菜',
    tags: ['健康', '清淡', '快手菜'],
    ingredients: [
      { name: '西兰花', amount: 300, unit: 'g' },
      { name: '大蒜', amount: 20, unit: 'g' },
      { name: '盐', amount: 2, unit: 'g' },
      { name: '鸡精', amount: 2, unit: 'g' },
      { name: '橄榄油', amount: 15, unit: 'ml' }
    ],
    steps: [
      { order: 1, desc: '西兰花切成小朵，用盐水浸泡10分钟' },
      { order: 2, desc: '大蒜剁成蒜蓉' },
      { order: 3, desc: '锅中烧水，加少许盐和油' },
      { order: 4, desc: '放入西兰花焯水1分钟，捞出沥干' },
      { order: 5, desc: '锅中热油，下蒜蓉炒香' },
      { order: 6, desc: '放入西兰花翻炒，加盐和鸡精调味' }
    ]
  },
  {
    name: '酸辣土豆片',
    cover_image: '',
    servings: 2,
    category: '素菜',
    tags: ['家常菜', '酸辣', '下饭'],
    ingredients: [
      { name: '土豆', amount: 2, unit: '个' },
      { name: '干辣椒', amount: 10, unit: 'g' },
      { name: '花椒', amount: 3, unit: 'g' },
      { name: '白醋', amount: 30, unit: 'ml' },
      { name: '盐', amount: 3, unit: 'g' },
      { name: '葱花', amount: 10, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '土豆去皮，切成薄片' },
      { order: 2, desc: '用清水冲洗掉淀粉，沥干' },
      { order: 3, desc: '锅中热油，下花椒、干辣椒段' },
      { order: 4, desc: '放入土豆片大火翻炒' },
      { order: 5, desc: '沿锅边淋入白醋，翻炒均匀' },
      { order: 6, desc: '加盐调味，撒上葱花即可' }
    ]
  },
  {
    name: '西红柿鸡蛋汤',
    cover_image: '',
    servings: 3,
    category: '汤羹',
    tags: ['家常汤', '简单', '开胃'],
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 2, unit: '个' },
      { name: '葱花', amount: 10, unit: 'g' },
      { name: '盐', amount: 3, unit: 'g' },
      { name: '香油', amount: 5, unit: 'ml' },
      { name: '水', amount: 500, unit: 'ml' }
    ],
    steps: [
      { order: 1, desc: '番茄切块，鸡蛋打散' },
      { order: 2, desc: '锅中加水烧开，放入番茄块' },
      { order: 3, desc: '煮至番茄出汁，加盐调味' },
      { order: 4, desc: '慢慢倒入鸡蛋液，边倒边搅动' },
      { order: 5, desc: '关火，淋入香油' },
      { order: 6, desc: '撒上葱花即可' }
    ]
  },
  {
    name: '玉米排骨汤',
    cover_image: '',
    servings: 4,
    category: '汤羹',
    tags: ['养生汤', '清甜', '滋补'],
    ingredients: [
      { name: '排骨', amount: 400, unit: 'g' },
      { name: '玉米', amount: 2, unit: '根' },
      { name: '胡萝卜', amount: 1, unit: '根' },
      { name: '姜片', amount: 5, unit: '片' },
      { name: '料酒', amount: 20, unit: 'ml' },
      { name: '盐', amount: 5, unit: 'g' },
      { name: '葱花', amount: 10, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '排骨剁块，冷水下锅加料酒焯水' },
      { order: 2, desc: '玉米切段，胡萝卜切块' },
      { order: 3, desc: '砂锅中加水，放入排骨和姜片' },
      { order: 4, desc: '大火烧开后转小火炖40分钟' },
      { order: 5, desc: '加入玉米和胡萝卜' },
      { order: 6, desc: '继续炖20分钟，加盐调味' },
      { order: 7, desc: '撒上葱花即可' }
    ]
  },
  {
    name: '紫菜蛋花汤',
    cover_image: '',
    servings: 2,
    category: '汤羹',
    tags: ['快手汤', '简单', '家常'],
    ingredients: [
      { name: '紫菜', amount: 10, unit: 'g' },
      { name: '鸡蛋', amount: 2, unit: '个' },
      { name: '虾皮', amount: 10, unit: 'g' },
      { name: '盐', amount: 2, unit: 'g' },
      { name: '香油', amount: 5, unit: 'ml' },
      { name: '葱花', amount: 5, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '紫菜撕成小块，鸡蛋打散' },
      { order: 2, desc: '锅中加水烧开' },
      { order: 3, desc: '放入紫菜和虾皮煮1分钟' },
      { order: 4, desc: '慢慢倒入鸡蛋液' },
      { order: 5, desc: '加盐调味，淋入香油' },
      { order: 6, desc: '撒上葱花出锅' }
    ]
  },
  {
    name: '蛋炒饭',
    cover_image: '',
    servings: 2,
    category: '主食',
    tags: ['快手', '主食', '家常'],
    ingredients: [
      { name: '米饭', amount: 300, unit: 'g' },
      { name: '鸡蛋', amount: 2, unit: '个' },
      { name: '火腿肠', amount: 1, unit: '根' },
      { name: '胡萝卜', amount: 30, unit: 'g' },
      { name: '葱花', amount: 20, unit: 'g' },
      { name: '盐', amount: 3, unit: 'g' },
      { name: '生抽', amount: 10, unit: 'ml' }
    ],
    steps: [
      { order: 1, desc: '米饭打散，鸡蛋打散' },
      { order: 2, desc: '火腿肠、胡萝卜切丁' },
      { order: 3, desc: '锅中热油，先炒鸡蛋盛出' },
      { order: 4, desc: '锅中再加油，下火腿肠、胡萝卜丁' },
      { order: 5, desc: '放入米饭翻炒松散' },
      { order: 6, desc: '加入鸡蛋，放盐和生抽' },
      { order: 7, desc: '撒上葱花翻炒均匀' }
    ]
  },
  {
    name: '葱油拌面',
    cover_image: '',
    servings: 2,
    category: '主食',
    tags: ['上海菜', '简单', '快捷'],
    ingredients: [
      { name: '细面条', amount: 300, unit: 'g' },
      { name: '小葱', amount: 100, unit: 'g' },
      { name: '食用油', amount: 80, unit: 'ml' },
      { name: '生抽', amount: 40, unit: 'ml' },
      { name: '老抽', amount: 15, unit: 'ml' },
      { name: '糖', amount: 15, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '小葱切段，沥干水分' },
      { order: 2, desc: '锅中油烧至五成热，放入葱段' },
      { order: 3, desc: '小火慢慢熬至葱段焦黄' },
      { order: 4, desc: '过滤出葱油' },
      { order: 5, desc: '碗中放生抽、老抽、糖' },
      { order: 6, desc: '面条煮熟沥干，倒入酱汁和葱油拌匀' }
    ]
  },
  {
    name: '馒头',
    cover_image: '',
    servings: 6,
    category: '主食',
    tags: ['面食', '家常', '主食'],
    ingredients: [
      { name: '面粉', amount: 500, unit: 'g' },
      { name: '酵母', amount: 5, unit: 'g' },
      { name: '温水', amount: 250, unit: 'ml' },
      { name: '糖', amount: 10, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '酵母放入温水中化开' },
      { order: 2, desc: '面粉放入盆中，加入糖' },
      { order: 3, desc: '慢慢倒入酵母水，搅拌成絮状' },
      { order: 4, desc: '揉成光滑面团' },
      { order: 5, desc: '盖上保鲜膜，发酵至2倍大' },
      { order: 6, desc: '排气，揉成长条，切成剂子' },
      { order: 7, desc: '剂子揉圆，醒发15分钟' },
      { order: 8, desc: '冷水上锅，大火蒸15分钟' }
    ]
  },
  {
    name: '手抓饼',
    cover_image: '',
    servings: 2,
    category: '主食',
    tags: ['早餐', '快手', '香脆'],
    ingredients: [
      { name: '面粉', amount: 200, unit: 'g' },
      { name: '温水', amount: 120, unit: 'ml' },
      { name: '盐', amount: 2, unit: 'g' },
      { name: '食用油', amount: 30, unit: 'ml' },
      { name: '葱花', amount: 30, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '面粉加盐，用温水和成面团' },
      { order: 2, desc: '醒面15分钟' },
      { order: 3, desc: '面团擀成薄片，刷上油' },
      { order: 4, desc: '撒上葱花，从一边卷起' },
      { order: 5, desc: '卷起后盘成螺旋状' },
      { order: 6, desc: '再擀成薄饼' },
      { order: 7, desc: '锅中烙至两面金黄酥脆' }
    ]
  },
  {
    name: '凉拌黄瓜',
    cover_image: '',
    servings: 2,
    category: '素菜',
    tags: ['凉菜', '爽口', '家常'],
    ingredients: [
      { name: '黄瓜', amount: 2, unit: '根' },
      { name: '蒜末', amount: 10, unit: 'g' },
      { name: '香菜', amount: 10, unit: 'g' },
      { name: '辣椒油', amount: 15, unit: 'ml' },
      { name: '生抽', amount: 15, unit: 'ml' },
      { name: '醋', amount: 10, unit: 'ml' },
      { name: '盐', amount: 2, unit: 'g' },
      { name: '糖', amount: 5, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '黄瓜用刀拍碎，切成块' },
      { order: 2, desc: '放入碗中，加盐腌制10分钟' },
      { order: 3, desc: '倒掉腌制出的水分' },
      { order: 4, desc: '加入蒜末、香菜' },
      { order: 5, desc: '放入辣椒油、生抽、醋、糖' },
      { order: 6, desc: '拌匀即可食用' }
    ]
  },
  {
    name: '糖醋里脊',
    cover_image: '',
    servings: 3,
    category: '荤菜',
    tags: ['酸甜', '外酥里嫩', '家常'],
    ingredients: [
      { name: '猪里脊', amount: 300, unit: 'g' },
      { name: '面粉', amount: 50, unit: 'g' },
      { name: '淀粉', amount: 50, unit: 'g' },
      { name: '鸡蛋', amount: 1, unit: '个' },
      { name: '番茄酱', amount: 50, unit: 'g' },
      { name: '糖', amount: 30, unit: 'g' },
      { name: '醋', amount: 25, unit: 'ml' },
      { name: '盐', amount: 2, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '里脊切条，用盐腌制10分钟' },
      { order: 2, desc: '面粉、淀粉、鸡蛋加水调成糊' },
      { order: 3, desc: '里脊条裹上面糊' },
      { order: 4, desc: '油温六成热，下锅炸至金黄' },
      { order: 5, desc: '番茄酱、糖、醋、水调成汁' },
      { order: 6, desc: '锅中热汁，放入里脊翻炒' },
      { order: 7, desc: '快速翻炒均匀出锅' }
    ]
  },
  {
    name: '回锅肉',
    cover_image: '',
    servings: 3,
    category: '荤菜',
    tags: ['川菜', '家常', '香辣'],
    ingredients: [
      { name: '五花肉', amount: 300, unit: 'g' },
      { name: '青蒜', amount: 100, unit: 'g' },
      { name: '郫县豆瓣酱', amount: 30, unit: 'g' },
      { name: '豆豉', amount: 10, unit: 'g' },
      { name: '甜面酱', amount: 15, unit: 'g' },
      { name: '花椒', amount: 3, unit: 'g' },
      { name: '姜片', amount: 5, unit: '片' }
    ],
    steps: [
      { order: 1, desc: '五花肉冷水下锅，加姜片煮熟' },
      { order: 2, desc: '捞出放凉，切成薄片' },
      { order: 3, desc: '青蒜切段备用' },
      { order: 4, desc: '锅中热油，下肉片翻炒出油' },
      { order: 5, desc: '下豆瓣酱、豆豉、甜面酱炒香' },
      { order: 6, desc: '放入青蒜翻炒均匀' },
      { order: 7, desc: '出锅装盘' }
    ]
  },
  {
    name: '可乐鸡翅',
    cover_image: '',
    servings: 3,
    category: '荤菜',
    tags: ['家常菜', '甜味', '小朋友爱吃'],
    ingredients: [
      { name: '鸡翅中', amount: 500, unit: 'g' },
      { name: '可乐', amount: 330, unit: 'ml' },
      { name: '生抽', amount: 30, unit: 'ml' },
      { name: '老抽', amount: 10, unit: 'ml' },
      { name: '姜片', amount: 5, unit: '片' },
      { name: '葱段', amount: 2, unit: '根' },
      { name: '八角', amount: 1, unit: '个' }
    ],
    steps: [
      { order: 1, desc: '鸡翅洗净，在表面划两刀' },
      { order: 2, desc: '冷水下锅，加料酒焯水' },
      { order: 3, desc: '锅中热油，放入鸡翅煎至两面金黄' },
      { order: 4, desc: '加入姜片、葱段、八角' },
      { order: 5, desc: '倒入可乐，没过鸡翅' },
      { order: 6, desc: '加生抽、老抽，大火烧开' },
      { order: 7, desc: '转中小火炖15分钟，大火收汁' }
    ]
  },
  {
    name: '清炒油麦菜',
    cover_image: '',
    servings: 2,
    category: '素菜',
    tags: ['快手菜', '清淡', '健康'],
    ingredients: [
      { name: '油麦菜', amount: 400, unit: 'g' },
      { name: '大蒜', amount: 15, unit: 'g' },
      { name: '盐', amount: 2, unit: 'g' },
      { name: '鸡精', amount: 2, unit: 'g' }
    ],
    steps: [
      { order: 1, desc: '油麦菜洗净，切成段' },
      { order: 2, desc: '大蒜剁成蒜蓉' },
      { order: 3, desc: '锅中热油，下蒜蓉爆香' },
      { order: 4, desc: '放入油麦菜大火翻炒' },
      { order: 5, desc: '加盐和鸡精调味' },
      { order: 6, desc: '炒至断生即可出锅' }
    ]
  }
];

// 插入数据
const insert = db.prepare(`
  INSERT INTO recipes (id, name, cover_image, servings, category, tags, ingredients, steps, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
let count = 0;

for (const r of recipes) {
  const id = 'recipe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  try {
    insert.run(
      id,
      r.name,
      r.cover_image || '',
      r.servings,
      r.category,
      JSON.stringify(r.tags),
      JSON.stringify(r.ingredients),
      JSON.stringify(r.steps),
      now,
      now
    );
    count++;
    console.log(`✓ 已导入: ${r.name}`);
  } catch (e) {
    console.log(`✗ 失败: ${r.name} - ${e.message}`);
  }
}

console.log(`\n总计: 成功导入 ${count} 道菜谱`);
