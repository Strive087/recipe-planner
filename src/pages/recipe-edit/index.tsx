import { View, Text, Input, Image } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { nanoid } from 'nanoid';
import { useRecipeStore } from '../../store/useRecipeStore';
import type { Recipe, Ingredient, Step } from '../../types';
import { CATEGORY_OPTIONS } from '../../types';
import IngredientRow from '../../components/IngredientRow';
import StepRow from '../../components/StepRow';
import TagPicker from '../../components/TagPicker';
import './index.scss';

export default function RecipeEdit() {
  const router = useRouter();
  const { upsertRecipe, getById } = useRecipeStore();
  const isEdit = !!router.params?.id;

  const [form, setForm] = useState<Partial<Recipe>>({
    name: '',
    coverImage: '',
    servings: 2,
    category: '荤菜',
    tags: [],
    ingredients: [{ id: nanoid(), name: '', amount: 0, unit: 'g' }],
    steps: [{ id: nanoid(), order: 1, desc: '' }],
  });

  const [showTagPicker, setShowTagPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && router.params.id) {
      const recipe = getById(router.params.id);
      if (recipe) {
        setForm(recipe);
      }
    }
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 1 || form.name.length > 20) {
      errs.name = '请输入1-20字的菜名';
    }
    if (!form.ingredients || form.ingredients.length === 0) {
      errs.ingredients = '请至少添加1个食材';
    }
    const hasValidIngredient = form.ingredients?.some(i => i.name.trim());
    if (!hasValidIngredient) {
      errs.ingredients = '请填写食材名称';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const now = Date.now();
    const recipe: Recipe = {
      id: form.id || nanoid(),
      name: form.name!,
      coverImage: form.coverImage || '',
      servings: form.servings || 2,
      category: form.category as Recipe['category'],
      tags: form.tags || [],
      ingredients: form.ingredients?.filter(i => i.name.trim()) || [],
      steps: form.steps?.filter(s => s.desc.trim()).map((s, i) => ({ ...s, order: i + 1 })) || [],
      createdAt: isEdit ? (form.createdAt || now) : now,
      updatedAt: now,
    };

    upsertRecipe(recipe);
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => router.back(), 1500);
  };

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      if (res.tempFilePaths?.[0]) {
        setForm({ ...form, coverImage: res.tempFilePaths[0] });
      }
    } catch (e) {
      console.error('选择图片失败:', e);
    }
  };

  const updateIngredient = (index: number, ingredient: Ingredient) => {
    const list = [...(form.ingredients || [])];
    list[index] = ingredient;
    setForm({ ...form, ingredients: list });
  };

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [...(form.ingredients || []), { id: nanoid(), name: '', amount: 0, unit: 'g' }],
    });
  };

  const removeIngredient = (index: number) => {
    if ((form.ingredients?.length || 0) <= 1) return;
    const list = [...(form.ingredients || [])];
    list.splice(index, 1);
    setForm({ ...form, ingredients: list });
  };

  const updateStep = (index: number, step: Step) => {
    const list = [...(form.steps || [])];
    list[index] = step;
    setForm({ ...form, steps: list });
  };

  const addStep = () => {
    setForm({
      ...form,
      steps: [...(form.steps || []), { id: nanoid(), order: (form.steps?.length || 0) + 1, desc: '' }],
    });
  };

  const removeStep = (index: number) => {
    if ((form.steps?.length || 0) <= 1) return;
    const list = [...(form.steps || [])];
    list.splice(index, 1);
    setForm({ ...form, steps: list.map((s, i) => ({ ...s, order: i + 1 })) });
  };

  return (
    <View className="recipe-edit-page">
      <View className="form-section">
        <Text className="label">菜名 *</Text>
        <Input
          className="input"
          placeholder="请输入菜名"
          value={form.name}
          onInput={(e) => setForm({ ...form, name: e.detail.value })}
        />
        {errors.name && <Text className="error">{errors.name}</Text>}
      </View>

      <View className="form-section">
        <Text className="label">封面图</Text>
        <View className="cover-picker" onClick={handleChooseImage}>
          {form.coverImage ? (
            <Image src={form.coverImage} mode="aspectFill" className="cover-preview" />
          ) : (
            <View className="cover-placeholder">
              <Text>+ 添加图片</Text>
            </View>
          )}
        </View>
      </View>

      <View className="form-section row">
        <View className="flex-1">
          <Text className="label">份数</Text>
          <View className="servings-ctrl">
            <View className="ctrl-btn" onClick={() => setForm({ ...form, servings: Math.max(1, (form.servings || 1) - 1) })}>-</View>
            <Text className="servings-num">{form.servings}</Text>
            <View className="ctrl-btn" onClick={() => setForm({ ...form, servings: Math.min(50, (form.servings || 1) + 1) })}>+</View>
          </View>
        </View>
        <View className="flex-1">
          <Text className="label">分类 *</Text>
          <View className="category-list">
            {CATEGORY_OPTIONS.map((cat) => (
              <View
                key={cat}
                className={`cat-item ${form.category === cat ? 'active' : ''}`}
                onClick={() => setForm({ ...form, category: cat as Recipe['category'] })}
              >
                {cat}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="form-section">
        <Text className="label">标签</Text>
        <View className="tags-display" onClick={() => setShowTagPicker(true)}>
          {form.tags?.length ? (
            form.tags.map((tag) => <View key={tag} className="tag">{tag}</View>)
          ) : (
            <Text className="placeholder">点击选择标签</Text>
          )}
        </View>
      </View>

      <View className="form-section">
        <Text className="label">食材 *</Text>
        {form.ingredients?.map((ing, index) => (
          <IngredientRow
            key={ing.id}
            value={ing}
            onChange={(v) => updateIngredient(index, v)}
            onDelete={() => removeIngredient(index)}
          />
        ))}
        <View className="add-btn" onClick={addIngredient}>+ 添加食材</View>
        {errors.ingredients && <Text className="error">{errors.ingredients}</Text>}
      </View>

      <View className="form-section">
        <Text className="label">烹饪步骤</Text>
        {form.steps?.map((step, index) => (
          <StepRow
            key={step.id}
            value={step}
            onChange={(v) => updateStep(index, v)}
            onDelete={() => removeStep(index)}
          />
        ))}
        <View className="add-btn" onClick={addStep}>+ 添加步骤</View>
      </View>

      <View className="bottom-action">
        <Button block type="primary" onClick={handleSave}>
          {isEdit ? '保存修改' : '创建菜谱'}
        </Button>
      </View>

      <TagPicker
        visible={showTagPicker}
        value={form.tags || []}
        onClose={() => setShowTagPicker(false)}
        onConfirm={(tags) => setForm({ ...form, tags })}
      />
    </View>
  );
}
