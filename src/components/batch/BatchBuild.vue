<template>
  <div class="batch-build-module">
    <h2>批量构建小程序</h2>
    
    <!-- 步骤1: 选择小程序 -->
    <div v-if="currentStep === 0">
      <AppSelectionStep
        :apps="availableApps"
        :is-batch-build="true"
        :show-ad-settings="false"
        @update:selectedApps="updateSelectedApps"
        @next="goToConfigStep"
      />
    </div>
    
    <!-- 步骤2: 配置参数 -->
    <div v-if="currentStep === 1">
      <BatchBuildConfigStep
        :selectedApps="selectedApps"
        @previous="goToSelectionStep"
        @next="goToBuildStep"
      />
    </div>
    
    <!-- 步骤3: 执行构建 -->
    <div v-if="currentStep === 2">
      <div class="build-summary" v-if="!buildStarted">
        <h3>构建配置预览</h3>
        <el-table :data="buildConfigs" style="width: 100%">
          <el-table-column prop="name" label="小程序名称" />
          <el-table-column label="平台">
            <template #default="scope">
              {{ getPlatformDisplayName(scope.row.platform) }}
            </template>
          </el-table-column>
          <el-table-column label="构建环境">
            <template #default="scope">
              {{ scope.row.config.environment === 'production' ? '生产环境' : '开发环境' }}
            </template>
          </el-table-column>
          <el-table-column label="构建类型">
            <template #default="scope">
              {{ getBuildTypeName(scope.row.config.buildType) }}
            </template>
          </el-table-column>
          <el-table-column prop="config.description" label="构建说明" />
        </el-table>
        
        <div class="action-buttons">
          <el-button @click="goToConfigStep">上一步</el-button>
          <el-button type="primary" @click="startBatchBuild">开始批量构建</el-button>
        </div>
      </div>
      
      <!-- 构建进度显示 -->
      <div v-else>
        <BatchBuildProgressStep
          :app-configs="batchStore.batchTask.apps"
          :batch-task-id="batchStore.batchTask.id"
          @finish="handleBuildFinish"
          @rebuild="handleRebuild"
          @home="handleGoHome"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useBatchBuildStore } from '@/stores/batchBuildStore'
import { useRouter } from 'vue-router'
import batchBuildWebSocket from '@/utils/batchBuildWebSocket'
import AppSelectionStep from './AppSelectionStep.vue'
import BatchBuildConfigStep from './BatchBuildConfigStep.vue'
import BatchBuildProgressStep from './BatchBuildProgressStep.vue'
import request from '@/utils/request'

// 使用router
const router = useRouter()

// 使用store
const batchStore = useBatchBuildStore()

// 响应式数据
const currentStep = ref(0)
const selectedApps = ref([])
const buildConfigs = ref([])
const buildAppConfigs = ref([])
const buildStarted = ref(false)

// 可用的小程序数据
const availableApps = ref([])

// 获取小程序列表
const fetchApps = async () => {
  try {
    // 这里需要根据当前是视频还是动画来调用不同的接口
    // 暂时使用模拟数据，实际使用时需要根据路由参数判断调用哪个接口
    const isVideo = window.location.pathname.includes('/novel/')
    
    const res = await request.get('/api/novel-apps/appLists')
    const data = res.data
    
    let appList = []
    Object.values(data).forEach(platformApps => {
      appList = [...appList, ...platformApps.map(app => ({
        id: app.appid,
        name: app.appName,
        platform: app.platform, // 直接使用平台代码
        platformName: getPlatformName(app.platform), // 保存平台名称用于显示
        product: app.product,
        version: app.version,
        status: app.status,
        lastBuildTime: app.lastBuildTime,
        avatar: '' // 可以根据需要添加头像URL
      }))]
    })
    
    availableApps.value = appList
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    ElMessage.error('获取小程序列表失败')
    
    // 使用模拟数据以便开发和测试
    availableApps.value = [
      {
        id: 1,
        name: '小说阅读器',
        platform: 'mp-weixin',
        platformName: '微信',
        version: '1.0.0',
        status: '正常',
        avatar: ''
      },
      {
        id: 2,
        name: '视频播放器',
        platform: 'mp-alipay', // 支付宝小程序的平台代码，如果不确定具体代码，可以先用这个
        platformName: '支付宝',
        version: '2.1.0',
        status: '正常',
        avatar: ''
      },
      {
        id: 3,
        name: '音乐播放器',
        platform: 'mp-baidu',
        platformName: '百度',
        version: '1.5.0',
        status: '维护中',
        avatar: ''
      },
      {
        id: 4,
        name: '游戏中心',
        platform: 'mp-toutiao', // 字节跳动小程序的平台代码通常是mp-toutiao
        platformName: '字节',
        version: '3.2.0',
        status: '正常',
        avatar: ''
      }
    ]
  }
}

