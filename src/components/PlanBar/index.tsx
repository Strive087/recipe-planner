import { View, Text } from '@tarojs/components';
import { useNavigate } from '@tarojs/taro';
import { Popup } from '@nutui/nutui-react-taro';
import { useState } from 'react';
import { usePlanStore } from '../../store/usePlanStore';
import { useRecipeStore } from '../../store/useRecipeStore';
import './index.scss';

export default function PlanBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { selectedIds, removeRecipe, clearAll } = usePlanStore();
  const { recipes, getById } = useRecipeStore();

  if (selectedIds.length === 0) {
    return null;
  }

  const selectedRecipes = selectedIds.map((id) => getById(id)).filter(Boolean);

  const handleGoPlan = () => {
    navigate({ path: '/pages/plan-setting/index' });
  };

  return (
    <>
      {/* 折叠状态 */}
      <View className="plan-bar" onClick={() => setExpanded(true)}>
        <Text className="bar-text">已选 {selectedIds.length} 道菜 · 去规划 →</Text>
      </View>

      {/* 展开抽屉 */}
      <Popup
        visible={expanded}
        position="bottom"
        onClose={() => setExpanded(false)}
        round
      >
        <View className="drawer-content">
          <View className="drawer-header">
            <Text className="drawer-title">已选菜谱</Text>
            <Text className="clear-btn" onClick={clearAll}>清空全部</Text>
          </View>

          <View className="selected-list">
            {selectedRecipes.map((recipe) => (
              <View key={recipe!.id} className="selected-item">
                <Text className="item-name">{recipe!.name}</Text>
                <Text className="item-remove" onClick={() => removeRecipe(recipe!.id)}>✕</Text>
              </View>
            ))}
          </View>

          <View className="drawer-footer">
            <View className="btn-secondary" onClick={() => setExpanded(false)}>取消</View>
            <View className="btn-primary" onClick={handleGoPlan}>去规划</View>
          </View>
        </View>
      </Popup>
    </>
  );
}
