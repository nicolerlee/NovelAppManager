<template>
  <div class="app-upload-check">
    <el-card class="check-container">
      <template #header>
        <div class="header">
          <div class="header-left">
            <el-button @click="goBack" link>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <h3>发版前防呆检查</h3>
          </div>
        </div>
      </template>

      <div class="check-content" ref="checkContentRef">
        <!-- 小程序列表页面 -->
        <div v-if="!selectedApp || !showCheckResult">
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
              @row-click="handleSelectApp"
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

        <!-- 检查结果页面 -->
        <div v-if="selectedApp && showCheckResult" class="check-result-page">
          <!-- 小程序信息展示 -->
          <div class="app-info-card">
            <h4>小程序信息</h4>
            <div class="info-row">
              <span class="label">平台：</span>
              <el-tag :type="getPlatformType(selectedApp.platform)" effect="light" class="platform-tag">
                {{ selectedApp.platform }}
              </el-tag>
            </div>
            <div class="info-row">
              <span class="label">小程序名称：</span>
              <span class="value app-name-value" :title="selectedApp.appName">{{ selectedApp.appName }}</span>
            </div>
            <div class="info-row">
              <span class="label">AppID：</span>
              <span class="value">{{ selectedApp.appid }}</span>
            </div>
            <div class="info-row">
              <span class="label">AppToken：</span>
              <span class="value">{{ getAppTokenByPlatform(selectedApp.platform) }}</span>
            </div>
          </div>

          <!-- 检查选项 -->
          <div class="check-options">
            <h4>检查项</h4>
            <el-form :model="checkOptions" label-width="180px" class="form-container">
              <el-form-item label="测试代码遗留">
                <el-checkbox v-model="checkOptions.testCodeCheck" :disabled="true">检查是否有未移除的测试代码和调试信息</el-checkbox>
              </el-form-item>
              <el-form-item label="线上版本号比对">
                <el-checkbox v-model="checkOptions.versionComparisonCheck" :disabled="true">比对当前版本与线上版本的版本号</el-checkbox>
              </el-form-item>
              <el-form-item label="微距配置检查">
                <el-checkbox v-model="checkOptions.macroConfigCheck" :disabled="true">检查微距相关配置的完整性和正确性</el-checkbox>
              </el-form-item>
              <el-form-item label="支付配置检查">
                <el-checkbox v-model="checkOptions.paymentConfigCheck" :disabled="true">检查支付相关配置的完整性和正确性</el-checkbox>
              </el-form-item>
              <el-form-item label="广告配置检查">
                <el-checkbox v-model="checkOptions.adConfigCheck" :disabled="true">检查广告相关配置的完整性和正确性</el-checkbox>
              </el-form-item>
            </el-form>
          </div>

          <div class="form-actions">
            <el-button @click="backToAppList">取消</el-button>
            <el-button type="primary" @click="performCheck" :loading="checkLoading">
              执行检查
            </el-button>
          </div>
        </div>

        <!-- 检查结果展示 -->
        <div v-if="checkResults.length > 0" class="check-results">
          <el-card class="results-card">
            <div class="results-container">
              <h4>检查结果</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="result in checkResults"
                  :key="result.id"
                  :type="result.status === 'success' ? 'success' : 'danger'"
                  :timestamp="result.time"
                >
                  <div class="result-item">
                    <div class="result-title">{{ result.title }}</div>
                    <div class="result-description">{{ result.description }}</div>
                    <div v-if="result.suggestions && result.suggestions.length > 0" class="result-suggestions">
                      <h5>建议：</h5>
                      <ul>
                        <li v-for="(suggestion, index) in result.suggestions" :key="index">{{ suggestion }}</li>
                      </ul>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </div>
        
        <!-- 通过检查后显示的发布按钮 -->
        <div v-if="allChecksPassed" class="publish-section">
          <el-button 
            type="primary" 
            size="large" 
            @click="goToWenquAuto"
            class="publish-button"
          >
            通过检查，去发布
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { pinyin } from 'pinyin-pro'

const router = useRouter()



// 状态定义
const loading = ref(false)
const checkLoading = ref(false)
const searchQuery = ref('')
const apps = ref([])
const selectedApp = ref(null)
const showCheckResult = ref(false)
const checkResults = ref([])
const checkContentRef = ref(null)

