const db = require('../models/db');

// 更多菜谱数据
const recipes = [
  // 猪肉类
  {name:'红烧狮子头',servings:4,category:'荤菜',tags:['淮扬菜','大肉丸'],ingredients:[{name:'猪肉',amount:500,unit:'g'},{name:'马蹄',amount:100,unit:'g'},{name:'淀粉',amount:50,unit:'g'}],steps:[{order:1,desc:'猪肉剁馅加马蹄淀粉搅拌'},{order:2,desc:'做成大肉圆油炸'},{order:3,desc:'红烧1小时'}]},
  {name:'无锡排骨',servings:4,category:'荤菜',tags:['苏帮菜','酥烂'],ingredients:[{name:'排骨',amount:600,unit:'g'},{name:'冰糖',amount:60,unit:'g'},{name:'生抽',amount:40,unit:'ml'}],steps:[{order:1,desc:'排骨斩段炒糖色'},{order:2,desc:'放排骨翻炒'},{order:3,desc:'小火烧1小时'}]},
  {name:'肉夹馍',servings:4,category:'主食',tags:['陕西','小吃'],ingredients:[{name:'五花肉',amount:500,unit:'g'},{name:'面粉',amount:400,unit:'g'},{name:'青椒',amount:100,unit:'g'}],steps:[{order:1,desc:'红烧肉卤制'},{order:2,desc:'和面做馍烤制'},{order:3,desc:'夹入肉和青椒'}]},
  {name:'京酱肉丝',servings:2,category:'荤菜',tags:['京菜','甜面酱'],ingredients:[{name:'猪里脊',amount:300,unit:'g'},{name:'甜面酱',amount:30,unit:'g'},{name:'豆皮',amount:100,unit:'g'}],steps:[{order:1,desc:'肉切丝滑炒'},{order:2,desc:'甜面酱炒香'},{order:3,desc:'配豆皮葱丝'}]},
  {name:'木须肉',servings:2,category:'荤菜',tags:['北方','家常'],ingredients:[{name:'猪里脊',amount:200,unit:'g'},{name:'鸡蛋',amount:2,unit:'个'},{name:'木耳',amount:50,unit:'g'}],steps:[{order:1,desc:'炒鸡蛋盛出'},{order:2,desc:'炒肉片'},{order:3,desc:'放鸡蛋木耳'}]},
  {name:'黑椒牛排',servings:2,category:'荤菜',tags:['西餐','煎制'],ingredients:[{name:'牛排',amount:300,unit:'g'},{name:'黑胡椒',amount:10,unit:'g'},{name:'黄油',amount:30,unit:'g'}],steps:[{order:1,desc:'牛排撒盐黑胡椒'},{order:2,desc:'黄油煎牛排'},{order:3,desc:'煎至所需熟度'}]},
  {name:'土豆烧牛肉',servings:4,category:'荤菜',tags:['家常','炖菜'],ingredients:[{name:'牛腩',amount:500,unit:'g'},{name:'土豆',amount:300,unit:'g'},{name:'胡萝卜',amount:200,unit:'g'}],steps:[{order:1,desc:'牛肉切块焯水'},{order:2,desc:'炒香蔬菜'},{order:3,desc:'放牛肉加水炖1.5小时'}]},
  {name:'咖喱牛肉',servings:4,category:'荤菜',tags:['西餐','咖喱'],ingredients:[{name:'牛肉',amount:500,unit:'g'},{name:'咖喱块',amount:50,unit:'g'},{name:'土豆',amount:200,unit:'g'}],steps:[{order:1,desc:'牛肉切块'},{order:2,desc:'炒香蔬菜'},{order:3,desc:'加咖喱块炖1小时'}]},
  {name:'红烧羊肉',servings:4,category:'荤菜',tags:['冬季','温补'],ingredients:[{name:'羊肉',amount:600,unit:'g'},{name:'胡萝卜',amount:200,unit:'g'},{name:'八角',amount:3,unit:'个'}],steps:[{order:1,desc:'羊肉切块焯水'},{order:2,desc:'炒香调料'},{order:3,desc:'加胡萝卜小火烧1.5小时'}]},
  {name:'葱爆羊肉',servings:2,category:'荤菜',tags:['鲁菜','葱香'],ingredients:[{name:'羊肉',amount:300,unit:'g'},{name:'大葱',amount:200,unit:'g'},{name:'盐',amount:3,unit:'g'}],steps:[{order:1,desc:'羊肉切片'},{order:2,desc:'大葱切段'},{order:3,desc:'爆炒'}]},
  {name:'手抓羊肉',servings:4,category:'荤菜',tags:['西北','原味'],ingredients:[{name:'羊排',amount:800,unit:'g'},{name:'姜',amount:20,unit:'g'},{name:'葱',amount:20,unit:'g'},{name:'盐',amount:10,unit:'g'}],steps:[{order:1,desc:'羊排斩段'},{order:2,desc:'加姜葱煮1小时'},{order:3,desc:'捞出撒盐'}]},
  {name:'羊肉汤',servings:4,category:'汤羹',tags:['冬季','暖身'],ingredients:[{name:'羊肉',amount:500,unit:'g'},{name:'白萝卜',amount:300,unit:'g'},{name:'姜',amount:15,unit:'g'}],steps:[{order:1,desc:'羊肉焯水'},{order:2,desc:'加萝卜姜炖2小时'},{order:3,desc:'调味'}]},
  {name:'羊蝎子火锅',servings:4,category:'荤菜',tags:['火锅','冬季','特色'],ingredients:[{name:'羊蝎子',amount:1000,unit:'g'},{name:'火锅底料',amount:100,unit:'g'},{name:'辣椒',amount:30,unit:'g'}],steps:[{order:1,desc:'羊蝎子焯水'},{order:2,desc:'炒香底料'},{order:3,desc:'加水炖1小时'},{order:4,desc:'涮菜食用'}]},
  // 鸡鸭鹅
  {name:'啤酒鸭',servings:4,category:'荤菜',tags:['湘菜','啤酒','浓郁'],ingredients:[{name:'鸭肉',amount:600,unit:'g'},{name:'啤酒',amount:330,unit:'ml'},{name:'青椒',amount:100,unit:'g'},{name:'红椒',amount:50,unit:'g'}],steps:[{order:1,desc:'鸭肉斩块焯水'},{order:2,desc:'炒香调料'},{order:3,desc:'加啤酒炖30分钟'},{order:4,desc:'加青红椒'}]},
  {name:'老鸭汤',servings:4,category:'汤羹',tags:['养生','清淡'],ingredients:[{name:'老鸭',amount:800,unit:'g'},{name:'酸萝卜',amount:200,unit:'g'},{name:'姜',amount:15,unit:'g'}],steps:[{order:1,desc:'老鸭斩块焯水'},{order:2,desc:'加酸萝卜炖2小时'}]},
  {name:'盐水鸭',servings:4,category:'荤菜',tags:['南京','盐水','特色'],ingredients:[{name:'鸭子',amount:1200,unit:'g'},{name:'盐',amount:100,unit:'g'},{name:'花椒',amount:10,unit:'g'},{name:'葱姜',amount:30,unit:'g'}],steps:[{order:1,desc:'盐和花椒炒热'},{order:2,desc:'鸭身擦盐'},{order:3,desc:'腌制24小时'},{order:4,desc:'煮40分钟'}]},
  {name:'烤鸭',servings:4,category:'荤菜',tags:['北京','挂炉','经典'],ingredients:[{name:'鸭子',amount:1500,unit:'g'},{name:'麦芽糖',amount:50,unit:'g'},{name:'蜂蜜',amount:30,unit:'ml'}],steps:[{order:1,desc:'鸭子处理'},{order:2,desc:'烫皮刷糖水'},{order:3,desc:'风干'},{order:4,desc:'烤箱烤1小时'}]},
  {name:'烧鸭',servings:4,category:'荤菜',tags:['粤菜','烧腊'],ingredients:[{name:'鸭',amount:1200,unit:'g'},{name:'叉烧酱',amount:50,unit:'g'},{name:'蜂蜜',amount:30,unit:'ml'}],steps:[{order:1,desc:'鸭子腌制'},{order:2,desc:'上皮水'},{order:3,desc:'风干'},{order:4,desc:'烤制'}]},
  // 鱼虾更多
  {name:'干烧黄鱼',servings:2,category:'荤菜',tags:['川菜','干香'],ingredients:[{name:'黄鱼',amount:400,unit:'g'},{name:'五花肉',amount:50,unit:'g'},{name:'郫县豆瓣酱',amount:20,unit:'g'}],steps:[{order:1,desc:'黄鱼两面煎黄'},{order:2,desc:'炒肉末豆瓣酱'},{order:3,desc:'放鱼烧10分钟'}]},
  {name:'豆瓣鱼',servings:2,category:'荤菜',tags:['川菜','家常'],ingredients:[{name:'鲫鱼',amount:400,unit:'g'},{name:'郫县豆瓣酱',amount:30,unit:'g'},{name:'姜蒜',amount:20,unit:'g'}],steps:[{order:1,desc:'鱼煎至两面金黄'},{order:2,desc:'炒豆瓣酱姜蒜'},{order:3,desc:'加水烧15分钟'}]},
  {name:'番茄鱼',servings:3,category:'荤菜',tags:['酸甜','家常'],ingredients:[{name:'鱼片',amount:400,unit:'g'},{name:'番茄',amount:300,unit:'g'},{name:'番茄酱',amount:30,unit:'g'}],steps:[{order:1,desc:'炒番茄'},{order:2,desc:'加水煮汤'},{order:3,desc:'放入鱼片'}]},
  {name:'剁椒鱼头',servings:3,category:'荤菜',tags:['湘菜','剁椒','蒸菜'],ingredients:[{name:'鱼头',amount:600,unit:'g'},{name:'剁椒',amount:80,unit:'g'},{name:'姜蒜',amount:20,unit:'g'}],steps:[{order:1,desc:'鱼头洗净'},{order:2,desc:'铺上剁椒姜蒜'},{order:3,desc:'蒸15分钟'},{order:4,desc:'浇热油'}]},
  {name:'麻辣小龙虾',servings:4,category:'荤菜',tags:['夏季','宵夜','麻辣'],ingredients:[{name:'小龙虾',amount:1500,unit:'g'},{name:'干辣椒',amount:50,unit:'g'},{name:'花椒',amount:20,unit:'g'},{name:'郫县豆瓣酱',amount:60,unit:'g'}],steps:[{order:1,desc:'小龙虾刷净'},{order:2,desc:'炒香调料'},{order:3,desc:'放入小龙虾翻炒'},{order:4,desc:'加啤酒焖10分钟'}]},
  {name:'十三香小龙虾',servings:4,category:'荤菜',tags:['江苏','十三香','宵夜'],ingredients:[{name:'小龙虾',amount:1500,unit:'g'},{name:'十三香粉',amount:30,unit:'g'},{name:'干辣椒',amount:30,unit:'g'}],steps:[{order:1,desc:'小龙虾处理干净'},{order:2,desc:'炒香调料'},{order:3,desc:'放入虾翻炒'},{order:4,desc:'加十三香焖煮'}]},
  {name:'蒜蓉小龙虾',servings:4,category:'荤菜',tags:['蒜香','夏季'],ingredients:[{name:'小龙虾',amount:1500,unit:'g'},{name:'大蒜',amount:150,unit:'g'},{name:'啤酒',amount:330,unit:'ml'}],steps:[{order:1,desc:'小龙虾处理'},{order:2,desc:'炒香蒜蓉'},{order:3,desc:'放入虾翻炒'},{order:4,desc:'加啤酒焖'}]},
  // 素菜更多
  {name:'虎皮青椒',servings:2,category:'素菜',tags:['湘菜','家常'],ingredients:[{name:'青椒',amount:300,unit:'g'},{name:'豆豉',amount:10,unit:'g'},{name:'蒜',amount:15,unit:'g'}],steps:[{order:1,desc:'青椒拍松'},{order:2,desc:'干炒至虎皮状'},{order:3,desc:'加豆豉蒜末'}]},
  {name:'酿青椒',servings:3,category:'荤菜',tags:['客家','酿菜'],ingredients:[{name:'青椒',amount:300,unit:'g'},{name:'猪肉',amount:200,unit:'g'},{name:'淀粉',amount:30,unit:'g'}],steps:[{order:1,desc:'肉剁馅调味'},{order:2,desc:'青椒去籽'},{order:3,desc:'酿入肉馅'},{order:4,desc:'煎或蒸'}]},
  {name:'干煸四季豆',servings:2,category:'素菜',tags:['川菜','干香'],ingredients:[{name:'四季豆',amount:300,unit:'g'},{name:'干辣椒',amount:15,unit:'g'},{name:'花椒',amount:5,unit:'g'},{name:'肉末',amount:50,unit:'g'}],steps:[{order:1,desc:'四季豆切段'},{order:2,desc:'干煸至皱皮'},{order:3,desc:'加肉末调料'}]},
  {name:'四季豆炒肉',servings:2,category:'荤菜',tags:['家常','清淡'],ingredients:[{name:'四季豆',amount:300,unit:'g'},{name:'猪肉',amount:150,unit:'g'},{name:'蒜',amount:10,unit:'g'}],steps:[{order:1,desc:'四季豆切丝'},{order:2,desc:'炒肉丝'},{order:3,desc:'放四季豆'}]},
  {name:'豆角烧茄子',servings:2,category:'素菜',tags:['家常','软糯'],ingredients:[{name:'豆角',amount:200,unit:'g'},{name:'茄子',amount:200,unit:'g'},{name:'蒜',amount:15,unit:'g'}],steps:[{order:1,desc:'豆角茄子切段'},{order:2,desc:'分别过油'},{order:3,desc:'一起烧5分钟'}]},
  {name:'炝炒圆白菜',servings:2,category:'素菜',tags:['快手','家常'],ingredients:[{name:'圆白菜',amount:300,unit:'g'},{name:'干辣椒',amount:10,unit:'g'},{name:'花椒',amount:3,unit:'g'}],steps:[{order:1,desc:'圆白菜手撕'},{order:2,desc:'炝锅'},{order:3,desc:'炒圆白菜'}]},
  {name:'粉丝娃娃菜',servings:2,category:'素菜',tags:['蒸菜','清淡'],ingredients:[{name:'娃娃菜',amount:2,unit:'棵'},{name:'粉丝',amount:100,unit:'g'},{name:'蒜蓉',amount:30,unit:'g'}],steps:[{order:1,desc:'娃娃菜切开'},{order:2,desc:'铺粉丝'},{order:3,desc:'撒蒜蓉'},{order:4,desc:'蒸10分钟'}]},
  // 豆制品更多
  {name:'臭豆腐',servings:2,category:'素菜',tags:['长沙','小吃','油炸'],ingredients:[{name:'豆腐',amount:400,unit:'g'},{name:'臭豆腐乳',amount:30,unit:'g'},{name:'辣椒油',amount:20,unit:'ml'}],steps:[{order:1,desc:'豆腐切块'},{order:2,desc:'裹臭豆腐乳'},{order:3,desc:'油炸至金黄'},{order:4,desc:'配辣椒油食用'}]},
  {name:'豆腐脑',servings:2,category:'素菜',tags:['早餐','咸鲜'],ingredients:[{name:'内酯豆腐',amount:1,unit:'盒'},{name:'榨菜',amount:30,unit:'g'},{name:'虾皮',amount:20,unit:'g'},{name:'酱油',amount:15,unit:'ml'}],steps:[{order:1,desc:'豆腐蒸热'},{order:2,desc:'浇上调料'},{order:3,desc:'撒榨菜虾皮'}]},
  {name:'豆浆',servings:2,category:'饮品',tags:['早餐','营养'],ingredients:[{name:'黄豆',amount:100,unit:'g'},{name:'水',amount:1000,unit:'ml'}],steps:[{order:1,desc:'黄豆泡发'},{order:2,desc:'打成豆浆'},{order:3,desc:'煮沸'}]},
  // 更多凉菜
  {name:'凉拌海带丝',servings:2,category:'素菜',tags:['凉菜','爽口'],ingredients:[{name:'海带',amount:200,unit:'g'},{name:'蒜',amount:15,unit:'g'},{name:'辣椒油',amount:15,unit:'ml'}],steps:[{order:1,desc:'海带切丝焯水'},{order:2,desc:'加蒜末辣椒油'},{order:3,desc:'拌匀'}]},
  {name:'凉拌粉丝',servings:2,category:'素菜',tags:['凉菜','爽滑'],ingredients:[{name:'粉丝',amount:150,unit:'g'},{name:'黄瓜',amount:100,unit:'g'},{name:'蒜',amount:15,unit:'g'}],steps:[{order:1,desc:'粉丝泡软焯水'},{order:2,desc:'黄瓜切丝'},{order:3,desc:'加调料拌匀'}]},
  {name:'卤花生',servings:4,category:'素菜',tags:['下酒','卤味'],ingredients:[{name:'花生',amount:500,unit:'g'},{name:'八角',amount:3,unit:'个'},{name:'桂皮',amount:1,unit:'块'},{name:'盐',amount:20,unit:'g'}],steps:[{order:1,desc:'花生洗净'},{order:2,desc:'加香料盐水煮30分钟'},{order:3,desc:'泡2小时'}]},
  {name:'卤鸡蛋',servings:4,category:'荤菜',tags:['卤味','早餐'],ingredients:[{name:'鸡蛋',amount:10,unit:'个'},{name:'茶叶',amount:10,unit:'g'},{name:'生抽',amount:50,unit:'ml'},{name:'老抽',amount:20,unit:'ml'}],steps:[{order:1,desc:'鸡蛋煮熟去壳'},{order:2,desc:'加茶叶酱油卤30分钟'},{order:3,desc:'泡2小时'}]},
  // 更多主食
  {name:'石锅拌饭',servings:2,category:'主食',tags:['韩国','拌饭','丰富'],ingredients:[{name:'米饭',amount:300,unit:'g'},{name:'鸡蛋',amount:1,unit:'个'},{name:'韩式辣酱',amount:30,unit:'g'},{name:'蔬菜',amount:100,unit:'g'}],steps:[{order:1,desc:'米饭装石锅'},{order:2,desc:'铺上蔬菜'},{order:3,desc:'煎荷包蛋'},{order:4,desc:'拌饭食用'}]},
  {name:'日式拉面',servings:2,category:'主食',tags:['日本','豚骨','汤面'],ingredients:[{name:'拉面',amount:300,unit:'g'},{name:'猪骨汤',amount:500,unit:'ml'},{name:'叉烧',amount:100,unit:'g'},{name:'溏心蛋',amount:2,unit:'个'}],steps:[{order:1,desc:'煮拉面'},{order:2,desc:'盛入猪骨汤'},{order:3,desc:'放叉烧溏心蛋'}]},
  {name:'意式番茄面',servings:2,category:'主食',tags:['意大利','番茄','西餐'],ingredients:[{name:'意大利面',amount:300,unit:'g'},{name:'番茄',amount:300,unit:'g'},{name:'大蒜',amount:15,unit:'g'},{name:'罗勒',amount:10,unit:'g'}],steps:[{order:1,desc:'煮意面'},{order:2,desc:'炒番茄蒜蓉'},{order:3,desc:'拌面'},{order:4,desc:'撒罗勒'}]},
  {name:'披萨',servings:4,category:'主食',tags:['意大利','烤箱','西餐'],ingredients:[{name:'面粉',amount:300,unit:'g'},{name:'酵母',amount:5,unit:'g'},{name:'番茄酱',amount:50,unit:'g'},{name:'马苏里拉',amount:200,unit:'g'}],steps:[{order:1,desc:'和面发酵'},{order:2,desc:'擀成饼底'},{order:3,desc:'抹番茄酱放芝士'},{order:4,desc:'烤15分钟'}]},
  {name:'汉堡',servings:2,category:'主食',tags:['西式','快餐','牛肉'],ingredients:[{name:'面包',amount:2,unit:'个'},{name:'牛肉饼',amount:200,unit:'g'},{name:'生菜',amount:50,unit:'g'},{name:'芝士',amount:2,unit:'片'}],steps:[{order:1,desc:'煎牛肉饼'},{order:2,desc:'面包烤一下'},{order:3,desc:'夹入生菜芝士'}]},
  // 更多汤类
  {name:'罗宋汤',servings:4,category:'汤羹',tags:['西式','俄罗斯','浓郁'],ingredients:[{name:'牛肉',amount:300,unit:'g'},{name:'番茄',amount:200,unit:'g'},{name:'土豆',amount:150,unit:'g'},{name:'胡萝卜',amount:100,unit:'g'}],steps:[{order:1,desc:'牛肉切块炖'},{order:2,desc:'加蔬菜'},{order:3,desc:'煮至软烂'}]},
  {name:'奶油蘑菇汤',servings:2,category:'汤羹',tags:['西餐','法式','浓郁'],ingredients:[{name:'蘑菇',amount:200,unit:'g'},{name:'奶油',amount:50,unit:'g'},{name:'牛奶',amount:200,unit:'ml'},{name:'洋葱',amount:50,unit:'g'}],steps:[{order:1,desc:'炒蘑菇洋葱'},{order:2,desc:'加牛奶煮'},{order:3,desc:'加入奶油'}]},
  {name:'南瓜汤',servings:3,category:'汤羹',tags:['西餐','秋季','甜香'],ingredients:[{name:'南瓜',amount:400,unit:'g'},{name:'牛奶',amount:200,unit:'ml'},{name:'奶油',amount:30,unit:'g'}],steps:[{order:1,desc:'南瓜蒸熟'},{order:2,desc:'打成泥'},{order:3,desc:'加牛奶奶油煮'}]}
];

const insert = db.prepare(`
  INSERT INTO recipes (id, name, cover_image, servings, category, tags, ingredients, steps, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
let count = 0;

for (const r of recipes) {
  const id = 'recipe_' + now + '_' + Math.random().toString(36).substr(2, 9);
  try {
    insert.run(id, r.name, '', r.servings, r.category, JSON.stringify(r.tags), JSON.stringify(r.ingredients), JSON.stringify(r.steps), now, now);
    count++;
    console.log(`✓ ${r.name}`);
  } catch (e) {
    console.log(`✗ ${r.name}: ${e.message}`);
  }
}

console.log(`\n✅ 成功导入 ${count} 道菜谱！`);
