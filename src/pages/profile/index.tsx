import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import './index.scss';

export default function Profile() {
  const { recipes, loadRecipes } = useRecipeStore();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    loadRecipes();
    const info = Taro.getStorageSync('user_info');
    if (info) {
      setUserInfo(JSON.parse(info));
    }
  }, []);

  return (
    <View className="profile-page">
      <View className="profile-header">
        <View className="avatar-area">
          {userInfo?.avatarUrl ? (
            <Image src={userInfo.avatarUrl} mode="aspectFill" className="avatar" />
          ) : (
            <View className="avatar-placeholder">👤</View>
          )}
        </View>
        <Text className="nickname">{userInfo?.nickName || '点击授权'}</Text>
      </View>

      <View className="stats-card">
        <View className="stat-item">
          <Text className="stat-num">{recipes.length}</Text>
          <Text className="stat-label">私人菜谱</Text>
        </View>
      </View>

      <View className="setting-list">
        <View className="setting-item">
          <Text className="setting-label">清除缓存</Text>
          <Text className="setting-arrow">→</Text>
        </View>
        <View className="setting-item">
          <Text className="setting-label">关于</Text>
          <Text className="setting-arrow">→</Text>
        </View>
        <View className="setting-item">
          <Text className="setting-label">意见反馈</Text>
          <Text className="setting-arrow">→</Text>
        </View>
      </View>
    </View>
  );
}