// 检查选项 - 全部勾选且不可取消
const checkOptions = reactive({
  testCodeCheck: true,
  versionComparisonCheck: true,
  macroConfigCheck: true,
  paymentConfigCheck: true,
  adConfigCheck: true
})

// 平台映射
const platformMap = {
  '抖音': 'mp-toutiao',
  '快手': 'mp-kuaishou',
  '微信': 'mp-weixin',
  '百度': 'mp-baidu'
};

// appCommonConfig状态
const appCommonConfig = ref(null);
const configLoading = ref(false);

// 获取小程序通用配置
const fetchAppCommonConfig = async (appId) => {
  if (!appId) return;
  
  configLoading.value = true;
  appCommonConfig.value = null;
  
  try {
    const res = await request.get('/api/novel-common/getAppCommonConfig', {
      params: { appId }
    });
    
    if (res.code === 200 && res.data) {
      appCommonConfig.value = res.data;
    }
  } catch (error) {
    console.error('获取小程序通用配置失败:', error);
  } finally {
    configLoading.value = false;
  }
};

// 根据平台获取AppToken
const getAppTokenByPlatform = (platform) => {
  if (!appCommonConfig.value) return '';
  
  const platformCode = platformMap[platform] || '';
  const tokenMap = {
    'mp-toutiao': appCommonConfig.value.douyinAppToken,
    'mp-kuaishou': appCommonConfig.value.kuaishouAppToken,
    'mp-weixin': appCommonConfig.value.weixinAppToken,
    'mp-baidu': appCommonConfig.value.baiduAppToken
  };
  
  return tokenMap[platformCode] || '';
};

// 获取平台名称
const getPlatformName = (platformCode) => {
  const platforms = {
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-weixin': '微信',
    'mp-baidu': '百度'
  }
  return platforms[platformCode] || platformCode
}

// 获取平台类型
const getPlatformType = (platform) => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
}

