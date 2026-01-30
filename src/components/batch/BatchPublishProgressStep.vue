<template>
  <div class="batch-publish-progress-step">
    <!-- 排队提示 -->
    <el-alert
      v-if="showQueueInfo"
      type="info"
      show-icon
      title="排队提示"
      :description="`当前队列有 ${queueStats?.pendingUsers || 0} 个用户在等待，${queueStats?.totalPending || 0} 个任务在等待；您的任务正在排队中...`"
      style="margin-bottom: 20px;"
    />
    
    <!-- 顶部进度信息 -->
    <div class="progress-header">
      <div class="progress-info">
        <h3>批量发布进度</h3>
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
              :status="publishStatus"
              :stroke-width="12"
              :striped="!['success', 'exception'].includes(publishStatus)"
              :striped-flow="!['success', 'exception'].includes(publishStatus)"
              :duration="publishStatus === 'success' ? 0 : 3"
              class="overall-progress"
            />
      <div class="timer-display">
        <span class="timer-label">耗时:</span>
        <span class="timer-value">{{ formattedElapsedTime }}</span>
      </div>
    </div>

    <!-- 发布控制按钮 -->
        <div class="control-buttons">
          <el-button
            v-if="publishStatus === 'pending' || (publishStatus === '' && hasRunningTasks)"
            type="danger"
            @click="stopPublish"
            :loading="stopping"
          >
            停止发布
          </el-button>
          <el-button
            v-if="publishStatus === 'success' || publishStatus === 'exception'"
            type="primary"
            @click="goToHome"
          >
            返回首页
          </el-button>
          <el-button
            v-if="publishStatus === 'success' || publishStatus === 'exception'"
            @click="rebuild"
          >
            重新发布
          </el-button>
        </div>

    <!-- 小程序发布状态列表 -->
    <div class="app-publish-list">
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
                <span class="log-title">{{ scope.row.name }} - 发布日志</span>
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

        <!-- 发布模式列 -->
        <el-table-column label="发布模式" width="120">
          <template #default="scope">
            <span>{{ props.isPreviewMode ? '仅预览' : (scope.row.config.publishMode === 'preview' ? '仅预览' : '发布并预览') }}</span>
          </template>
        </el-table-column>

        <!-- 版本列 -->
        <el-table-column prop="version" label="版本" width="10" />

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
              :percentage="getRowProgress(scope.row)"
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
    
    <!-- 二维码显示区域 -->
    <div v-if="publishStatus === 'success' || publishStatus === 'exception'" class="qrcode-section">
      <h3>体验版二维码</h3>
      <div class="qrcode-container">
        <div
          v-for="(app, index) in completedApps"
          :key="app.id"
          class="qrcode-item"
        >
          <div class="qrcode-header">
            <span class="qrcode-index">{{ index + 1 }}.</span>
            <span class="qrcode-app-name">{{ app.name }}</span>
            <el-tag :type="getPlatformTagType(getPlatformDisplayName(app.platform))" size="small">
              {{ getPlatformDisplayName(app.platform) }}
            </el-tag>
          </div>
          <div class="qrcode-content">
            <img
              v-if="app.qrCodeImage"
              :src="app.qrCodeImage"
              :alt="`${app.name} 二维码`"
              class="qrcode-image"
              @click="showQRCode(app)"
            />
            <div v-else class="qrcode-placeholder">
              <el-icon><Picture /></el-icon>
              <p>二维码获取失败</p>
            </div>
            <p class="qrcode-tip">请使用{{ getPlatformAppName(app.platform) }}APP扫码体验</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 下载二维码图片按钮 -->
    <div v-if="publishStatus === 'success' || publishStatus === 'exception'" class="download-qrcode-btn">
      <el-button type="primary" @click="downloadQRCodeImage">下载二维码图片</el-button>
    </div>
    
    <!-- 二维码放大模态框 -->
    <div v-if="showQRCodeModal" class="qrcode-modal" @click="closeQRCodeModal">
      <div class="qrcode-modal-content" @click.stop>
        <div class="qrcode-modal-header">
          <span class="qrcode-modal-app-name">{{ selectedQRCodeAppName }}</span>
          <el-tag :type="getPlatformTagType(getPlatformDisplayName(selectedQRCodeAppPlatform))" size="small">
            {{ getPlatformDisplayName(selectedQRCodeAppPlatform) }}
          </el-tag>
        </div>
        <img :src="selectedQRCodeImage" :alt="selectedQRCodeAppName + ' 二维码'" class="qrcode-modal-image" />
        <div class="qrcode-modal-footer">
          <el-button type="primary" @click="closeQRCodeModal" class="qrcode-modal-close">关闭</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import request from '@/utils/request'
