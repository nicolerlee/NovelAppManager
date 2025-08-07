<template>
  <div v-if="showModal" class="login-modal-overlay">
    <div class="login-modal-container">
      <div class="login-left-panel">
        <div class="login-ad-content">
          <h2>文曲助力 全链路打通小说小程序</h2>
          <p>让小程序生产更轻松，让需求流动更简单</p>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <el-icon><Brush /></el-icon>
              </div>
              <span>创意</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <el-icon><Document /></el-icon>
              </div>
              <span>开发</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <el-icon><Share /></el-icon>
              </div>
              <span>发布</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <span>AI</span>
            </div>
          </div>
        </div>
      </div>
      <div class="login-right-panel">
        <button @click="closeModal" class="close-btn">×</button>
        <h3>欢迎登录文曲</h3>
        <div class="login-form-container">
          <div class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="username" placeholder="请输入用户名">
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="password" placeholder="请输入密码">
            </div>
            <div class="remember-forgot">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe">
                <span>记住账号密码</span>
              </label>
              <a href="#" class="forgot-password">忘记密码</a>
            </div>
            <button @click="handleLogin" class="login-btn">登录</button>
            <div class="register-link">
              <span>还没有账号？</span>
              <a href="#" class="register-btn">注册账号</a>
            </div>
          </div>
        </div>
        <div class="agreement">
          登录即同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私协议》</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义emits
const emit = defineEmits(['close', 'login']);

// 本地响应式变量控制弹窗显示
const showModal = ref(props.visible);
// 账号密码
const username = ref('');
const password = ref('');
const rememberMe = ref(true);

// 监听props.visible变化
watch(() => props.visible, (newValue) => {
  showModal.value = newValue;
});

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  emit('close');
};

// 处理密码登录
const handleLogin = () => {
  if (!username.value) {
    ElMessage.error('请输入手机号');
    return;
  }
  if (!password.value) {
    ElMessage.error('请输入密码');
    return;
  }
  // 模拟登录验证
  emit('login', {
    username: username.value,
    password: password.value,
    rememberMe: rememberMe.value
  });
};
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* 确保弹窗显示在最上层 */
  opacity: 1;
  pointer-events: auto;
}

.login-modal-container {
  position: relative;
  z-index: 100000;
  width: 900px;
  height: 550px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
}

.login-left-panel {
  width: 50%;
  background: linear-gradient(135deg, #4096ff, #59b1ff);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-ad-content h2 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.login-ad-content p {
  font-size: 16px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
}

.feature-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.feature-icon i {
  font-size: 24px;
}

.login-right-panel {
  width: 50%;
  padding: 40px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  z-index: 10;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-right-panel h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 0 20px 10px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #4096ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4096ff;
}

.login-form-container {
  padding: 0 20px;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.form-group input {
  width: 100%;
  height: 42px;
  padding: 0 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4096ff;
}

.verify-code-group {
  display: flex;
  gap: 10px;
}

.verify-code-input {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  height: 42px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.send-code-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.forgot-password {
  color: #4096ff;
  text-decoration: none;
}

.login-btn {
  width: 100%;
  height: 44px;
  background-color: #4096ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2780e3;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-btn {
  color: #4096ff;
  text-decoration: none;
  font-weight: 500;
}

.agreement {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.agreement a {
  color: #4096ff;
  text-decoration: none;
}
</style>