// 过滤后的应用列表
const filteredApps = computed(() => {
  if (!searchQuery.value) {
    return apps.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return apps.value.filter(app => 
    (app.appName && app.appName.toLowerCase().includes(query)) ||
    (app.appid && app.appid.toLowerCase().includes(query)) ||
    (app.platform && app.platform.toLowerCase().includes(query)) ||
    // 支持拼音搜索
    (app.appName && pinyin(app.appName, { toneType: 'none' }).includes(query)) ||
    (app.platform && pinyin(app.platform, { toneType: 'none' }).includes(query))
  )
})

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

// 选择应用
const handleSelectApp = async (row) => {
  selectedApp.value = row
  showCheckResult.value = true
  // 获取小程序通用配置
  await fetchAppCommonConfig(row.appid)
}

// 返回应用列表
const backToAppList = () => {
  selectedApp.value = null
  showCheckResult.value = false
  checkResults.value = []
  // 重置检查选项（保持全选状态）
    Object.keys(checkOptions).forEach(key => {
      checkOptions[key] = true
    })
}

// 返回上一页
const goBack = () => {
  router.push('/toolbox')
}

// 判断所有检查是否通过的计算属性
const allChecksPassed = computed(() => {
  return checkResults.value.length > 0 && 
         checkResults.value.every(result => result.status !== 'danger')
})

// 跳转到文曲自动化页面
const goToWenquAuto = () => {
  router.push('/wenqu-auto')
}

// 执行检查
const performCheck = async () => {
  if (!selectedApp.value) {
    ElMessage.warning('请先选择小程序')
    return
  }

  checkLoading.value = true
  checkResults.value = []

  try {
    // 调用真实的后端API，使用GET请求，传递appId参数
    const response = await request.get('/api/novel-toolbox/app-upload-check', {
      params: {
        appId: selectedApp.value.appid,
        projectPath: selectedApp.value.projectPath,
      }
    })

    if (response.code !== 200) {
      throw new Error(response.message || '接口返回异常')
    }

    const data = response.data
    const results = []
    let id = 1
    const currentTime = new Date().toLocaleString()
    
    // 1. 测试代码遗留检查
    if (checkOptions.testCodeCheck) {
      results.push({
        id: id++,
        title: '测试代码遗留',
        status: data.hasTestCode ? 'danger' : 'success',
        time: currentTime,
        description: data.hasTestCode ? '发现测试代码遗留' : '未发现测试代码',
        suggestions: data.hasTestCode 
          ? ['请移除src/modules/mod_config/deliverConfig对应小程序中的测试代码', '检查useTest字段']
          : ['测试代码检查通过']
      })
    }
    
    // 2. 线上版本号比对检查
    if (checkOptions.versionComparisonCheck && data.versionInfo) {
      const { onlineVersion, currentVersion } = data.versionInfo
      let status = 'success'
      let description = ''
      let suggestions = []
      
      // 处理线上版本号为null的情况
      if (onlineVersion === null) {
        status = 'danger' // 修改为danger状态，确保无法获取线上版本号时不允许通过检查
        description = `无法获取线上版本号，当前版本号为${currentVersion}`
        suggestions = ['后台获取线上版本失败，无法验证版本号是否正确递增', '请先解决版本号获取问题后再提交']
      } else {
        // 正常的版本号比较逻辑
        description = `当前版本号(${currentVersion})与线上版本(${onlineVersion})一致`
        suggestions = ['版本号检查通过']
        
        if (currentVersion !== onlineVersion) {
          const currentParts = currentVersion.split('.').map(Number)
          const onlineParts = onlineVersion.split('.').map(Number)
          
          // 比较版本号
          let isHigher = false
          for (let i = 0; i < Math.max(currentParts.length, onlineParts.length); i++) {
            const current = currentParts[i] || 0
            const online = onlineParts[i] || 0
            if (current > online) {
              isHigher = true
              break
            } else if (current < online) {
              break
            }
          }
          
          if (isHigher) {
            description = `当前版本号(${currentVersion})高于线上版本(${onlineVersion})`
            suggestions = ['版本号递增正确']
          } else {
            status = 'danger' // 修改为danger状态，确保不允许通过检查
            description = `当前版本号(${currentVersion})低于或等于线上版本(${onlineVersion})`
            suggestions = ['版本号必须递增更新，不允许低于或等于线上版本']
          }
        }
      }
      
      results.push({
        id: id++,
        title: '线上版本号比对',
        status,
        time: currentTime,
        description,
        suggestions
      })
    }
    
    // 3. 微距配置检查
    if (checkOptions.macroConfigCheck && data.deliverInfo) {
      const { deliverId, bannerId } = data.deliverInfo
      let status = 'success'
      let description = '微距配置检查通过'
      let suggestions = ['deliverId和bannerId配置正常']
      
      // 检查参数是否为空或无效
      if (!deliverId || !bannerId) {
        status = 'danger'
        description = '发现微距配置参数异常'
        suggestions = ['请检查src/modules/mod_config/deliverConfig中的deliver_id/banner_id参数配置']
      }
      
      results.push({
        id: id++,
        title: '微距配置检查',
        status,
        time: currentTime,
        description,
        suggestions
      })
    }
    
    // 4. 支付配置检查
    if (checkOptions.paymentConfigCheck && data.appPayWithConfig) {
      const payConfig = data.appPayWithConfig
      let status = 'success'
      let description = '支付配置检查通过'
      let suggestions = []
      
      // 支付方式名称映射
      const methodNameMap = {
        normalPay: '普通支付',
        orderPay: '通用支付',
        renewPay: '连包支付',
        douzuanPay: '抖钻支付',
        imPay: 'IM支付'
      }
      
      // 检查支付配置状态
      const paymentMethods = ['normalPay', 'orderPay', 'renewPay', 'douzuanPay', 'imPay']
      const enabledMethods = []
      const disabledMethods = []
      
      // 构建详细的支付方式信息
      paymentMethods.forEach(method => {
        const methodConfig = payConfig[method]
        if (methodConfig && methodConfig.enabled) {
          enabledMethods.push({
            name: methodNameMap[method] || method,
            key: method,
            gatewayAndroid: methodConfig.gatewayAndroid || 0,
            gatewayIos: methodConfig.gatewayIos || 0
          })
        } else if (methodConfig) {
          disabledMethods.push({
            name: methodNameMap[method] || method,
            key: method
          })
        }
      })
      
      // 添加微信虚拟支付信息
      if (payConfig.wxVirtualPay) {
        enabledMethods.push({
          name: '微信虚拟支付',
          key: 'wxVirtualPay',
          gatewayAndroid: payConfig.wxVirtualPay.gatewayAndroid || 0,
          gatewayIos: payConfig.wxVirtualPay.gatewayIos || 0
        })
      }
      
      // 构建描述和建议
      if (enabledMethods.length === 0) {
        status = 'warning'
        description = '未配置启用任何支付方式'
        suggestions = ['建议至少启用一种支付方式']
      } else {
        description = `已启用${enabledMethods.length}种支付方式`
        // 详细展示每种支付方式的网关信息
        enabledMethods.forEach(method => {
          suggestions.push(`${method.name}: Android网关(${method.gatewayAndroid}), iOS网关(${method.gatewayIos})`)
        })
        
        if (disabledMethods.length > 0) {
          status = 'warning'
          description = `部分支付方式未启用，已启用: ${enabledMethods.length}种，未启用: ${disabledMethods.length}种`
          suggestions.push(`未启用的支付方式: ${disabledMethods.map(m => m.name).join(', ')}`)
        }
        
        // 添加支付配置总体状态
        suggestions.push(`AppID: ${payConfig.appId}`)
      }
      
      results.push({
        id: id++,
        title: '支付配置检查',
        status,
        time: currentTime,
        description,
        suggestions
      })
    }
    
    // 5. 广告配置检查
    if (checkOptions.adConfigCheck && data.appAdWithConfig) {
      const adConfig = data.appAdWithConfig
      let status = 'success'
      let description = '广告配置检查通过'
      let suggestions = []
      
      // 广告类型名称映射
      const adTypeNameMap = {
        reward: '激励广告',
        interstitial: '插屏广告',
        banner: 'Banner广告',
        feed: '信息流广告'
      }
      
      // 检查广告位配置
      const adTypes = ['reward', 'interstitial', 'banner', 'feed']
      const enabledAds = []
      const disabledAds = []
      
      // 构建详细的广告信息
      adTypes.forEach(type => {
        const ad = adConfig[type]
        if (ad) {
          const adInfo = {
            name: adTypeNameMap[type] || type,
            key: type,
            enabled: false,
            adId: ad.adId || '',
            status: '',
            details: []
          }
          
          // 检查广告是否启用并收集详细信息
          if (type === 'reward') {
            adInfo.enabled = ad.isRewardAdEnabled || false
            adInfo.status = ad.isRewardAdEnabled ? '已启用' : '已配置但未启用'
            adInfo.details.push(`广告ID: ${ad.adId || '未配置'}`)
            adInfo.details.push(`是否启用: ${ad.isRewardAdEnabled ? '是' : '否'}`)
          } else if (type === 'interstitial') {
            adInfo.enabled = ad.isInterstitialAdEnabled || false
            adInfo.status = ad.isInterstitialAdEnabled ? '已启用' : '已配置但未启用'
            adInfo.details.push(`广告ID: ${ad.adId || '未配置'}`)
            adInfo.details.push(`是否启用: ${ad.isInterstitialAdEnabled ? '是' : '否'}`)
          } else {
            adInfo.enabled = !!ad.adId
            adInfo.status = ad.adId ? '已配置' : '未配置'
            adInfo.details.push(`广告ID: ${ad.adId || '未配置'}`)
          }
          
          if (adInfo.enabled) {
            enabledAds.push(adInfo)
          } else {
            disabledAds.push(adInfo)
          }
        } else {
          disabledAds.push({
            name: adTypeNameMap[type] || type,
            key: type,
            enabled: false,
            status: '未配置',
            details: ['未在配置中找到此广告位']
          })
        }
      })
      
      if (enabledAds.length === 0) {
        status = 'warning'
        description = '未配置启用任何广告位'
        suggestions = ['建议至少配置一种广告位以优化收益']
      } else {
        description = `已启用${enabledAds.length}种广告`
        
        // 详细展示每种广告的配置信息（一行显示）
        enabledAds.forEach(ad => {
          // 将所有详细信息合并到一行
          const detailsStr = ad.details.join('，')
          suggestions.push(`${ad.name}: ${ad.status}，${detailsStr}`)
        })
        
        // 检查是否有已配置但未启用的激励广告
        const rewardAd = adConfig.reward
        if (rewardAd && rewardAd.adId && !rewardAd.isRewardAdEnabled) {
          status = 'warning'
          description = `部分广告已配置但未启用，已启用: ${enabledAds.length}种`
          suggestions.push('建议启用激励广告以提升用户体验和收益')
        }
        
        // 显示未配置的广告类型
        if (disabledAds.length > 0) {
          suggestions.push(`未配置或未启用的广告类型: ${disabledAds.map(ad => ad.name).join(', ')}`)
        }
        
        // 添加广告配置总体状态
        suggestions.push(`广告配置总体状态: ${status === 'success' ? '正常' : '需注意'}`)
      }
      
      results.push({
        id: id++,
        title: '广告配置检查',
        status,
        time: currentTime,
        description,
        suggestions
      })
    }
    
    checkResults.value = results
    
    // 检查是否有失败项
    const hasErrors = results.some(r => r.status === 'danger')
    if (hasErrors) {
      ElMessage.warning('检查发现一些问题，建议修复后再发布')
    } else {
      ElMessage.success('检查完成，未发现严重问题')
    }
  } catch (error) {
    console.error('执行检查失败:', error)
    ElMessage.error('执行检查失败，请稍后重试')
  } finally {
    checkLoading.value = false
    // 使用新方法滚动到底部
    scrollToBottom()
  }
}

// 滚动到底部的独立函数
const scrollToBottom = async () => {
  try {
    console.log('开始执行滚动操作')
    
    // 使用更长的延迟确保DOM完全更新
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300)) // 增加延迟时间
    await nextTick()
    
    // 1. 尝试滚动到检查结果容器
    const resultsCard = document.querySelector('.results-card')
    if (resultsCard) {
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'end' })
      console.log('滚动成功: 滚动到结果卡片')
      return
    }
    
    // 2. 尝试使用ref引用滚动整个内容区
    if (checkContentRef.value) {
      checkContentRef.value.scrollTo({
        top: checkContentRef.value.scrollHeight,
        behavior: 'smooth'
      })
      console.log('滚动成功: 使用ref引用')
      return
    }
    
    // 3. 备用方案：使用document查询
    const checkContent = document.querySelector('.check-content')
    if (checkContent) {
      checkContent.scrollTo({
        top: checkContent.scrollHeight,
        behavior: 'smooth'
      })
      console.log('滚动成功: 使用document查询')
      return
    }
    
    // 4. 最后尝试滚动整个页面
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
    console.log('滚动成功: 滚动到页面底部')
    
  } catch (error) {
    console.error('滚动操作失败:', error)
  }
}

