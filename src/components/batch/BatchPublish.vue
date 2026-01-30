<template>
  <div class="batch-publish-module">
    <h2>批量发布小程序</h2>
    
    <!-- 步骤1: 选择小程序 -->
    <div v-if="currentStep === 0">
      <AppSelectionStep
        :apps="availableApps"
        :is-batch-build="false"
        @update:selectedApps="updateSelectedApps"
        @next="goToConfigStep"
      />
    </div>
    
    <!-- 步骤2: 配置参数 -->
    <div v-if="currentStep === 1">
      <BatchPublishConfigStep
        :selectedApps="selectedApps"
        @previous="goToSelectionStep"
        @next="goToPublishStep"
      />
    </div>
    
    <!-- 步骤3: 执行发布 -->
    <div v-if="currentStep === 2">
      <div class="publish-summary" v-if="!publishStarted">
        <h3>发布配置预览</h3>
        <el-table :data="publishConfigs" style="width: 100%">
          <el-table-column prop="name" label="小程序名称" />
          <el-table-column label="平台">
            <template #default="scope">
              {{ getPlatformDisplayName(scope.row.platform) }}
            </template>
          </el-table-column>
          <el-table-column label="版本号">
            <template #default="scope">
              {{ scope.row.config.version }}
            </template>
          </el-table-column>
          <el-table-column label="发布模式">
            <template #default="scope">
              {{ scope.row.config.publishMode === 'preview' ? '仅预览' : '发布并预览' }}
            </template>
          </el-table-column>
          <el-table-column prop="config.description" label="发布说明" />
        </el-table>
        
        <div class="action-buttons">
          <el-button @click="goToConfigStep">上一步</el-button>
          <el-button type="primary" @click="startBatchPublish">开始批量发布</el-button>
        </div>
      </div>
      
      <!-- 发布进度显示 -->
      <div v-else>
        <BatchPublishProgressStep
          :app-configs="batchStore.batchTask.apps"
          :batch-task-id="batchStore.batchTask.id"
          :is-preview-mode="false"
          @finish="handlePublishFinish"
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
import BatchPublishConfigStep from './BatchPublishConfigStep.vue'
import BatchPublishProgressStep from './BatchPublishProgressStep.vue'
import request from '@/utils/request'

// 使用router
const router = useRouter()

// 使用store
const batchStore = useBatchBuildStore()

// 响应式数据
const currentStep = ref(0)
const selectedApps = ref([])
const publishConfigs = ref([])
const publishStarted = ref(false)

// 可用的小程序数据
const availableApps = ref([])

// 获取小程序列表
const fetchApps = async () => {
  try {
    // 小说项目使用 novel-publish 接口
    const res = await request.get('/api/novel-publish/list')
    const data = res.data
    
    console.log('[BatchPublish] 接口返回数据:', data)
    
    let appList = []
    
    // 检查data是对象还是数组
    if (Array.isArray(data)) {
      // data 是一个数组，每个元素是一个包含appName和platforms的对象
      data.forEach(appItem => {
        // appItem.platforms 是一个数组，包含该应用在不同平台的信息
        appItem.platforms.forEach(platformApp => {
          appList.push({
            id: platformApp.appId, // 确保id唯一
            name: appItem.appName,
            platform: platformApp.platformCode,  // 使用平台代码而不是平台名称
            platformName: platformApp.platformName,  // 保存平台名称用于显示
            product: platformApp.product,
            lastBuildTime: platformApp.buildTime, // 修正：后端返回的是buildTime，不是lastBuildTime
            version: platformApp.version,
            status: platformApp.status, // 使用接口返回的status值，并转换为中文显示
            avatar: '', // 可以根据需要添加头像URL
            projectPath: platformApp.projectPath,  // 添加projectPath字段
            appId: platformApp.appId  // 添加appId字段
          })
        })
      })
    } else if (typeof data === 'object' && data !== null) {
      // data 是一个对象，key是平台名称，value是该平台的应用数组
      Object.entries(data).forEach(([platformKey, apps]) => {
        if (Array.isArray(apps)) {
          apps.forEach(app => {
            // 平台代码映射
            const platformCodeMap = {
              'douyin': 'mp-toutiao',
              'kuaishou': 'mp-kuaishou',
              'weixin': 'mp-weixin',
              'baidu': 'mp-baidu',
              'alipay': 'mp-alipay'
            }
            
            const platformCode = platformCodeMap[platformKey] || app.platform || platformKey
            
            appList.push({
              id: app.appid || app.appId,
              name: app.name || app.appName,
              platform: platformCode,
              platformName: app.platformName || getPlatformDisplayName(platformCode),
              product: app.product,
              lastBuildTime: app.buildTime || app.lastBuildTime, // 修正：优先使用buildTime
              version: app.version,
              status: app.status,
              avatar: '',
              projectPath: app.projectPath || '',
              appId: app.appid || app.appId
            })
          })
        }
      })
    }
    
    console.log('[BatchPublish] 处理后的应用列表:', appList)
    availableApps.value = appList
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    ElMessage.error('获取小程序列表失败: ' + (error.message || '未知错误'))
    
    // 获取失败时不使用 mock 数据，保持空列表
    availableApps.value = []
  }
}

