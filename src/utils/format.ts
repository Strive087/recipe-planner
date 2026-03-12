import Taro from '@tarojs/taro';
import type { ShoppingItem } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  meat: '🥩 肉类',
  vegetable: '🥬 蔬菜',
  seasoning: '🧂 调味品',
  dry: '🥫 干货',
  other: '📦 其他',
};

export function formatShoppingListText(list: ShoppingItem[]): string {
  const grouped = list.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return Object.entries(grouped)
    .map(([cat, items]) => {
      const header = CATEGORY_LABELS[cat] || `【${cat}】`;
      const rows = items.map((i) => `  • ${i.name} ${i.totalAmount}${i.unit}`).join('\n');
      return `${header}\n${rows}`;
    })
    .join('\n\n');
}

export function formatCookingGuideText(
  guide: Array<{ order: number; title: string; duration?: string; actions: string[]; parallel?: string }>
): string {
  return guide
    .map((step) => {
      let text = `${step.order}. ${step.title}`;
      if (step.duration) {
        text += ` (${step.duration})`;
      }
      text += '\n';
      step.actions.forEach((action) => {
        text += `   • ${action}\n`;
      });
      if (step.parallel) {
        text += `   💡 ${step.parallel}\n`;
      }
      return text;
    })
    .join('\n');
}