// 监听检查结果变化，确保在结果显示后滚动
watch(checkResults, (newResults, oldResults) => {
  // 只有当结果从无到有时才触发滚动
  if (oldResults.length === 0 && newResults.length > 0) {
    console.log('检测到检查结果变化，准备滚动')
    // 延迟执行以确保Element Plus的动画完成
    setTimeout(() => {
      scrollToBottom()
    }, 500)
  }
}, { immediate: false })

// 初始化时获取小程序列表
fetchApps()
</script>

<style scoped>
.app-upload-check {
  padding: 20px;
}

.check-container {
  min-height: calc(100vh - 40px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.check-content {
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

.check-result-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.app-info-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.app-info-card h4 {
  margin: 0 0 16px 0;
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

.app-name-value {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  font-weight: 500;
  max-width: 400px;
}

.platform-tag {
  margin-left: 8px;
  font-size: 12px;
}

.check-options {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.check-options h4 {
  margin: 0 0 20px 0;
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
  justify-content: flex-end;
}

.check-results {
  margin-top: 32px;
}

.results-card {
  background: #f8f9fa;
}

.results-container h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.result-item {
  padding: 8px 0;
}

.result-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.result-description {
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.result-suggestions {
  background-color: #f0f9ff;
  padding: 12px;
  border-radius: 4px;
}

.result-suggestions h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #409eff;
}

.result-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.result-suggestions li {
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
}

.result-suggestions li:last-child {
  margin-bottom: 0;
}

.publish-section {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.publish-button {
  font-size: 16px;
  padding: 12px 32px;
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
</style>