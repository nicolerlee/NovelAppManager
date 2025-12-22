import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 蒙版相关状态
    isMaskVisible: false,
    maskConfig: {
      // 蒙版透明度
      opacity: 0.7,
      // 蒙版背景色
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      // 是否显示加载动画
      showLoading: false,
      // 加载动画文本
      loadingText: '自动化任务执行中...',
      // 是否禁止点击穿透
      preventClick: true
    },
    // 自动化任务相关配置
    autoTaskConfig: {
      // 当前执行的任务
      currentTask: null,
      // 任务状态：idle, running, completed, error
      taskStatus: 'idle',
      // 任务进度
      taskProgress: 0,
    }
  }),
  
  getters: {
    // 获取蒙版配置
    getMaskConfig: (state) => state.maskConfig,
    // 获取自动化任务配置
    getAutoTaskConfig: (state) => state.autoTaskConfig,
    // 获取当前任务状态
    getTaskStatus: (state) => state.autoTaskConfig.taskStatus,
    // 获取任务进度
    getTaskProgress: (state) => state.autoTaskConfig.taskProgress
  },
  
  actions: {
    // 显示蒙版
    showMask(config = {}) {
      this.isMaskVisible = true
      // 合并配置
      this.maskConfig = { ...this.maskConfig, ...config }
    },
    
    // 隐藏蒙版
    hideMask() {
      this.isMaskVisible = false
    },
    
    // 更新蒙版配置
    updateMaskConfig(config) {
      this.maskConfig = { ...this.maskConfig, ...config }
    },
    
    // 开始自动化任务
    startAutoTask(taskName, config = {}) {
      this.autoTaskConfig = {
        currentTask: taskName,
        taskStatus: 'running',
        taskProgress: 0,
        ...config
      }
      // 自动显示蒙版
      this.showMask({ showLoading: true, loadingText: `执行${taskName}中...` })
    },
    
    // 更新任务进度
    updateTaskProgress(progress) {
      this.autoTaskConfig.taskProgress = Math.max(0, Math.min(100, progress))
    },
  
    // 完成任务
    completeTask() {
      this.autoTaskConfig.taskStatus = 'completed'
      this.autoTaskConfig.taskProgress = 100
      // 可选择自动隐藏蒙版
      this.hideMask()
    },
    
    // 任务失败
    failTask(log = '任务失败') {
      this.autoTaskConfig.taskStatus = 'error'
    },
    
    // 重置任务状态
    resetTask() {
      this.autoTaskConfig = {
        currentTask: null,
        taskStatus: 'idle',
        taskProgress: 0,
      }
      this.hideMask()
    }
  }
})
