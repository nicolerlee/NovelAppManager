<template>
  <div class="login-modal-overlay">
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
        <h3>{{ currentTab === "login" ? "欢迎登录文曲" : "注册文曲账号" }}</h3>
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: currentTab === 'login' }"
            @click="currentTab = 'login'"
          >
            <span>登录</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'register' }"
            @click="currentTab = 'register'"
          >
            <span>注册</span>
          </div>
        </div>
        <div class="login-form-container">
          <!-- 登录表单 -->
          <div class="login-form" v-if="currentTab === 'login'">
            <div class="form-group">
              <label>用户名</label>
              <input
                type="text"
                v-model="username"
                placeholder="请输入用户名"
              />
            </div>
            <div class="form-group password-group">
              <label>密码</label>
              <div class="password-input-wrapper">
                <input
                  :type="showLoginPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="请输入密码"
                  @keyup.enter="handleLogin"
                />
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="toggle-password-btn"
                >
                  <el-icon v-if="showLoginPassword"><View /></el-icon>
                  <el-icon v-else><Hide /></el-icon>
                </button>
              </div>
            </div>
            <div class="remember-forgot">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span>记住账号密码</span>
              </label>
              <a href="#" class="forgot-password">忘记密码</a>
            </div>
            <button @click="handleLogin" class="login-btn">登录</button>
            <div class="register-link">
              <span>还没有账号？</span>
              <a
                href="#"
                class="register-btn"
                @click.stop="currentTab = 'register'"
                ><span>注册账号</span></a
              >
            </div>
          </div>
          <!-- 注册表单 -->
          <div class="register-form" v-else-if="currentTab === 'register'">
            <div class="form-group">
              <label>用户名</label>
              <input
                type="text"
                v-model="registerUsername"
                placeholder="请输入用户名"
              />
            </div>
            <div class="form-group password-group">
              <label>密码</label>
              <div class="password-input-wrapper">
                <input
                  :type="showRegisterPassword ? 'text' : 'password'"
                  v-model="registerPassword"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  @click="showRegisterPassword = !showRegisterPassword"
                  class="toggle-password-btn"
                >
                  <el-icon v-if="showRegisterPassword"><View /></el-icon>
                  <el-icon v-else><Hide /></el-icon>
                </button>
              </div>
            </div>
            <div class="form-group password-group">
              <label>确认密码</label>
              <div class="password-input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="请再次输入密码"
                  @keyup.enter="handleRegister"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="toggle-password-btn"
                >
                  <el-icon v-if="showConfirmPassword"><View /></el-icon>
                  <el-icon v-else><Hide /></el-icon>
                </button>
              </div>
              <div
                v-if="!passwordMatch && confirmPassword"
                class="error-message"
              >
                两次输入的密码不一致
              </div>
            </div>
            <div class="form-group">
              <label>用户类型</label>
              <div class="user-type-selector">
                <label class="user-type-option">
                  <input
                    type="radio"
                    name="userType"
                    value="0"
                    v-model="userType"
                  />
                  <span>研发</span>
                </label>
                <label class="user-type-option">
                  <input
                    type="radio"
                    name="userType"
                    value="1"
                    v-model="userType"
                  />
                  <span>产品</span>
                </label>
                <label class="user-type-option">
                  <input
                    type="radio"
                    name="userType"
                    value="2"
                    v-model="userType"
                  />
                  <span>测试</span>
                </label>
              </div>
            </div>
            <button @click="handleRegister" class="login-btn">注册</button>
            <div class="register-link">
              <span>已有账号？</span>
              <a
                href="#"
                class="register-btn"
                @click.stop="currentTab = 'login'"
                ><span>立即登录</span></a
              >
            </div>
          </div>
        </div>
        <div class="agreement">
          {{ currentTab === "login" ? "登录" : "注册" }}即同意
          <a href="#">《用户协议》</a> 和 <a href="#">《隐私协议》</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onUnmounted,inject } from "vue";
import { ElMessage } from "element-plus";
import {
  View,
  Hide,
  Brush,
  Document,
  Share,
  Cpu,
} from "@element-plus/icons-vue";

