import { ref, provide, inject } from 'vue';

// 创建登录状态管理的组合式函数
export function useAuth() {
  // 登录状态
  const isLogin = ref(false);
  // 登录弹窗显示状态
  const showLoginModal = ref(false);
  // 当前用户信息
  const userInfo = ref(null);

  // 登录函数
  const login = (userData) => {
    // 这里只是模拟登录，实际项目中需要调用后台接口
    console.log('登录信息:', userData);
    isLogin.value = true;
    userInfo.value = userData;
    showLoginModal.value = false;
    // 可以在这里添加登录成功的逻辑，如存储token等
  };

  // 登出函数
  const logout = () => {
    isLogin.value = false;
    userInfo.value = null;
    // 可以在这里添加登出逻辑，如清除token等
  };

  // 显示登录弹窗
  const showLogin = () => {
    showLoginModal.value = true;
  };

  // 隐藏登录弹窗
  const hideLogin = () => {
    console.log('hideLogin called');
    showLoginModal.value = false;
  };

  return {
    isLogin,
    showLoginModal,
    userInfo,
    login,
    logout,
    showLogin,
    hideLogin
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