import batchBuildWebSocket from '@/utils/batchBuildWebSocket'
import html2canvas from 'html2canvas'

// Props
const props = defineProps({
 appConfigs: {
    type: Array,
    default: () => []
  },
  batchTaskId: {
    type: String,
    default: ''
  },
  isPreviewMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['finish', 'rebuild', 'home'])

// 计算属性 - 已完成的应用（成功或失败）
const completedApps = computed(() => {
  return props.appConfigs.filter(app =>
    app.status === 'completed' || app.status === 'failed'
  )
})

// 响应式数据
const tableRef = ref(null)
const expandedRows = ref([])
const stopping = ref(false)
const logContainerRef = ref([])
const startTime = ref(0) // 计时开始时间
const elapsedTime = ref(0) // 经过的时间（毫秒）
const timerInterval = ref(null) // 计时器引用
// 队列统计信息
const queueStats = ref(null)
const queueCheckInterval = ref(null)

// 二维码模态框相关数据
const showQRCodeModal = ref(false)
const selectedQRCodeImage = ref('')
const selectedQRCodeAppName = ref('')
const selectedQRCodeAppPlatform = ref('')

// 计算属性 - 发布状态
const publishStatus = computed(() => {
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
    return ''  // running 状态不设置特定的 status 值，使用默认的进度条样式
  }
  
  const hasPending = props.appConfigs.some(app => app.status === 'pending')
  if (hasPending) {
    return 'pending'
  }
  
  return ''
})

// 计算属性 - 是否有运行中的任务
const hasRunningTasks = computed(() => {
  return props.appConfigs.some(app => app.status === 'running')
})

// 计算属性 - 整体进度
const overallProgress = computed(() => {
  if (props.appConfigs.length === 0) return 0
  
  // 如果所有任务都已完成（成功或失败），强制进度为100%
  const allCompleted = props.appConfigs.every(app =>
    app.status === 'completed' || app.status === 'failed'
  )
  
  if (allCompleted) {
    return 100
  }
  
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
  // 如果没有队列统计信息，不显示排队信息
  if (!queueStats.value) return false
  
  // 如果发布状态不是pending或running，不显示排队信息
  if (publishStatus.value !== 'pending' && publishStatus.value !== '') return false
  
  // 检查当前用户是否有任务正在运行
  const hasRunningTask = props.appConfigs.some(app => app.status === 'running')
  
  // 如果当前用户有任务正在运行，不显示排队提示
  if (hasRunningTask) {
    return false
  }
  
  // 如果当前用户没有任务在运行，且队列中有待处理任务，显示排队提示
  return queueStats.value.totalPending > 0
})

// 存储注册的回调函数引用，用于取消注册
let logCallback = null;
let statusCallback = null;

// 方法 - 获取平台标签类型
const getPlatformTagType = (platform) => {
  const typeMap = {
    '微信': 'success',
    '支付宝': 'primary',
    '百度': 'warning',
    '字节': 'danger'
  }
  
  // 检查完整平台名称
  if (platform.includes('微信')) return 'success'  // 绿色
  if (platform.includes('抖音')) return 'info'     // 灰色
  if (platform.includes('快手')) return 'danger'   // 红色
  if (platform.includes('百度')) return 'warning'  // 黄色
  if (platform.includes('支付宝')) return 'primary'
  if (platform.includes('字节')) return 'danger'
  
  // 检查简写平台名称
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
    'running': '发布中',
    'completed': '完成',
    'failed': '失败'
  }
  return textMap[status] || status
}

