import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type { PlanConfig, PlanResult } from '../types';

interface PlanStore {
  selectedIds: string[];
  config: PlanConfig;
  result: PlanResult | null;
  loading: boolean;
  
  addRecipe: (id: string) => void;
  removeRecipe: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  
  setConfig: (partial: Partial<PlanConfig>) => void;
  setResult: (r: PlanResult | null) => void;
  setLoading: (v: boolean) => void;
}

const defaultConfig: PlanConfig = {
  servings: 2,
  appetite: 'normal',
  avoidFoods: '',
  selectedRecipeIds: [],
};

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      config: defaultConfig,
      result: null,
      loading: false,

      addRecipe: (id: string) => {
        const { selectedIds } = get();
        if (!selectedIds.includes(id)) {
          set({ selectedIds: [...selectedIds, id] });
        }
      },

      removeRecipe: (id: string) => {
        const { selectedIds } = get();
        set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
      },

      clearAll: () => set({ selectedIds: [], result: null }),

      isSelected: (id: string) => get().selectedIds.includes(id),

      setConfig: (partial: Partial<PlanConfig>) => {
        const { config } = get();
        set({ config: { ...config, ...partial } });
      },

      setResult: (r: PlanResult | null) => set({ result: r }),
      setLoading: (v: boolean) => set({ loading: v }),
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => Taro.getStorageSyncAdapter()),
    }
  )
);