// 当前标签页，login或register
const currentTab = ref("login");
// 登录表单数据
const username = ref("");
const password = ref("");
const rememberMe = ref(true);
const showLoginPassword = ref(false); // 控制登录密码显示
// 注册表单数据
const registerUsername = ref("");
const registerPassword = ref("");
const confirmPassword = ref("");
const userType = ref("0"); // 默认研发
const passwordMatch = ref(true);
const showRegisterPassword = ref(false); // 控制注册密码显示
const showConfirmPassword = ref(false); // 控制确认密码显示

const TAG="LoginDialog->"
const auth = inject('auth', null);

// 实时检查密码是否匹配
watch(
  [registerPassword, confirmPassword],
  ([newPassword, newConfirmPassword]) => {
    passwordMatch.value = newPassword === newConfirmPassword;
  }
);

// 关闭弹窗
const closeModal = () => {
  auth.hideLogin()
};

// 处理密码登录
const handleLogin = async () => {
  if (!username.value) {
    ElMessage.error('请输入用户名');
    return;
  }
  if (!password.value) {
    ElMessage.error('请输入密码');
    return;
  }

  // 调用auth中的login方法
  const result = await auth.login({
    username: username.value,
    password: password.value,
    rememberMe: rememberMe.value
  });

  if (result) {
    // 登录成功，这里可以添加额外的逻辑
    console.log(TAG,'登录成功，用户信息:', result);
  } else {
    // 登录失败，无需额外处理，auth.login已经显示错误信息
  }
};

// 处理注册
const handleRegister = async () => {
  if (!registerUsername.value) {
    ElMessage.error("请输入用户名");
    return;
  }
  if (!registerPassword.value) {
    ElMessage.error("请输入密码");
    return;
  }
  if (!passwordMatch.value) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }
  if (!userType.value) {
    ElMessage.error("请选择用户类型");
    return;
  }

  const res = await auth.register({
    userName: registerUsername.value,
    password: registerPassword.value,
    type: parseInt(userType.value),
  });

  // 检查是否返回了Promise
  if (res) {
    // 自动切换到登录tab
    currentTab.value = "login";
    // 自动填充用户名
    username.value = res.data.userName;
    // 清空注册表单
    registerUsername.value = "";
    registerPassword.value = "";
    confirmPassword.value = "";

  } 
};
</script>

<style scoped>
/* 密码输入框样式 */
.password-group {
  position: relative;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  padding-right: 45px;
}

.toggle-password-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
}

.toggle-password-btn:hover {
  color: rgb(96, 92, 229);
}

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
  z-index: 1000; /* 降低层级，确保ElMessage可以显示在上面 */
  opacity: 1;
  pointer-events: auto;
}

.login-modal-container {
  position: relative;
  z-index: 100000;
  width: 900px;
  max-width: 90%;
  height: 700px;
  background-color: #fff;
  border-radius: 12px;
  overflow-x: hidden;
  overflow-y: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
}

.login-left-panel {
  width: 50%;
  /* background: linear-gradient(135deg, #4096ff, #59b1ff); */
  background: rgb(96, 92, 229);
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
  color: rgb(96, 92, 229);
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: rgb(96, 92, 229);
}

.login-form-container {
  padding: 0 20px;
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f5f5f5;
  box-sizing: border-box;
}

.login-form-container::-webkit-scrollbar {
  width: 6px;
}

.login-form-container::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 3px;
}

.login-form-container::-webkit-scrollbar-track {
  background-color: transparent;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
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
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: rgb(96, 92, 229);
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.user-type-selector {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.user-type-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.user-type-option input {
  width: auto;
  height: auto;
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
  color: rgb(96, 92, 229);
  text-decoration: none;
}

.login-btn {
  width: 100%;
  height: 44px;
  background-color: rgb(96, 92, 229);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: rgb(96, 92, 229);
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-btn {
  color: rgb(96, 92, 229);
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
  color: rgb(96, 92, 229);
  text-decoration: none;
}
</style>