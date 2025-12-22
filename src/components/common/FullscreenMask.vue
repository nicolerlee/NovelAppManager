<template>
  <div 
    v-if="isVisible" 
    class="fullscreen-mask"
    :style="maskStyle"
    @click="handleClick"
  >
    <div class="mask-content">
      <!-- 加载动画 -->
      <div v-if="showLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
      
      <!-- 任务进度 -->
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
      
      <!-- 自定义内容插槽 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../stores/appStore'

// 使用全局状态
const appStore = useAppStore()

// 计算属性
const isVisible = computed(() => appStore.isMaskVisible)
const maskStyle = computed(() => ({
  backgroundColor: appStore.maskConfig.backgroundColor,
  opacity: appStore.maskConfig.opacity
}))
const showLoading = computed(() => appStore.maskConfig.showLoading)
const loadingText = computed(() => appStore.maskConfig.loadingText)
const preventClick = computed(() => appStore.maskConfig.preventClick)

// 进度显示相关
const showProgress = computed(() => appStore.autoTaskConfig.taskStatus === 'running')
const progress = computed(() => appStore.autoTaskConfig.taskProgress)

// 点击处理
const handleClick = () => {
  if (preventClick.value) {
    // 禁止点击穿透
    return false
  }
}
</script>

<style scoped>
.fullscreen-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999; /* 确保在最顶层 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(3px); /* 可选：添加模糊效果 */
}

.mask-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: white;
  text-align: center;
  padding: 40px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: white;
}

/* 进度条 */
.progress-container {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #605ce5;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: white;
  text-align: right;
}
</style>
