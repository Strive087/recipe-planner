import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type { Recipe } from '../types';
import { recipeApi, type Category } from '../services/recipeApi';

interface RecipeStore {
  recipes: Recipe[];
  categories: Category[];
  keyword: string;
  activeCategory: string;
  isLoading: boolean;
  loadRecipes: () => Promise<void>;
  loadCategories: () => Promise<void>;
  searchRecipes: (keyword: string) => Promise<void>;
  filterByCategory: (category: string) => Promise<void>;
  upsertRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  setKeyword: (kw: string) => void;
  setActiveCategory: (cat: string) => void;
  filteredRecipes: () => Recipe[];
  getById: (id: string) => Recipe | undefined;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      categories: [
        { key: '', label: '全部' },
        { key: '荤菜', label: '荤菜' },
        { key: '素菜', label: '素菜' },
        { key: '汤羹', label: '汤羹' },
        { key: '主食', label: '主食' },
        { key: '其他', label: '其他' },
      ],
      keyword: '',
      activeCategory: '',
      isLoading: false,

      loadRecipes: async () => {
        set({ isLoading: true });
        try {
          const res = await recipeApi.getList();
          if (res.data) {
            set({ recipes: res.data });
          }
        } catch (e) {
          console.error('Failed to load recipes:', e);
          // 降级到本地存储
          try {
            const data = Taro.getStorageSync('recipes');
            if (data) {
              set({ recipes: JSON.parse(data) });
            }
          } catch (err) {
            console.error('Failed to load local recipes:', err);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      loadCategories: async () => {
        try {
          const res = await recipeApi.getCategories();
          if (res.data && res.data.length > 0) {
            set({ categories: [{ key: '', label: '全部' }, ...res.data] });
          }
        } catch (e) {
          console.error('Failed to load categories:', e);
        }
      },

      searchRecipes: async (keyword: string) => {
        set({ isLoading: true, keyword });
        try {
          const res = await recipeApi.search(keyword);
          if (res.data) {
            set({ recipes: res.data });
          }
        } catch (e) {
          console.error('Search failed:', e);
          // 降级到本地搜索
          const { recipes } = get();
          const filtered = recipes.filter((r) =>
            r.name.toLowerCase().includes(keyword.toLowerCase())
          );
          set({ recipes: filtered });
        } finally {
          set({ isLoading: false });
        }
      },

      filterByCategory: async (category: string) => {
        set({ isLoading: true, activeCategory: category });
        try {
          const res = await recipeApi.getList(category);
          if (res.data) {
            set({ recipes: res.data });
          }
        } catch (e) {
          console.error('Filter failed:', e);
          // 降级到本地筛选
          const { recipes } = get();
          const filtered = category
            ? recipes.filter((r) => r.category === category)
            : recipes;
          set({ recipes: filtered });
        } finally {
          set({ isLoading: false });
        }
      },

      upsertRecipe: (recipe: Recipe) => {
        const { recipes } = get();
        const index = recipes.findIndex((r) => r.id === recipe.id);
        let newRecipes: Recipe[];

        if (index >= 0) {
          newRecipes = [...recipes];
          newRecipes[index] = recipe;
        } else {
          newRecipes = [...recipes, recipe];
        }

        set({ recipes: newRecipes });
        Taro.setStorageSync('recipes', JSON.stringify(newRecipes));
      },

      deleteRecipe: (id: string) => {
        const { recipes } = get();
        const newRecipes = recipes.filter((r) => r.id !== id);
        set({ recipes: newRecipes });
        Taro.setStorageSync('recipes', JSON.stringify(newRecipes));
      },

      setKeyword: (kw: string) => set({ keyword: kw }),

      setActiveCategory: (cat: string) => {
        set({ activeCategory: cat });
        // 触发分类筛选
        get().filterByCategory(cat);
      },

      filteredRecipes: () => {
        const { recipes, keyword, activeCategory } = get();
        return recipes.filter((r) => {
          const matchKeyword = !keyword || r.name.toLowerCase().includes(keyword.toLowerCase());
          const matchCategory = !activeCategory || r.category === activeCategory;
          return matchKeyword && matchCategory;
        });
      },

      getById: (id: string) => {
        const { recipes } = get();
        return recipes.find((r) => r.id === id);
      },
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => Taro.getStorageSyncAdapter()),
      partialize: (state) => ({
        recipes: state.recipes,
        categories: state.categories,
      }),
    }
  )
);
