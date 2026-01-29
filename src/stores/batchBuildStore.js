import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useBatchBuildStore = defineStore('batchBuild', () => {
  // 批量构建任务状态
  const batchTask = reactive({
    id: '',
    status: 'idle', // idle, running, completed, failed
    progress: 0,
    apps: []
  })

  // WebSocket连接状态
  const wsConnection = reactive({
    isConnected: false,
    client: null,
    error: null
  })

  // 日志存储
  const logs = ref([])

  // 重置批量构建状态
  function resetBatchBuild() {
    batchTask.id = ''
    batchTask.status = 'idle'
    batchTask.progress = 0
    batchTask.apps = []
    logs.value = []
  }

  // 设置批量任务ID
  function setBatchTaskId(taskId) {
    batchTask.id = taskId
  }

  // 更新批量构建状态
  function updateBatchStatus(status) {
    batchTask.status = status
  }

  // 更新整体进度
  function updateOverallProgress(progress) {
    batchTask.progress = progress
  }

  // 添加应用到批量构建任务
  function addAppToBatch(app) {
    batchTask.apps.push({
      ...app,
      status: 'pending',
      progress: 0,
      logs: []
    })
  }

  // 更新应用状态
  function updateAppStatus(taskId, status, progress = null, errorMessage = null) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    if (app) {
      if (app.status === 'failed') return
      app.status = status
      if (progress !== null) {
        app.progress = progress
      }
      
      // 如果有错误信息，添加到日志中
      if (errorMessage) {
        app.logs.push(`[错误] ${errorMessage}`)
      }
      
      // 如果构建完成或失败，显示通知
      if (status === 'completed') {
        console.log(`${app.name} 构建完成`)
      } else if (status === 'failed') {
        console.log(`${app.name} 构建失败${errorMessage ? ': ' + errorMessage : ''}`)
      }
    }
    
    // 检查是否所有任务都已完成
    // 只有当应用配置不为空且所有任务都已完成时才更新状态
    if (batchTask.apps.length > 0) {
      const allCompleted = batchTask.apps.every(app =>
        app.status === 'completed' || app.status === 'failed'
      )
      
      if (allCompleted) {
        batchTask.status = batchTask.apps.some(app => app.status === 'failed') ? 'failed' : 'completed'
        batchTask.progress = 100
      } else {
        // 计算整体进度
        const completedCount = batchTask.apps.filter(app =>
          app.status === 'completed' || app.status === 'failed'
        ).length
        batchTask.progress = Math.round((completedCount / batchTask.apps.length) * 100)
      }
    }
  }

  // 添加应用日志
  function addAppLog(taskId, log) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    if (app) {
      app.logs.push(log)
    }
  }

  // 添加全局日志
  function addGlobalLog(log) {
    logs.value.push(log)
  }

  // 清空应用日志
  function clearAppLogs(taskId) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    if (app) {
      app.logs = []
    }
  }

  // 设置WebSocket连接状态
  function setWsConnectionStatus(connected, client = null, error = null) {
    wsConnection.isConnected = connected
    wsConnection.client = client
    wsConnection.error = error
  }

  // 获取应用状态
  function getAppStatus(taskId) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    return app ? app.status : null
  }

  // 获取应用进度
  function getAppProgress(taskId) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    return app ? app.progress : 0
  }

  // 获取应用日志
  function getAppLogs(taskId) {
    const app = batchTask.apps.find(a => a.taskId === taskId)
    return app ? app.logs : []
  }
  
  // 根据任务ID获取应用
  function getAppByTaskId(taskId) {
    return batchTask.apps.find(app => app.taskId === taskId)
  }
  
  // 获取所有应用
  function getAllApps() {
    return batchTask.apps
  }
  
  // 获取批量任务ID
  function getBatchTaskId() {
    return batchTask.id
  }
  
  // 获取批量构建状态
  function getBatchStatus() {
    return batchTask.status
  }
  
  // 获取整体进度
  function getOverallProgress() {
    return batchTask.progress
  }

  return {
    batchTask,
    wsConnection,
    logs,
    resetBatchBuild,
    setBatchTaskId,
    updateBatchStatus,
    updateOverallProgress,
    addAppToBatch,
    updateAppStatus,
    addAppLog,
    addGlobalLog,
    clearAppLogs,
    setWsConnectionStatus,
    getAppStatus,
    getAppProgress,
    getAppLogs,
    getAppByTaskId,
    getAllApps,
    getBatchTaskId,
    getBatchStatus,
    getOverallProgress
  }
})
