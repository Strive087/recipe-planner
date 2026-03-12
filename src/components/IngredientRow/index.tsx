import { View, Text, Input, Picker } from '@tarojs/components';
import { useState } from 'react';
import type { Ingredient } from '../../types';
import { UNIT_OPTIONS } from '../../types';
import './index.scss';

interface Props {
  value: Ingredient;
  onChange: (value: Ingredient) => void;
  onDelete: () => void;
}

export default function IngredientRow({ value, onChange, onDelete }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleNameChange = (e: any) => {
    onChange({ ...value, name: e.detail.value });
  };

  const handleAmountChange = (e: any) => {
    onChange({ ...value, amount: Number(e.detail.value) || 0 });
  };

  const handleUnitChange = (e: any) => {
    const index = Number(e.detail.value);
    onChange({ ...value, unit: UNIT_OPTIONS[index] });
  };

  const unitIndex = UNIT_OPTIONS.indexOf(value.unit as any);

  return (
    <View className="ingredient-row">
      <Input
        className="input-name"
        placeholder="食材名称"
        value={value.name}
        onInput={handleNameChange}
      />
      <Input
        className="input-amount"
        type="digit"
        placeholder="数量"
        value={value.amount ? String(value.amount) : ''}
        onInput={handleAmountChange}
      />
      <Picker
        mode="selector"
        range={UNIT_OPTIONS}
        value={unitIndex >= 0 ? unitIndex : 0}
        onChange={handleUnitChange}
      >
        <View className="picker-unit">
          <Text>{value.unit || 'g'}</Text>
          <Text className="arrow">▼</Text>
        </View>
      </Picker>
      <View className="delete-btn" onClick={onDelete}>✕</View>
    </View>
  );
}
