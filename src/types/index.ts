// 食材
export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string; // g / ml / 个 / 片 / 根 / 适量
}

// 烹饪步骤
export interface Step {
  id: string;
  order: number;
  desc: string;
}

// 菜谱
export interface Recipe {
  id: string;
  name: string;
  coverImage?: string;
  servings: number;
  category: '荤菜' | '素菜' | '汤羹' | '主食' | '其他';
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  createdAt: number;
  updatedAt: number;
}

// 规划配置
export interface PlanConfig {
  servings: number;
  appetite: 'normal' | 'large' | 'small';
  avoidFoods: string;
  selectedRecipeIds: string[];
}

// 采购清单项
export interface ShoppingItem {
  name: string;
  totalAmount: number;
  unit: string;
  category: 'meat' | 'vegetable' | 'seasoning' | 'dry' | 'other';
  checked?: boolean;
}

// 烹饪步骤（AI生成）
export interface CookingStep {
  order: number;
  title: string;
  duration?: string;
  actions: string[];
  parallel?: string;
}

// AI 结果
export interface PlanResult {
  shopping_list: ShoppingItem[];
  cooking_guide: CookingStep[];
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 分类标签
export const CATEGORY_OPTIONS = ['荤菜', '素菜', '汤羹', '主食', '其他'] as const;

// 单位选项
export const UNIT_OPTIONS = ['g', 'kg', 'ml', 'L', '个', '片', '根', '勺', '适量'] as const;
