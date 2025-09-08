<template>
  <el-container>
    <el-aside width="200px">
      <div class="logo-container">
        <img src="/images/logo/wenqu_logo.png" class="logo-image" />
      </div>
      <el-menu
        :router="true"
        default-active="/apps"
        class="el-menu-vertical"
        background-color="#eef1f3"
        text-color="#333"
      >
        <el-menu-item index="/apps">
          <el-icon><Platform /></el-icon>
          <span>小程序列表</span>
        </el-menu-item>

        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>微距(for测试同学)</span>
        </el-menu-item>

        <el-menu-item index="/ads">
          <el-icon><Picture /></el-icon>
          <span>广告</span>
        </el-menu-item>

        <el-menu-item index="/payment">
          <el-icon><Money /></el-icon>
          <span>支付</span>
        </el-menu-item>

        <el-menu-item index="/general-config">
          <el-icon><Tools /></el-icon>
          <span>通用配置</span>
        </el-menu-item>


        <el-menu-item index="/wenqu-auto">
          <el-icon><Monitor /></el-icon>
          <span>文曲自动化</span>
        </el-menu-item>

        <el-menu-item index="/wenqu-ai">
          <el-icon><ChatDotRound /></el-icon>
          <span>文曲AI</span>
        </el-menu-item>

        <!-- 后台管理菜单，仅研发可见 -->
        <el-menu-item v-if="auth.isLogin.value && auth.userInfo.value?.type === 0" index="/admin">
          <el-icon><Key /></el-icon>
          <span>后台管理</span>
        </el-menu-item>

        
        <el-menu-item index="/toolbox">
          <el-icon><Grid /></el-icon>
          <span>工具箱</span>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <h2>文曲-小说小程序创作中心</h2>
          <!-- <h4>让需求流动更简单</h4> -->
          <div v-if="auth.isLogin.value">
            <el-dropdown>              
              <div class="admin-info">
                <div class="user-avatar">
                  <img :src="auth.userInfo.value?.avatar" alt="用户头像" class="avatar-image" />
                </div>
                <span>
                  {{ auth.userInfo.value?.userName }}（{{ getUserTypeDesc(auth.userInfo.value?.type) }}同学） <el-icon><ArrowDown /></el-icon>
                </span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item v-if="auth.userInfo.value?.type === 0" @click="handleNavigateToAdmin">后台管理</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <el-button v-else type="primary" @click="auth.showLogin">
            登录
          </el-button>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
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
      "pat_l7UKvMflGJIG5iL9YgRWcYW3NF19v1xiiGu15wSxMtwLRDJaNsUZ0xZWeiLYuT6y",
    onRefreshToken: function () {
      return "pat_l7UKvMflGJIG5iL9YgRWcYW3NF19v1xiiGu15wSxMtwLRDJaNsUZ0xZWeiLYuT6y";
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
.el-container {
  height: 100vh;
}

.el-aside {
  background-color: #eef1f3;
}

.logo-container {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #dcdfe6;
}

.logo-image {
  height: 50px;
  border-radius: 12px;
  object-fit: contain;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
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

.el-menu-vertical {
  height: 100%;
}

.el-menu-vertical .el-menu-item {
  color: #333; /* Default text color */
}

.el-menu-vertical .el-menu-item:hover {
  background-color: #e0e3e6; /* Subtle hover effect */
}

.el-menu-vertical .el-menu-item.is-active {
  background-color: #d3dce6; /* Active background */
  color: #409eff; /* Active text color */
  border-left: 3px solid #409eff; /* Active indicator */
}
</style>