// 方法 - 获取行进度
const getRowProgress = (row) => {
  // 如果任务已完成（成功或失败），强制进度为100%
  if (row.status === 'completed' || row.status === 'failed') {
    return 100
  }
  // 否则返回原始进度
  return row.progress || 0
}

// 方法 - 获取进度状态
const getProgressStatus = (status) => {
  const statusMap = {
    'completed': 'success',
    'failed': 'exception',
    'running': 'success'  // 进行中的状态也显示为成功状态的进度条
  }
  return statusMap[status] || null
}

// 方法 - 获取平台显示名称
const getPlatformDisplayName = (platformCode) => {
  const nameMap = {
    'mp-weixin': '微信',
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-baidu': '百度',
    'mp-alipay': '支付宝'
  }
  return nameMap[platformCode] || platformCode
}

// 方法 - 获取平台应用名称
const getPlatformAppName = (platformCode) => {
  const appNames = {
    'mp-weixin': '微信',
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-baidu': '百度',
    'mp-alipay': '支付宝'
  }
  return appNames[platformCode] || '对应平台'
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
  // 先获取一次统计信息
  fetchQueueStats()
  
  // 设置定时器定期获取统计信息
  queueCheckInterval.value = setInterval(() => {
    fetchQueueStats()
  }, 5000) // 每5秒获取一次
}

// 停止检查队列状态
const stopQueueCheck = () => {
  if (queueCheckInterval.value) {
    clearInterval(queueCheckInterval.value)
    queueCheckInterval.value = null
  }
}

