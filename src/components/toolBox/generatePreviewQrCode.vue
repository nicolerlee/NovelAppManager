<template>
  <div class="generate-preview-qrcode">
    <el-card class="preview-container">
      <template #header>
        <div class="header">
          <div class="header-left">
            <el-button @click="goBack" link>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <h3>生成预览二维码</h3>
          </div>
        </div>
      </template>

      <div class="preview-content">
        <!-- 小程序列表页面 -->
        <div v-if="!selectedBuild || !showQRCodePage">
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索小程序"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="app-list">
            <el-table
              :data="filteredApps"
              style="width: 100%"
              @row-click="handleSelectBuild"
              :highlight-current-row="true"
              v-loading="loading"
            >
              <el-table-column prop="platform" label="平台" width="100">
                <template #default="scope">
                  <el-tag :type="getPlatformType(scope.row.platform)" effect="light">
                    {{ scope.row.platform }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="appName" label="小程序名称" />
              <el-table-column prop="appid" label="AppID" width="220" />
            </el-table>
          </div>
        </div>

        <!-- 二维码生成页面 -->
        <div v-if="selectedBuild && showQRCodePage" class="qrcode-generate-page">
          <!-- 提示信息 -->
          <div class="warning-tip">
            <el-alert
              title="生成预览码请确认已编译小程序，如未编译，请前往文曲自动化进行编译操作！"
              type="warning"
              show-icon
              :closable="false"
            />
          </div>
          
          <!-- 小程序信息展示 -->
          <div class="app-info-card">
            <h4>小程序信息</h4>
            <div class="info-row">
              <span class="label">平台：</span>
              <el-tag :type="getPlatformType(selectedBuild.platform)" effect="light" class="platform-tag">
                {{ selectedBuild.platform }}
              </el-tag>
            </div>
            <div class="info-row">
              <span class="label">小程序名称：</span>
              <span class="value app-name-value" :title="selectedBuild.appName">{{ selectedBuild.appName }}</span>
            </div>
            <div class="info-row">
              <span class="label">AppID：</span>
              <span class="value">{{ selectedBuild.appid }}</span>
            </div>
            <div class="info-row" v-if="configLoading">
              <span class="label">AppToken：</span>
              <el-skeleton :rows="1" animated />
            </div>
            <div class="info-row" v-else-if="appCommonConfig">
              <span class="label">AppToken：</span>
              <span class="value app-token-value" :title="getAppTokenByPlatform(selectedPlatform)">
                {{ getAppTokenByPlatform(selectedPlatform) || '未配置' }}
              </span>
            </div>
          </div>

          <!-- 参数输入表单 -->
          <div class="param-form">
            <h4>请输入二维码参数</h4>
            <el-form :model="qrCodeParams" :rules="qrCodeRules" ref="qrCodeFormRef" label-width="80px" class="form-container">
              <el-form-item label="path" prop="path">
                <el-select v-model="qrCodeParams.path" placeholder="请选择小程序页面路径" style="width: 100%">
                  <el-option v-for="item in pathOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="query" prop="query">
                <el-input v-model="qrCodeParams.query" placeholder="请输入页面参数，格式如:key1=value1&key2=value2" />
              </el-form-item>
              <el-form-item label="scene" prop="scene">
                <el-select v-model="qrCodeParams.scene" placeholder="请选择或搜索场景值" style="width: 100%" filterable>
                  <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-form>
            
            <div class="form-actions">
              <el-button @click="backToAppList">取消</el-button>
              <el-button type="primary" @click="generateQRCode" :loading="loading">
                生成二维码
              </el-button>
            </div>
          </div>
        </div>

        <!-- 二维码展示部分 -->
        <div v-if="qrCodeImage" class="qrcode-display">
          <el-card class="qrcode-card">
            <div class="qrcode-container">
              <h4>预览二维码</h4>
              <img :src="qrCodeImage" alt="预览二维码" class="qrcode-image" />
              <p>请使用{{ getPlatformAppName(selectedPlatform) }}APP扫码验证</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 自定义弹窗 -->
    <el-dialog
      v-model="showDialog"
      title="生成预览二维码"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :before-close="handleDialogClose"
    >
      <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; padding: 20px 0;">
        <div v-if="!publishFailed" class="loading-spinner" style="margin-bottom: 16px;">
          <el-icon size="36" style="animation: el-icon-spin 1s linear infinite;">
            <Loading />
          </el-icon>
        </div>
        <div 
          ref="logContentRef" 
          class="log-content" 
          style=" 
            max-height: 400px; 
            width: 100%;
            min-width: 500px;
            overflow: auto; 
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            text-align: left
          "
        >
          {{ previewLogsText }}
        </div>
        <!-- 错误时显示关闭按钮 -->
        <div v-if="publishFailed" style="margin-top: 20px;">
          <el-button type="primary" @click="showDialog = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, h, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Search, Share, Platform, ChatDotRound, Connection, Check, Loading } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { pinyin } from 'pinyin-pro'

const router = useRouter()

// 状态定义
const loading = ref(false)
const searchQuery = ref('')
const apps = ref([])
const selectedBuild = ref(null)
const selectedPlatform = ref('')
const qrCodeImage = ref(null)
const showQRCodePage = ref(false)
const qrCodeFormRef = ref(null)
const appCommonConfig = ref(null)
const configLoading = ref(false)
const showDialog = ref(false)
const previewLogsText = ref('')
const publishFailed = ref(false)

// 二维码参数表单
const qrCodeParams = reactive({
  path: '',
  query: '',
  scene: ''
})

// 表单验证规则
const qrCodeRules = reactive({
  path: [
    { required: true, message: '请输入跳转路径', trigger: 'blur' }
  ],
  query: [
    { required: true, message: '请输入参数', trigger: 'blur' }
  ],
  scene: [
    { required: true, message: '请选择场景值', trigger: 'change' }
  ]
})

// 页面路径选项
const pathOptions = [
  { label: 'pages/readerPage/readerPage', value: 'pages/readerPage/readerPage' },
  { label: 'pages/novel_plugin/index', value: 'pages/novel_plugin/index' }
]

// 从配置文件导入平台场景值
import { platformSceneOptions } from './config/platformScenesConfig.js'

// 根据当前选择的平台获取对应的场景值选项
const sceneOptions = computed(() => {
  return platformSceneOptions[selectedPlatform.value] || platformSceneOptions.default
})

// 获取可用的平台列表
const availablePlatforms = computed(() => {
  if (!selectedBuild.value) return []
  
  // 映射平台代码
  const platformMap = {
    '抖音': 'mp-toutiao',
    '快手': 'mp-kuaishou',
    '微信': 'mp-weixin',
    '百度': 'mp-baidu'
  }
  
  // 获取当前选择的小程序的平台代码
  const appPlatformCode = platformMap[selectedBuild.value.platform]
  if (!appPlatformCode) return []
  
  // 返回对应的平台信息
  return platforms.filter(platform => platform.code === appPlatformCode)
})

// 过滤小程序列表
const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  const isSingleCharQuery = query.length === 1;
  return apps.value.filter(app => {
    const name = app.appName || ''
    // 获取全拼和首字母
    const namePinyinFirst = pinyin(name, {
      pattern: 'first',
      type: 'array',
      toneType: 'none',
      nonZh: 'consecutive'
    }).join('').toLowerCase()
    const namePinyinFull = pinyin(name, {
      pattern: 'pinyin',
      type: 'array',
      toneType: 'none',
      nonZh: 'consecutive'
    }).join('').toLowerCase()
    // 检查原始名称
    if (name.toLowerCase().includes(query)) return true
    // 检查拼音首字母
    if (isSingleCharQuery) {
      if (namePinyinFirst.length > 0 && namePinyinFirst[0] === query) return true;
    } else {
      if (namePinyinFirst.startsWith(query)) return true
    }
    // 检查全拼
    if (namePinyinFull.includes(query)) return true
    // 检查其他字段
    return (app.appid && app.appid.toLowerCase().includes(query))
  })
})

