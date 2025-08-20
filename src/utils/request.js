import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 创建一个函数用于设置认证token
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 自动添加Authorization头部
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else {
      // 降级方案：从localStorage获取token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 检查是否为二维码接口响应或图片响应
    const isQrCodeRequest = response.config.url.includes('/api/novel-publish/qrcode/');
    const contentType = response.headers['content-type'];
    const isImageResponse = contentType && contentType.startsWith('image/');
    // 检查是否为登录请求
    const isLoginRequest = response.config.url.includes('/api/novel-auth/login');

    // 如果是二维码请求、图片响应或登录请求，直接返回原始响应
    if (isQrCodeRequest || isImageResponse || isLoginRequest) {
        return response; // 返回完整的response对象
    }

    // 对于其他响应，进行正常的JSON数据和code检查
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      // 抛出错误，以便调用方能在catch中处理，同时携带后端返回的可能有用信息
      const error = new Error(res.message || '请求失败');
      error.response = response; // 将原始响应附加到错误对象
      return Promise.reject(error);
    }
    return res // 返回res.data
  },
  error => {
    // 处理认证失败的情况
  if (error.response?.status === 401) {
    // Token过期或无效，清除token
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    authToken = null; // 更新全局token变量
    ElMessage.error('登录已过期，请重新登录');
    // 重定向到首页
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } else {
      ElMessage.error(error.message || '请求失败');
    }
    return Promise.reject(error)
  }
)

export default request