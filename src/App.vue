<template>
  <div class="flex-container">
    <div class="sidebar">
      <div class="logo-container">
        <img src="/images/logo/wenqu_logo.png" class="logo-image" />
        <div class="logo-text">WENQU 2.0</div>

      </div>
       <router-link to="/home" class="menu-item" active-class="menu-item-active">
          <svg width="20px" height="20px" viewBox="0 0 20 20"><defs><rect id="path-bitl8fdbrr-1" x="0" y="0" width="20" height="20"></rect></defs><g stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"><g id="home"><g id="path-1"></g><path d="M17.5,6.6368772 L17.5,17.5 L11.5,17.5 L11.5,12.2874897 L8.5,12.2874897 L8.5,17.5 L4.74999658,17.5 L4.73392336,17.5 C3.50016156,17.5 2.5,16.4998384 2.5,15.2660766 L2.5,15.2660766 L2.5,15.2660766 L2.5,6.6368772 L10,2.5 L17.5,6.6368772 Z" id="vector" fill="currentColor" fill-rule="nonzero" mask="url(#mask-bitl8fdbrr-2)"></path></g></g></svg>
          <span style="margin-left: 8px;">首页</span>
        </router-link>

        <router-link to="/apps" class="menu-item" active-class="menu-item-active">
          <svg t="1666080077986" class="icon" viewBox="0 0 1024 1024" p-id="4159" width="20" height="20"><path d="M640 128l213.333333 213.333333v513.28l-0.298666 4.864a41.386667 41.386667 0 0 1-36.266667 36.266667l-4.778667 0.256H298.666667l-7.509334-0.213333a128 128 0 0 1-120.277333-120.277334L170.666667 768V171.008l0.256-4.693333c2.133333-19.882667 17.877333-35.712 37.717333-38.016L213.674667 128H640z m42.666667 426.666667H341.333333v42.666666l0.298667 4.992a42.666667 42.666667 0 0 0 37.376 37.376L384 640h298.666667v-85.333333z m-85.333334-170.666667H341.333333v85.333333h256V384z" p-id="4160" fill="currentColor"></path></svg>
          <span style="margin-left: 8px;">小程序列表</span>
        </router-link>

        <router-link to="/config" class="menu-item" active-class="menu-item-active">
          <svg t="1666078013248" class="icon" viewBox="0 0 1024 1024" p-id="12494" width="20" height="20"><path d="M529.066667 165.034667l104.533333 216.405333 206.378667 20.181333a42.666667 42.666667 0 0 1 23.808 74.666667l-162.176 140.885333 46.037333 224.384a42.666667 42.666667 0 0 1-64.298667 44.8l-192.725333-119.637333-192.597333 119.637333a42.666667 42.666667 0 0 1-64.298667-44.8l45.994667-224.384-162.133334-140.842666a42.666667 42.666667 0 0 1 23.808-74.666667L348.16 381.44l104.106667-216.32a42.666667 42.666667 0 0 1 76.8-0.085333z" p-id="12495" fill="currentColor"></path></svg>
          <span style="margin-left: 8px;">微距(for测试同学)</span>
        </router-link>

        <!-- <router-link to="/ads" class="menu-item" active-class="menu-item-active">
          <el-icon><Picture /></el-icon>
          <span style="margin-left: 8px;">广告</span>
        </router-link>

        <router-link to="/payment" class="menu-item" active-class="menu-item-active">
          <el-icon><Money /></el-icon>
          <span style="margin-left: 8px;">支付</span>
        </router-link>

        <router-link to="/ui-config" class="menu-item" active-class="menu-item-active">
          <el-icon><PictureRounded /></el-icon>
          <span style="margin-left: 8px;">UI配置</span>
        </router-link>

        <router-link to="/general-config" class="menu-item" active-class="menu-item-active">
          <el-icon><Tools /></el-icon>
          <span style="margin-left: 8px;">通用配置</span>
        </router-link> -->

        <router-link to="/wenqu-auto" class="menu-item" active-class="menu-item-active">
          <svg width="20px" height="20px" viewBox="0 0 20 20"><g id="\u63A7\u4EF6" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icon/24*24/\u5171\u4EAB\u7EAA\u8981"><path d="M0,0 L20,0 L20,20 L0,20 L0,0 Z" id="user-m-(Background/Mask)"></path><path d="M3.9814865,17.5 C3.1632841,17.5 2.5,16.8367159 2.5,16.0185135 C2.5,13.0555537 4.69500581,10.8333333 7.91666667,10.8333333 C11.1383275,10.8333333 13.3333333,13.0555537 13.3333333,16.0185213 L13.3333333,16.0185213 L13.3333333,17.5 Z M14.1666611,12.5 C16.3981145,12.5 18.2198735,14.0671857 18.328234,16.1884318 L18.3333333,16.3888909 L18.3333333,17.5 L15,17.5 L15,16.0185213 C15,14.6451046 14.5283862,13.4308432 13.7015175,12.5232804 C13.8531848,12.5078334 14.008899,12.5 14.1666611,12.5 Z M14.1666667,6.66666667 C15.461084,6.66666667 16.5104167,7.75797259 16.5104167,9.10416667 C16.5104167,10.4503607 15.461084,11.5416667 14.1666667,11.5416667 C12.8722493,11.5416667 11.8229167,10.4503607 11.8229167,9.10416667 C11.8229167,7.75797259 12.8722493,6.66666667 14.1666667,6.66666667 Z M7.91666667,2.5 C9.728851,2.5 11.1979167,4.01103897 11.1979167,5.875 C11.1979167,7.73896103 9.728851,9.25 7.91666667,9.25 C6.10448233,9.25 4.63541667,7.73896103 4.63541667,5.875 C4.63541667,4.01103897 6.10448233,2.5 7.91666667,2.5 Z" id="\u5F62\u72B6\u7ED3\u5408" fill="currentColor"></path></g></g></svg>
          <span style="margin-left: 8px;">文曲自动化</span>
        </router-link>

        <router-link to="/wenqu-ai" class="menu-item" active-class="menu-item-active">
          <svg t="1666080077986" class="icon" viewBox="0 0 1024 1024" p-id="4159" width="20" height="20"><path d="M640 128l213.333333 213.333333v513.28l-0.298666 4.864a41.386667 41.386667 0 0 1-36.266667 36.266667l-4.778667 0.256H298.666667l-7.509334-0.213333a128 128 0 0 1-120.277333-120.277334L170.666667 768V171.008l0.256-4.693333c2.133333-19.882667 17.877333-35.712 37.717333-38.016L213.674667 128H640z m42.666667 426.666667H341.333333v42.666666l0.298667 4.992a42.666667 42.666667 0 0 0 37.376 37.376L384 640h298.666667v-85.333333z m-85.333334-170.666667H341.333333v85.333333h256V384z" p-id="4160" fill="currentColor"></path></svg>
          <span style="margin-left: 8px;">文曲AI</span>
        </router-link>

        <router-link to="/toolbox" class="menu-item" active-class="menu-item-active">
          <svg width="20px" height="20px" viewBox="0 0 20 20"><defs><rect id="path-tu_jwkx0s7-1" x="0" y="0" width="20" height="20"></rect></defs><g stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"><g id="recycler"><g id="path-1"></g><path d="M12.5,9.16666667 L12.5,14.1666667 L10.8333333,14.1666667 L10.8333333,9.16666667 L12.5,9.16666667 Z M9.16666667,9.16666667 L9.16666667,14.1666667 L8.33332869,14.1666667 L8.22880635,14.1601738 C7.81790632,14.1087513 7.5,13.7581652 7.5,13.3333281 L7.5,9.16666667 L9.16666667,9.16666667 Z M2.5,5 L2.5,6.66666667 L4.16666667,6.66666667 L4.16666287,15 C4.16666497,16.3807125 5.28595418,17.5 6.66666667,17.5 L6.66666153,17.5 L6.66666153,17.5 L15.8333333,17.5 L15.8333333,6.66666667 L17.5,6.66666667 L17.5,5 L2.5,5 Z M12.5,2.5 L7.5,2.5 L7.5,4.16666667 L12.5,4.16666667 L12.5,2.5 Z" id="vector" fill="currentColor" fill-rule="nonzero" mask="url(#mask-tu_jwkx0s7-2)"></path></g></g></svg>
          <span style="margin-left: 8px;">工具箱</span>
        </router-link>

        <!-- 后台管理菜单，仅研发可见 -->
        <router-link v-if="auth.isLogin.value && auth.userInfo.value?.type === 0" to="/admin" class="menu-item" active-class="menu-item-active">
          <svg t="1666080077986" class="icon" viewBox="0 0 1024 1024" p-id="4159" width="20" height="20"><path d="M640 128l213.333333 213.333333v513.28l-0.298666 4.864a41.386667 41.386667 0 0 1-36.266667 36.266667l-4.778667 0.256H298.666667l-7.509334-0.213333a128 128 0 0 1-120.277333-120.277334L170.666667 768V171.008l0.256-4.693333c2.133333-19.882667 17.877333-35.712 37.717333-38.016L213.674667 128H640z m42.666667 426.666667H341.333333v42.666666l0.298667 4.992a42.666667 42.666667 0 0 0 37.376 37.376L384 640h298.666667v-85.333333z m-85.333334-170.666667H341.333333v85.333333h256V384z" p-id="4160" fill="currentColor"></path></svg>
          <span style="margin-left: 8px;">后台管理</span>
        </router-link>

        <div style="height: auto; flex:1"></div>

        <div class="about-wenqu-content">
          <svg t="1663830167881" class="icon" viewBox="0 0 1024 1024" p-id="3917" width="20" height="20"><path d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m42.666667 597.333334h-85.333334v85.333333h85.333334v-85.333333zM512 256a170.666667 170.666667 0 0 0-170.453333 162.133333L341.333333 426.666667h85.333334a85.333333 85.333333 0 1 1 91.733333 85.12L512 512h-42.666667v107.178667h85.333334v-27.221334A170.752 170.752 0 0 0 512 256z" p-id="3918" fill="currentColor"></path></svg>
          <div class="about-wenqu-text">关于文曲</div>
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
      isNeed: false,
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
  background-image: linear-gradient(rgb(234, 242, 255) 0%, rgb(234, 242, 255) 190px, rgb(234, 242, 255) 25%, #e6e6ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #e0e0e0;
  height: 100%;
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

.menu-item:hover:not(.menu-item-active) {
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
  background-color: rgb(244, 247, 252);
  background-image: url(/images/home/home_bg_content1.png), url(/images/home/home_bg_content2.png);
  background-repeat: no-repeat, no-repeat;
  background-position: calc(100% + 310px) 0px, center calc(100% + 400px);
  background-size: 439px 607px, 888px 579px;
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
.about-wenqu-content{
 margin-bottom: 40px; 
 display: flex;
 flex-direction: row; 
 align-items: center; 
 height: 25px;
 cursor: pointer;
 transition: all 0.3s ease;
}
.about-wenqu-content:hover svg{
 color: #605ce5;
}
.about-wenqu-content:hover .about-wenqu-text{
 color: #605ce5;
}
.about-wenqu-text{
 color: rgb(39, 38, 77); 
 line-height: 25px; 
 height: 25px;
 font-size: 14px;
 margin-left: 8px;
 transition: color 0.3s ease;
}






</style>