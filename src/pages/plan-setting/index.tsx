import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { InputNumber, Radio, Button, Switch } from '@nutui/nutui-react-taro';
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
  const { 
    config, setConfig, selectedIds, loading, setLoading, setResult,
    planDays, planMealsPerDay, planPreferences, setPlanParams, setPlanResult 
  } = usePlanStore();
  const { getById } = useRecipeStore();
  const [selectedRecipes, setSelectedRecipes] = useState<any[]>([]);
  const [useAIPlan, setUseAIPlan] = useState(false);

  useEffect(() => {
    const recipes = selectedIds.map((id) => getById(id)).filter(Boolean);
    setSelectedRecipes(recipes);
  }, [selectedIds]);

  // 原有模式：基于已选菜谱生成
  const handleGenerateLegacy = async () => {
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
      setPlanResult(null); // 清除AI规划结果
      Taro.navigateTo({ url: '/pages/plan-result/index' });
    } catch (e) {
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 新模式：AI自动规划
  const handleGenerateAI = async () => {
    if (!planDays || planDays < 1) {
      Taro.showToast({ title: '请输入规划天数', icon: 'none' });
      return;
    }
    if (!planMealsPerDay || planMealsPerDay < 1) {
      Taro.showToast({ title: '请输入每餐数量', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const result = await planApi.generatePlan(planDays, planMealsPerDay, planPreferences);
      setPlanResult(result);
      setResult(null); // 清除原有结果
      Taro.navigateTo({ url: '/pages/plan-result/index' });
    } catch (e) {
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = useAIPlan ? handleGenerateAI : handleGenerateLegacy;

  return (
    <View className="plan-setting-page">
      <LoadingOverlay visible={loading} />
      
      <ScrollView className="setting-scroll">
        {/* 模式切换 */}
        <View className="section mode-switch">
          <Text className="section-title">规划模式</Text>
          <View className="switch-row">
            <Text>AI智能规划</Text>
            <Switch checked={useAIPlan} onChange={(val) => setUseAIPlan(val)} />
          </View>
          <Text className="mode-desc">
            {useAIPlan ? '根据天数、餐数偏好自动生成菜谱安排' : '基于已选菜谱生成采购清单'}
          </Text>
        </View>

        {useAIPlan ? (
          // AI 智能规划模式
          <>
            {/* 规划天数 */}
            <View className="section">
              <Text className="section-title">规划天数</Text>
              <View className="input-row">
                <InputNumber
                  value={planDays}
                  min={1}
                  max={30}
                  onChange={(val) => setPlanParams(val as number, planMealsPerDay, planPreferences)}
                />
                <Text className="input-unit">天</Text>
              </View>
            </View>

            {/* 每餐数量 */}
            <View className="section">
              <Text className="section-title">每餐数量</Text>
              <View className="input-row">
                <InputNumber
                  value={planMealsPerDay}
                  min={1}
                  max={5}
                  onChange={(val) => setPlanParams(planDays, val as number, planPreferences)}
                />
                <Text className="input-unit">道菜/餐</Text>
              </View>
            </View>

            {/* 饮食偏好 */}
            <View className="section">
              <Text className="section-title">饮食偏好（选填）</Text>
              <Textarea
                className="pref-textarea"
                value={planPreferences}
                onInput={(e) => setPlanParams(planDays, planMealsPerDay, e.detail.value)}
                placeholder="如：想吃川菜、喜欢清淡、要不要辣等"
              />
            </View>
          </>
        ) : (
          // 原有模式：基于已选菜谱
          <>
            {/* 已选菜谱预览 */}
            <View className="section">
              <Text className="section-title">已选菜谱</Text>
              {selectedIds.length === 0 ? (
                <Text className="empty-tip">请先在菜谱列表中选择菜谱</Text>
              ) : (
                <ScrollView scrollX className="recipe-preview">
                  {selectedRecipes.map((recipe) => (
                    <View key={recipe.id} className="preview-tag">{recipe.name}</View>
                  ))}
                </ScrollView>
              )}
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
              <Textarea
                className="pref-textarea"
                value={config.avoidFoods}
                onInput={(e) => setConfig({ avoidFoods: e.detail.value })}
                placeholder="如：香菜、姜、辣椒等"
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View className="bottom-action">
        <Button block type="primary" onClick={handleGenerate}>
          {useAIPlan ? '生成规划' : '开始生成'}
        </Button>
      </View>
    </View>
  );
}
