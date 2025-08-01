<template>
  <div class="wenqu-agent-page">
    <el-card>
      <template #header>
        <div class="header">
          <h3>文曲下凡 - 内测版</h3>
        </div>
      </template>
      <div class="wenqu-agent-container">
        <!-- 添加容器调试标识 -->
        <div
          ref="agentContainer"
          id="agentContainer"
          class="agent-content"
          :style="containerStyle"
        >
          <!-- 容器占位标识 -->
          <div v-if="!agentClient" class="container-placeholder">
            智能体加载中...
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
//智能体配置
const agentContainer = ref(null);
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
    el:null
  },
});

const agentClient = ref(null);

// 容器样式定义
const containerStyle = {
  width: "100%",
  height: "500px",
  minHeight: "500px",
  border: "1px solid #e5e7eb",
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#ffffff",
};

// 合并后的onMounted钩子
onMounted(async () => {
  await nextTick();

  // 整合所有挂载逻辑
  let container = document.getElementById('agentContainer');
  if (!container || !(container instanceof HTMLElement)) {
    console.error("无效的容器元素:", container);
    return;
  }

  // 多配置方式传递容器
  agentOption.value.chatBot.el = container;

  try {
    agentClient.value = new CozeWebSDK.WebChatClient(agentOption.value);
    agentClient.value.showChatBot()
  } catch (e) {
    console.error("创建WebChatClient实例失败:", e);
    return;
  }
});

onUnmounted(async () => {
  // 如果destroy是异步函数，等待它完成
  if (agentClient.value && agentClient.value.destroy) {
    await agentClient.value.destroy();
  }
  // 清除引用
  agentClient.value = null;
});
</script>

<style scoped>
/* 唯一有效的样式定义 */
.wenqu-agent-page {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.agent-content {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  height: 500px;
}
.container-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background-color: #f9fafb;
}
.wenqu-agent-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>