// 方法 - 获取日志行的类名
const getLogClass = (log) => {
  if (log.includes('ERROR') || (log.includes('error') && !log.includes('耗时:')) || log.includes('失败')) {
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

// 方法 - 处理日志消息
const handleLogMessage = (logData) => {
  const { appId, log } = logData
  
  // 检查日志是否包含错误信息
  const isErrorLog = log.includes('Upload Error') || log.includes('Publish Error');
  
  // 只使用appId查找应用
  let app = null;
  if (appId) {
    app = props.appConfigs.find(a => a.id === appId)
  }
  
  if (app) {
   app.logs.push(log)

   // 如果日志包含错误信息，将应用状态设置为失败
   if (isErrorLog) {
     app.status = 'failed'
   }
   
   // 如果该应用的日志区域是展开的，滚动到底部
   if (isLogExpanded(app)) {
     scrollToBottom(app.id)
   }
 }

  // 特殊处理抖音平台的二维码URL
  if (log.startsWith('[抖音] 二维码生成成功:')) {
    // 提取二维码URL
    const qrCodeUrl = log.substring('[抖音] 二维码生成成功:'.length).trim();

    // 只使用appId查找应用
    let qrApp = null;
    if (appId) {
      qrApp = props.appConfigs.find(a => a.id === appId);
    }

    if (qrApp) {
      // 明确更新props.appConfigs中的对象
      const appIndex = props.appConfigs.findIndex(a => a.id === appId);
      if (appIndex !== -1) {
        props.appConfigs[appIndex].qrCodeUrl = qrCodeUrl;
      }

    }
  }
  if (log.startsWith('[支付宝] 二维码生成成功:')) {
    // 提取二维码URL
    const qrCodeUrl = log.substring('[支付宝] 二维码生成成功:'.length).trim();

    // 只使用appId查找应用
    let qrApp = null;
    if (appId) {
      qrApp = props.appConfigs.find(a => a.id === appId);
    }

    if (qrApp) {
      // 明确更新props.appConfigs中的对象
      const appIndex = props.appConfigs.findIndex(a => a.id === appId);
      if (appIndex !== -1) {
        props.appConfigs[appIndex].qrCodeUrl = qrCodeUrl;
      }

    }
  }
}

// 方法 - 处理状态消息
const handleStatusMessage = (statusData) => {
 console.log("【DEBUG】收到状态消息", statusData);
  const { appId, status, progress, errorMessage, taskId } = statusData
  
  console.log("【DEBUG】handleStatusMessage", appId, status, progress, errorMessage, taskId)
  
  // 首先尝试按原有逻辑处理单个应用的状态更新
  let app = null;
  // 尝试通过appId查找应用（用于发布任务）
  if (appId) {
    app = props.appConfigs.find(a => a.id === appId)
    if (app) {
      console.log("【DEBUG】通过appId找到对应应用", app.name, app.id);
    } else {
      console.log("【DEBUG】通过appId未找到对应应用，appId:", appId);
    }
  }
  
  // 如果通过appId没有找到应用，尝试通过taskId查找（兼容批量任务取消等场景）
  if (!app && taskId) {
    app = props.appConfigs.find(a => a.taskId === taskId)
    if (app) {
      console.log("【DEBUG】通过taskId找到对应应用", app.name, app.taskId);
    } else {
      console.log("【DEBUG】通过taskId未找到对应应用，taskId:", taskId);
    }
  }
  
  if (app) {
   // 更新状态
   // 如果收到错误状态或者有错误信息，将应用状态设置为失败
   if (status === 'error' || status === 'failed' || errorMessage) {
     app.status = 'failed'
     console.log("【DEBUG】设置应用状态为失败", app.name);
   } else {
     app.status = status
     console.log("【DEBUG】设置应用状态为", status, app.name);
   }
   
   // 只有当新进度大于等于当前进度时才更新，防止进度回退
   // 但如果状态是completed或failed，则强制更新进度到100
   if (status === 'completed' || status === 'failed' || status === 'error') {
     app.progress = 100
     console.log("【DEBUG】设置应用进度为100%", app.name);
   } else if (progress !== undefined && progress >= (app.progress || 0)) {
     app.progress = progress
     console.log("【DEBUG】更新应用进度", app.name, progress);
   }
   
   // 如果有错误信息，添加到日志中
   if (errorMessage) {
     app.logs.push(`[错误] ${errorMessage}`)
     console.log("【DEBUG】添加错误日志", errorMessage, app.name);
   }
   
   // 如果发布完成，获取二维码
   if (status === 'completed') {
     console.log("【DEBUG】应用发布完成", app.name);
     ElMessage.success(`${app.name} 发布完成`)
     fetchQRCode(app)
   } else if (status === 'failed' || status === 'error') {
     // 检查错误信息是否包含"任务被用户停止"，如果是，则可能是管理员停止了整个批量任务
     if (errorMessage && errorMessage.includes('任务被用户停止')) {
       console.log("【DEBUG】检测到任务被管理员停止", app.name);
       ElMessage.error(`${app.name} 发布失败: 任务被管理员停止`)
     } else {
       console.log("【DEBUG】应用发布失败", app.name, errorMessage);
       ElMessage.error(`${app.name} 发布失败${errorMessage ? ': ' + errorMessage : ''}`)
     }
   }
  }
  
  // 检查是否所有任务都已完成
  // 只有当应用配置不为空且所有任务都已完成时才处理完成逻辑
  if (props.appConfigs.length > 0) {
    // 检查是否所有任务都已完成（成功或失败）
    let allCompleted = props.appConfigs.every(app =>
      app.status === 'completed' || app.status === 'failed'
    )
    
    // 检查是否有任务真正开始运行过（不是初始的pending状态）
    // 这个条件确保至少有一个任务不是pending状态，防止在任务刚开始时就处理完成逻辑
    const hasTasksStarted = props.appConfigs.some(app =>
      app.status === 'running' || app.status === 'completed' || app.status === 'failed'
    )
    
    // 检查是否真的有任务（而不是空任务列表）
    const hasActualTasks = props.appConfigs.some(app => app.taskId)
    
    // 检查是否大部分任务都失败了（这可能表示整个批量任务被管理员停止）
    const totalTasks = props.appConfigs.length;
    const failedTasks = props.appConfigs.filter(app => app.status === 'failed').length;
    console.log("【DEBUG】任务统计 - 总数:", totalTasks, "失败数:", failedTasks, "比例:", failedTasks / totalTasks);
    const shouldStopAll = totalTasks > 0 && failedTasks > 0 && (failedTasks / totalTasks) > 0.5; // 如果超过一半任务失败，可能表示整个批量任务被停止
    
    if (shouldStopAll) {
      console.log("【DEBUG】检测到批量任务可能被停止，将所有未完成任务标记为失败");
      // 将所有未完成的任务标记为失败
      props.appConfigs.forEach(app => {
        if (app.status !== 'completed' && app.status !== 'failed') {
          app.status = 'failed'
          app.progress = 0
          if (!app.logs.some(log => log.includes('任务被管理员停止'))) {
            app.logs.push('[错误] 任务被管理员停止')
          }
          console.log("【DEBUG】批量停止 - 设置应用状态为失败", app.name);
          ElMessage.error(`${app.name} 发布失败: 任务被管理员停止`)
        }
      })
      // 重新计算是否所有任务都已完成
      allCompleted = props.appConfigs.every(app => app.status === 'completed' || app.status === 'failed');
      console.log("【DEBUG】重新计算 - 所有任务是否完成:", allCompleted);
    }
    
    // 只有在所有任务都完成、有任务真正开始运行过、有实际任务时才处理完成逻辑
    // 防止在任务刚开始（所有任务都处于pending状态）时就处理完成逻辑
    if (allCompleted && hasTasksStarted && hasActualTasks) {
      console.log("【DEBUG】所有任务已完成，触发完成事件");
      // 停止计时器
      stopTimer()
      
      // 断开WebSocket连接
      batchBuildWebSocket.disconnect()
      
      // 发出完成事件
      emit('finish', publishStatus.value)
    } else {
      console.log("【DEBUG】完成条件检查 - allCompleted:", allCompleted, "hasTasksStarted:", hasTasksStarted, "hasActualTasks:", hasActualTasks);
    }
 }
}

// 生成抖音二维码
const generateDouyinQRCode = async (app, qrCodeUrl, retryCount = 1) => {
  if (!qrCodeUrl) {
    // 第一次失败不弹出提示，只有最终重试失败才弹出
    if (retryCount <= 0) {
      const errorMsg = `获取${app.name}体验版二维码失败: 二维码URL为空`;
      ElMessage.error(errorMsg)
    }
    app.qrCodeImage = null // 获取失败则不显示二维码
    return false // 返回失败状态
  }
  try {
    // 使用QRCode.toDataURL生成二维码图片
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    app.qrCodeImage = qrCodeDataUrl
    return true // 返回成功状态
  } catch (error) {
    // 第一次失败不弹出提示，只有最终重试失败才弹出
    if (retryCount <= 0) {
      ElMessage.error(`生成${app.name}二维码失败`)
    }
    app.qrCodeImage = null // 获取失败则不显示二维码
    return false // 返回失败状态
  }
}

// 方法 - 获取二维码 (带重试机制)
const fetchQRCode = async (app, retryCount = 1) => {
  try {
    // 检查taskId是否存在
    if (!app.taskId) {
      // 第一次失败不弹出提示，只有最终重试失败才弹出
      if (retryCount <= 0) {
        const errorMsg = `获取${app.name}体验版二维码失败: taskId不存在`;
        ElMessage.error(errorMsg)
      }
      app.qrCodeImage = null // 获取失败则不显示二维码
      return false; // 返回失败状态
    }
    
    // 根据平台类型采用不同的获取二维码方式
    let success = false;
    if (app.platform === 'mp-toutiao' && app.qrCodeUrl) {
      // 抖音平台通过日志中的URL生成二维码
      success = await generateDouyinQRCode(app, app.qrCodeUrl, retryCount);
    } else if (app.platform === 'mp-alipay' && app.qrCodeUrl) {
      // 抖音平台通过日志中的URL生成二维码
      app.qrCodeImage = app.qrCodeUrl;
      success = true;
    } else {
      // 微信、百度、快手平台通过后端接口获取二维码图片
      console.log(`[DEBUG] 调用fetchQRCodeImage: ${app.name}`);
      success = await fetchQRCodeImage(app, retryCount);
    }
    
    // 如果成功获取二维码，直接返回
    if (success) {
      return true; // 返回成功状态
    }
    
    // 如果还有重试次数，则延时后重试
    if (retryCount > 0) {
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await fetchQRCode(app, retryCount - 1);
    } else {
      // 只有在最终失败时才显示错误信息
      ElMessage.error(`获取${app.name}体验版二维码失败`)
      app.qrCodeImage = null // 获取失败则不显示二维码
      return false; // 返回失败状态
    }
  } catch (error) {
    // 如果还有重试次数，则延时后重试
    if (retryCount > 0) {
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await fetchQRCode(app, retryCount - 1);
    } else {
      ElMessage.error(`获取${app.name}体验版二维码失败: ` + (error?.message || ''))
      app.qrCodeImage = null // 获取失败则不显示二维码
      return false; // 返回失败状态
    }
  }
}

// 方法 - 通过后端接口获取二维码图片
const fetchQRCodeImage = async (app, retryCount = 1) => {
  // 获取当前应用类型
  const appType = window.location.pathname.includes('/novel/') ? 'video' : 'animate';
  
  // 使用axios获取原始响应，绕过拦截器的data处理
  // 使用批量任务接口获取二维码
  try {
    const response = await request({
      method: 'GET',
      url: `/api/${appType}-publish/qrcode/batch/${props.batchTaskId}/${app.id}`,
      responseType: 'arraybuffer' // 告知axios以ArrayBuffer形式处理响应
    })
    
    if (response.status === 200 && response.data) {
      // 将ArrayBuffer转换为Blob对象，并创建Object URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/png' });
      app.qrCodeImage = URL.createObjectURL(blob);
      return true // 返回成功状态
    } else {
      // 第一次失败不弹出提示，只有最终重试失败才弹出
      if (retryCount <= 0) {
        // 更详细的错误提示
        const errorMsg = `获取${app.name}体验版二维码失败: 状态码 ${response.status}, 消息: ${response.statusText || '未知错误'}`;
        ElMessage.error(errorMsg)
      }
      app.qrCodeImage = null // 获取失败则不显示二维码
      return false // 返回失败状态
    }
  } catch (error) {
    // 第一次失败不弹出提示，只有最终重试失败才弹出
    if (retryCount <= 0) {
      ElMessage.error(`获取${app.name}体验版二维码失败: ` + (error?.message || ''))
    }
    app.qrCodeImage = null // 获取失败则不显示二维码
    return false // 返回失败状态
  }
}

// 方法 - 停止发布
const stopPublish = async () => {
  if (stopping.value) return
  
  stopping.value = true
  try {
    // 如果有batchTaskId，使用批量停止接口
    if (props.batchTaskId) {
      await request.post(`/api/novel-publish/stop-batch/${props.batchTaskId}`);
    } else {
      // 否则逐个停止任务
      const stopPromises = props.appConfigs
        .filter(app => app.taskId && (app.status === 'pending' || app.status === 'running'))
        .map(app =>
          request.post(`/api/novel-publish/stop/${app.taskId}`)
        )
      
      await Promise.all(stopPromises)
    }
    
    // 更新状态
    props.appConfigs.forEach(app => {
      if (app.status === 'pending' || app.status === 'running') {
        app.status = 'failed'
        app.progress = 0
      }
    })
    
    // 停止计时器
    stopTimer()
    
    // 停止队列检查
    stopQueueCheck()
    
    // 断开WebSocket连接
    batchBuildWebSocket.disconnect()
    
    ElMessage.success('已发送停止发布命令')
    emit('finish', 'exception')
 } catch (error) {
   ElMessage.error('停止发布失败: ' + (error.message || '未知错误'))
 } finally {
   stopping.value = false
  }
}

// 方法 - 返回首页
const goToHome = () => {
  emit('home')
}

// 方法 - 重新发布
const rebuild = () => {
  emit('rebuild')
}

// 方法 - 显示二维码模态框
const showQRCode = (app) => {
  selectedQRCodeImage.value = app.qrCodeImage
  selectedQRCodeAppName.value = app.name
  selectedQRCodeAppPlatform.value = app.platform
  showQRCodeModal.value = true
}

// 方法 - 关闭二维码模态框
const closeQRCodeModal = () => {
  showQRCodeModal.value = false
}

// 方法 - 下载二维码区域图片
const downloadQRCodeImage = async () => {
  try {
    // 获取二维码区域元素
    const qrCodeSection = document.querySelector('.qrcode-section')
    if (!qrCodeSection) {
      ElMessage.error('未找到二维码区域')
      return
    }
    
    // 使用 html2canvas 截图
    const canvas = await html2canvas(qrCodeSection, {
      backgroundColor: '#fff',
      scale: 2, // 提高截图质量
      useCORS: true // 允许跨域图片
    })
    
    // 将 canvas 转换为 Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        ElMessage.error('生成图片失败')
        return
      }
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `二维码_${new Date().getTime()}.png`
      document.body.appendChild(a)
      a.click()
      
      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      ElMessage.success('二维码图片下载成功')
    }, 'image/png')
  } catch (error) {
    console.error('下载二维码图片失败:', error)
    ElMessage.error('下载二维码图片失败: ' + (error.message || '未知错误'))
  }
}

