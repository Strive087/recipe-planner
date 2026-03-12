import { View, Text, Image } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from '@tarojs/taro';
import { useRecipeStore } from '../../store/useRecipeStore';
import type { Recipe, Step } from '../../types';
import './index.scss';

export default function CookingMode() {
  const router = useRouter();
  const { getById } = useRecipeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioManagerRef = useRef<any>(null);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      const data = getById(id);
      if (data) {
        setRecipe(data);
        // 初始化语音播报
        initAudio();
      }
    }

    // 保持屏幕常亮
    Taro.setKeepScreenOn({
      keepScreenOn: true,
      success: () => {
        console.log('屏幕常亮已开启');
      },
      fail: (err) => {
        console.error('设置屏幕常亮失败:', err);
      }
    });

    // 页面卸载时关闭屏幕常亮
    return () => {
      Taro.setKeepScreenOn({
        keepScreenOn: false,
      });
      // 停止语音
      if (audioManagerRef.current) {
        audioManagerRef.current.stop();
      }
    };
  }, []);

  const initAudio = () => {
    // 获取背景音频管理器
    const audioManager = Taro.getBackgroundAudioManager();
    audioManagerRef.current = audioManager;

    audioManager.onEnded(() => {
      setIsPlaying(false);
    });

    audioManager.onStop(() => {
      setIsPlaying(false);
    });

    audioManager.onPlay(() => {
      setIsPlaying(true);
    });

    audioManager.onPause(() => {
      setIsPlaying(false);
    });
  };

  const speakStep = (step: Step) => {
    if (!audioManagerRef.current) return;

    const text = `第${step.order}步，${step.desc}`;
    
    // 使用微信小程序订阅同一 Tregird 组件进行测试
    // 实际项目中需要配置微信同声传译插件
    // 这里使用 setStorage 模拟语音播报提示
    Taro.showToast({
      title: '语音播报功能需要配置微信同声传译插件',
      icon: 'none',
      duration: 2000,
    });
    
    // 如果需要实际语音播放，可以使用以下代码（需要后端返回音频资源）
    // audioManagerManager.title = recipe?.name || '菜谱播报';
    // audioManagerManager.src = 'https://example.com/audio/step1.mp3';
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (recipe?.steps) {
        speakStep(recipe.steps[newStep]);
      }
    }
  };

  const handleNext = () => {
    if (recipe?.steps && currentStep < recipe.steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      speakStep(recipe.steps[newStep]);
    }
  };

  const handleVoiceToggle = () => {
    if (!recipe?.steps) return;
    
    if (isPlaying) {
      audioManagerRef.current?.pause();
    } else {
      speakStep(recipe.steps[currentStep]);
    }
  };

  const handleExit = () => {
    router.navigateBack();
  };

  if (!recipe || !recipe.steps || recipe.steps.length === 0) {
    return (
      <View className="cooking-mode-page">
        <View className="empty-state">
          <Text className="empty-text">暂无烹饪步骤</Text>
          <View className="exit-btn" onClick={handleExit}>返回</View>
        </View>
      </View>
    );
  }

  const currentStepData = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <View className="cooking-mode-page">
      {/* 顶部信息 */}
      <View className="header">
        <View className="exit-btn-small" onClick={handleExit}>✕ 退出</View>
        <Text className="recipe-name">{recipe.name}</Text>
        <Text className="step-counter">{currentStep + 1} / {recipe.steps.length}</Text>
      </View>

      {/* 进度条 */}
      <View className="progress-bar">
        <View className="progress-fill" style={{ width: `${progress}%` }} />
      </View>

      {/* 主要步骤显示区域 */}
      <View className="step-display">
        <View className="step-number-large">{currentStepData.order}</View>
        <Text className="step-desc-large">{currentStepData.desc}</Text>
      </View>

      {/* 语音播报按钮 */}
      <View className="voice-control">
        <View 
          className={`voice-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handleVoiceToggle}
        >
          <Text className="voice-icon">{isPlaying ? '🔊' : '🔈'}</Text>
          <Text className="voice-text">{isPlaying ? '播报中...' : '播报此步'}</Text>
        </View>
      </View>

      {/* 底部导航 */}
      <View className="bottom-nav">
        <View 
          className={`nav-btn prev-btn ${currentStep === 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
        >
          <Text className="nav-icon">◀</Text>
          <Text className="nav-text">上一步</Text>
        </View>

        <View 
          className={`nav-btn next-btn ${currentStep === recipe.steps.length - 1 ? 'disabled' : ''}`}
          onClick={handleNext}
        >
          <Text className="nav-text">下一步</Text>
          <Text className="nav-icon">▶</Text>
        </View>
      </View>
    </View>
  );
}