// 平台类型和名称转换
const getPlatformType = (platform) => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
}

// 获取小程序列表
const fetchApps = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/novel-publish/list')
    if (res.code === 200) {
      // 调整数据结构以匹配当前组件的使用方式
      const formattedApps = res.data.flatMap(build => 
        build.platforms.map(platform => ({
          id: build.id,
          platform: getPlatformName(platform.platformCode),
          appName: build.appName,
          appid: platform.appId,
          version: build.version || '1.0.0',
          projectPath: platform.projectPath || build.projectPath || ''
        }))
      )
      
      apps.value = formattedApps
    } else {
      console.error('获取小程序列表失败:', res.message)

    }
  } catch (error) {
    console.error('获取小程序列表失败:', error)

  } finally {
    loading.value = false
  }
}

const getPlatformName = (platformCode) => {
  const platforms = {
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-weixin': '微信',
    'mp-baidu': '百度'
  }
  return platforms[platformCode] || platformCode
}


// 处理选择构建
const handleSelectBuild = async (app) => {
  selectedBuild.value = app
  // 根据选择的小程序设置平台
  const platformMap = {
    '抖音': 'mp-toutiao',
    '快手': 'mp-kuaishou',
    '微信': 'mp-weixin',
    '百度': 'mp-baidu'
  }
  selectedPlatform.value = platformMap[app.platform] || 'mp-weixin'
  
  // 请求小程序通用配置
  await fetchAppCommonConfig(app.appid)
  
  // 跳转到二维码生成页面
  showQRCodePage.value = true
  // 重置表单和二维码
  resetForm()
}