// 平台名称转换
const getPlatformName = (platformCode) => {
  const platforms = {
    'douyin': '抖音',
    'kuaishou': '快手',
    'weixin': '微信',
    'baidu': '百度',
    'alipay': '支付宝'
  }
  return platforms[platformCode] || platformCode
}

// 方法 - 更新选中的应用
const updateSelectedApps = (apps) => {
  selectedApps.value = apps
}

// 方法 - 获取构建类型名称
const getBuildTypeName = (type) => {
  const types = {
    'full': '完整构建',
    'incremental': '增量构建',
    'quick': '快速构建'
  }
  return types[type] || type
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

// 方法 - 跳转到选择步骤
const goToSelectionStep = () => {
  currentStep.value = 0
}

// 方法 - 跳转到配置步骤
const goToConfigStep = (apps) => {
  if (apps && apps.length > 0) {
    selectedApps.value = apps
  }
  currentStep.value = 1
}

// 方法 - 跳转到构建步骤
const goToBuildStep = (configs) => {
  buildConfigs.value = configs
  currentStep.value = 2
}

// 方法 - 开始批量构建
const startBatchBuild = async () => {
  ElMessage.info('开始批量构建...')
  buildStarted.value = true
  
  // 重置store状态
  batchStore.resetBatchBuild()
  
  // 平台映射
  const platformMap = {
    '抖音': 'tt',
    '微信': 'wx',
    '快手': 'ks',
    '百度': 'bd',
    '支付宝': 'tb'
  }
  
  // 准备构建参数
    const buildItems = []
   for (const config of buildConfigs.value) {
      try {
        // 获取应用配置信息
        const res = await request.get('/api/novel-common/getAppCommonConfig', {
          params: { appId: config.id }
        })
        
        if (res.code === 200 && res.data) {
          const buildCode = res.data.buildCode || 'fun' // 默认值
          const plat = platformMap[config.platformName] || config.platform.toLowerCase()
          
          // 生成构建命令
          const buildCommand = `npm run build:${plat}-${buildCode}`
          
          console.log(`[批量编译] 应用ID: ${config.id}, 平台: ${config.platformName}(${plat}), buildCode: ${buildCode}, 命令: ${buildCommand}`)
          
          // 小说项目不需要预取命令
          let prefetchCommand = ''
          let isPrefetchApp = false
          
          buildItems.push({
            buildCommand: buildCommand,
            prefetchCommand: prefetchCommand,
            isPrefetchApp: isPrefetchApp
          })
        } else {
          // 如果获取配置失败，使用默认命令
          const platformScriptMap = {
            '微信': 'mp-weixin',
            '抖音': 'mp-toutiao',
            '快手': 'mp-kuaishou',
            '百度': 'mp-baidu',
            '支付宝': 'mp-alipay'
          }
          const scriptName = platformScriptMap[config.platform] || config.platform.toLowerCase()
          const buildCommand = `npm run build:${scriptName}`
          
          // 小说项目不需要预取命令
          let prefetchCommand = ''
          let isPrefetchApp = false
          
          buildItems.push({
            buildCommand: buildCommand,
            prefetchCommand: prefetchCommand,
            isPrefetchApp: isPrefetchApp
          })
        }
      } catch (error) {
        // 如果请求失败，使用默认命令
        const platformScriptMap = {
          '微信': 'mp-weixin',
          '抖音': 'mp-toutiao',
          '快手': 'mp-kuaishou',
          '百度': 'mp-baidu',
          '支付宝': 'mp-alipay'
        }
        const scriptName = platformScriptMap[config.platform] || config.platform.toLowerCase()
        const buildCommand = `npm run build:${scriptName}`
        
        // 小说项目不需要预取命令
        let prefetchCommand = ''
        let isPrefetchApp = false
        
        buildItems.push({
          buildCommand: buildCommand,
          prefetchCommand: prefetchCommand,
          isPrefetchApp: isPrefetchApp
        })
      }
    }
  
  // 准备构建请求
    const commands = []
    const douyinCombinedFlags = []
    const prefetchCommands = []
    
    for (const item of buildItems) {
      commands.push(item.buildCommand)
      if (item.isPrefetchApp && item.prefetchCommand) {
        douyinCombinedFlags.push(true)
        prefetchCommands.push(item.prefetchCommand)
      } else {
        douyinCombinedFlags.push(false)
        prefetchCommands.push('')
      }
    }
  
  // 提取选中的appId
  const appIds = selectedApps.value.map(app => app.id)
  
  console.log('[批量编译] 最终生成的命令列表:', commands)
  console.log('[批量编译] 抖音合并标志:', douyinCombinedFlags)
  console.log('[批量编译] 预取命令列表:', prefetchCommands)
  console.log('[批量编译] 应用ID列表:', appIds)
  
  const buildRequest = {
    commands: commands,
    douyinCombinedFlags: douyinCombinedFlags,
    prefetchCommands: prefetchCommands,
    description: buildConfigs.value
      .map(config => config.config.description)
      .filter(desc => desc && desc.trim() !== '') // 过滤掉空字符串
      .join(', ') || '批量构建任务', // 如果没有有效描述，则使用默认描述
    appIds: appIds // 添加选中的appId列表
 }
  
  // 添加调试日志
  console.log('[BatchBuild] 构建请求参数:', buildRequest);
  
  try {
    // 调用后端API执行批量构建
    // 小说项目使用 novel-build 接口
    const res = await request.post(
      '/api/novel-build/batch-build',
      buildRequest
    )
    
    if (res.code === 200 && res.data) {
      // 添加调试日志
      console.log('[BatchBuild] 后端响应数据:', res.data);
      
      // 保存批任务ID到store
      const batchTaskId = res.data.batchTaskId || (res.data.taskIds ? res.data.taskIds[0] : res.data[0]) // 根据实际返回结构调整
      batchStore.setBatchTaskId(batchTaskId)
      
      // 初始化构建应用配置到store
      buildConfigs.value.forEach((config, index) => {
        const taskId = res.data.taskIds ? res.data.taskIds[index] : (res.data.length > index ? res.data[index] : null) // 根据实际返回结构调整
        batchStore.addAppToBatch({
          ...config,
          taskId: taskId,
          batchTaskId: batchTaskId // 添加batchTaskId字段
        })
      })
      
      // 连接WebSocket
      try {
        await batchBuildWebSocket.connect(batchTaskId)
        ElMessage.success('批量构建任务已启动')
      } catch (error) {
        ElMessage.error('WebSocket连接失败: ' + (error.message || '未知错误'))
      }
    } else {
      ElMessage.error('启动批量构建失败: ' + (res.message || '未知错误'))
      buildStarted.value = false
    }
  } catch (error) {
    ElMessage.error('启动批量构建失败: ' + (error.message || '未知错误'))
    buildStarted.value = false
  }
}

// 方法 - 处理构建完成
const handleBuildFinish = (status) => {
  // 构建完成时不需要主动断开WebSocket连接，因为BatchBuildProgressStep.vue已经处理了
  // WebSocket会在所有任务真正完成后自动断开
  
  if (status === 'success') {
    ElMessage.success('批量构建已完成')
  } else {
    ElMessage.error('批量构建已完成，但有任务失败')
  }
}

// 方法 - 处理重新构建
const handleRebuild = () => {
  // 重置store状态
  batchStore.resetBatchBuild()
  
  // 重新开始构建
  startBatchBuild()
}

// 方法 - 处理返回首页
const handleGoHome = () => {
  // 只有在构建真正完成后才断开WebSocket连接
  // 如果还有任务在运行，则不主动断开连接
  const batchTask = batchStore.batchTask
  const hasRunningTasks = batchTask.apps.some(app =>
    app.status === 'running' || app.status === 'pending'
  )
  
  if (!hasRunningTasks) {
    // 断开WebSocket连接
    batchBuildWebSocket.disconnect()
    
    // 清空所有回调函数
    batchBuildWebSocket.clearCallbacks()
  }
  
  // 重置store状态
  batchStore.resetBatchBuild()
  
  // 重置状态
  currentStep.value = 0
  buildStarted.value = false
  buildConfigs.value = []
  buildAppConfigs.value = []
  
  // 返回文曲自动化页面
  router.push('/wenqu-auto')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApps()
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 只有在构建真正完成后才断开WebSocket连接
  // 如果还有任务在运行，则不主动断开连接
  const batchTask = batchStore.batchTask
  const hasRunningTasks = batchTask.apps.some(app =>
    app.status === 'running' || app.status === 'pending'
  )
  
  if (!hasRunningTasks) {
    // 断开WebSocket连接
    batchBuildWebSocket.disconnect()
    
    // 清空所有回调函数
    batchBuildWebSocket.clearCallbacks()
  }
})
</script>

<style scoped>
.batch-build-module {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.build-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>