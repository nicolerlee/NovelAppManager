<template>
  <div class="flex-container">
    <div class="sidebar">
      <div class="logo-container">
        <img src="/images/logo/wenqu_logo.png" class="logo-image" />
        <div class="logo-text">WENQU 2.0</div>
      </div>
      <div class="sidebar-menu">

        <router-link to="/home" class="menu-item" active-class="menu-item-active">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>

        <router-link to="/apps" class="menu-item" active-class="menu-item-active">
          <el-icon><Platform /></el-icon>
          <span>小程序列表</span>
        </router-link>

        <router-link to="/config" class="menu-item" active-class="menu-item-active">
          <el-icon><Setting /></el-icon>
          <span>微距(for测试同学)</span>
        </router-link>

        <router-link to="/ads" class="menu-item" active-class="menu-item-active">
          <el-icon><Picture /></el-icon>
          <span>广告</span>
        </router-link>

        <router-link to="/payment" class="menu-item" active-class="menu-item-active">
          <el-icon><Money /></el-icon>
          <span>支付</span>
        </router-link>

        <router-link to="/ui-config" class="menu-item" active-class="menu-item-active">
          <el-icon><PictureRounded /></el-icon>
          <span>UI配置</span>
        </router-link>

        <router-link to="/general-config" class="menu-item" active-class="menu-item-active">
          <el-icon><Tools /></el-icon>
          <span>通用配置</span>
        </router-link>

        <router-link to="/wenqu-auto" class="menu-item" active-class="menu-item-active">
          <el-icon><MagicStick /></el-icon>
          <span>文曲自动化</span>
        </router-link>

        <router-link to="/wenqu-ai" class="menu-item" active-class="menu-item-active">
          <el-icon><Star /></el-icon>
          <span>文曲AI</span>
        </router-link>

        <router-link to="/toolbox" class="menu-item" active-class="menu-item-active">
          <el-icon><Grid /></el-icon>
          <span>工具箱</span>
        </router-link>

        <!-- 后台管理菜单，仅研发可见 -->
        <router-link v-if="auth.isLogin.value && auth.userInfo.value?.type === 0" to="/admin" class="menu-item" active-class="menu-item-active">
          <el-icon><Key /></el-icon>
          <span>后台管理</span>
        </router-link>
      </div>
    </div>

    <div class="main-content">
      <!-- 登录相关UI只在首页显示 -->
      <div v-if="router.currentRoute.value.path === '/home'" class="login-content">
        <div v-if="auth.isLogin.value">
          <el-dropdown>              
            <div class="admin-info">
              <div class="user-avatar">
                <img src="/images/icon/user_icon.png" alt="用户头像" class="avatar-image" />
              </div>
              <span>
                {{ auth.userInfo.value?.userName }}（{{ getUserTypeDesc(auth.userInfo.value?.type) }}同学） <el-icon><ArrowDown /></el-icon>
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="auth.userInfo.value?.type === 0" @click="handleNavigateToAdmin">后台管理</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div v-else class="login-btn" @click="auth.showLogin">
          立即登录
        </div>
      </div>
       
      <router-view></router-view>
    </div>
  </div>
<!-- 登录弹窗组件 -->
   <LoginModal v-if="auth.showLoginModal.value"/>
 </template>

