import { View, Text } from '@tarojs/components';
import { Loading } from '@nutui/nutui-react-taro';
import { useState, useEffect } from 'react';
import './index.scss';

interface Props {
  visible: boolean;
}

const LOADING_TEXTS = [
  '正在合并食材...',
  '正在统筹步骤...',
  '即将完成...',
];

export default function LoadingOverlay({ visible }: Props) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <View className="loading-overlay">
      <View className="loading-content">
        <Loading type="circle" size="80rpx" color="#FFFFFF" />
        <Text className="loading-text">{LOADING_TEXTS[textIndex]}</Text>
      </View>
    </View>
  );
}
