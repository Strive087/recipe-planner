import { View, Text, Textarea } from '@tarojs/components';
import type { Step } from '../../types';
import './index.scss';

interface Props {
  value: Step;
  onChange: (value: Step) => void;
  onDelete: () => void;
}

export default function StepRow({ value, onChange, onDelete }: Props) {
  const handleDescChange = (e: any) => {
    onChange({ ...value, desc: e.detail.value });
  };

  return (
    <View className="step-row">
      <View className="step-order">{value.order}</View>
      <Textarea
        className="step-input"
        placeholder="请输入步骤描述"
        value={value.desc}
        onInput={handleDescChange}
        autoHeight
      />
      <View className="delete-btn" onClick={onDelete}>✕</View>
    </View>
  );
}