// 获取小程序通用配置
const fetchAppCommonConfig = async (appId) => {
  if (!appId) return
  
  configLoading.value = true
  appCommonConfig.value = null
  
  try {
    const res = await request.get('/api/novel-common/getAppCommonConfig', {
      params: { appId }
    })
    
    if (res.code === 200 && res.data) {
      appCommonConfig.value = res.data
      console.log('获取小程序通用配置成功:', res.data)
    } else {
      console.error('获取小程序通用配置失败:', res.message)
      ElMessage.warning('获取小程序通用配置失败，将使用默认值')
    }
  } catch (error) {
    console.error('获取小程序通用配置异常:', error)
    ElMessage.warning('获取小程序通用配置异常，将使用默认值')
  } finally {
    configLoading.value = false
  }
}

// 返回小程序列表
const backToAppList = () => {
  showQRCodePage.value = false
  selectedBuild.value = null
  selectedPlatform.value = ''
  appCommonConfig.value = null
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (qrCodeFormRef.value) {
    qrCodeFormRef.value.resetFields()
  }
  qrCodeImage.value = null
}

// 返回上一页
const goBack = () => {
  router.push('/toolbox')
}


// 获取平台应用名称
const getPlatformAppName = (platformCode) => {
  const appNames = {
    'mp-weixin': '微信',
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-baidu': '百度'
  }
  return appNames[platformCode] || '对应平台'
}

// 根据平台获取AppToken
const getAppTokenByPlatform = (platformCode) => {
  if (!appCommonConfig.value) return ''
  
  const tokenMap = {
    'mp-toutiao': appCommonConfig.value.douyinAppToken,
    'mp-kuaishou': appCommonConfig.value.kuaishouAppToken,
    'mp-weixin': appCommonConfig.value.weixinAppToken
  }
  
  return tokenMap[platformCode] || ''
}

// 响应式变量定义
const previewLogs = ref([])
const previewTaskId = ref(null)
const previewStompClient = ref(null)
const logContentRef = ref(null)
const publishing = ref(false)
// 该变量已在上方声明，此处移除重复声明

