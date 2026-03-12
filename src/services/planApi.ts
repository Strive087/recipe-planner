import request from './request';
import type { Recipe, PlanConfig, PlanResult, ApiResponse, GeneratePlanRequest, PlanGenerateResult } from '../types';

const SYSTEM_PROMPT = `你是一个专业的行政主厨和精算师。请严格按照 JSON 格式输出，不要输出任何解释文字。

输出格式：
{
  "shopping_list": [
    {
      "name": string,
      "totalAmount": number,
      "unit": string,
      "category": "meat"|"vegetable"|"seasoning"|"dry"|"other"
    }
  ],
  "cooking_guide": [
    {
      "order": number,
      "title": string,
      "duration": string,
      "actions": string[],
      "parallel": string|null
    }
  ]
}`;

function buildUserPrompt(recipes: Recipe[], config: PlanConfig): string {
  const appetiteCoeff = config.appetite === 'large' ? 1.2 : config.appetite === 'small' ? 0.8 : 1.0;
  
  return `菜谱数据：${JSON.stringify(recipes)}
目标人数：${config.servings}人
胃口系数：${appetiteCoeff}（正常=1.0，偏大=1.2，偏小=0.8）
忌口食材：${config.avoidFoods || '无'}

请完成：
1. 按人数和胃口系数计算食材用量，合并相同食材，去除忌口食材
2. 给出最高效的烹饪作业流程（非步骤堆砌，需体现并行建议）`;
}

export const planApi = {
  // AI 规划生成接口
  generate: async (recipes: Recipe[], config: PlanConfig): Promise<PlanResult> => {
    // TODO: 替换为实际的后端 API
    // const res = await request.post<ApiResponse<PlanResult>>('/plan/generate', {
    //   recipes,
    //   config,
    // });
    // return res.data;
    
    // 模拟 AI 调用（开发测试用）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          shopping_list: [
            { name: '五花肉', totalAmount: 500, unit: 'g', category: 'meat' },
            { name: '生姜', totalAmount: 15, unit: 'g', category: 'seasoning' },
            { name: '生抽', totalAmount: 30, unit: 'ml', category: 'seasoning' },
          ],
          cooking_guide: [
            {
              order: 1,
              title: '食材准备',
              duration: '15分钟',
              actions: ['五花肉切3cm方块', '焯水2分钟捞出'],
              parallel: '焯水期间可以备好酱油、冰糖等调料',
            },
          ],
        });
      }, 3000);
    });
  },

  // 流式输出版本（推荐）
  generateStream: async (
    recipes: Recipe[], 
    config: PlanConfig,
    onChunk: (text: string) => void
  ) => {
    // TODO: 实现 SSE 流式调用
    // const response = await request.post('/plan/generate/stream', {
    //   recipes,
    //   config,
    // }, {
    //   responseType: 'text',
    // });
    // return response;
  },

  // AI 规划生成接口 - 根据天数、每餐数、偏好生成规划
  generatePlan: async (days: number, mealsPerDay: number, preferences: string): Promise<PlanGenerateResult> => {
    const res = await request.post<ApiResponse<PlanGenerateResult>>('/plan/generate', {
      days,
      mealsPerDay,
      preferences,
    });
    return res.data;
  },
};

export default planApi;
