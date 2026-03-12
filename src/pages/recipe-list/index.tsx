import { useEffect } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { useNavigate } from '@tarojs/taro';
import { SearchBar, Empty } from '@nutui/nutui-react-taro';
import { useRecipeStore } from '../../store/useRecipeStore';
import { usePlanStore } from '../../store/usePlanStore';
import RecipeCard from '../../components/RecipeCard';
import PlanBar from '../../components/PlanBar';
import './index.scss';

export default function RecipeList() {
  const navigate = useNavigate();
  const {
    loadRecipes,
    loadCategories,
    categories,
    filteredRecipes,
    keyword,
    setKeyword,
    searchRecipes,
    activeCategory,
    setActiveCategory,
    isLoading,
  } = useRecipeStore();
  
  const { addRecipe, removeRecipe, isSelected } = usePlanStore();

  useEffect(() => {
    loadRecipes();
    loadCategories();
  }, []);

  // 防抖搜索
  const handleSearch = (val: string) => {
    setKeyword(val);
    // 调用搜索API
    searchRecipes(val);
  };

  const recipes = filteredRecipes();

  const handleToggleSelect = (id: string) => {
    if (isSelected(id)) {
      removeRecipe(id);
    } else {
      addRecipe(id);
    }
  };

  const handleCardClick = (id: string) => {
    navigate({ path: '/pages/recipe-detail/index', params: { id } });
  };

  const handleAddRecipe = () => {
    navigate({ path: '/pages/recipe-edit/index' });
  };

  return (
    <View className="recipe-list-page">
      {/* 搜索栏 */}
      <View className="search-area">
        <SearchBar
          placeholder="搜索菜谱"
          value={keyword}
          onChange={handleSearch}
        />
      </View>

      {/* 分类 Tab */}
      <View className="category-tabs">
        <ScrollView scrollX className="tabs-scroll">
          <View className="tabs-wrapper">
            {categories.map((cat) => (
              <View
                key={cat.key}
                className={`tab-item ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 菜谱列表 */}
      <ScrollView scrollY className="recipe-scroll">
        {recipes.length > 0 ? (
          <View className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={isSelected(recipe.id)}
                onToggleSelect={() => handleToggleSelect(recipe.id)}
                onClick={() => handleCardClick(recipe.id)}
              />
            ))}
          </View>
        ) : (
          <Empty
            description="还没有菜谱"
            image={
              <View className="empty-icon">🍳</View>
            }
          />
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <View className="fab-add" onClick={handleAddRecipe}>
        +
      </View>

      {/* 规划悬浮栏 */}
      <PlanBar />
    </View>
  );
}
