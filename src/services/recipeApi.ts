import request from './request';
import type { Recipe, ApiResponse, FavoriteFolder, FavoriteFolderWithRecipes, PantryItem } from '../types';

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

  // ========== 收藏夹 API ==========
  // 获取所有收藏夹
  getFolders: () => 
    request.get<ApiResponse<FavoriteFolder[]>>('/favorites'),
  
  // 创建收藏夹
  createFolder: (name: string) => 
    request.post<ApiResponse<FavoriteFolder>>('/favorites', { name }),
  
  // 获取收藏夹内的菜谱
  getFolderRecipes: (folderId: string) => 
    request.get<ApiResponse<FavoriteFolderWithRecipes>>(`/favorites/${folderId}`),
  
  // 添加菜谱到收藏夹
  addToFolder: (folderId: string, recipeId: string) => 
    request.post<ApiResponse<null>>(`/favorites/${folderId}/add`, { recipeId }),
  
  // 从收藏夹移除菜谱
  removeFromFolder: (folderId: string, recipeId: string) => 
    request.delete<ApiResponse<null>>(`/favorites/${folderId}/remove/${recipeId}`),

  // ========== 食材库存 API ==========
  // 获取库存列表
  getPantry: () => 
    request.get<ApiResponse<PantryItem[]>>('/pantry'),
  
  // 添加食材到库存
  addPantryItem: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => 
    request.post<ApiResponse<PantryItem>>('/pantry', item),
  
  // 更新库存食材
  updatePantryItem: (id: string, item: Partial<PantryItem>) => 
    request.put<ApiResponse<PantryItem>>(`/pantry/${id}`, item),
  
  // 删除库存食材
  deletePantryItem: (id: string) => 
    request.delete<ApiResponse<null>>(`/pantry/${id}`),
  
  // 清空库存
  clearPantry: () => 
    request.post<ApiResponse<null>>('/pantry/clear'),
};

export default recipeApi;
