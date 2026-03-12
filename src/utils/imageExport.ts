import Taro from '@tarojs/taro';
import type { ShoppingItem, CookingStep } from '../types';

interface ExportOptions {
  title: string;
  shoppingList?: ShoppingItem[];
  cookingGuide?: CookingStep[];
}

// 导出长图（简化版，完整实现需使用 wxml-to-canvas 或原生 Canvas）
export async function exportToImage(options: ExportOptions): Promise<string> {
  const { title, shoppingList, cookingGuide } = options;

  // 检查权限
  const setting = await Taro.getSetting();
  if (!setting.authSetting['scope.writePhotosAlbum']) {
    const auth = await Taro.authorize({ scope: 'scope.writePhotosAlbum' });
    if (!auth) {
      Taro.showModal({
        title: '提示',
        content: '需要相册权限才能保存图片，是否前往设置？',
        success: (res) => {
          if (res.confirm) {
            Taro.openSetting();
          }
        },
      });
      return '';
    }
  }

  // TODO: 使用 wxml-to-canvas 或原生 Canvas 绘制
  // 这里返回空字符串，实际需要实现 Canvas 绘制逻辑
  Taro.showToast({
    title: '长图功能开发中',
    icon: 'none',
  });
  
  return '';
}

// 保存图片到相册
export async function saveToAlbum(filePath: string): Promise<boolean> {
  try {
    await Taro.saveImageToPhotosAlbum({ filePath });
    Taro.showToast({ title: '已保存到相册', icon: 'success' });
    return true;
  } catch (error) {
    console.error('保存图片失败:', error);
    Taro.showToast({ title: '保存失败', icon: 'none' });
    return false;
  }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Taro.setClipboardData({ data: text });
    Taro.showToast({ title: '已复制', icon: 'success' });
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    Taro.showToast({ title: '复制失败', icon: 'none' });
    return false;
  }
}
