<template>
  <div class="wenqu-agent-container" ref="containerRef" :class="{ 'chatbox-hidden': !localVisible }">
    <!-- 悬浮窗主体 -->
    <div class="wenqu-agent-chatbox" ref="chatboxRef" :class="{ 'visible': localVisible }">
      <!-- 头部 -->
      <div class="wenqu-agent-header">
        <div class="wenqu-agent-title">文曲下凡智能体</div>
        <div class="wenqu-agent-header-actions">
          <el-button type="text" class="minimize-btn" @click="minimizeChat">
            <el-icon><Minus /></el-icon>
          </el-button>
          <el-button type="text" class="close-btn" @click="closeChat">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 对话内容区域 -->
      <div class="wenqu-agent-messages" ref="messagesContainerRef">
        <!-- 欢迎消息 -->
        <div class="message assistant-message" v-if="messages.length === 0">
          <div class="message-content">
            <div class="assistant-avatar">
              <img src="/images/logo/wenqu_logo.png" alt="文曲智能体" class="avatar-img" />
            </div>
            <div class="message-text">
              <p>你好！我是文曲下凡智能体，有什么可以帮助你的吗？</p>
            </div>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-content">
            <div v-if="message.role === 'assistant'" class="assistant-avatar">
              <img src="/images/logo/wenqu_logo.png" alt="文曲智能体" class="avatar-img" />
            </div>
            <div v-if="message.role === 'user'" class="user-avatar">
              <img :src="auth.userInfo.value?.avatar || '/images/icon/user_icon.png'" alt="用户" class="avatar-img" />
            </div>
            <div class="message-text">
              <div v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div class="message assistant-message" v-if="isLoading">
          <div class="message-content">
            <div class="assistant-avatar">
              <img src="/images/logo/wenqu_logo.png" alt="文曲智能体" class="avatar-img" />
            </div>
            <div class="message-text">
              <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="wenqu-agent-input-area">
        <div class="input-wrapper">
          <textarea 
            v-model="inputMessage" 
            placeholder="请输入您的问题..."
            rows="3"
            @keyup.ctrl.enter="handleSendMessage"
            class="message-input"
          ></textarea>
          <el-button 
            type="primary" 
            @click="handleSendMessage" 
            :disabled="!inputMessage.trim() || isLoading" 
            class="send-btn"
          >
            <el-icon><ChatDotRound /></el-icon> 发送
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 最小化按钮 -->
    <div class="wenqu-agent-minimize" ref="minimizeRef" :class="{ 'visible': !localVisible }">
      <div class="minimize-icon" @click="showChat">
        <el-icon><ChatDotRound /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ChatDotRound, User, Minus, Close } from '@element-plus/icons-vue'
import { agentManager } from '../../utils/agentManager'
import { injectAuth } from '../../composables/useAuth'
import request from '../../utils/request'

// 使用本地状态，初始值与agentManager.isVisible保持一致
const localVisible = ref(agentManager.isVisible)
const containerRef = ref(null)
const chatboxRef = ref(null)
const minimizeRef = ref(null)
const messagesContainerRef = ref(null)

// 注入登录状态
const auth = injectAuth()

// 响应式数据
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)

// 检查DOM元素可见性的函数
const checkElementVisibility = () => {
  if (chatboxRef.value) {
    const computedStyle = window.getComputedStyle(chatboxRef.value)
    // 检查样式但不输出日志
  }
}

// 处理可见性变化的回调函数
const handleVisibilityChange = (isVisible) => {
  // 如果是要显示智能体，检查登录状态
  if (isVisible && !auth.isLogin.value) {
    auth.showLogin()
    // 阻止智能体显示
    return
  }
  
  localVisible.value = isVisible
  checkElementVisibility()
}

onMounted(() => {
  // 初始化时检查登录状态，如果未登录且智能体可见，则隐藏智能体
  if (localVisible.value && !auth.isLogin.value) {
    localVisible.value = false
    agentManager.hide()
  }
  
  // 组件挂载时如果有消息，滚动到底部
  if (messages.value.length > 0) {
    nextTick(() => {
      scrollToBottom()
    })
  }
  
  // 注册agentManager回调
  agentManager.onVisibilityChange(handleVisibilityChange)
  
  // 立即检查可见性
  checkElementVisibility()
  
  // 在下一个DOM更新周期检查
  nextTick(() => {
    checkElementVisibility()
  })
})