// 方法 - 启动计时器
const startTimer = () => {
  // 如果计时器已经在运行，则不重复启动
  if (timerInterval.value) return
  
  // 设置开始时间
  startTime.value = Date.now()
  
  // 启动计时器，每100毫秒更新一次
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
  }, 10)
}

// 方法 - 重新启动计时器（强制重启）
const restartTimer = () => {
  // 停止现有计时器
  stopTimer()
  
  // 重置经过的时间
  elapsedTime.value = 0
  
  // 设置开始时间
  startTime.value = Date.now()
  
  // 启动计时器，每100毫秒更新一次
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

// 组件挂载时的初始化逻辑
onMounted(() => {
  // 初始化应用状态，但保留失败的任务状态
  props.appConfigs.forEach(app => {
    if (!app.status && app.status !== 'failed') app.status = 'pending'
    if (!app.progress) app.progress = 0
    if (!app.logs) app.logs = []
    if (!app.qrCodeImage) app.qrCodeImage = null
    if (!app.qrCodeUrl) app.qrCodeUrl = null
  })
  
  // 检查是否已经有任务在运行，如果有则重启计时器
  const hasTasksInProgress = props.appConfigs.some(app =>
    app.status === 'running' || app.status === 'completed' || app.status === 'failed'
  )
  
  if (hasTasksInProgress) {
    // 如果已经有任务在运行，重启计时器
    restartTimer()
  } else {
    // 否则正常启动计时器
    startTimer()
  }
  
  // 启动队列检查
  startQueueCheck()
  
  // 连接WebSocket
  if (props.batchTaskId && props.batchTaskId !== '') {
    batchBuildWebSocket.connect(props.batchTaskId, 'publish')
      .then(() => {
        // 取消注册之前的回调函数
        if (logCallback) {
          batchBuildWebSocket.offMessage('log', logCallback);
          logCallback = null;
        }
        if (statusCallback) {
          batchBuildWebSocket.offMessage('status', statusCallback);
          statusCallback = null;
        }
        
        // 注册日志消息处理回调
        logCallback = (logData) => {
          // 直接处理已解析的日志数据
          handleLogMessage(logData)
        };
        batchBuildWebSocket.onMessage('log', logCallback);

        // 注册状态消息处理回调
        statusCallback = (statusData) => {
          // 直接处理已解析的状态数据
          handleStatusMessage(statusData)
        };
        batchBuildWebSocket.onMessage('status', statusCallback);
      })
      .catch((error) => {
        console.error('[WebSocket] 连接失败:', error);
        // 提供更详细的错误信息
        let errorMessage = '连接实时日志服务失败';
        if (error.message) {
          errorMessage += ': ' + error.message;
        }
        // 检查是否是认证问题
        const token = localStorage.getItem('token');
        if (!token) {
          errorMessage += ' (未找到认证令牌，请重新登录)';
        }
        ElMessage.error(errorMessage);
      })
  }
})

// 监听batchTaskId的变化
watch(() => props.batchTaskId, (newBatchTaskId, oldBatchTaskId) => {
if (newBatchTaskId && newBatchTaskId !== '') {
  // 先取消注册之前的回调函数
  if (logCallback) {
    batchBuildWebSocket.offMessage('log', logCallback);
    logCallback = null;
  }
  if (statusCallback) {
    batchBuildWebSocket.offMessage('status', statusCallback);
    statusCallback = null;
  }
  
  batchBuildWebSocket.connect(newBatchTaskId, 'publish')
    .then(() => {
      // 注册日志消息处理回调
      logCallback = (logData) => {
        // 直接处理已解析的日志数据
        handleLogMessage(logData)
      };
      batchBuildWebSocket.onMessage('log', logCallback);

      // 注册状态消息处理回调
      statusCallback = (statusData) => {
        // 直接处理已解析的状态数据
        handleStatusMessage(statusData)
      };
      batchBuildWebSocket.onMessage('status', statusCallback);
    })
    .catch((error) => {
      console.error('[WebSocket] 连接失败:', error);
      // 提供更详细的错误信息
      let errorMessage = '连接实时日志服务失败';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      // 检查是否是认证问题
      const token = localStorage.getItem('token');
      if (!token) {
        errorMessage += ' (未找到认证令牌，请重新登录)';
      }
      ElMessage.error(errorMessage);
    })
}
})

// 监听appConfigs的变化
watch(() => props.appConfigs, (newAppConfigs, oldAppConfigs) => {
  // 仅在需要调试时启用
  // console.log('[BatchPublishProgressStep] appConfigs变化，从', oldAppConfigs, '变为', newAppConfigs)
}, { deep: true })

// 组件卸载时的清理逻辑
onUnmounted(() => {
// 停止计时器
stopTimer()

// 停止队列检查
stopQueueCheck()

// 取消注册回调函数
if (logCallback) {
  batchBuildWebSocket.offMessage('log', logCallback);
  logCallback = null;
}
if (statusCallback) {
  batchBuildWebSocket.offMessage('status', statusCallback);
  statusCallback = null;
}

// 强制断开WebSocket连接，确保资源完全释放
batchBuildWebSocket.disconnect()
})
</script>

<style scoped lang="less">
.batch-publish-progress-step {
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

.app-publish-list {
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

/* 响应式设计 */
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

.qrcode-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
 border-radius: 4px;
  
 h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }
}

.qrcode-container {
 display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.qrcode-item {
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.qrcode-header {
  padding: 12px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .qrcode-index {
    font-weight: 600;
    color: #606266;
  }
  
  .qrcode-app-name {
    flex: 1;
    font-weight: 500;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.qrcode-content {
  padding: 15px;
  text-align: center;
  
  .qrcode-image {
    width: 150px;
    height: 150px;
    object-fit: contain;
    border: 1px solid #eee;
    padding: 8px;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .qrcode-placeholder {
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px dashed #ccc;
    border-radius: 4px;
    margin: 0 auto 10px;
    color: #909399;
    
    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
  
  .qrcode-tip {
    margin: 0;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}

/* 二维码放大模态框样式 */
.qrcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.qrcode-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 90%;
  max-height: 90%;
}

.qrcode-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.qrcode-modal-app-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.qrcode-modal-image {
  max-width: 80vw;
  max-height: 70vh;
  object-fit: contain;
}

.qrcode-modal-footer {
  margin-top: 15px;
}

.qrcode-modal-close {
  margin: 0 auto;
}

.download-qrcode-btn {
  text-align: center;
  margin: 20px 0;
}
</style>