// 连接发布日志 WebSocket
const connectPublishLogSocket = (taskId) => {
  return new Promise((resolve, reject) => {
    if (previewStompClient.value) {
      try { previewStompClient.value.disconnect() } catch {}
      previewStompClient.value = null
    }
    console.log("connectPublishLogSocket:", taskId)
    
    // 使用WebSocket工厂函数创建连接，以支持自动重连
    const client = Stomp.over(() => {
      return new SockJS(`${window.location.protocol}//${window.location.hostname}:8080/ws`)
    })
    
    // 启用自动重连
    client.reconnect_delay = 5000 // 5秒后自动重连
    client.heartbeat.outgoing = 20000 // 20秒发送一次心跳
    client.heartbeat.incoming = 20000 // 20秒接收一次心跳
    client.debug = (str) => {
      console.log('STOMP debug:', str) // 启用调试日志以便排查问题
    }
    
    // 连接成功回调
    const onConnect = () => {
      console.log('WebSocket连接成功')
      client.subscribe(`/topic/publish-logs/${taskId}`, async (message) => {
        if (message.body) {
          previewLogs.value.push(message.body)
          previewLogsText.value = previewLogs.value.join('\n')
          nextTick(() => {
            if (logContentRef.value) {
              logContentRef.value.scrollTop = logContentRef.value.scrollHeight
            }
          })
          console.log("message.body:", message.body)
          if (message.body.startsWith('Preview QrCode success')) {
              // 检查是否包含二维码链接
              if (message.body.includes('[抖音] 二维码生成成功:')) {
                const qrCodeUrl = message.body.substring(message.body.indexOf('[抖音] 二维码生成成功:') + '[抖音] 二维码生成成功:'.length).trim()
                console.log('提取的二维码URL:', qrCodeUrl)
                
                // 设置二维码图片
                try {
                  // 使用QRCode.toDataURL生成二维码图片
                  const QRCode = (await import('qrcode')).default
                  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
                    width: 180,
                    margin: 1,
                    color: {
                      dark: '#000000',
                      light: '#ffffff'
                    }
                  })
                  qrCodeImage.value = qrCodeDataUrl
                  console.log('二维码图片生成成功')
                } catch (error) {
                  console.error('生成二维码图片失败:', error)
                  ElMessage.error('生成二维码图片失败')
                  // 如果生成失败，直接使用原始URL（备用方案）
                  qrCodeImage.value = qrCodeUrl
                }
              }else if(message.body.includes('[微信] 二维码生成成功:')){
                  await fetchWeixinQRCode(taskId)
              }
              
              setTimeout(async () => {
                if (previewStompClient.value) previewStompClient.value.disconnect()
                previewStompClient.value = null
                publishing.value = false
                loading.value = false
                previewTaskId.value = null              
                showDialog.value = false // 直接隐藏弹窗
                ElMessage.success('预览二维码生成成功')
              }, 1000)
          } else if (message.body.startsWith('Preview QrCode error')) {
              setTimeout(() => {
                if (previewStompClient.value) previewStompClient.value.disconnect()
                previewStompClient.value = null
                publishing.value = false
                loading.value = false
                previewTaskId.value = null
                publishFailed.value = true
                ElMessage.error('预览二维码生成失败，请检查日志并重试')
              }, 1000)
          } else if(message.body.startsWith('[抖音] 二维码生成成功:')) {
            const qrCodeUrl = message.body.substring('[抖音] 二维码生成成功:'.length).trim()
            console.log("douyin qrCodeUrl:", qrCodeUrl)
            // 这里可以添加生成抖音二维码的逻辑
          }
          // 检查是否收到TASK_COMPLETED命令
          if (message.body === 'TASK_COMPLETED') {
            console.log('收到任务完成命令，断开连接')
            if (previewStompClient.value) previewStompClient.value.disconnect()
            previewStompClient.value = null
            publishing.value = false
            loading.value = false
            previewTaskId.value = null
            ElMessage.success('任务已完成')
          }
        }
      })
      resolve(client) // 连接成功，返回client
    }
    
    // 连接错误回调
    const onError = (error) => {
      console.error('WebSocket连接失败:', error)
      reject(error) // 连接失败，拒绝Promise
    }
    
    client.connect({}, onConnect, onError)
    previewStompClient.value = client
  })  

}


