import Taro from '@tarojs/taro';
import { View, Text, Image, Input, Button, ScrollView, Picker } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useRecipeStore } from '../../store/useRecipeStore';
import recipeApi, { FavoriteFolder, FavoriteFolderWithRecipes, Recipe, PantryItem, PANTRY_CATEGORY_OPTIONS } from '../../services/recipeApi';
import { UNIT_OPTIONS } from '../../types';
import './index.scss';

type TabType = 'profile' | 'pantry' | 'favorites';

export default function Profile() {
  const { recipes, loadRecipes } = useRecipeStore();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // 收藏夹相关状态
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FavoriteFolderWithRecipes | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // 库存相关状态
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [editingPantryItem, setEditingPantryItem] = useState<PantryItem | null>(null);
  const [pantryForm, setPantryForm] = useState({
    name: '',
    amount: 1,
    unit: 'g',
    category: 'other' as PantryItem['category'],
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipes();
    const info = Taro.getStorageSync('user_info');
    if (info) {
      setUserInfo(JSON.parse(info));
    }
  }, []);

  // Tab 切换时加载对应数据
  useEffect(() => {
    if (activeTab === 'favorites') {
      loadFolders();
    } else if (activeTab === 'pantry') {
      loadPantry();
    }
  }, [activeTab]);

  // ========== 收藏夹相关函数 ==========
  const loadFolders = async () => {
    try {
      setLoading(true);
      const res = await recipeApi.getFolders();
      if (res.code === 0 && res.data) {
        setFolders(res.data);
      }
    } catch (err) {
      console.error('加载收藏夹失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Taro.showToast({ title: '请输入夹子名称', icon: 'none' });
      return;
    }
    try {
      const res = await recipeApi.createFolder(newFolderName.trim());
      if (res.code === 0) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setNewFolderName('');
        setShowCreateModal(false);
        loadFolders();
      } else {
        Taro.showToast({ title: res.message || '创建失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }
  };

  const handleViewFolder = async (folder: FavoriteFolder) => {
    try {
      setLoading(true);
      const res = await recipeApi.getFolderRecipes(folder.id);
      if (res.code === 0 && res.data) {
        setSelectedFolder(res.data);
      }
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    if (!selectedFolder) return;
    try {
      const res = await recipeApi.removeFromFolder(selectedFolder.id, recipeId);
      if (res.code === 0) {
        Taro.showToast({ title: '已移除', icon: 'success' });
        handleViewFolder(selectedFolder);
        loadFolders();
      }
    } catch (err) {
      Taro.showToast({ title: '移除失败', icon: 'none' });
    }
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    loadFolders();
  };

  const handleGoToRecipe = (recipeId: string) => {
    Taro.navigateTo({ url: `/pages/recipe-detail/index?id=${recipeId}` });
  };

  // ========== 库存相关函数 ==========
  const loadPantry = async () => {
    try {
      setLoading(true);
      const res = await recipeApi.getPantry();
      if (res.code === 0 && res.data) {
        setPantryItems(res.data);
      }
    } catch (err) {
      console.error('加载库存失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPantryItem(null);
    setPantryForm({ name: '', amount: 1, unit: 'g', category: 'other' });
    setShowPantryModal(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingPantryItem(item);
    setPantryForm({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
    });
    setShowPantryModal(true);
  };

  const handleSavePantryItem = async () => {
    if (!pantryForm.name.trim()) {
      Taro.showToast({ title: '请输入食材名称', icon: 'none' });
      return;
    }
    try {
      let res;
      if (editingPantryItem) {
        // 更新
        res = await recipeApi.updatePantryItem(editingPantryItem.id, pantryForm);
      } else {
        // 添加
        res = await recipeApi.addPantryItem(pantryForm);
      }
      
      if (res.code === 0) {
        Taro.showToast({ title: editingPantryItem ? '更新成功' : '添加成功', icon: 'success' });
        setShowPantryModal(false);
        loadPantry();
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleDeletePantryItem = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该食材吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await recipeApi.deletePantryItem(id);
            if (result.code === 0) {
              Taro.showToast({ title: '已删除', icon: 'success' });
              loadPantry();
            } else {
              Taro.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleClearPantry = () => {
    if (pantryItems.length === 0) {
      Taro.showToast({ title: '库存已清空', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有库存吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await recipeApi.clearPantry();
            if (result.code === 0) {
              Taro.showToast({ title: '已清空', icon: 'success' });
              loadPantry();
            } else {
              Taro.showToast({ title: result.message || '清空失败', icon: 'none' });
            }
          } catch (err) {
            Taro.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      },
    });
  };

  // 获取分类标签
  const getCategoryLabel = (category: string) => {
    const option = PANTRY_CATEGORY_OPTIONS.find(o => o.key === category);
    return option?.label || '其他';
  };

  // 获取分类标签颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      meat: '#FF6B6B',
      vegetable: '#4CAF50',
      seasoning: '#FF9800',
      dry: '#9C27B0',
      other: '#607D8B',
    };
    return colors[category] || colors.other;
  };

  // ========== 渲染函数 ==========
  const renderTabBar = () => (
    <View className="tab-bar">
      <View 
        className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <Text>个人中心</Text>
      </View>
      <View 
        className={`tab-item ${activeTab === 'pantry' ? 'active' : ''}`}
        onClick={() => setActiveTab('pantry')}
      >
        <Text>食材库存</Text>
      </View>
      <View 
        className={`tab-item ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => setActiveTab('favorites')}
      >
        <Text>我的收藏</Text>
      </View>
    </View>
  );

  const renderProfileTab = () => (
    <View className="profile-content">
      <View className="profile-header">
        <View className="avatar-area">
          {userInfo?.avatarUrl ? (
            <Image src={userInfo.avatarUrl} mode="aspectFill" className="avatar" />
          ) : (
            <View className="avatar-placeholder">👤</View>
          )}
        </View>
        <Text className="nickname">{userInfo?.nickName || '点击授权'}</Text>
      </View>

      <View className="stats-card">
        <View className="stat-item">
          <Text className="stat-num">{recipes.length}</Text>
          <Text className="stat-label">私人菜谱</Text>
        </View>
      </View>

      <View className="setting-list">
        <View className="setting-item">
          <Text className="setting-label">清除缓存</Text>
          <Text className="setting-arrow">→</Text>
        </View>
        <View className="setting-item">
          <Text className="setting-label">关于</Text>
          <Text className="setting-arrow">→</Text>
        </View>
        <View className="setting-item">
          <Text className="setting-label">意见反馈</Text>
          <Text className="setting-arrow">→</Text>
        </View>
      </View>
    </View>
  );

  const renderPantryTab = () => (
    <View className="pantry-content">
      <View className="pantry-header">
        <View className="pantry-stats">
          <Text className="pantry-count">{pantryItems.length}</Text>
          <Text className="pantry-label">种食材</Text>
        </View>
        <View className="pantry-actions">
          <View className="clear-btn" onClick={handleClearPantry}>
            <Text>清空库存</Text>
          </View>
          <View className="add-btn" onClick={openAddModal}>
            <Text>+ 添加食材</Text>
          </View>
        </View>
      </View>

      {pantryItems.length === 0 ? (
        <View className="empty-pantry">
          <Text className="empty-icon">📦</Text>
          <Text className="empty-text">库存为空</Text>
          <Text className="empty-hint">点击"添加食材"开始管理</Text>
        </View>
      ) : (
        <ScrollView scrollY className="pantry-list">
          {pantryItems.map(item => (
            <View key={item.id} className="pantry-item">
              <View className="item-info">
                <View className="item-header">
                  <Text className="item-name">{item.name}</Text>
                  <View 
                    className="item-category"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    <Text>{getCategoryLabel(item.category)}</Text>
                  </View>
                </View>
                <Text className="item-amount">
                  {item.amount} {item.unit}
                </Text>
              </View>
              <View className="item-actions">
                <View className="edit-btn" onClick={() => openEditModal(item)}>
                  <Text>编辑</Text>
                </View>
                <View className="delete-btn" onClick={() => handleDeletePantryItem(item.id)}>
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderFavoritesTab = () => (
    <View className="favorites-content">
      {selectedFolder ? renderFolderRecipes() : renderFolderList()}
    </View>
  );

  const renderFolderList = () => (
    <View className="favorites-section">
      <View className="section-header">
        <Text className="section-title">我的收藏夹</Text>
        <View 
          className="add-folder-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Text>+ 新建夹子</Text>
        </View>
      </View>

      {folders.length === 0 ? (
        <View className="empty-folders">
          <Text className="empty-text">暂无收藏夹</Text>
          <Text className="empty-hint">点击上方"新建夹子"创建</Text>
        </View>
      ) : (
        <View className="folder-list">
          {folders.map(folder => (
            <View 
              key={folder.id} 
              className="folder-item"
              onClick={() => handleViewFolder(folder)}
            >
              <View className="folder-icon">📁</View>
              <View className="folder-info">
                <Text className="folder-name">{folder.name}</Text>
                <Text className="folder-count">{folder.recipeCount} 个菜谱</Text>
              </View>
              <Text className="folder-arrow">→</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderFolderRecipes = () => (
    <View className="folder-recipes">
      <View className="folder-header">
        <View className="back-btn" onClick={handleBackToFolders}>
          <Text>← 返回</Text>
        </View>
        <Text className="folder-title">{selectedFolder?.name}</Text>
        <View style={{ width: 100 }} />
      </View>

      {selectedFolder?.recipes.length === 0 ? (
        <View className="empty-recipes">
          <Text className="empty-text">夹子内暂无菜谱</Text>
        </View>
      ) : (
        <ScrollView scrollY className="recipe-scroll">
          {selectedFolder?.recipes.map(recipe => (
            <View key={recipe.id} className="recipe-item">
              <View 
                className="recipe-content"
                onClick={() => handleGoToRecipe(recipe.id)}
              >
                {recipe.coverImage ? (
                  <Image src={recipe.coverImage} mode="aspectFill" className="recipe-cover" />
                ) : (
                  <View className="recipe-cover-placeholder">🍳</View>
                )}
                <View className="recipe-info">
                  <Text className="recipe-name">{recipe.name}</Text>
                  <Text className="recipe-category">{recipe.category}</Text>
                </View>
              </View>
              <View 
                className="remove-btn"
                onClick={() => handleRemoveRecipe(recipe.id)}
              >
                <Text>移除</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    return (
      <View className="modal-overlay" onClick={() => setShowCreateModal(false)}>
        <View className="modal-content" onClick={e => e.stopPropagation()}>
          <Text className="modal-title">新建收藏夹</Text>
          <Input
            className="folder-input"
            placeholder="请输入夹子名称"
            value={newFolderName}
            onInput={(e) => setNewFolderName(e.detail.value)}
            maxLength={20}
          />
          <View className="modal-buttons">
            <Button 
              className="cancel-btn"
              onClick={() => setShowCreateModal(false)}
            >
              取消
            </Button>
            <Button 
              className="confirm-btn"
              onClick={handleCreateFolder}
            >
              创建
            </Button>
          </View>
        </View>
      </View>
    );
  };

  const renderPantryModal = () => {
    if (!showPantryModal) return null;
    return (
      <View className="modal-overlay" onClick={() => setShowPantryModal(false)}>
        <View className="modal-content pantry-modal" onClick={e => e.stopPropagation()}>
          <Text className="modal-title">{editingPantryItem ? '编辑食材' : '添加食材'}</Text>
          
          <View className="form-item">
            <Text className="form-label">食材名称</Text>
            <Input
              className="form-input"
              placeholder="请输入食材名称"
              value={pantryForm.name}
              onInput={(e) => setPantryForm({ ...pantryForm, name: e.detail.value })}
              maxLength={20}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">数量</Text>
            <View className="form-row">
              <Input
                className="form-input amount-input"
                type="number"
                placeholder="数量"
                value={String(pantryForm.amount)}
                onInput={(e) => setPantryForm({ ...pantryForm, amount: Number(e.detail.value) || 0 })}
              />
              <Picker
                mode="selector"
                range={UNIT_OPTIONS}
                onChange={(e) => setPantryForm({ ...pantryForm, unit: UNIT_OPTIONS[e.detail.value] })}
              >
                <View className="unit-picker">
                  <Text>{pantryForm.unit}</Text>
                  <Text className="picker-arrow">▼</Text>
                </View>
              </Picker>
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">分类</Text>
            <View className="category-picker">
              {PANTRY_CATEGORY_OPTIONS.map(option => (
                <View
                  key={option.key}
                  className={`category-option ${pantryForm.category === option.key ? 'active' : ''}`}
                  onClick={() => setPantryForm({ ...pantryForm, category: option.key as PantryItem['category'] })}
                >
                  <Text>{option.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="modal-buttons">
            <Button 
              className="cancel-btn"
              onClick={() => setShowPantryModal(false)}
            >
              取消
            </Button>
            <Button 
              className="confirm-btn"
              onClick={handleSavePantryItem}
            >
              {editingPantryItem ? '保存' : '添加'}
            </Button>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="profile-page">
      {renderTabBar()}
      
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'pantry' && renderPantryTab()}
      {activeTab === 'favorites' && renderFavoritesTab()}

      {renderCreateModal()}
      {renderPantryModal()}
    </View>
  );
}