// 组件卸载时清理
onUnmounted(() => {
  agentManager.offVisibilityChange(handleVisibilityChange)
})

// 滚动到最新消息
const scrollToBottom = () => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

// 监听messages变化，自动滚动到底部
watch(
  () => messages.value,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true }
)

// 发送消息 
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  // 检查登录状态 
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  
  // 立即设置加载状态，防止重复发送 
  isLoading.value = true
  
  // 添加用户消息 
  const userMessage = {
    role: 'user',
    content: inputMessage.value.trim()
  }
  messages.value.push(userMessage)
  
  // 清空输入框 
  inputMessage.value = ''
  
  try {
    // 生成chatId 
    const userId = auth.userInfo.value?.userId || 'anonymous'
    const timestamp = new Date().getTime()
    const chatId = `${userId}_${timestamp}`
    
    // 使用原生fetch API替代axios，以更好地支持流式响应
    // 从localStorage获取token，添加鉴权信息
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch('/api/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'model': 'qwen-plus',
        'chatId': chatId,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: userMessage.content
    })
    
    // 添加一个空的助手消息 
    const assistantMessage = reactive({
      role: 'assistant',
      content: ''
    })
    messages.value.push(assistantMessage)
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 检查是否为流式响应
    if (!response.body) {
      throw new Error('Response body is not available');
    }
    
    // 流式响应处理
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let buffer = '';
    
    console.log('开始处理流式响应...');
    
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        // 解码收到的数据并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        console.log('收到数据块:', chunk);
        console.log('当前缓冲区:', buffer);
        
        // 处理SSE格式的消息，SSE格式：data: 内容\n\n
        let lineEndIndex;
        // 循环处理缓冲区中的所有完整消息
        while ((lineEndIndex = buffer.indexOf('\n\n')) !== -1) {
          // 提取完整的消息行
          const line = buffer.substring(0, lineEndIndex).trim();
          // 从缓冲区中移除已处理的消息
          buffer = buffer.substring(lineEndIndex + 2);
          console.log('处理完整消息:', line);
          
          // 将完整消息按换行符分割，处理每个可能的SSE消息行
          const messageLines = line.split('\n');
          
          for (const messageLine of messageLines) {
            const trimmedLine = messageLine.trim();
            
            // 跳过空行
            if (!trimmedLine) continue;
            
            // 检查是否是SSE格式的data字段（适配冒号后有无空格的情况）
            if (trimmedLine.startsWith('data:')) {
              // 提取data:后面的内容（移除data:前缀，然后修剪空白字符）
              const content = trimmedLine.substring(5).trim();
              console.log('提取的消息内容:', content);
              
              // 检查是否是结束标记
              if (content === '[DONE]') {
                console.log('收到结束标记，终止流式处理');
                done = true; // 设置done为true，终止外层循环
                break;
              }
              
              // 只有非空内容才添加到助手消息中
              if (content) {
                // 将内容添加到助手消息中
                assistantMessage.content += content + '\n';
                console.log('更新助手消息内容:', assistantMessage.content);
                await nextTick();
                scrollToBottom();
              }
            }
          }
        }
      }
    }
    
    // 处理缓冲区中剩余的内容
    if (buffer.trim()) {
        console.log('处理缓冲区剩余内容:', buffer);
        
        // 将剩余内容按换行符分割，处理每个可能的SSE消息行
        const messageLines = buffer.split('\n');
        
        for (const messageLine of messageLines) {
          const trimmedLine = messageLine.trim();
          
          // 跳过空行
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith('data:')) {
            const content = trimmedLine.substring(5).trim();
            if (content !== '[DONE]' && content) {
              assistantMessage.content += content + '\n';
              await nextTick();
              scrollToBottom();
            }
          }
        }
      }
    
    // 移除最后的换行符
    if (assistantMessage.content.endsWith('\n')) {
      assistantMessage.content = assistantMessage.content.slice(0, -1);
    }
    
    console.log('完整消息内容:', assistantMessage.content);
    
    // 完成后关闭reader
    await reader.closed;
    
  } catch (error) {
    console.error('Chat API error:', error)
    // 添加错误消息
    const errorMessage = {
      role: 'assistant',
      content: `很抱歉，与AI助手的对话出现错误：${error.message}`
    }
    messages.value.push(errorMessage)
  } finally {
    // 无论成功还是失败，都关闭加载状态
    isLoading.value = false
  }
}

