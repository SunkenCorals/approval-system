import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 模拟权限 Headers，实际项目中可能从 Store/LocalStorage 获取
    // 这里由各个 Page/Component 调用 API 时手动传入或在组件中设置 defaults
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0) {
      message.error(res.msg || 'System Error');
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res.data;
  },
  (error) => {
    if (error.response) {
      // 后端返回的错误结构
      const { data } = error.response;
      message.error(data.msg || 'Network Error');
    } else {
      message.error(error.message || 'Network Error');
    }
    return Promise.reject(error);
  }
);

export default request;
