import { View, Text, Image } from '@tarojs/components';
import { useLongPress } from '@tarojs/use';
import type { Recipe } from '../../types';
import './index.scss';

interface Props {
  recipe: Recipe;
  selected: boolean;
  isFavorited?: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RecipeCard({ recipe, selected, isFavorited = false, onToggleSelect, onClick, onToggleFavorite, onEdit, onDelete }: Props) {
  const handleLongPress = () => {
    // TODO: 显示操作菜单
    console.log('Long press:', recipe.id);
  };

  const getFallbackImage = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const index = recipe.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View className="recipe-card" onClick={onClick}>
      {/* 封面图 */}
      <View className="card-cover" style={{ backgroundColor: recipe.coverImage ? 'transparent' : getFallbackImage() }}>
        {recipe.coverImage ? (
          <Image src={recipe.coverImage} mode="aspectFill" className="cover-img" />
        ) : (
          <Text className="cover-fallback">{recipe.name[0]}</Text>
        )}
        
        {/* 选择框 */}
        <View 
          className={`select-box ${selected ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
        >
          {selected && <Text className="check-icon">✓</Text>}
        </View>
        
        {/* 收藏按钮 */}
        {onToggleFavorite && (
          <View 
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Text className="favorite-icon">{isFavorited ? '❤️' : '🤍'}</Text>
          </View>
        )}
      </View>

      {/* 卡片内容 */}
      <View className="card-content">
        <Text className="card-title" numberOfLines={2}>{recipe.name}</Text>
        <View className="card-meta">
          <Text className="category-tag">{recipe.category}</Text>
          <Text className="servings">{recipe.servings}人份</Text>
        </View>
      </View>
    </View>
  );
}