// 最小化聊天
const minimizeChat = () => {
  localVisible.value = false
  // 同步到agentManager
  agentManager.hide()
}

// 显示聊天
const showChat = () => {
  // 检查登录状态
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  localVisible.value = true
  // 同步到agentManager
  agentManager.show()
}

// 格式化消息文本，将换行符转换为<br>标签
const formatMessage = (text) => {
  if (!text) return ''
  // 将换行符转换为<br>标签
  return text.replace(/\n/g, '<br>')
}

// 关闭聊天
const closeChat = () => {
  localVisible.value = false
  // 同步到agentManager
  agentManager.hide()
}
</script>

<style scoped>
.wenqu-agent-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
}

/* 当聊天框隐藏时，让容器不拦截点击事件 */
.wenqu-agent-container.chatbox-hidden {
  pointer-events: none;
}

/* 确保最小化按钮始终可以点击 */
.wenqu-agent-container.chatbox-hidden .wenqu-agent-minimize {
  pointer-events: auto;
}

.wenqu-agent-chatbox {
  width: 400px;
  height: 800px; /* 增加对话框高度 */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 使用CSS类控制显示/隐藏 */
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  position: relative;
  z-index: 10000;
}

.wenqu-agent-chatbox:not(.visible) {
  opacity: 0;
  visibility: hidden;
}

.wenqu-agent-header {
  background-color: #605ce2;
  color: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wenqu-agent-title {
  font-size: 16px;
  font-weight: 600;
}

.wenqu-agent-header-actions .el-button {
  color: #fff;
  padding: 4px 8px;
}

.wenqu-agent-header-actions .el-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.wenqu-agent-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.message {
  margin-bottom: 16px;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.assistant-avatar, .user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  background-color: #e9ecef;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.assistant-avatar {
  background-color: #605ce2;
  color: #fff;
}

.user-avatar {
  background-color: #e9ecef;
  color: #495057;
  margin-right: 0;
  margin-left: 12px;
  order: 2;
}

.message-text {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 75%;
  line-height: 1.5;
  font-size: 14px; /* 调小字体大小 */
}

.user-message .message-content {
  justify-content: flex-end;
}

.user-message .message-text {
  background-color: #605ce2;
  color: #fff;
}

.wenqu-agent-input-area {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #e9ecef;
}

.wenqu-agent-input-area .input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0;
  width: 100%;
}

.wenqu-agent-input-area .message-input {
  flex: 1;
  resize: none;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px 0 0 8px;
  border-right: none;
  height: auto;
  min-height: 80px;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s;
}

.wenqu-agent-input-area .message-input:focus {
  border-color: #605ce2;
}

.wenqu-agent-input-area .send-btn {
  border-radius: 0 8px 8px 0;
  height: 100%;
  min-height: 80px;
  min-width: 80px;
  border-left: none;
  background-color: #605ce2;
  border-color: #605ce2;
}

.wenqu-agent-input-area .send-btn:hover {
  background-color: #504dcb;
  border-color: #504dcb;
}

.wenqu-agent-input-area .send-btn:disabled {
  background-color: #b8b6f1;
  border-color: #b8b6f1;
}

.wenqu-agent-minimize {
  width: 60px;
  height: 60px;
  background-color: #605ce2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(96, 92, 229, 0.4);
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  /* 使用CSS类控制显示/隐藏 */
  opacity: 0;
  visibility: hidden;
  position: relative;
  z-index: 10000;
}

.wenqu-agent-minimize.visible {
  opacity: 1;
  visibility: visible;
}

.wenqu-agent-minimize:hover {
  transform: scale(1.1);
}

.minimize-icon {
  color: #fff;
  font-size: 24px;
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #605ce2;
  margin-right: 4px;
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 滚动条样式 */
.wenqu-agent-messages::-webkit-scrollbar {
  width: 6px;
}

.wenqu-agent-messages::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.wenqu-agent-messages::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

.wenqu-agent-messages::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
</style>