<template>
  <div class="build-progress-step">
    <!-- 排队提示 -->
    <el-alert
      v-if="showQueueInfo"
      type="info"
      show-icon
      title="排队提示"
      :description="`当前队列中有 ${queueStats?.totalPending || 0} 个用户在等待，您的任务正在排队中...`"
      style="margin-bottom: 20px;"
    />

    <!-- 顶部进度信息 -->
    <div class="progress-header">
      <div class="progress-info">
        <h3>批量构建进度</h3>
        <div class="progress-stats">
          <span>总进度: {{ completedCount }}/{{ appConfigs.length }}</span>
          <span>成功: {{ successCount }}</span>
          <span>失败: {{ failCount }}</span>
          <span>进行中: {{ runningCount }}</span>
          <span>等待中: {{ pendingCount }}</span>
        </div>
      </div>
      <el-progress
        :percentage="overallProgress"
        :status="buildStatus"
        :stroke-width="12"
        :striped="!['success', 'exception'].includes(buildStatus)"
        :striped-flow="!['success', 'exception'].includes(buildStatus)"
        :duration="buildStatus === 'success' ? 0 : 3"
        class="overall-progress"
      />
      <div class="timer-display">
        <span class="timer-label">耗时:</span>
        <span class="timer-value">{{ formattedElapsedTime }}</span>
      </div>
    </div>

    <!-- 构建控制按钮 -->
    <div class="control-buttons">
      <el-button
        v-if="buildStatus === 'pending' || buildStatus === 'running'"
        type="danger"
        @click="stopBuild"
        :loading="stopping"
      >
        停止构建
      </el-button>
      <el-button
        v-if="buildStatus === 'success' || buildStatus === 'exception'"
        type="primary"
        @click="goToHome"
      >
        返回首页
      </el-button>
      <el-button
        v-if="buildStatus === 'success' || buildStatus === 'exception'"
        @click="rebuild"
      >
        重新构建
      </el-button>
    </div>

    <!-- 小程序构建状态列表 -->
    <div class="app-build-list">
      <el-table
        :data="appConfigs"
        row-key="id"
        height="400"
        ref="tableRef"
        @expand-change="handleExpandChange"
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="scope">
            <div class="log-container">
              <div class="log-header">
                <span class="log-title">{{ scope.row.name }} - 构建日志</span>
                <el-button
                  size="small"
                  @click="clearLog(scope.row)"
                >
                  清空日志
                </el-button>
              </div>
              <div
                ref="logContainerRef"
                class="log-content"
                :id="'log-container-' + scope.row.id"
              >
                <pre
                  v-for="(log, index) in scope.row.logs"
                  :key="index"
                  class="log-line"
                  :class="getLogClass(log)"
                >{{ log }}</pre>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 应用信息列 -->
        <el-table-column prop="name" label="小程序名称" min-width="150">
          <template #default="scope">
            <div class="app-info">
              <el-avatar
                :src="scope.row.avatar"
                size="small"
                class="app-avatar"
              />
              <span class="app-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 平台列 -->
        <el-table-column prop="platform" label="平台" width="100">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(getPlatformDisplayName(scope.row.platform))">
              {{ getPlatformDisplayName(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 版本列 -->
        <el-table-column prop="version" label="版本" width="100" />

        <!-- 状态列 -->
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <div class="status-cell">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
              <el-progress
                v-if="scope.row.status === 'running'"
                :percentage="scope.row.progress"
                :show-text="false"
                :stroke-width="4"
                class="status-progress"
              />
            </div>
          </template>
        </el-table-column>

        <!-- 进度列 -->
        <el-table-column label="进度" width="150">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.status)"
              :stroke-width="10"
              :show-text="true"
            />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="toggleLog(scope.row)"
            >
              {{ isLogExpanded(scope.row) ? '收起' : '展开' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import batchBuildWebSocket from '@/utils/batchBuildWebSocket'

// Props
const props = defineProps({
  appConfigs: {
    type: Array,
    default: () => []
  },
  batchTaskId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['finish', 'rebuild', 'home'])

// 响应式数据
const tableRef = ref(null)
const expandedRows = ref([])
const stopping = ref(false)
const logContainerRef = ref([])
const startTime = ref(0)
const elapsedTime = ref(0)
const timerInterval = ref(null)
const queueStats = ref(null)
const queueCheckInterval = ref(null)

// 计算属性 - 构建状态
const buildStatus = computed(() => {
  if (props.appConfigs.length === 0) return ''
  
  const allCompleted = props.appConfigs.every(app =>
    app.status === 'completed' || app.status === 'failed'
  )
  
  if (allCompleted) {
    const hasFailed = props.appConfigs.some(app => app.status === 'failed')
    return hasFailed ? 'exception' : 'success'
  }
  
  const hasRunning = props.appConfigs.some(app => app.status === 'running')
  if (hasRunning) {
    return 'running'
  }
  
  const hasPending = props.appConfigs.some(app => app.status === 'pending')
  if (hasPending) {
    return 'pending'
  }
  
  return ''
})

// 计算属性 - 整体进度
const overallProgress = computed(() => {
  if (props.appConfigs.length === 0) return 0
  
  const total = props.appConfigs.length
  const completed = props.appConfigs.filter(app => 
    app.status === 'completed' || app.status === 'failed'
  ).length
  
  return Math.round((completed / total) * 100)
})

// 计算属性 - 完成数量
const completedCount = computed(() => {
  return props.appConfigs.filter(app => 
    app.status === 'completed' || app.status === 'failed'
  ).length
})

// 计算属性 - 成功数量
const successCount = computed(() => {
  return props.appConfigs.filter(app => app.status === 'completed').length
})

// 计算属性 - 失败数量
const failCount = computed(() => {
  return props.appConfigs.filter(app => app.status === 'failed').length
})

// 计算属性 - 运行中数量
const runningCount = computed(() => {
  return props.appConfigs.filter(app => app.status === 'running').length
})

// 计算属性 - 等待中数量
const pendingCount = computed(() => {
  return props.appConfigs.filter(app => app.status === 'pending').length
})

// 计算属性 - 格式化经过的时间
const formattedElapsedTime = computed(() => {
  const totalSeconds = Math.floor(elapsedTime.value / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 计算是否显示排队提示
const showQueueInfo = computed(() => {
  if (!queueStats.value) return false
  if (buildStatus.value !== 'pending' && buildStatus.value !== 'running') return false
  
  const currentTaskId = queueStats.value.currentTaskId
  const hasRunningTask = props.appConfigs.some(app => app.taskId && app.status === 'running')
  
  if (hasRunningTask && currentTaskId) {
    const isOurTaskRunning = props.appConfigs.some(app => app.taskId === currentTaskId)
    return !isOurTaskRunning
  }
  
  return queueStats.value.totalPending > 0
})

// 方法 - 获取平台标签类型
const getPlatformTagType = (platform) => {
  const typeMap = {
    '微信': 'success',
    '支付宝': 'primary',
    '百度': 'warning',
    '快手': 'danger'
  }
  return typeMap[platform] || 'info'
}

// 方法 - 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'pending': 'info',
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger'
  }
  return typeMap[status] || 'info'
}

// 方法 - 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '等待中',
    'running': '构建中',
    'completed': '完成',
    'failed': '失败'
  }
  return textMap[status] || status
}

// 方法 - 获取进度状态
const getProgressStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'failed': 'exception'
  }
  return statusMap[status] || null
}

// 方法 - 获取平台显示名称
const getPlatformDisplayName = (platformCode) => {
  const nameMap = {
    'weixin': '微信',
    'douyin': '抖音',
    'kuaishou': '快手',
    'baidu': '百度',
    'alipay': '支付宝'
  }
  return nameMap[platformCode] || platformCode
}

// 方法 - 获取日志行的类名
const getLogClass = (log) => {
  if (log.includes('ERROR') || log.includes('error') || log.includes('失败')) {
    return 'log-error'
  } else if (log.includes('WARN') || log.includes('warn')) {
    return 'log-warn'
  } else if (log.includes('SUCCESS') || log.includes('success') || log.includes('成功')) {
    return 'log-success'
  }
  return ''
}

// 方法 - 判断日志是否展开
const isLogExpanded = (row) => {
  return expandedRows.value.some(r => r.id === row.id)
}

// 方法 - 切换日志展开/收起
const toggleLog = (row) => {
  const index = expandedRows.value.findIndex(r => r.id === row.id)
  if (index >= 0) {
    expandedRows.value.splice(index, 1)
    tableRef.value?.toggleRowExpansion(row, false)
  } else {
    expandedRows.value.push(row)
    tableRef.value?.toggleRowExpansion(row, true)
    scrollToBottom(row.id)
  }
}

// 方法 - 处理展开变化
const handleExpandChange = (row, expandedRowsList) => {
  expandedRows.value = expandedRowsList
  if (expandedRowsList.some(r => r.id === row.id)) {
    scrollToBottom(row.id)
  }
}

// 方法 - 滚动到底部
const scrollToBottom = (appId) => {
  nextTick(() => {
    const container = document.getElementById(`log-container-${appId}`)
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// 方法 - 清空日志
const clearLog = (row) => {
  row.logs = []
}

// 获取任务队列统计信息
const fetchQueueStats = async () => {
  try {
    const res = await request.get('/api/task-queue/statistics')
    if (res.code === 200 && res.data) {
      queueStats.value = res.data
    }
  } catch (error) {
    // 如果接口不存在，静默处理，不影响主流程
    console.debug('任务队列统计接口不可用:', error.message)
    // 设置默认值
    queueStats.value = {
      totalPending: 0,
      totalRunning: 0,
      totalCompleted: 0,
      totalFailed: 0
    }
  }
}

// 开始检查队列状态
const startQueueCheck = () => {
  fetchQueueStats()
  queueCheckInterval.value = setInterval(() => {
    fetchQueueStats()
  }, 5000)
}

// 停止检查队列状态
const stopQueueCheck = () => {
  if (queueCheckInterval.value) {
    clearInterval(queueCheckInterval.value)
    queueCheckInterval.value = null
  }
}

// 方法 - 处理日志消息
const handleLogMessage = (logData) => {
  const { taskId, log } = logData
  
  if (taskId) {
    let app = props.appConfigs.find(a => a.taskId === taskId)
    
    if (!app) {
      app = props.appConfigs.find(a => a.prefetchTaskId === taskId)
    }
    
    if (!app) {
      app = props.appConfigs.find(a => a.batchTaskId === taskId)
    }
    
    if (app) {
      app.logs.push(log)
      
      if (log.includes('Build completed successfully')) {
        app.status = 'completed';
        app.progress = 100;
        checkAllTasksCompleted();
      }
      
      if (isLogExpanded(app)) {
        scrollToBottom(app.id)
      }
    }
  } else {
    props.appConfigs.forEach(app => {
      app.logs.push(log)
      
      if (log.includes('Build completed successfully')) {
        app.status = 'completed';
        app.progress = 100;
        checkAllTasksCompleted();
      }
      
      if (isLogExpanded(app)) {
        scrollToBottom(app.id)
      }
    })
  }
}

// 方法 - 处理状态消息
const handleStatusMessage = (statusData) => {
  const { taskId, status, progress, description } = statusData
  
  const app = props.appConfigs.find(a => a.taskId === taskId)
  if (app) {
    app.status = status;
    if (progress !== undefined) {
      app.progress = progress;
    }
    
    if (status === 'completed') {
      if (description && description.includes('预取')) {
        ElMessage.success(`${app.name} 预取完成`);
      } else {
        ElMessage.success(`${app.name} 构建完成`);
      }
      checkAllTasksCompleted();
    } else if (status === 'failed') {
      ElMessage.error(`${app.name} 构建失败: ${description || ''}`);
      checkAllTasksCompleted();
    } else if (status === 'running') {
      if (description && description.includes('预取')) {
        app.logs.push(`[预取阶段] ${description}`);
      }
    }
  }
}

// 方法 - 停止构建
const stopBuild = async () => {
  if (stopping.value) return
  
  stopping.value = true
  try {
    if (props.batchTaskId) {
      await request.get('/api/novel-build/stop-batch', {
        params: { batchTaskId: props.batchTaskId }
      });
    } else {
      const stopPromises = props.appConfigs
        .filter(app => app.taskId && (app.status === 'pending' || app.status === 'running'))
        .map(app =>
          request.get('/api/novel-build/stop', {
            params: { taskId: app.taskId }
          })
        )
      
      await Promise.all(stopPromises)
    }
    
    props.appConfigs.forEach(app => {
      if (app.status === 'pending' || app.status === 'running') {
        app.status = 'failed'
        app.progress = 0
      }
    })
    
    stopTimer()
    stopQueueCheck()
    batchBuildWebSocket.disconnect()
    
    ElMessage.success('已发送停止构建命令')
    emit('finish', 'exception')
  } catch (error) {
    ElMessage.error('停止构建失败: ' + (error.message || '未知错误'))
  } finally {
    stopping.value = false
  }
}

// 方法 - 返回首页
const goToHome = () => {
  emit('home')
}

// 方法 - 重新构建
const rebuild = () => {
  if (logCallback) {
    batchBuildWebSocket.offMessage('log', logCallback);
    logCallback = null;
  }
  if (statusCallback) {
    batchBuildWebSocket.offMessage('status', statusCallback);
    statusCallback = null;
  }
  
  props.appConfigs.forEach(app => {
    app.status = 'pending'
    app.progress = 0
    app.logs = []
  })
  
  stopTimer()
  elapsedTime.value = 0
  startTimer()
  
  emit('rebuild')
}

// 方法 - 启动计时器
const startTimer = () => {
  if (timerInterval.value) return
  
  startTime.value = Date.now()
  
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
  }, 100)
}

// 方法 - 停止计时器
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// 方法 - 检查所有任务是否已完成
const checkAllTasksCompleted = () => {
  const allCompleted = props.appConfigs.every(app => {
    return app.status === 'completed' || app.status === 'failed';
  });
  
  const hasTasksStarted = props.appConfigs.some(app =>
    app.status === 'running' || app.status === 'completed' || app.status === 'failed'
  );
  
  const hasActualTasks = props.appConfigs.some(app => app.taskId);
  
  if (allCompleted && hasTasksStarted && hasActualTasks) {
    stopTimer();
    stopQueueCheck();
    batchBuildWebSocket.disconnect();
    emit('finish', buildStatus.value);
  }
}

// 存储注册的回调函数引用
let logCallback = null;
let statusCallback = null;

// 组件挂载时的初始化逻辑
onMounted(() => {
  props.appConfigs.forEach(app => {
    if (!app.status) app.status = 'pending'
    if (!app.progress) app.progress = 0
    if (!app.logs) app.logs = []
  })
  
  startTimer()
  startQueueCheck()
  
  if (props.batchTaskId && props.batchTaskId !== '') {
    batchBuildWebSocket.connect(props.batchTaskId, 'build')
      .then(() => {
        if (logCallback) {
          batchBuildWebSocket.offMessage('log', logCallback);
          logCallback = null;
        }
        if (statusCallback) {
          batchBuildWebSocket.offMessage('status', statusCallback);
          statusCallback = null;
        }
        
        logCallback = (logData) => {
          handleLogMessage(logData)
        };
        batchBuildWebSocket.onMessage('log', logCallback);

        statusCallback = (statusData) => {
          handleStatusMessage(statusData)
        };
        batchBuildWebSocket.onMessage('status', statusCallback);
      })
      .catch((error) => {
        console.error('[WebSocket] 连接失败:', error)
        ElMessage.error('连接实时日志服务失败')
      })
  }
})

// 监听batchTaskId的变化
watch(() => props.batchTaskId, (newBatchTaskId) => {
if (newBatchTaskId && newBatchTaskId !== '') {
  if (logCallback) {
    batchBuildWebSocket.offMessage('log', logCallback);
    logCallback = null;
  }
  if (statusCallback) {
    batchBuildWebSocket.offMessage('status', statusCallback);
    statusCallback = null;
  }
  
  batchBuildWebSocket.connect(props.batchTaskId, 'build')
    .then(() => {
      logCallback = (logData) => {
        handleLogMessage(logData)
      };
      batchBuildWebSocket.onMessage('log', logCallback);

      statusCallback = (statusData) => {
        handleStatusMessage(statusData)
      };
      batchBuildWebSocket.onMessage('status', statusCallback);
    })
    .catch((error) => {
      console.error('[WebSocket] 连接失败:', error)
      ElMessage.error('连接实时日志服务失败')
    })
}
})

// 组件卸载时的清理逻辑
onUnmounted(() => {
stopTimer()
stopQueueCheck()

if (logCallback) {
  batchBuildWebSocket.offMessage('log', logCallback);
  logCallback = null;
}
if (statusCallback) {
  batchBuildWebSocket.offMessage('status', statusCallback);
  statusCallback = null;
}

batchBuildWebSocket.disconnect()
})
</script>

<style scoped lang="less">
.build-progress-step {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.progress-header {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .progress-stats {
      display: flex;
      gap: 15px;
      
      span {
        font-weight: 500;
        color: #606266;
      }
    }
  }
  
  .overall-progress {
    margin-bottom: 10px;
  }
  
  .timer-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 14px;
    
    .timer-label {
      color: #606266;
      font-weight: 500;
    }
    
    .timer-value {
      font-family: 'Consolas', 'Courier New', monospace;
      font-weight: 600;
      color: #409eff;
    }
  }
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.app-build-list {
  .app-info {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .app-avatar {
      background-color: #f5f7fa;
    }
    
    .app-name {
      font-weight: 500;
    }
  }
  
  .status-cell {
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    .status-progress {
      width: 100%;
    }
  }
}

.log-container {
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 4px;
  
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .log-title {
      font-weight: 500;
      color: #fff;
      font-size: 16px;
    }
  }
  
  .log-content {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    background-color: #2d2d30;
    border-radius: 4px;
    
    .log-line {
      margin: 0;
      padding: 2px 0;
      color: #dcdcdc;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    
    .log-error {
      color: #f48771;
    }
    
    .log-warn {
      color: #cca700;
    }
    
    .log-success {
      color: #89d185;
    }
  }
}

@media (max-width: 768px) {
  .progress-header {
    .progress-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      
      .progress-stats {
        flex-wrap: wrap;
      }
    }
  }
  
  .control-buttons {
    flex-direction: column;
  }
}
</style>
