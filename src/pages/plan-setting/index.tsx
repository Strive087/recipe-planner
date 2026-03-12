import { View, Text, ScrollView } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { InputNumber, Radio, Button } from '@nutui/nutui-react-taro';
import { usePlanStore } from '../../store/usePlanStore';
import { useRecipeStore } from '../../store/useRecipeStore';
import { planApi } from '../../services/planApi';
import LoadingOverlay from '../../components/LoadingOverlay';
import './index.scss';

const APPETITE_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '偏大', value: 'large' },
  { label: '偏小', value: 'small' },
];

export default function PlanSetting() {
  const { config, setConfig, selectedIds, loading, setLoading, setResult } = usePlanStore();
  const { getById } = useRecipeStore();
  const [selectedRecipes, setSelectedRecipes] = useState<any[]>([]);

  useEffect(() => {
    const recipes = selectedIds.map((id) => getById(id)).filter(Boolean);
    setSelectedRecipes(recipes);
  }, [selectedIds]);

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请先选择菜谱', icon: 'none' });
      return;
    }
    if (!config.servings || config.servings < 1) {
      Taro.showToast({ title: '请输入用餐人数', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const result = await planApi.generate(selectedRecipes, config);
      setResult(result);
      Taro.navigateTo({ url: '/pages/plan-result/index' });
    } catch (e) {
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="plan-setting-page">
      <LoadingOverlay visible={loading} />
      
      <ScrollView className="setting-scroll">
        {/* 已选菜谱预览 */}
        <View className="section">
          <Text className="section-title">已选菜谱</Text>
          <ScrollView scrollX className="recipe-preview">
            {selectedRecipes.map((recipe) => (
              <View key={recipe.id} className="preview-tag">{recipe.name}</View>
            ))}
          </ScrollView>
        </View>

        {/* 用餐人数 */}
        <View className="section">
          <Text className="section-title">用餐人数</Text>
          <View className="input-row">
            <InputNumber
              value={config.servings}
              min={1}
              max={20}
              onChange={(val) => setConfig({ servings: val as number })}
            />
            <Text className="input-unit">人</Text>
          </View>
        </View>

        {/* 胃口偏好 */}
        <View className="section">
          <Text className="section-title">胃口偏好</Text>
          <Radio.Group
            value={config.appetite}
            onChange={(val) => setConfig({ appetite: val as any })}
          >
            <View className="radio-group">
              {APPETITE_OPTIONS.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} className="radio-item" />
              ))}
            </View>
          </Radio.Group>
        </View>

        {/* 忌口 */}
        <View className="section">
          <Text className="section-title">饮食忌口（选填）</Text>
          <Text className="textarea" placeholder="如：香菜、姜、辣椒等">
            {config.avoidFoods}
          </Text>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className="bottom-action">
        <Button block type="primary" onClick={handleGenerate}>
          开始生成
        </Button>
      </View>
    </View>
  );
}

import Taro from '@tarojs/taro';
