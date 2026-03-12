import { defineAppConfig } from '@tarojs/taro';

export default defineAppConfig({
  pages: [
    'pages/recipe-list/index',
    'pages/recipe-detail/index',
    'pages/recipe-edit/index',
    'pages/plan-setting/index',
    'pages/plan-result/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A3C6E',
    navigationBarTitleText: '菜谱规划助手',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#2E75B6',
    list: [
      {
        pagePath: 'pages/recipe-list/index',
        text: '菜谱库',
        iconPath: 'assets/tab-recipe.png',
        selectedIconPath: 'assets/tab-recipe-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-me.png',
        selectedIconPath: 'assets/tab-me-active.png',
      },
    ],
  },
});