// 方法 - 将数字状态转换为中文状态显示
const getStatusText = (status) => {
  // 状态映射规则：
  // status: 0 → "禁用" 或 "异常"
  // status: 1 → "正常"
  const statusMap = {
    0: '禁用',
    1: '正常'
  }
  return statusMap[status] || '未知状态'
}

// 平台名称转换（实际上后端已经返回了完整的平台名称，这里可能不需要转换）
const getPlatformName = (platformCode) => {
  // 如果后端返回的是平台代码，可以在这里进行转换
  // 如果后端返回的是完整名称，直接返回即可
  return platformCode
}

// 方法 - 获取平台显示名称
const getPlatformDisplayName = (platformCode) => {
  const nameMap = {
    'mp-weixin': '微信小程序',
    'mp-toutiao': '抖音小程序',
    'mp-kuaishou': '快手小程序',
    'mp-baidu': '百度小程序',
    'mp-alipay': '支付宝小程序'
  }
  return nameMap[platformCode] || platformCode
}

// 方法 - 更新选中的应用
const updateSelectedApps = (apps) => {
  selectedApps.value = apps
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

// 方法 - 跳转到发布步骤
const goToPublishStep = (configs) => {
  publishConfigs.value = configs
  currentStep.value = 2
}

// 方法 - 开始批量发布
const startBatchPublish = async () => {
  ElMessage.info('开始批量发布...')
  publishStarted.value = true
  
  // 重置store状态
  batchStore.resetBatchBuild()
  
  
  // 准备发布参数
  const publishParams = []
  for (const config of publishConfigs.value) {
    console.log('config', config)
    try {
      // 获取应用配置信息
      const res = await request.get('/api/novel-common/getAppCommonConfig', {
        params: { appId: config.id }
      })
      
      if (res.code === 200 && res.data) {
        // 直接使用平台代码，不再需要映射
        const plat = config.platform;
        
        // 准备发布参数
        const params = {
          platformCode: plat,
          appId: config.id,
          projectPath: config.projectPath, // 从config中获取projectPath
          version: config.config.version,
          publishMode: config.config.publishMode || 'preview', // 添加发布模式参数
          log: (() => {
            // 获取当前登录用户信息
            const userInfoStr = localStorage.getItem('userInfo');
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
            const currentUserId = userInfo?.userName || userInfo?.username || userInfo?.id || '未知用户';
            
            // 格式化日志，包含发布人员信息
            return `【当前发布人员：${currentUserId}】发布日志：${config.config.description}`;
          })(),
          douyinAppToken: res.data.douyinAppToken || '',
          kuaishouAppToken: res.data.kuaishouAppToken || '',
          weixinAppToken: res.data.weixinAppToken || '',
          baiduAppToken: res.data.baiduAppToken || '',
          alipayAppToken: res.data.alipayAppToken || '',
          alipayToolId: res.data.alipayToolId || ''
        }
        publishParams.push(params)
      } else {
        // 如果获取配置失败，使用默认参数
        // 直接使用平台代码，不再需要映射
        const plat = config.platform;
        publishParams.push({
          platformCode: plat,
          appId: config.id,
          projectPath: config.projectPath || '', // 使用config中的projectPath，如果不存在则使用空字符串
          version: config.config.version,
          publishMode: config.config.publishMode || 'publish', // 添加发布模式参数
          log: (() => {
            // 获取当前登录用户信息
            const userInfoStr = localStorage.getItem('userInfo');
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
            const currentUserId = userInfo?.userName || userInfo?.username || userInfo?.id || '未知用户';
            
            // 格式化日志，包含发布人员信息
            return `【当前发布人员：${currentUserId}】发布日志：${config.config.description}`;
          })(),
          douyinAppToken: '',
          kuaishouAppToken: '',
          weixinAppToken: '',
          baiduAppToken: '',
          alipayAppToken: '',
          alipayToolId: ''
        })
      }
    } catch (error) {
      // 如果请求失败，使用默认参数
      // 直接使用平台代码，不再需要映射
      const plat = config.platform;
      publishParams.push({
        platformCode: plat,
        appId: config.id,
        projectPath: config.projectPath || '', // 使用config中的projectPath，如果不存在则使用空字符串
        version: config.config.version,
        publishMode: config.config.publishMode || 'publish', // 添加发布模式参数
        log: config.config.description,
        douyinAppToken: '',
        kuaishouAppToken: '',
        weixinAppToken: '',
        baiduAppToken: '',
        alipayAppToken: '',
        alipayToolId: ''
      })
    }
  }
  
  const publishRequest = {
    publishParams: publishParams,
    description: publishConfigs.value.map(config => config.config.description).join(', ')
  };
  
  try {
    // 调用后端API执行批量发布
    // 小说项目使用 novel-publish 接口
    const res = await request.post(
      '/api/novel-publish/batch-publish',
      publishRequest
    )
    
    if (res.code === 200 && res.data) {
      // 保存批任务ID到store
      // 后端现在返回的是包含batchTaskId和taskIds的对象
      const batchTaskId = res.data.batchTaskId;
      const taskIds = res.data.taskIds || [];
      batchStore.setBatchTaskId(batchTaskId)
      
      // 初始化发布应用配置到store
      publishConfigs.value.forEach((config, index) => {
        const taskId = taskIds[index] || (taskIds.length > index ? taskIds[index] : null)
        batchStore.addAppToBatch({
          ...config,
          taskId: taskId
        })
      })
      
      // 不在这里连接WebSocket，让进度页面在onMounted时连接
      // 这样可以确保WebSocket连接建立后，后端才开始发送日志
      ElMessage.success('批量发布任务已启动')
    } else {
      ElMessage.error('启动批量发布失败: ' + (res.message || '未知错误'))
      publishStarted.value = false
    }
  } catch (error) {
    ElMessage.error('启动批量发布失败: ' + (error.message || '未知错误'))
    publishStarted.value = false
  }
}

// 方法 - 处理发布完成
const handlePublishFinish = (status) => {
  console.log('[BatchPublish] 处理发布完成，状态:', status);
  // 确保断开WebSocket连接
  batchBuildWebSocket.disconnect()
  
  if (status === 'success') {
    ElMessage.success('批量发布已完成')
  } else {
    ElMessage.error('批量发布已完成，但有任务失败')
  }
}

// 方法 - 处理重新发布
const handleRebuild = () => {
  console.log('[BatchPublish] 处理重新发布');
  // 重置store状态
  batchStore.resetBatchBuild()
  
  // 重新开始发布
  startBatchPublish()
}

// 方法 - 处理返回首页
const handleGoHome = () => {
  // 断开WebSocket连接
  batchBuildWebSocket.disconnect()
  
  // 清空所有回调函数
  batchBuildWebSocket.clearCallbacks()
  
  // 重置store状态
  batchStore.resetBatchBuild()
  
  // 重置状态
  currentStep.value = 0
  publishStarted.value = false
  publishConfigs.value = []
  
  // 返回文曲自动化页面
  router.push('/wenqu-auto')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApps()
})

// 组件卸载时清理资源
onUnmounted(() => {
  console.log('[BatchPublish] 组件卸载，准备清理资源');
  // 只有在发布真正完成后才断开WebSocket连接
  // 如果还有任务在运行，则不主动断开连接
  const batchTask = batchStore.batchTask
  const hasRunningTasks = batchTask.apps.some(app =>
    app.status === 'running' || app.status === 'pending'
  )
  
  if (!hasRunningTasks) {
    console.log('[BatchPublish] 没有运行中的任务，断开WebSocket连接');
    // 断开WebSocket连接
    batchBuildWebSocket.disconnect()
    
    // 清空所有回调函数
    batchBuildWebSocket.clearCallbacks()
  } else {
    console.log('[BatchPublish] 仍有运行中的任务，不主动断开WebSocket连接');
  }
})
</script>

<style scoped>
.batch-publish-module {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.publish-summary {
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