<script setup>
import { onMounted, onUnmounted, provide, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
// 导入登录相关的组合式函数
import { provideAuth } from "./composables/useAuth";
// 导入设置认证token的函数
import { setAuthToken } from "./utils/request";
// 导入登录弹窗组件
 import LoginModal from "./components/common/LoginModal.vue";
// 提供登录状态
const auth = provideAuth();
const TAG="App->";
// 初始化路由
const router = useRouter();

// 监听token变化并更新request.js中的认证token
watchEffect(() => {
  if (auth.token && auth.token.value) {
    setAuthToken(auth.token.value);
  } else {
    setAuthToken(null);
  }
});


// 用户类型描述转换函数
const getUserTypeDesc = (type) => {
  switch(type) {
    case 0:
      return '研发';
    case 1:
      return '产品';
    case 2:
      return '测试';
    default:
      return '未知';
  }
};

// 处理退出登录
const handleLogout = () => {
  auth.logout();
  ElMessage.success('退出登录成功');
  
  // 如果当前在后台管理页面，重定向到小程序列表首页
  if (router.currentRoute.value.path === '/admin') {
    router.push('/apps');
  }
};

// 处理跳转到后台管理
const handleNavigateToAdmin = () => {
  router.push('/admin');
};



//智能体终端
const agentClient = ref(null);
//智能体配置项
const agentOption = ref({
  config: {
    bot_id: "7532714420175847487",
  },
  componentProps: {
    title: "文曲智能对话",
  },
  //鉴权配置
  auth: {
    type: "token",
    token:
      "pat_ogyAtCdul52maU0rzqGWhwHnkHTDzMlIoP46jzLvTOKXAKjdv6PJ4TYq9hS7Ps3L",
    onRefreshToken: function () {
      return "pat_ogyAtCdul52maU0rzqGWhwHnkHTDzMlIoP46jzLvTOKXAKjdv6PJ4TYq9hS7Ps3L";
    },
  },
  //整体UI效果配置
  ui: {
    base: {
      icon: "/images/logo/wenqu_logo.png",
      layout: "pc",
      zIndex: 1000,
    },
    asstBtn: {
      isNeed: true,
    },
    footer: {
      isShow: true,
      expressionText: "Powered by Wenqu AI",
    },
  },
  //聊天框的 UI 和基础能力
  chatBot: {
    title: "文曲智能对话",
    uploadable: true,
    width: 800,
    //设置是否支持对智能体或应用回复的消息进行追问。
    isNeedQuote: true,
    //当聊天框隐藏的时候，会回调该方法
    onHide: () => {},
    //当聊天框 显示的时候，会回调该方法
    onShow: () => {},
    el: null,
  },
});

onMounted(() => {
  console.log(TAG,"onMounted");
  try {
    agentClient.value = new CozeWebSDK.WebChatClient(agentOption.value);
    // 提供agentClient给所有子组件
    provide("agentClient", agentClient);
  } catch (e) {
    console.error(TAG,"创建WebChatClient实例失败:", e);
    return;
  }
});


onUnmounted(async () => {
  console.log(TAG,"unmounted");
  // 如果destroy是异步函数，等待它完成
  if (agentClient.value && agentClient.value.destroy) {
    await agentClient.value.destroy();
  }
  // 清除引用
  agentClient.value = null;
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  height: 100%;
}

.flex-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 214px;
  background-image: linear-gradient(rgb(234, 242, 255) 0%, rgb(234, 242, 255) 190px, rgb(234, 242, 255) 25%, rgb(230, 230, 255) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #e0e0e0;
}

.logo-container {
  width: 214px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 24px 0px 16px;
  padding-left: 40px;
}

.logo-text{
  margin-left: 10px;
  font-weight: bold;
  color: #605ce5;
}
.logo-image {
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
}

.sidebar-menu {
  
}

.menu-item {
  display: flex;
  align-items: center;
  width: 174px;
  height: 44px;
  text-decoration: none;
  color: rgb(39, 38, 77);
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;;
  border-radius: 8px;
  margin-bottom: 16px;
  padding-left: 20px;
    padding-right: 8px;
}

.menu-item:hover {
  background-color: rgba(96, 92, 229, .10);
  
}

.menu-item-active {
  background-color: rgb(96, 92, 229);
  color: rgb(255, 255, 255);
  font-weight: 500;
  border-left: none;
}

.menu-item .el-icon {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.login-content{
  position: fixed;
  z-index: 999;
  top: 30px;
  right: 40px;
}
.login-btn{
  width: 96px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  background-color: #605ce5;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.user-avatar {
  margin-right: 10px;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

</style>