// 在发布成功后，如果当前是快手平台，调用接口获取二维码
const fetchWeixinQRCode = async (taskId) => {
  console.log("fetchWeixinQRCode:", taskId)
  if (!taskId) return
  try {
    // 使用axios获取原始响应，绕过拦截器的data处理
    const response = await request({
      method: 'GET',
      url: `/api/novel-publish/qrcode/${taskId}`,
      responseType: 'arraybuffer' // 告知axios以ArrayBuffer形式处理响应
    })

    if (response.status === 200 && response.data) {
      // 将ArrayBuffer转换为Blob对象，并创建Object URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/png' });
      qrCodeImage.value = URL.createObjectURL(blob);
      console.log("微信二维码Object URL:", qrCodeImage.value);

    } else {
      // 更详细的错误提示
      const errorMsg = `获取微信预览二维码失败: 状态码 ${response.status}, 消息: ${response.statusText || '未知错误'}`;
      ElMessage.error(errorMsg)
      console.error(errorMsg, response); // 打印完整的响应对象
      qrCodeImage.value = null // 获取失败则不显示二维码
    }
  } catch (error) {
    console.error('获取微信预览二维码失败:', error) // 打印完整的错误对象
    ElMessage.error('获取微信预览二维码失败: ' + (error?.message || ''))
    qrCodeImage.value = null // 获取失败则不显示二维码
  }
}


// 处理对话框关闭
const handleDialogClose = (done) => {
  if (publishing.value || loading.value) {
    ElMessageBox.confirm('生成二维码中，确定要关闭吗？')
      .then(() => {
        loading.value = false
        publishing.value = false
        if (done) {
          done()
        } else {
          showDialog.value = false
        }
      })
      .catch(() => {})
    return false // 阻止默认关闭行为
  }
  if (done) {
    done()
  }
  return true
}

import { useAuth } from '../../composables/useAuth'

// 使用useAuth获取用户信息
const { userInfo } = useAuth()

// 生成二维码
const generateQRCode = async () => {
  // 验证表单
  if (!qrCodeFormRef.value) return
  
  qrCodeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      previewLogs.value = ['开始生成二维码']
      previewLogsText.value = '开始生成二维码\n'
      previewTaskId.value = null
      
      // 显示自定义弹窗
      showDialog.value = true
      
      try {
        console.log('selectedBuild.value:', selectedBuild.value)
        // 组装参数
        const params = {
          platformCode: selectedPlatform.value,
          appId: selectedBuild.value.appid,
          projectPath: selectedBuild.value.projectPath,
          path: qrCodeParams.path,
          query: qrCodeParams.query,
          scene: qrCodeParams.scene,
          // 添加userId参数
          userId: userInfo.value?.id || '',
          // 添加可选的token参数
          douyinAppToken: appCommonConfig.value?.douyinAppToken || '',
          kuaishouAppToken: appCommonConfig.value?.kuaishouAppToken || '',
          weixinAppToken: appCommonConfig.value?.weixinAppToken || ''
        }
        
        publishing.value = true
        console.log('生成预览二维码参数:', params)
        // 调用接口
        const res = await request.post('/api/novel-publish/previewQrCode', params)
        
        if (res.code === 200 && res.data && res.data.taskId) {
          previewTaskId.value = res.data.taskId
          await connectPublishLogSocket(previewTaskId.value)
            .then(client => {
              console.log('WebSocket连接已建立成功')
              // 连接成功后的处理逻辑
            })
            .catch(error => {
              console.error('WebSocket连接失败，错误:', error)
              ElMessage.error('WebSocket连接失败，请检查网络或稍后重试')
              publishing.value = false
              previewTaskId.value = null
              loading.value = false
            })
          ElMessage.success('预览二维码任务已启动，任务ID: ' + previewTaskId.value)
        } else {
          ElMessage.error('启动预览二维码生成失败: ' + (res.message || '未知错误'))
          publishing.value = false
          publishFailed.value = true
          loading.value = false
        }
      } catch (error) {
        console.error('生成预览二维码失败:', error)
        loading.value = false
        ElMessage.error('生成预览二维码失败: ' + (error?.message || ''))
        publishing.value = false
        publishFailed.value = true
        // 错误时可以选择关闭弹窗
        if (showDialog.value) {
          showDialog.value = false
        }
      }
      // 移除finally中的loading设置，让loading状态保持到WebSocket任务完成
    }
  })
}

