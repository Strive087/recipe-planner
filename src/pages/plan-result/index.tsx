import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Tabs } from '@nutui/nutui-react-taro';
import { usePlanStore } from '../../store/usePlanStore';
import { formatShoppingListText, formatCookingGuideText } from '../../utils/format';
import { copyToClipboard } from '../../utils/imageExport';
import './index.scss';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 早餐',
  lunch: '☀️ 午餐',
  dinner: '🌙 晚餐',
};

const CATEGORY_LABELS: Record<string, string> = {
  meat: '🥩 肉类',
  vegetable: '🥬 蔬菜',
  seasoning: '🧂 调味品',
  dry: '🥫 干货',
  other: '📦 其他',
};

export default function PlanResult() {
  const { result, planResult, selectedIds } = usePlanStore();
  const [tabIndex, setTabIndex] = useState(0);

  // 判断是否为AI规划模式
  const isAIPlan = !!planResult && planResult.daily_plans?.length > 0;

  if (!result && !planResult) {
    return (
      <View className="result-page">
        <Text className="empty-result">暂无结果</Text>
      </View>
    );
  }

  // AI 规划结果渲染
  if (isAIPlan && planResult) {
    const handleCopyShopping = async () => {
      const items = planResult.shopping_list
        .map(item => `${item.name} ${item.amount}${item.unit}`)
        .join('\n');
      await copyToClipboard(`采购清单：\n${items}\n\n共${planResult.shopping_list.length}种食材`);
    };

    const handleCopyPlan = async () => {
      const text = planResult.daily_plans.map(day => {
        const meals = day.meals.map(m => `${MEAL_LABELS[m.mealType]}: ${m.recipeName}`).join('\n');
        return `第${day.day}天：\n${meals}`;
      }).join('\n\n');
      await copyToClipboard(`每日规划：\n\n${text}`);
    };

    return (
      <View className="result-page">
        <View className="header">
          <Text className="title">AI 智能规划</Text>
          <Text className="subtitle">{planResult.daily_plans.length} 天 · 每日 {planResult.shopping_list.length ? '多' : ''}餐</Text>
        </View>

        <Tabs value={tabIndex} onChange={(idx) => setTabIndex(idx as number)}>
          <Tabs.TabPane title="每日安排">
            <ScrollView className="tab-content">
              {planResult.daily_plans.map((day) => (
                <View key={day.day} className="day-card">
                  <View className="day-header">
                    <Text className="day-title">第 {day.day} 天</Text>
                  </View>
                  <View className="meals-list">
                    {day.meals.map((meal, idx) => (
                      <View key={idx} className="meal-item">
                        <Text className="meal-type">{MEAL_LABELS[meal.mealType]}</Text>
                        <Text className="meal-name">{meal.recipeName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Tabs.TabPane>
          
          <Tabs.TabPane title="采购清单">
            <ScrollView className="tab-content">
              {planResult.shopping_list.map((item, idx) => (
                <View key={idx} className="shopping-item">
                  <View className="item-left">
                    <Text className="item-name">{item.name}</Text>
                    <Text className="item-category">{CATEGORY_LABELS[item.category]}</Text>
                  </View>
                  <View className="item-right">
                    <Text className="item-amount">{item.amount}{item.unit}</Text>
                  </View>
                </View>
              ))}
              <View className="summary">
                <Text>共 {planResult.shopping_list.length} 种食材</Text>
              </View>
            </ScrollView>
          </Tabs.TabPane>
        </Tabs>

        <View className="bottom-actions">
          <View className="btn-secondary" onClick={tabIndex === 0 ? handleCopyPlan : handleCopyShopping}>
            复制文字
          </View>
          <View className="btn-primary">保存长图</View>
        </View>
      </View>
    );
  }

  // 原有模式：基于已选菜谱的结果
  const handleCopyShopping = async () => {
    const text = formatShoppingListText(result!.shopping_list);
    await copyToClipboard(text);
  };

  const handleCopyGuide = async () => {
    const text = formatCookingGuideText(result!.cooking_guide);
    await copyToClipboard(text);
  };

  const categoryLabels: Record<string, string> = {
    meat: '🥩 肉类',
    vegetable: '🥬 蔬菜',
    seasoning: '🧂 调味品',
    dry: '🥫 干货',
    other: '📦 其他',
  };

  return (
    <View className="result-page">
      <View className="header">
        <Text className="title">本次规划：{selectedIds.length} 道菜</Text>
      </View>

      <Tabs value={tabIndex} onChange={(idx) => setTabIndex(idx as number)}>
        <Tabs.TabPane title="采购清单">
          <ScrollView className="tab-content">
            {result!.shopping_list.map((item, idx) => (
              <View key={idx} className="shopping-item">
                <View className="item-left">
                  <Text className="item-name">{item.name}</Text>
                </View>
                <View className="item-right">
                  <Text className="item-amount">{item.totalAmount}{item.unit}</Text>
                </View>
              </View>
            ))}
            <View className="summary">
              <Text>共 {result!.shopping_list.length} 种食材</Text>
            </View>
          </ScrollView>
        </Tabs.TabPane>
        
        <Tabs.TabPane title="烹饪向导">
          <ScrollView className="tab-content">
            {result!.cooking_guide.map((step) => (
              <View key={step.order} className="guide-item">
                <View className="guide-header">
                  <View className="step-num">{step.order}</View>
                  <Text className="step-title">{step.title}</Text>
                  {step.duration && <Text className="step-duration">{step.duration}</Text>}
                </View>
                <View className="step-actions">
                  {step.actions.map((action, idx) => (
                    <Text key={idx} className="action-text">• {action}</Text>
                  ))}
                </View>
                {step.parallel && (
                  <View className="parallel-tip">
                    <Text>💡 {step.parallel}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </Tabs.TabPane>
      </Tabs>

      <View className="bottom-actions">
        <View className="btn-secondary" onClick={tabIndex === 0 ? handleCopyShopping : handleCopyGuide}>
          复制文字
        </View>
        <View className="btn-primary">保存长图</View>
      </View>
    </View>
  );
}
