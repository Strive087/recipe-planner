import { View, Text } from '@tarojs/components';
import { Popup, Checkbox } from '@nutui/nutui-react-taro';
import { useState } from 'react';
import type { Recipe } from '../../types';
import { CATEGORY_OPTIONS } from '../../types';
import './index.scss';

interface Props {
  visible: boolean;
  value: string[];
  onClose: () => void;
  onConfirm: (value: string[]) => void;
}

export default function TagPicker({ visible, value, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>(value || []);

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      setSelected(selected.filter((t) => t !== tag));
    } else if (selected.length < 5) {
      setSelected([...selected, tag]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const presetTags = ['快手菜', '下饭', '清淡', '重口', '家常', '宴客', '早餐', '晚餐', '懒人'];

  return (
    <Popup visible={visible} position="bottom" onClose={onClose} round>
      <View className="tag-picker">
        <View className="picker-header">
          <Text className="title">选择标签（最多5个）</Text>
          <Text className="confirm" onClick={handleConfirm}>确定</Text>
        </View>
        
        <View className="preset-tags">
          {presetTags.map((tag) => (
            <View
              key={tag}
              className={`tag-item ${selected.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </View>
          ))}
        </View>
      </View>
    </Popup>
  );
}
