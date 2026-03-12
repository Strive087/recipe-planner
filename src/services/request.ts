import Taro from '@tarojs/taro';
import axios from 'axios';
import axiosAdapter from 'axios-miniprogram-adapter';

axios.defaults.adapter = axiosAdapter;

const BASE_URL = 'https://api.yourdomain.com/v1';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = Taro.getStorageSync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 200 || data.code === 0) {
      return data;
    }
    Taro.showToast({
      title: data.message || '请求失败',
      icon: 'none',
    });
    return Promise.reject(data);
  },
  (error) => {
    Taro.showToast({
      title: '网络异常，请检查网络',
      icon: 'none',
    });
    return Promise.reject(error);
  }
);

export default request;
