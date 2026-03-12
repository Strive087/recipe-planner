import { View, Text, ScrollView } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Tabs } from '@nutui/nutui-react-taro';
import { usePlanStore } from '../../store/usePlanStore';
import { formatShoppingListText, formatCookingGuideText } from '../../utils/format';
import { copyToClipboard } from '../../utils/imageExport';
import './index.scss';

export default function PlanResult() {
  const { result, selectedIds } = usePlanStore();
  const [tabIndex, setTabIndex] = useState(0);

  if (!result) {
    return (
      <View className="result-page">
        <Text>暂无结果</Text>
      </View>
    );
  }

  const handleCopyShopping = async () => {
    const text = formatShoppingListText(result.shopping_list);
    await copyToClipboard(text);
  };

  const handleCopyGuide = async () => {
    const text = formatCookingGuideText(result.cooking_guide);
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
            {result.shopping_list.map((item, idx) => (
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
              <Text>共 {result.shopping_list.length} 种食材</Text>
            </View>
          </ScrollView>
        </Tabs.TabPane>
        
        <Tabs.TabPane title="烹饪向导">
          <ScrollView className="tab-content">
            {result.cooking_guide.map((step) => (
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