// 组件卸载时清理资源
onBeforeUnmount(() => {
  if (previewStompClient.value) {
    try {
      previewStompClient.value.disconnect()
    } catch (error) {
      console.error('断开WebSocket连接失败:', error)
    }
    previewStompClient.value = null
  }
})

// 初始化，获取小程序列表
fetchApps()
</script>

<style scoped>
.generate-preview-qrcode {
  padding: 20px;
}

.preview-container {
  min-height: calc(100vh - 40px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h3 {
  margin: 0;
}

.preview-content {
  padding: 24px 0;
}

.search-bar {
  margin-bottom: 24px;
}

.search-input {
  width: 400px;
}

.app-list {
  margin-top: 16px;
  margin-bottom: 32px;
}

.qrcode-generate-page {
  padding: 20px 0;
}

.warning-tip {
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warning-tip .el-alert__content {
  font-size: 14px;
  line-height: 1.6;
}

.page-header {
  margin-bottom: 24px;
}

.back-button {
  margin-bottom: 16px;
}

.app-info-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.app-info-card h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  width: 120px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.info-row .value {
  color: var(--el-text-color-primary);
}

.platform-tag {
  margin-left: 8px;
}

.param-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.param-form h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.form-container {
  max-width: 600px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.platform-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.platform-tag {
  font-size: 12px;
}

.platform-selection {
  margin-top: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

.platform-selection h4 {
  margin-bottom: 24px;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.platform-card {
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.platform-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  filter: brightness(0.99);
}

.platform-icon {
  font-size: 32px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-info {
  text-align: center;
}

.platform-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.platform-desc {
  font-size: 13px;
  line-height: 1.4;
}

.platform-status {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--el-color-primary);
  font-size: 20px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s;
}

.platform-card.selected .platform-status {
  opacity: 1;
  transform: scale(1);
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.qrcode-display {
  margin-top: 32px;
}

.qrcode-card {
  text-align: center;
}

.qrcode-container {
  text-align: center;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  max-width: 300px;
}

.qrcode-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border: 1px solid #eee;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  margin: 16px auto;
}

.douyin-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
}

.douyin-tip a {
  color: #409EFF;
  text-decoration: none;
}

.douyin-tip a:hover {
  text-decoration: underline;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-table .el-table__row) {
  cursor: pointer;
}

:deep(.el-table .el-table__row:hover) {
  background-color: var(--el-color-primary-light-9);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-name-value {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  font-weight: 500;
}

.app-token-value {
  word-break: break-all;
  max-width: 400px;
  font-family: monospace;
}
.info-row .value {
  word-break: break-all;
}
  /* 自定义loading弹窗样式 */
  .large-loading-modal {
    min-width: 550px;
  }
  
  .large-loading-modal .el-message-box__content {
    padding: 0;
  }
  
  /* 确保loading动画正常工作 */
  @keyframes el-icon-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>