import { View, Text, ScrollView, Image } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import { useRecipeStore } from '../../store/useRecipeStore';
import { usePlanStore } from '../../store/usePlanStore';
import type { Recipe } from '../../types';
import './index.scss';

export default function RecipeDetail() {
  const router = useRouter();
  const { getById } = useRecipeStore();
  const { addRecipe, removeRecipe, isSelected } = usePlanStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      const data = getById(id);
      if (data) {
        setRecipe(data);
      }
    }
  }, []);

  if (!recipe) {
    return (
      <View className="detail-page">
        <Text>加载中...</Text>
      </View>
    );
  }

  const selected = isSelected(recipe.id);

  const handleTogglePlan = () => {
    if (selected) {
      removeRecipe(recipe.id);
    } else {
      addRecipe(recipe.id);
    }
  };

  const handleEdit = () => {
    router.navigate({ path: '/pages/recipe-edit/index', params: { id: recipe.id } });
  };

  // 分享配置
  useEffect(() => {
    // 动态设置分享配置
    Taro.onShareAppMessage(() => {
      return {
        title: recipe.name,
        path: `/pages/recipe-detail/index?id=${recipe.id}`,
        imageUrl: recipe.coverImage,
      };
    });
  }, [recipe]);

  const handleShare = () => {
    Taro.showToast({
      title: '点击右上角分享',
      icon: 'none',
    });
  };

  return (
    <ScrollView className="detail-page" scrollY>
      {/* 封面 */}
      <View className="cover">
        {recipe.coverImage ? (
          <Image src={recipe.coverImage} mode="aspectFill" className="cover-img" />
        ) : (
          <View className="cover-placeholder">
            <Text className="placeholder-text">{recipe.name[0]}</Text>
          </View>
        )}
      </View>

      {/* 基本信息 */}
      <View className="info-section">
        <Text className="recipe-name">{recipe.name}</Text>
        <View className="meta-row">
          <Text className="category-tag">{recipe.category}</Text>
          <Text className="servings">{recipe.servings}人份</Text>
        </View>
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="tags-row">
            {recipe.tags.map((tag) => (
              <Text key={tag} className="tag">{tag}</Text>
            ))}
          </View>
        )}
      </View>

      {/* 食材清单 */}
      <View className="section">
        <Text className="section-title">食材清单</Text>
        <View className="ingredient-list">
          {recipe.ingredients?.map((item) => (
            <View key={item.id} className="ingredient-item">
              <Text className="ingredient-name">{item.name}</Text>
              <Text className="ingredient-amount">{item.amount}{item.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 烹饪步骤 */}
      <View className="section">
        <Text className="section-title">烹饪步骤</Text>
        <View className="step-list">
          {recipe.steps?.map((step) => (
            <View key={step.id} className="step-item">
              <View className="step-order">{step.order}</View>
              <Text className="step-desc">{step.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部按钮 */}
      <View className="bottom-actions">
        <View className="btn-secondary" onClick={handleShare}>分享</View>
        <View className="btn-secondary" onClick={handleEdit}>编辑</View>
        <View 
          className={`btn-primary ${selected ? 'btn-added' : ''}`}
          onClick={handleTogglePlan}
        >
          {selected ? '已加入规划 ✓' : '加入规划'}
        </View>
      </View>
    </ScrollView>
  );
}
