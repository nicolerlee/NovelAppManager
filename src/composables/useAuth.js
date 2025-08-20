import { ref, provide, inject } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

// 创建登录状态管理的组合式函数
const TAG="UseAuth->"
export function useAuth() {
  // 登录状态
  const isLogin = ref(false);
  // 登录弹窗显示状态
  const showLoginModal = ref(false);
  // 初始化时检查localStorage中的userInfo
  const userInfo = ref(localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null);

  // 初始化时检查localStorage中的token
  const token=ref(localStorage.getItem('token') || null);

  // 如果有token，尝试自动登录
  if (token.value) {
    // 这里可以添加自动登录的逻辑，比如验证token有效性
    isLogin.value = true;
  }

  // 登录函数
  const login = async (userData) => {
    try {
      // 调用登录API接口
      const res = await request.post('/api/novel-auth/login', {
        userName: userData.username,
        password: userData.password
      });
      
      // 现在res是完整的response对象
      if (res.data.code === 200) {
        // 登录成功
        isLogin.value = true;
        console.log(TAG,'login success res:',res);
        // 从header中获取token
        const authHeader = res.headers['authorization'] || res.headers['Authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token.value = authHeader.substring(7);
        } else {
          console.error('登录失败: 未在header中找到有效的Authorization token');
          ElMessage.error('登录失败: 认证信息获取失败');
          return null;
        }
        
        userInfo.value = res.data.data;
        showLoginModal.value = false;
        
        // 保存token和userInfo到localStorage
        localStorage.setItem('token', token.value);
        localStorage.setItem('userInfo', JSON.stringify(res.data.data));
        
        ElMessage.success('登录成功');
        console.log('登录成功:', res.data.data);
        return res.data.data;
      } else {
        // 登录失败
        ElMessage.error('登录失败: ' + (res.data.message || '用户名或密码错误'));
        return null;
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error('登录失败: ' + (error.message || '网络异常，请重试'));
      return null;
    }
  };

  // 登出函数
  const logout = () => {
    isLogin.value = false;
    userInfo.value = null;
    token.value=null;
    
    // 从localStorage移除token和userInfo
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  // 显示登录弹窗
  const showLogin = () => {
    console.log(TAG,'showLogin');
    showLoginModal.value = true;
  };

  // 隐藏登录弹窗
  const hideLogin = () => {
    console.log(TAG,'hideLogin');
    showLoginModal.value = false;
  };

  // 注册函数
  const register = async (userData) => {
    try {
      // 调用注册API接口
      const res = await request.post('/api/novel-auth/register', userData);
      if (res.code === 200) {
        ElMessage.success('注册成功');
        return res;
      } else {
        ElMessage.error('注册失败: ' + res.msg);
        return null;
      }
    } catch (error) {
      console.error('注册失败:', error);
      // ElMessage.error('注册失败: ' + (error.message || '未知错误'));
    }
  };

  return {
    isLogin,
    showLoginModal,
    userInfo,
    token,
    login,
    logout,
    showLogin,
    hideLogin,
    register
  };
}

// 创建一个提供登录状态的函数
export function provideAuth() {
  const auth = useAuth();
  provide('auth', auth);
  return auth;
}

// 创建一个注入登录状态的函数
export function injectAuth() {
  const auth = inject('auth');
  if (!auth) {
    throw new Error('请在应用的顶层组件中调用provideAuth函数');
  }
  return auth;
}