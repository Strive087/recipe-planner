import request from './request';
import type { Recipe, ApiResponse } from '../types';

export interface Category {
  key: string;
  label: string;
}

export const recipeApi = {
  // 获取菜谱列表
  getList: (category?: string) => 
    request.get<ApiResponse<Recipe[]>>('/recipes', { category } as any),
  
  // 搜索菜谱
  search: (q: string) => 
    request.get<ApiResponse<Recipe[]>>('/recipes/search', { q } as any),
  
  // 获取分类列表
  getCategories: () => 
    request.get<ApiResponse<Category[]>>('/categories'),
  
  // 获取单个菜谱
  getById: (id: string) => 
    request.get<ApiResponse<Recipe>>(`/recipes/${id}`),
  
  // 保存菜谱
  save: (recipe: Recipe) => 
    request.post<ApiResponse<Recipe>>('/recipes', recipe),
  
  // 删除菜谱
  delete: (id: string) => 
    request.delete<ApiResponse<null>>(`/recipes/${id}`),
  
  // 收藏菜谱
  favorite: (id: string) => 
    request.post<ApiResponse<{ favorited: boolean }>>(`/recipes/${id}/favorite`),
  
  // 取消收藏
  unfavorite: (id: string) => 
    request.delete<ApiResponse<{ favorited: boolean }>>(`/recipes/${id}/favorite`),
};

export default recipeApi;
