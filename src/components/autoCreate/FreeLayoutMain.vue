<template>
  <div class="free-layout-module">
    <el-card class="main-card">
      <template #header>
        <div class="header-content">
          <h2>自由编排工作台</h2>
          <div style="display: flex; gap: 10px;">
            <el-button @click="resetLayout">重新编排</el-button>
            <el-button type="primary" @click="handleSaveLayout">完成编排</el-button>
          </div>
        </div>
      </template>
      <div class="workspace-container">
        <div class="sidebar">
          <h3 style="margin-top: 20px;">模块待选区</h3>
          <div class="component-list">
            <div 
                  v-for="item in filteredComponents" 
                        :key="item.type"

              class="component-item" 
              draggable="true" 
              @dragstart.native="handleDragStart" 
              :data-type="item.type"
            >
              <div :style="getComponentStyle(item)"
                  class="component-card">
                  <span style="color: white; font-weight: 500; font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.3);">{{ item.name }}</span>
                </div>
            </div>
          </div>
        </div>
      
        <div class="main-content">
          <div class="canvas-container" ref="canvasRef" @dragover.prevent @drop="handleDrop">
            <!-- 手机框架 -->
            <div class="phone-frame">
              <!-- 顶部渐变容器 -->
          <div class="top-gradient-container" 
          :style="{ 
            width: '100%',
            height: '120px', 
            background: `linear-gradient(180deg, ${uiConfig.secondTheme}, #f8f8f8)`
          }" 
          :key="themeUpdateKey">
            <!-- 状态栏 -->
            <div class="phone-status-bar">
              <div class="status-bar-time" :style="{ color: '#ffffff' }">&nbsp;9:41</div>
              <div class="status-bar-icons"></div>
            </div>
            <!-- 标题区域 -->
            <div class="app-title-bar"><div class="app-title">{{ appName }}</div></div>
          </div>
              <!-- 应用区域 -->
              <div class="phone-app-area">
                <!-- 固定模块区域占位符 -->
                <div class="module-placeholder" data-module-type="basic-config" style="top: 15px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 15px; left: 15px; width: calc(100% - 30px); height: 80px;" @dragover.prevent="handleDragOver($event, 'basic-config')" @dragenter.prevent="handleDragEnter($event, 'basic-config')">
                  <div class="placeholder-label">基础配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="general-config" style="top: 110px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 110px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">通用配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="payment" style="top: 205px; left: 15px; width: calc(50% - 22.5px); height: 80px;" data-original-style="top: 205px; left: 15px; width: calc(50% - 22.5px); height: 80px;">
                  <div class="placeholder-label">支付区域</div>
                </div>
                <div class="module-placeholder" data-module-type="advertisement" style="top: 205px; left: calc(50% + 7.5px); width: calc(50% - 22.5px); height: 80px;" data-original-style="top: 205px; left: calc(50% + 7.5px); width: calc(50% - 22.5px); height: 80px;">
                  <div class="placeholder-label">广告区域</div>
                </div>
                <div class="module-placeholder" data-module-type="ui-config" style="top: 300px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 300px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">UI配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="weiju-config" style="top: 395px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 395px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">微距区域</div>
                </div>
                
                <!-- 组件渲染区域 -->
                <div 
                    v-for="component in currentLayout" 
                    :key="component.id" 
                    :class="['component component-' + component.type, { 'component-selected': selectedComponent?.id == component.id, 'component-completed': component.isCompleted }]"
                    :style="[
                      { transform: `translate(${component.position.x}px, ${component.position.y}px) ${selectedComponent?.id == component.id ? 'scale(1.1)' : ''}` },
                      getCanvasComponentStyle(component)
                    ]"
                  :data-component-id="component.id"
                  @click="selectComponent(component)"
                  :data-id="component.id"
                >
                  <div class="component-header">
                    <ElIcon class="delete-icon" @click.stop="removeComponent(component)">
                      <Close />
                    </ElIcon>
                  </div>
                  <div class="component-label">{{ getComponentName(component.type) }}</div>
                  <span v-if="component.isCompleted" class="completion-tag">配置完成</span>
                  <span v-else class="uncompletion-tag">未配置</span>
                </div>
              </div>
              <!-- 底部导航 -->
              <div class="phone-tab-bar">
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_shelf_nor.png" class="tab-bar-icon" alt="书架">
                  <div class="tab-bar-label">书架</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_home_nor.png" class="tab-bar-icon" alt="书城">
                  <div class="tab-bar-label">书城</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_category_nor.png" class="tab-bar-icon" alt="分类">
                  <div class="tab-bar-label">分类</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_mine_nor.png" class="tab-bar-icon" alt="我的">
                  <div class="tab-bar-label">我的</div>
                </div>
              </div>
              </div>
            </div>
          
        </div>
        <!-- 属性面板 -->
        <div class="properties-panel">
          <div v-if="selectedComponent" class="component-properties">
            <h4>{{ getComponentName(selectedComponent.type) }} 配置编辑</h4>
            <el-form ref="formRef" size="small" label-width="100px" class="basic-config-form" :model="generalConfig" :rules="generalConfigRules">
              <!-- <el-form-item label="组件类型">
                <el-input v-model="selectedComponent.type" disabled></el-input>
              </el-form-item> -->
              <template v-if="selectedComponent.type === 'basic-config'">
                <FreeBasicConfigPanel v-model:basicConfig="basicConfig" />
              </template>
              <template v-else-if="selectedComponent.type === 'ui-config'">
                <FreeUiConfigPanel 
                  v-model:uiConfig="uiConfig" 
                  :uiConfigThemeConfigured="uiConfigThemeConfigured" 
                  :uiConfigLoading="uiConfigLoading" 
                />
              </template>
              <template v-else-if="selectedComponent.type === 'general-config'">
                <FreeGeneralConfigPanel 
                  v-model:generalConfig="generalConfig"
                  :basicConfig="basicConfig"
                  :formRef="formRef"
                  :buildCodeDisabled="buildCodeDisabled"
                  :generalConfigLoading="generalConfigLoading"
                />
              </template>
              <template v-else-if="selectedComponent.type === 'weiju-config'">
                <FreeWeijuConfigPanel 
                  v-model:weijuConfig="weijuConfig"
                />
              </template>
              <template v-else-if="selectedComponent.type === 'payment'">
                <FreePayConfigPanel 
                  v-model:modelValue="paymentConfig"
                  :platform="getCurrentPlatform()"
                />
              </template>
              <template v-else-if="selectedComponent.type === 'advertisement'">
                <FreeAdConfigPanel 
                  v-model:modelValue="adConfig"
                  :platform="getCurrentPlatform()"
                />
              </template>
            </el-form>
          </div>
          <div v-else class="no-selection">
            <el-empty description="选择组件以编辑属性"></el-empty>
          </div>
        </div>
      </div>
      
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch ,nextTick} from 'vue'
import { useRouter } from 'vue-router'
import { Platform, Share, ChatDotRound, Connection, InfoFilled, Close } from '@element-plus/icons-vue';

import { ElMessage, ElMessageBox, ElEmpty, ElCard, ElForm, ElFormItem, ElInput, ElIcon, ElSwitch, ElRadioGroup, ElRadio, ElRadioButton, ElInputNumber } from 'element-plus'
import { inject } from 'vue'

// 导入配置面板组件
import FreeBasicConfigPanel from './FreeBasicConfigPanel.vue'
import FreeUiConfigPanel from './FreeUiConfigPanel.vue'
import FreeGeneralConfigPanel from './FreeGeneralConfigPanel.vue'
import FreeWeijuConfigPanel from './FreeWeijuConfigPanel.vue'
import FreePayConfigPanel from './FreePayConfigPanel.vue'
import FreeAdConfigPanel from './FreeAdConfigPanel.vue'
import request from '../../utils/request';

// 表单校验规则
const generalConfigRules = ref({
  buildCode: [
    { required: true, message: '请输入构建命令', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (/^\d+$/.test(value)) {
          callback(new Error('构建命令不能为纯数字'));
        } else if (/^\d/.test(value)) {
          callback(new Error('构建命令不能以数字开头'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  contact: [{ required: true, message: '请输入客服URL', trigger: 'blur' }],
  iaaDialogStyle: [
    {
      validator: (rule, value, callback) => {
        if (generalConfig.value.iaaMode && !value) {
          callback(new Error('请选择IAA弹窗样式'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  mineLoginType: [{ required: true, message: '请选择我的页登录类型', trigger: 'change' }],
  readerLoginType: [{ required: true, message: '请选择阅读页登录类型', trigger: 'change' }]
});

const auth = inject('auth')
const router = useRouter()
const currentLayout = ref([])
const nextComponentId = ref(1)
const draggedComponent = ref(null)
const isDragging = ref(false)
  const usedComponentTypes = ref(new Set())
  const selectedComponent = ref(null)
const basicConfig = ref({})
const uiConfig = ref({})
const generalConfig = ref({})
const weijuConfig = ref({})
const paymentConfig = ref({})
const adConfig = ref({})
// UI配置相关状态
const uiConfigThemeConfigured = ref(false)
const uiConfigLoading = ref(false)
// 通用配置相关状态
const buildCodeDisabled = ref(false)
const generalConfigLoading = ref(false)
// 上次查询的appName缓存
const lastQueriedAppName = ref('')
// 表单引用
const formRef = ref(null);

// 请求查询同名小程序主体配置
const fetchUiThemeConfig = async () => {
  // 查找基础配置组件
  const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
  if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.appName) {
    return;
  }

  const currentAppName = basicConfigComponent.config.appName;
  // 如果appName没有变化，且已经有查询结果，不重复请求
  if (currentAppName === lastQueriedAppName.value && (uiConfigThemeConfigured.value || lastQueriedAppName.value !== '')) {
    console.log('appName未变化，跳过主题色配置查询');
    return;
  }

  uiConfigLoading.value = true;
  try {
    const response = await request.get('/api/novel-ui/getUiConfigByAppName', {
      params: { appName: currentAppName }
    });
    
    // 更新上次查询的appName
    lastQueriedAppName.value = currentAppName;
    
    // 检查接口返回是否成功
    if (response.code === 200 && response.data && response.data.length > 0) {
      // 有配置，使用第一条数据
      const firstTheme = response.data[0];
      if (firstTheme.mainTheme && firstTheme.secondTheme) {
        uiConfig.value.mainTheme = firstTheme.mainTheme;
        uiConfig.value.secondTheme = firstTheme.secondTheme;
        
        // 如果有支付卡片样式和首页卡片样式，也一并设置
        if (firstTheme.payCardStyle !== undefined) {
          uiConfig.value.payCardStyle = firstTheme.payCardStyle;
        }
        if (firstTheme.homeCardStyle !== undefined) {
          uiConfig.value.homeCardStyle = firstTheme.homeCardStyle;
        }
        
        uiConfigThemeConfigured.value = true;
        ElMessage.success('已加载历史主题色配置，主题色不可修改');
      }
    } else {
      // 无配置，允许用户设置
      uiConfigThemeConfigured.value = false;
    }
  } catch (error) {
    console.error('获取主题色配置失败:', error);
    ElMessage.error('获取主题色配置失败，将使用默认配置');
  } finally {
    uiConfigLoading.value = false;
  }
};


// 请求查询应用通用配置
const fetchAppCommonConfigByAppName = async () => {
  // 查找基础配置组件
  const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
  if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.appName) {
    return;
  }

  const currentAppName = basicConfigComponent.config.appName;
  // 如果appName没有变化，且已经有查询结果，不重复请求
  if (currentAppName === lastQueriedAppName.value && (buildCodeDisabled.value || lastQueriedAppName.value !== '')) {
    console.log('appName未变化，跳过通用配置查询');
    return;
  }

  generalConfigLoading.value = true;
  try {
    const response = await request.get('/api/novel-common/getAppCommonConfigByAppName', {
      params: { appName: currentAppName }
    });
    
    // 更新上次查询的appName
    lastQueriedAppName.value = currentAppName;
    
    if (response.code === 200 && response.data && response.data.length > 0) {
      // 有配置，使用第一条数据
      const appConfig = response.data[0];
      if (appConfig.buildCode) {
        generalConfig.value.buildCode = appConfig.buildCode;
        buildCodeDisabled.value = true;
        ElMessage.success('已加载历史构建命令，构建命令不可修改');
      }
    } else {
      // 无配置，允许用户设置
      buildCodeDisabled.value = false;
    }
  } catch (error) {
    console.error('获取通用配置失败:', error);
    buildCodeDisabled.value = false;
  } finally {
    generalConfigLoading.value = false;
  }
};

// 初始化基础配置数据
const initBasicConfig = (component) => {
  basicConfig.value = {
    appName: component.config?.appName || '',
    appCode: component.config?.appCode || '',
    platform: component.config?.platform || 'douyin',
    version: component.config?.version || '',
    product: component.config?.product || '',
    customer: component.config?.customer || '',
    appid: component.config?.appid || '',
    tokenId: component.config?.tokenId || '',
    cl: component.config?.cl || '',
    deliverId: component.config?.deliverId || '',
    bannerId: component.config?.bannerId || ''
  }
}

// 初始化通用配置数据
const initGeneralConfig = (component) => {
  generalConfig.value = {
    contact: component.config?.contact || '',
    buildCode: component.config?.buildCode || '',
    iaaMode: component.config?.iaaMode || false,
    iaaDialogStyle: component.config?.iaaDialogStyle || null,
    hidePayEntry: component.config?.hidePayEntry || false,
    hideScoreExchange: component.config?.hideScoreExchange || false,
    mineLoginType: component.config?.mineLoginType || 'anonymousLogin',
    readerLoginType: component.config?.readerLoginType || 'anonymousLogin',
    // 平台特定配置
    douyinImId: component.config?.douyinImId || '',
    douyinAppToken: component.config?.douyinAppToken || '',
    weixinAppToken: component.config?.weixinAppToken || '',
    kuaishouClientId: component.config?.kuaishouClientId || '',
    kuaishouClientSecret: component.config?.kuaishouClientSecret || '',
    kuaishouAppToken: component.config?.kuaishouAppToken || ''
  }
}

// 初始化UI配置数据
const initUIConfig = (component) => {
  uiConfig.value = {
    mainTheme: component.config?.mainTheme || '#2552F5FF',
    secondTheme: component.config?.secondTheme || '#DCE7FFFF',
    payCardStyle: component.config?.payCardStyle || 1,
    homeCardStyle: component.config?.homeCardStyle || 1,
    selectedPayCardImage: `/images/payStyle/pay_style${component.config?.payCardStyle || 1}.png`
  }
  // 预览图已经在uiConfig中设置，不需要额外处理
  // selectedPayCardImage已经在uiConfig初始化时设置
}

// 初始化微距配置数据
const initWeijuConfig = (component) => {
  weijuConfig.value = {
    // 不设置默认空字符串，而是设置为undefined，确保未配置时校验不通过
    deliverId: component.config?.deliverId,
    bannerId: component.config?.bannerId
  }
}

// 初始化支付配置数据
const initPaymentConfig = (component) => {
  paymentConfig.value = {
    normalPay: {
      enabled: component.config?.normalPay?.enabled || false,
      gatewayAndroid: component.config?.normalPay?.gatewayAndroid || '',
      gatewayIos: component.config?.normalPay?.gatewayIos || ''
    },
    orderPay: {
      enabled: component.config?.orderPay?.enabled || false,
      gatewayAndroid: component.config?.orderPay?.gatewayAndroid || '',
      gatewayIos: component.config?.orderPay?.gatewayIos || ''
    },
    renewPay: {
      enabled: component.config?.renewPay?.enabled || false,
      gatewayAndroid: component.config?.renewPay?.gatewayAndroid || '',
      gatewayIos: component.config?.renewPay?.gatewayIos || ''
    },
    douzuanPay: {
      enabled: component.config?.douzuanPay?.enabled || false,
      gatewayAndroid: component.config?.douzuanPay?.gatewayAndroid || '',
      gatewayIos: component.config?.douzuanPay?.gatewayIos || ''
    },
    imPay: {
      enabled: component.config?.imPay?.enabled || false,
      gatewayAndroid: component.config?.imPay?.gatewayAndroid || '',
      gatewayIos: component.config?.imPay?.gatewayIos || ''
    },
    wxVirtualPay: {
      enabled: component.config?.wxVirtualPay?.enabled || false,
      gatewayAndroid: component.config?.wxVirtualPay?.gatewayAndroid || '',
      gatewayIos: component.config?.wxVirtualPay?.gatewayIos || ''
    }
  }
}

// 检查支付配置是否完成
const checkPaymentConfigCompleted = (component) => {
  const config = component.config || {};
  
  // 检查是否至少有一个支付方式已启用并配置了网关
  const hasCompletedPayment = Object.values(config).some(payment => {
    if (!payment || typeof payment !== 'object') return false;
    
    // 检查该支付方式是否启用
    if (!payment.enabled) return false;
    
    // 检查网关是否配置
    const hasGateway = payment.gatewayAndroid && payment.gatewayIos;
    
    // 获取当前平台
    const currentPlatform = getCurrentPlatform();
    
    // 特殊处理：抖音平台的抖钻支付只需启用即可
    if (currentPlatform === 'douyin' && config.douzuanPay && payment === config.douzuanPay) {
      return true;
    }
      // 特殊处理：抖音平台的IM支付只需启用即可
    if (currentPlatform === 'douyin' && config.imPay && payment === config.imPay) {
      return true;
    }
    
    // 特殊处理：微信平台的微信虚拟支付只需启用即可
    if (currentPlatform === 'weixin' && config.wxVirtualPay && payment === config.wxVirtualPay) {
      return true;
    }
    
    return hasGateway;
  });
  
  component.isCompleted = hasCompletedPayment;
  return hasCompletedPayment;
}

// 初始化广告配置数据
const initAdConfig = (component) => {
  // 初始化adConfig，从组件配置读取数据
  adConfig.value = {
    rewardAd: {
      enabled: component.config?.rewardAd?.enabled || false,
      rewardAdId: component.config?.rewardAd?.rewardAdId || '',
      rewardCount: component.config?.rewardAd?.rewardCount || 1
    },
    interstitialAd: {
      enabled: component.config?.interstitialAd?.enabled || false,
      interstitialAdId: component.config?.interstitialAd?.interstitialAdId || '',
      interstitialCount: component.config?.interstitialAd?.interstitialCount || 1
    },
    bannerAd: {
      enabled: component.config?.bannerAd?.enabled || false,
      bannerAdId: component.config?.bannerAd?.bannerAdId || ''
    },
    feedAd: {
      enabled: component.config?.feedAd?.enabled || false,
      feedAdId: component.config?.feedAd?.feedAdId || ''
    }
  }
  
  // 只在初始化时更新component.config，避免递归更新
  // 注意：组件配置的后续更新应该通过v-model绑定自动同步，而不是通过watch监听器
  component.config = { ...adConfig.value };
}

// 检查广告配置是否完成
const checkAdConfigCompleted = (component) => {
  // 直接从adConfig读取数据，避免依赖component.config
  const config = adConfig.value || {};
  
  // 获取当前平台
  const currentPlatform = getCurrentPlatform();
  
  // 根据平台决定需要检查的广告类型
  const adsToCheck = [];
  
  // 抖音和快手平台检查激励广告和插屏广告
  if (currentPlatform === 'douyin' || currentPlatform === 'kuaishou') {
    if (config.rewardAd) adsToCheck.push(config.rewardAd);
    if (config.interstitialAd) adsToCheck.push(config.interstitialAd);
  }
  
  // 快手平台额外检查Banner广告和信息流广告
  if (currentPlatform === 'kuaishou') {
    if (config.bannerAd) adsToCheck.push(config.bannerAd);
    if (config.feedAd) adsToCheck.push(config.feedAd);
  }
  
  // 检查是否至少有一种广告类型已启用并配置了必要信息
  const hasCompletedAd = adsToCheck.some(ad => {
    if (!ad || typeof ad !== 'object' || !ad.enabled) return false;
    
    // 针对不同广告类型检查必要字段
    if (ad.rewardAdId) {
      return ad.rewardAdId && ad.rewardCount && ad.rewardCount > 0;
    } else if (ad.interstitialAdId) {
      return ad.interstitialAdId && ad.interstitialCount && ad.interstitialCount > 0;
    } else if (ad.bannerAdId) {
      return ad.bannerAdId;
    } else if (ad.feedAdId) {
      return ad.feedAdId;
    }
    
    return false;
  });
  
  // 使用nextTick和检查是否真的需要更新，避免递归更新
  nextTick(() => {
    if (component && component.isCompleted !== hasCompletedAd) {
      component.isCompleted = hasCompletedAd;
    }
  });
  return hasCompletedAd;
}




const canvasRef = ref(null)
const appName = ref('小程序名称')
const TAG="FreeLayoutMain->"
// 主题更新追踪键
const themeUpdateKey = ref(0);

// 监听主题色变化以更新渐变
watch(() => uiConfig.value.secondTheme, () => {
  // 触发重渲染
  themeUpdateKey.value++;
})

// 监听小程序名称变化，同步到手机模拟区
watch(() => basicConfig.value.appName, (newVal) => {
  if (newVal) {
    appName.value = newVal;
  }
})

// 监听基础配置变化，更新完成状态
watch(() => basicConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'basic-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听UI配置变化，更新完成状态
watch(() => uiConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'ui-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkUIConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听通用配置变化，更新完成状态并触发表单校验
watch(() => generalConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'general-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkGeneralConfigCompleted(selectedComponent.value);
    
    // 在表单有效时触发表单校验（主要针对buildCode字段）
    if (formRef.value && newVal.buildCode) {
      formRef.value.validateField('buildCode');
    }
  }
}, { deep: true })

// 监听微距配置变化，更新完成状态
watch(() => weijuConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'weiju-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkWeijuConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听支付配置变化，更新完成状态
watch(() => paymentConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'payment') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkPaymentConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听广告配置变化，更新完成状态
// 使用防抖和条件检查避免递归更新
let adConfigUpdateTimer = null;
watch(() => adConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'advertisement') {
    // 清除之前的定时器
    if (adConfigUpdateTimer) {
      clearTimeout(adConfigUpdateTimer);
    }
    // 使用定时器防抖
    adConfigUpdateTimer = setTimeout(() => {
      // 只检查完成状态，使用nextTick避免递归更新
      nextTick(() => {
        checkAdConfigCompleted(selectedComponent.value);
      });
    }, 50); // 50ms防抖
  }
}, { deep: true })

// IAA模式切换时，自动选中样式1
watch(() => generalConfig.value.iaaMode, (val) => {
  if (val && (generalConfig.value.iaaDialogStyle === null || generalConfig.value.iaaDialogStyle === undefined)) {
    nextTick(() => {
      generalConfig.value.iaaDialogStyle = 1;
    });
  }
  if (!val) {
    generalConfig.value.iaaDialogStyle = null;
  }
})

const canvasBounds = ref({})
let draggedElement = null;
let dragStartPos = null;

  // 选择组件
  const selectComponent = (component) => {
  // 查找基础配置组件
  const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
  
  // 当选择通用配置时，先检查基础配置是否已设置平台
  if (component.type === 'general-config') {
    // 检查是否存在基础配置且平台已设置
    if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.platform) {
      ElMessage.error('请先在基础配置中设置平台类型');
      return; 
    }
    if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.appName) {
      ElMessage.error('请先在基础配置中设置程序名称');
      return; 
    }
  }
  
  // 当选择UI配置时，先检查基础配置是否已设置程序名称
  if (component.type === 'ui-config') {
    // 检查是否存在基础配置且程序名称已设置
    if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.appName) {
      ElMessage.error('请先在基础配置中设置程序名称');
      return; // 不进行后续操作
    }
  }
  
  selectedComponent.value = component;
  if (component.type === 'basic-config') {
    initBasicConfig(component);
    checkConfigCompleted(component);
  } else if (component.type === 'ui-config') {
    initUIConfig(component);
    checkUIConfigCompleted(component);
    // 查询同名小程序主体配置
    fetchUiThemeConfig();
  } else if (component.type === 'general-config') {
    initGeneralConfig(component);
    checkGeneralConfigCompleted(component);
    // 查询同名小程序通用配置
    fetchAppCommonConfigByAppName();
  } else if (component.type === 'weiju-config') {
    initWeijuConfig(component);
    checkWeijuConfigCompleted(component);
  } else if (component.type === 'payment') {
    initPaymentConfig(component);
    checkPaymentConfigCompleted(component);
  } else if (component.type === 'advertisement') {
    initAdConfig(component);
    checkAdConfigCompleted(component);
  }
}

// 检查基础配置是否完成
const checkConfigCompleted = (component) => {
  const config = component.config || {};
  const requiredFields = ['appName', 'platform', 'version', 'appCode', 'product', 'customer', 'appid', 'tokenId', 'cl'];
  const allCompleted = requiredFields.every(field => {
    const value = config[field];
    return value !== undefined && value !== null && value !== '';
  });
  component.isCompleted = allCompleted;
  return allCompleted;
}

// 检查UI配置是否完成
const checkUIConfigCompleted = (component) => {
  const config = component.config || {};
  const allCompleted = !!config.mainTheme && !!config.secondTheme && config.payCardStyle !== undefined && config.homeCardStyle !== undefined;
  component.isCompleted = allCompleted;
  return allCompleted;
}

// 检查通用配置是否完成
const checkGeneralConfigCompleted = (component) => {
  if (!component || component.type !== 'general-config') {
    return false;
  }
  
  // 直接使用generalConfig作为验证来源，确保与表单输入同步
  const config = generalConfig.value;
  // 基本字段验证
  const requiredFields = ['contact', 'buildCode', 'mineLoginType', 'readerLoginType'];
  const allRequiredCompleted = requiredFields.every(field => {
    const value = config[field];
    return value !== undefined && value !== null && value !== '';
  });
  
  // buildCode 特殊校验（格式校验通过表单验证规则实现，这里只做基本逻辑判断）
  let buildCodeValid = true;
  if (config.buildCode) {
    const isPureNumber = /^\d+$/.test(config.buildCode);
    const startsWithNumber = /^\d/.test(config.buildCode);
    
    if (isPureNumber || startsWithNumber) {
      buildCodeValid = false;
    }
  }
  
  // 平台特定字段验证
  let platformSpecificCompleted = true;
  const currentPlatform = getCurrentPlatform();
  
  if (currentPlatform === 'douyin') {
    platformSpecificCompleted = !!config.douyinImId;
  } else if (currentPlatform === 'kuaishou') {
    platformSpecificCompleted = !!config.kuaishouClientId && !!config.kuaishouClientSecret;
  }
  
  // IAA模式验证
  const iaaCompleted = !config.iaaMode || (config.iaaMode && config.iaaDialogStyle !== null && config.iaaDialogStyle !== undefined);
  
  component.isCompleted = allRequiredCompleted && platformSpecificCompleted && iaaCompleted && buildCodeValid;
  return component.isCompleted;
}

// 检查微距配置是否完成
const checkWeijuConfigCompleted = (component) => {
  if (!component || component.type !== 'weiju-config') {
    return false;
  }
  
  // 直接使用weijuConfig作为验证来源，确保与表单输入同步
  const config = weijuConfig.value;
  // 基本字段验证 - 严格校验确保值不为空字符串
  const requiredFields = ['deliverId', 'bannerId'];
  const allRequiredCompleted = requiredFields.every(field => {
    const value = config[field];
    // 确保值存在且不是空字符串
    return value !== undefined && value !== null && value !== '' && value.trim() !== '';
  });
  
  component.isCompleted = allRequiredCompleted;
  return component.isCompleted;
}
  // 获取组件样式
  const getComponentStyle = (item) => {
    return {
      background: item.gradient,
      borderRadius: '8px',
      padding: '20px',
      width: '100%',
      height: '80px',
      'box-sizing': 'border-box',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    };
  }

  // 初始化画布边界
  onMounted(() => {
  updateCanvasBounds();
  window.addEventListener('resize', updateCanvasBounds);
  
  // 尝试从全局变量中恢复数据（从AutoCreateStep6返回时）
  try {
    const savedData = window.autoCreateFormData;
    console.log(TAG,'onMounted savedData:',savedData);
    if (savedData) {
      const formData = savedData;  // 不需要解析，已经是对象了
      console.log(TAG,'onMounted formData:',formData);

      // 首先检查是否有布局状态可以恢复
      if (formData.layoutState && formData.layoutState.currentLayout && formData.layoutState.currentLayout.length > 0) {
        console.log('检测到存在布局状态数据，准备恢复...');
        
        // 恢复组件布局状态
        currentLayout.value = JSON.parse(JSON.stringify(formData.layoutState.currentLayout));
        
        // 确保usedComponentTypes集合被正确初始化
        usedComponentTypes.value = new Set();
        
        // 从恢复的布局中更新usedComponentTypes集合
        currentLayout.value.forEach(component => {
          usedComponentTypes.value.add(component.type);
        });
        
        console.log('已更新usedComponentTypes集合:', Array.from(usedComponentTypes.value));
        
        // 根据恢复的组件状态更新占位区域
        currentLayout.value.forEach(component => {
          const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${component.type}"]`);
          if (modulePlaceholder) {
            modulePlaceholder.classList.add('occupied');
            modulePlaceholder.style.opacity = '0.3';
          }
        });
        
        console.log('已从localStorage恢复组件布局状态', currentLayout.value);
        
        // 恢复配置数据，确保与布局状态同步
        if (currentLayout.value.length > 0) {
          // 从恢复的布局中提取各个配置项
          currentLayout.value.forEach(component => {
            if (component.type === 'basic-config' && component.config) {
              basicConfig.value = { ...component.config };
              appName.value = component.config.appName || '小程序名称';
            } else if (component.type === 'ui-config' && component.config) {
              uiConfig.value = { ...component.config };
            } else if (component.type === 'general-config' && component.config) {
              generalConfig.value = { ...component.config };
            } else if (component.type === 'weiju-config' && component.config) {
              weijuConfig.value = { ...component.config };
            } else if (component.type === 'payment' && component.config) {
              paymentConfig.value = { ...component.config };
            } else if (component.type === 'advertisement' && component.config) {
              adConfig.value = { ...component.config };
            }
          });
          
          console.log('已从恢复的布局中同步配置数据');
          return; // 如果成功恢复了布局状态，就不再执行后续的配置恢复逻辑
        }
      } 
      
      // 如果没有成功恢复布局状态，再尝试恢复单个配置项
      console.log('未检测到完整布局状态，尝试恢复单个配置项');
      
      // 恢复基础配置
        if (formData.basicInfoForm) {
          basicConfig.value = {
            appName: formData.basicInfoForm.appName || '',
            platform: formData.basicInfoForm.platform || '',
            version: formData.basicInfoForm.version || '',
            appCode: formData.basicInfoForm.appCode || '',
            product: formData.basicInfoForm.product || '',
            customer: formData.basicInfoForm.customer || '',
            appid: formData.basicInfoForm.appid || '',
            tokenId: formData.basicInfoForm.token_id || '',
            cl: formData.basicInfoForm.cl || '',
            deliverId: formData.microConfigForm?.deliverId || '',
            bannerId: formData.microConfigForm?.bannerId || ''
          };
          
          // 更新手机模拟器的应用名称
          appName.value = basicConfig.value.appName || '小程序名称';
        }
        
        // 恢复UI配置
        if (formData.uiConfigForm) {
          uiConfig.value = {
            mainTheme: formData.uiConfigForm.mainTheme || '#2552F5FF',
            secondTheme: formData.uiConfigForm.secondTheme || '#DCE7FFFF',
            payCardStyle: formData.uiConfigForm.payCardStyle || 1,
            homeCardStyle: formData.uiConfigForm.homeCardStyle || 1,
            selectedPayCardImage: `/images/payStyle/pay_style${formData.uiConfigForm.payCardStyle || 1}.png`
          };
        }
        
        // 恢复支付配置
        if (formData.paymentConfigForm) {
          paymentConfig.value = { ...formData.paymentConfigForm };
        }
        
        // 恢复广告配置
        if (formData.adConfigForm) {
          adConfig.value = {
            rewardAd: {
              enabled: formData.adConfigForm.rewardAd?.enabled || false,
              rewardAdId: formData.adConfigForm.rewardAd?.rewardAdId || '',
              rewardCount: formData.adConfigForm.rewardAd?.rewardCount || null
            },
            interstitialAd: {
              enabled: formData.adConfigForm.interstitialAd?.enabled || false,
              interstitialAdId: formData.adConfigForm.interstitialAd?.interstitialAdId || '',
              interstitialCount: formData.adConfigForm.interstitialAd?.interstitialCount || null
            },
            bannerAd: {
              enabled: formData.adConfigForm.bannerAd?.enabled || false,
              bannerAdId: formData.adConfigForm.bannerAd?.bannerAdId || ''
            },
            feedAd: {
              enabled: formData.adConfigForm.feedAd?.enabled || false,
              feedAdId: formData.adConfigForm.feedAd?.feedAdId || ''
            }
          };


        }
        
        // 恢复通用配置
        if (formData.generalConfigForm) {
          generalConfig.value = {
            contact: formData.generalConfigForm.contact || '',
            buildCode: formData.generalConfigForm.buildCode || '',
            iaaMode: formData.generalConfigForm.iaaMode || false,
            iaaDialogStyle: formData.generalConfigForm.iaaDialogStyle || null,
            hidePayEntry: formData.generalConfigForm.hidePayEntry || false,
            hideScoreExchange: formData.generalConfigForm.hideScoreExchange || false,
            mineLoginType: formData.generalConfigForm.mineLoginType || 'anonymousLogin',
            readerLoginType: formData.generalConfigForm.readerLoginType || 'anonymousLogin',
            douyinImId: formData.generalConfigForm.douyinImId || '',
            douyinAppToken: formData.generalConfigForm.douyinAppToken || '',
            weixinAppToken: formData.generalConfigForm.weixinAppToken || '',
            kuaishouClientId: formData.generalConfigForm.kuaishouClientId || '',
            kuaishouClientSecret: formData.generalConfigForm.kuaishouClientSecret || '',
            kuaishouAppToken: formData.generalConfigForm.kuaishouAppToken || ''
          };
        }
        
        // 恢复微距配置
        if (formData.microConfigForm) {
          weijuConfig.value = {
            deliverId: formData.microConfigForm.deliverId || '',
            bannerId: formData.microConfigForm.bannerId || ''
          };
        }
        
        // 标记数据已成功恢复
        console.log('已从localStorage恢复数据');
        
        // 数据恢复成功后删除全局变量，避免下次打开时重复使用同一份数据
        delete window.autoCreateFormData;
    } else {
      console.log('localStorage中没有找到可恢复的数据');
    }
  } catch (error) {
    console.error('从localStorage恢复数据失败:', error);
  }
})

  // 更新画布边界
  const updateCanvasBounds = () => {
    if (canvasRef.value) {
      const rect = canvasRef.value.getBoundingClientRect();
      canvasBounds.value = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    }
  }


  // 可用组件列表
  const availableComponents = ref([
      { type: 'basic-config', name: '基础配置', color: '#409eff', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
      { type: 'general-config', name: '通用配置', color: '#67c23a', gradient: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)' },
      { type: 'payment', name: '支付', color: '#e6a23c', gradient: 'linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)' },
      { type: 'advertisement', name: '广告', color: '#f56c6c', gradient: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)' },
      { type: 'ui-config', name: 'UI配置', color: '#13c2c2', gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)' },
      { type: 'weiju-config', name: '微距', color: '#722ed1', gradient: 'linear-gradient(135deg, #9c27b0 0%, #6a0080 100%)' }
    ])
console.log('可用组件初始数据:', availableComponents.value);
  
// 过滤有效的组件
const filteredComponents = computed(() => {
  return availableComponents.value
    .filter(item => item && item.type)
    .filter(item => !usedComponentTypes.value.has(item.type));
})

  
  // 拖拽状态管理
  const draggedComponentType = ref(null);

  // 拖拽功能实现
  const handleDragStart = (e) => {
    const componentType = e.currentTarget.dataset.type;
    draggedComponentType.value = componentType;
    e.dataTransfer.setData('text/plain', componentType);
  
    e.dataTransfer.setData('text/plain', componentType);
    console.log('拖拽组件类型:', componentType);
  }
// 拖拽悬停处理
  const handleDragOver = (e, placeholderType) => {
    if (draggedComponentType.value === placeholderType && !document.querySelector(`.module-placeholder[data-module-type="${placeholderType}"].occupied`)) {
      e.currentTarget.classList.add('dragover');
    }
  };

  const handleDragEnter = (e, placeholderType) => {
    if (draggedComponentType.value === placeholderType && !document.querySelector(`.module-placeholder[data-module-type="${placeholderType}"].occupied`)) {
      e.currentTarget.classList.add('dragover');
    }
  };

  // 拖拽结束移除悬停样式
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault()
    // 获取组件类型
      const componentType = e.dataTransfer.getData('text/plain');
      console.log('组件类型:', componentType);
    if (!componentType) return

    // 获取画布容器
    const canvas = document.querySelector('.canvas-container')
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect()
    // 声明x, y, componentWidth和componentHeight变量
    let x, y, componentWidth, componentHeight;

    // 获取手机框架位置
    const phoneFrame = document.querySelector('.phone-frame')
    const appArea = document.querySelector('.phone-app-area')
    if (!phoneFrame || !appArea) return;
    const frameRect = phoneFrame.getBoundingClientRect();
    const appRect = appArea.getBoundingClientRect();
    const canvasWidth = appRect.width;
    const canvasHeight = appRect.height;
    // 使用实际渲染尺寸（与拖拽时保持一致）
    // 初始化默认尺寸
    componentWidth = 200;
    componentHeight = 100;

    // 根据组件类型获取对应模块区域位置
    // 根据组件类型获取对应模块区域位置
      // 精确匹配模块区域
        const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${componentType}"]`);
        console.log(`查找模块区域: ${componentType}`, modulePlaceholder);
    if (modulePlaceholder && !modulePlaceholder.classList.contains('occupied')) {
        componentWidth = modulePlaceholder.offsetWidth - 20;
        componentHeight = modulePlaceholder.offsetHeight - 20;
          const placeholderRect = modulePlaceholder.getBoundingClientRect();
          const appRect = appArea.getBoundingClientRect();
          // 计算相对于应用区域的精确位置
          x = placeholderRect.left - appRect.left + 5;
          y = placeholderRect.top - appRect.top + 5;
          componentWidth = modulePlaceholder.offsetWidth - 10;
          componentHeight = modulePlaceholder.offsetHeight - 10;
          // 标记占位区域为已占用
          modulePlaceholder.classList.add('occupied');
          modulePlaceholder.style.borderStyle = 'solid';
          modulePlaceholder.style.opacity = '0.3';
          modulePlaceholder.classList.remove('dragover');
          console.log(`组件${componentType}定位到区域:`, x, y);
        } else {
          console.error(`未找到${componentType}对应的模块区域`);
          // 根据组件类型设置备用位置（匹配占位符位置）
          const positions = {
            'basic-config': {x: 15, y: 59},
            'general-config': {x: 15, y: 154},
            'payment': {x: 15, y: 249},
            'advertisement': {x: 175, y: 249},
            'ui-config': {x: 15, y: 344},
            'weiju-config': {x: 15, y: 439}
          };
          const pos = positions[componentType] || {x: 15, y: 15};
          x = pos.x;
          y = pos.y;
          console.log(`使用备用位置:`, x, y);
        componentWidth = Math.max(200, modulePlaceholder.offsetWidth - 20);
        componentHeight = Math.max(80, modulePlaceholder.offsetHeight - 20);
      }

    // 调试组件尺寸和位置
    // 调试应用区域尺寸
    console.log('应用区域尺寸:', appRect.width, appRect.height);
    console.log('创建组件:', componentType, '位置:', x, y, '尺寸:', componentWidth, componentHeight);
    // 创建带正确初始位置的组件
    const newComponent = {
      id: nextComponentId.value++,
      type: componentType,
      position: { x: x, y: y },
      width: componentWidth,
        height: componentHeight,
      props: {},
      isEditingComplete: false
    }

    // 确保组件属性有效
    if (typeof x === 'number' && typeof y === 'number' && componentWidth > 0 && componentHeight > 0) {
      // 添加到布局中
      currentLayout.value.push(newComponent);
      console.log('组件已添加到布局:', newComponent);
    } else {
      console.error('无效的组件属性:', {x, y, componentWidth, componentHeight});
      ElMessage.error('组件创建失败: 无效的位置或尺寸');
    }
    console.log('组件已添加到布局，当前数量:', currentLayout.value.length);
    // 标记组件类型为已使用
    usedComponentTypes.value.add(componentType)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    ElMessage.success(`已添加${getComponentName(componentType)}组件`)
  }

  // 根据组件类型获取渐变背景
  const getComponentGradient = (type) => {
    const component = availableComponents.value.find(item => item.type === type);
    return component ? component.gradient : 'linear-gradient(135deg, #409eff 0%, #69b1ff 100%)';
  }

  // 获取当前平台
const getCurrentPlatform = () => {
  // 查找基础配置组件
  const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
  return basicConfigComponent?.config?.platform || 'douyin';
}

// 获取画布组件样式
const getCanvasComponentStyle = (component) => {
  // 使用动态宽高
  const style = {
    width: `${component.width}px`,
    height: `${component.height}px`,
    borderRadius: '8px',
    padding: '20px',
    'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
    'box-sizing': 'border-box',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.3s ease'
  };
  // 根据编辑状态设置背景
  if (!component.isCompleted) {
    style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
    style.borderColor = '#ddd';
    style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  } else {
    style.background = 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)';
    style.borderColor = '#4caf50';
    style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.2)';
  }
  return style;
}


  // 获取组件名称
  const getComponentName = (type) => {
    const names = {
      'basic-config': '基础配置',
      'general-config': '通用配置',
      'payment': '支付',
      'advertisement': '广告',
      'ui-config': 'UI配置',
      'weiju-config': '微距'
    }
    return names[type] || type
  }

// 拖拽中 - 平衡跟手性与流畅度
  const handleDrag = (e) => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value || !canvasBounds.value) return

    // 使用requestAnimationFrame优化性能，减少布局抖动
    requestAnimationFrame(() => {
      const offsetX = e.clientX - dragStartPos.startX;
      const offsetY = e.clientY - dragStartPos.startY;
      const newX = dragStartPos.initialX + offsetX;
      const newY = dragStartPos.initialY + offsetY;

      // 统一使用两位小数精度计算边界
      const canvasPadding = 15;
      const maxX = canvasBounds.value.width - 200 - canvasPadding;
      const maxY = canvasBounds.value.height - 100 - canvasPadding;
      const boundedX = Math.max(canvasPadding, Math.min(newX, maxX)).toFixed(2);
      const boundedY = Math.max(canvasPadding, Math.min(newY, maxY)).toFixed(2);

      // 应用硬件加速并更新位置
      draggedElement.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
    });
  }

  // 结束拖拽 - 精确同步位置并清理事件
  const stopDrag = () => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value) return

    // 精确提取transform值，避免舍入误差
    const transform = draggedElement.style.transform;
    const match = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
    if (match) {
        // 使用亚像素精度同步最终位置，避免释放时突变if (match) {
        // 统一使用parseFloat避免Number构造函数带来的精度问题
        draggedComponent.value.position = {
          x: parseFloat(parseFloat(match[1]).toFixed(2)),
          y: parseFloat(parseFloat(match[2]).toFixed(2))
        };
      }

    // 确保事件监听器正确移除
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);

    isDragging.value = false;
    // 清理样式和引用
    draggedElement.style.transition = '';
    draggedElement.style.willChange = 'auto';
    draggedElement.style.backfaceVisibility = 'visible';
    draggedElement = null;
    draggedComponent.value = null;
    dragStartPos = { x: 0, y: 0, startX: 0, startY: 0, initialX: 0, initialY: 0 };
  }

  // 删除组件
  const removeComponent = (component) => {
    // 从布局中移除组件
    currentLayout.value = currentLayout.value.filter(item => item.id !== component.id)
    // 从已使用类型中移除
    usedComponentTypes.value.delete(component.type)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    // 取消选中状态
    if (selectedComponent.value?.id === component.id) {
      selectedComponent.value = null
    }
    
    // 当基础配置被移除时，清空依赖的UI配置和通用配置数据
    if (component.type === 'basic-config') {
      // 清空UI配置数据
      uiConfig.value = {};
      uiConfigThemeConfigured.value = false;
      lastQueriedAppName.value = '';
      
      // 清空通用配置数据
      generalConfig.value = {};
      
      // 强制清空属性面板的选中状态，防止显示无效数据
      selectedComponent.value = null;
      
      // 将appName重置为默认值，同步更新手机模拟器区域的title
      appName.value = '小程序名称';
      
      // 找到并更新UI配置和通用配置组件的完成状态
      currentLayout.value.forEach(comp => {
        if (comp.type === 'ui-config' || comp.type === 'general-config') {
          // 直接设置为未完成状态
          comp.isCompleted = false;
        }
      });
    }
    // 重置对应占位区域状态
    const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${component.type}"]`);
    if (modulePlaceholder) {
      modulePlaceholder.classList.remove('occupied', 'dragover');
      // 先清除所有内联样式，再恢复原始样式
        modulePlaceholder.removeAttribute('style');
        const originalStyle = modulePlaceholder.getAttribute('data-original-style');
        if (originalStyle) {
            modulePlaceholder.style.cssText = originalStyle;
            // 显式清除可能残留的内联样式
            modulePlaceholder.style.border = '';
            modulePlaceholder.style.borderStyle = '';
            modulePlaceholder.style.borderWidth = '';
            modulePlaceholder.style.borderColor = '';
            modulePlaceholder.style.backgroundColor = '';
            modulePlaceholder.style.opacity = '';
            // 触发重排确保样式立即应用
            modulePlaceholder.offsetHeight;
          }
      // 清除所有内联样式，恢复CSS类定义的默认样式
      // 使用border简写属性清除所有边框样式
      // 仅清除组件添加时设置的内联样式，保留原始定位样式
        // 显式重置为默认样式，确保视觉一致性
        // 完全重置边框样式为默认值
        // 清除内联样式，完全依赖CSS类定义
          modulePlaceholder.style.borderStyle = '';
          modulePlaceholder.style.borderWidth = '';
          modulePlaceholder.style.borderColor = '';
          modulePlaceholder.style.opacity = '';
    }
    ElMessage.success(`已移除${getComponentName(component.type)}组件`)
  }

// 开始拖拽 - 优化事件绑定和初始位置
const startDrag = (component, e) => {
  const el = e.currentTarget;
  if (!el || !component || !canvasBounds.value) return

  // 移除旧事件监听防止多重绑定
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);

  draggedComponent.value = component;
  draggedElement = el;
  // 使用精确初始位置，避免取整导致偏移
  dragStartPos = {
    startX: e.clientX,
    startY: e.clientY,
    initialX: parseFloat(component.position.x.toFixed(2)),
    initialY: parseFloat(component.position.y.toFixed(2))
  };
  isDragging.value = true;
  // 优化样式提升性能
  el.style.transition = 'none';
  el.style.willChange = 'transform';
  el.style.backfaceVisibility = 'hidden';

  // 添加新事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

// 完成编排
const handleSaveLayout = () => {
  if (!currentLayout.value) {
    ElMessage.error('请先创建布局')
    return
  }
  
  // 验证当前选中的通用配置表单
  if (selectedComponent.value && selectedComponent.value.type === 'general-config' && formRef.value) {
    formRef.value.validate((valid) => {
      if (!valid) {
        ElMessage.error('请检查通用配置中的错误项')
        return
      }
      
      // 保存所有配置数据
      currentLayout.value.forEach(component => {
        if (component.type === 'basic-config') {
          component.config = { ...basicConfig.value };
        } else if (component.type === 'ui-config') {
          component.config = { ...uiConfig.value };
        } else if (component.type === 'general-config') {
          component.config = { ...generalConfig.value };
        } else if (component.type === 'weiju-config') {
          component.config = { ...weijuConfig.value };
        } else if (component.type === 'payment') {
          component.config = { ...paymentConfig.value };
        } else if (component.type === 'advertisement') {
          component.config = { ...adConfig.value };
        }
      });
      
      // 检查所有配置是否合理配置
      if (checkAllConfigsCompleted()) {
        // 构造AutoCreateStep6需要的表单数据
        navigateToAutoCreateStep6();
      }
    })
  } else {
    // 保存所有配置数据（当没有选中通用配置或表单引用不存在时）
    currentLayout.value.forEach(component => {
      if (component.type === 'basic-config') {
        component.config = { ...basicConfig.value };
      } else if (component.type === 'ui-config') {
        component.config = { ...uiConfig.value };
      } else if (component.type === 'general-config') {
        component.config = { ...generalConfig.value };
      } else if (component.type === 'weiju-config') {
        component.config = { ...weijuConfig.value };
      } else if (component.type === 'payment') {
        component.config = { ...paymentConfig.value };
      } else if (component.type === 'advertisement') {
        component.config = { ...adConfig.value };
      }
    });
    
    // 检查所有配置是否合理配置
    if (checkAllConfigsCompleted()) {
      // 构造AutoCreateStep6需要的表单数据
      navigateToAutoCreateStep6();
    }
  }
}

// 映射组件类型英文名称为中文名称
const getComponentTypeName = (type) => {
  const typeMap = {
    'basic-config': '基础配置',
    'payment': '支付配置',
    'advertisement': '广告配置',
    'general-config': '通用配置',
    'ui-config': 'UI配置',
    'weiju-config': '微距配置'
  };
  return typeMap[type] || type;
};

// 检查所有配置项是否已合理配置
const checkAllConfigsCompleted = () => {
  // 1. 先校验当前正在编辑的组件的配置完整性
  if (selectedComponent.value) {
    let isCurrentComponentValid = false;
    
    if (selectedComponent.value.type === 'basic-config') {
      isCurrentComponentValid = checkConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('当前编辑的基础配置不完整，请检查')
        return false;
      }
    } else if (selectedComponent.value.type === 'payment') {
      isCurrentComponentValid = checkPaymentConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('请至少配置一项支付方式')
        return false;
      }
    } else if (selectedComponent.value.type === 'advertisement') {
      isCurrentComponentValid = checkAdConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('请至少配置一项广告方式')
        return false;
      }
    } else if (selectedComponent.value.type === 'general-config') {
      isCurrentComponentValid = checkGeneralConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('当前编辑的通用配置不完整，请检查')
        return false;
      }
    } else if (selectedComponent.value.type === 'ui-config') {
      isCurrentComponentValid = checkUIConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('当前编辑的UI配置不完整，请检查')
        return false;
      }
    } else if (selectedComponent.value.type === 'weiju-config') {
      isCurrentComponentValid = checkWeijuConfigCompleted(selectedComponent.value);
      if (!isCurrentComponentValid) {
        ElMessage.error('当前编辑的微距配置不完整，请检查')
        return false;
      }
    }
  }
  
  // 2. 检查是否包含所有必需的配置组件
  const requiredComponents = ['basic-config', 'payment', 'advertisement', 'general-config', 'ui-config', 'weiju-config'];
  for (const componentType of requiredComponents) {
    const hasComponent = currentLayout.value.some(component => component.type === componentType);
    if (!hasComponent) {
      ElMessage.error(`请添加${getComponentTypeName(componentType)}组件`)
      return false;
    }
  }
  
  // 3. 按照顺序校验每个组件的配置
  // 3.1 校验基础配置
  const basicConfigComponent = currentLayout.value.find(component => component.type === 'basic-config');
  if (!basicConfigComponent.config) {
    ElMessage.error('基础配置数据不存在')
    return false;
  }
  
  // 基础配置中的所有字段都是必填项
  const requiredBasicFields = ['appName', 'platform', 'version', 'appCode', 'product', 'customer', 'appid', 'cl'];
  for (const field of requiredBasicFields) {
    if (!basicConfigComponent.config[field] || basicConfigComponent.config[field].trim() === '') {
      ElMessage.error(`基础配置中的${field}为必填项`)
      return false;
    }
  }
  
  // 3.2 校验其他组件配置
  for (const component of currentLayout.value) {
    if (component.type === 'payment' && !checkPaymentConfigCompleted(component)) {
      ElMessage.error('请至少配置一项支付方式')
      return false;
    } else if (component.type === 'advertisement' && !checkAdConfigCompleted(component)) {
      ElMessage.error('请至少配置一项广告方式')
      return false;
    } else if (component.type === 'general-config' && !checkGeneralConfigCompleted(component)) {
      ElMessage.error('通用配置不完整，请检查')
      return false;
    } else if (component.type === 'ui-config' && !checkUIConfigCompleted(component)) {
      ElMessage.error('UI配置不完整，请检查')
      return false;
    } else if (component.type === 'weiju-config' && !checkWeijuConfigCompleted(component)) {
      ElMessage.error('微距配置不完整，请检查')
      return false;
    }
  }
  
  return true;
}

// 重置编排
const resetLayout = () => {
  ElMessageBox.confirm('确定要重新编排吗？当前所有配置将被清空。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清空布局数组
    currentLayout.value = [];
    
    // 清空已使用组件类型集合
    usedComponentTypes.value = new Set();
    
    // 重置所有配置对象
    basicConfig.value = {};
    uiConfig.value = {};
    generalConfig.value = {};
    weijuConfig.value = {};
    paymentConfig.value = {};
    adConfig.value = {};
    
    // 重置选中组件
    selectedComponent.value = null;
    
    // 重置应用名称
    appName.value = '小程序名称';
    
    // 重置占位区域状态
    const placeholders = document.querySelectorAll('.module-placeholder');
    placeholders.forEach(placeholder => {
      placeholder.classList.remove('occupied', 'dragover');
      placeholder.style.cssText = placeholder.getAttribute('data-original-style') || '';
      placeholder.style.opacity = '';
    });
    
    // 重置UI配置相关状态
    uiConfigThemeConfigured.value = false;
    uiConfigLoading.value = false;
    
    // 重置通用配置相关状态
    buildCodeDisabled.value = false;
    generalConfigLoading.value = false;
    
    // 重置上次查询的appName缓存
    lastQueriedAppName.value = '';
    
    ElMessage.success('已重置所有编排状态');
  }).catch(() => {
    // 用户取消操作
  });
}

// 跳转到AutoCreateStep6
const navigateToAutoCreateStep6 = () => {
  // 构造AutoCreateStep6需要的表单数据
  const basicInfoForm = {
    appName: basicConfig.value.appName || '',
    platform: basicConfig.value.platform || '',
    version: basicConfig.value.version || '',
    appCode: basicConfig.value.appCode || '',
    product: basicConfig.value.product || '',
    customer: basicConfig.value.customer || '',
    appid: basicConfig.value.appid || '',
    token_id: basicConfig.value.tokenId || null,
    cl: basicConfig.value.cl || '',
  };
  
  const microConfigForm = {
    deliverId: weijuConfig.value.deliverId || basicConfig.value.deliverId || '',
    bannerId: weijuConfig.value.bannerId || basicConfig.value.bannerId || ''
  };
  
  const uiConfigForm = {
    mainTheme: uiConfig.value.mainTheme || '',
    secondTheme: uiConfig.value.secondTheme || '',
    homeCardStyle: uiConfig.value.homeCardStyle || null,
    payCardStyle: uiConfig.value.payCardStyle || null
  };
  
  const paymentConfigForm = {
    ...paymentConfig.value
  };
   
  const adConfigForm = {
    rewardAd: {
      enabled: adConfig.value.rewardAd?.enabled || false,
      rewardAdId: adConfig.value.rewardAd?.rewardAdId || '',
      rewardCount: adConfig.value.rewardAd?.rewardCount || null
    },
    interstitialAd: {
      enabled: adConfig.value.interstitialAd?.enabled || false,
      interstitialAdId: adConfig.value.interstitialAd?.interstitialAdId || '',
      interstitialCount: adConfig.value.interstitialAd?.interstitialCount || null
    },
    bannerAd: {
      enabled: adConfig.value.bannerAd?.enabled || false,
      bannerAdId: adConfig.value.bannerAd?.bannerAdId || ''
    },
    feedAd: {
      enabled: adConfig.value.feedAd?.enabled || false,
      feedAdId: adConfig.value.feedAd?.feedAdId || ''
    }
  };
  
  const generalConfigForm = {
    contact: generalConfig.value.contact || '',
    buildCode: generalConfig.value.buildCode || '',
    iaaMode: generalConfig.value.iaaMode || false,
    iaaDialogStyle: generalConfig.value.iaaDialogStyle || null,
    hidePayEntry: generalConfig.value.hidePayEntry || false,
    hideScoreExchange: generalConfig.value.hideScoreExchange || false,
    mineLoginType: generalConfig.value.mineLoginType || 'anonymousLogin',
    readerLoginType: generalConfig.value.readerLoginType || 'anonymousLogin',
    douyinImId: generalConfig.value.douyinImId || '',
    douyinAppToken: generalConfig.value.douyinAppToken || '',
    weixinAppToken: generalConfig.value.weixinAppToken || '',
    kuaishouClientId: generalConfig.value.kuaishouClientId || '',
    kuaishouClientSecret: generalConfig.value.kuaishouClientSecret || '',
    kuaishouAppToken: generalConfig.value.kuaishouAppToken || ''
  };
  
  // 保存当前布局状态，以便从AutoCreateStep6返回时恢复
  const layoutState = {
    currentLayout: currentLayout.value,
    usedComponentTypes: Array.from(usedComponentTypes.value)
  };
  
  // 使用全局变量在内存中存储表单数据，避免localStorage的问题
  window.autoCreateFormData = {
    basicInfoForm,
    microConfigForm,
    uiConfigForm,
    paymentConfigForm,
    adConfigForm,
    generalConfigForm,
    layoutState
  };
  console.log('已成功保存表单数据到内存');
  
  // 跳转到AutoCreate页面并设置为第6步
  router.push({
    name: 'AutoCreate',
    query: { step: 5 }
  });
}
</script>

<style scoped>
.free-layout-module {
  padding: 10px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.workspace-container {
  display: grid;
  grid-template-columns: 280px 1fr 400px;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 220px);
}

/* 确保属性面板正确显示 */
.properties-panel {
  display: block !important;
}

.basic-config-form{
  margin-top: 15px;
}
.basic-config-form .el-form-item {
  margin-bottom: 15px;
  
}

.basic-config-form .el-input, .basic-config-form .el-select {
  width: 100%;
  max-width: 280px;
}

.basic-config-form .el-form-item__label {
  padding-right: 10px;
}
.sidebar {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  min-height: 300px;
  width: 300px;
  /* 隐藏滚动条但保留滚动功能 */
  ::-webkit-scrollbar {width: 0;}
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 属性面板样式 */
  .properties-panel {
    width: 100%;
    padding: 20px;
    background-color: #f5f7fa;
    height: 100%;
    overflow-y: auto;
  }

  /* 基础配置表单样式 */
  .platform-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .platform-radio-group .el-radio-button__inner {
    padding: 8px 16px;
  }

  /* 主题选择样式 */
  .predefined-themes-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
  }

  .theme-option {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    border-radius: 4px;
    transition: all 0.3s;
    background-color: white;
    border: 1px solid #e4e7ed;
    width: 120px;
  }

  .theme-option:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #2552F5;
  }

  .theme-colors {
    display: flex;
    gap: 5px;
    margin-bottom: 8px;
  }

  .main-color,
  .second-color {
    width: 30px;
    height: 20px;
    border-radius: 2px;
    border: 1px solid #e4e7ed;
  }

  .theme-name {
    font-size: 12px;
    color: #606266;
  }

  /* IAA弹窗样式卡片布局 */
  .iaa-dialog-style-card-group {
    display: flex;
    gap: 15px;
  }

  .iaa-dialog-style-card {
    display: inline-block;
    width: 150px;
  }

  .iaa-dialog-style-card-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    border: 2px solid #e4e7ed;
    border-radius: 4px;
    transition: all 0.3s;
  }

  .iaa-dialog-style-card-inner:hover,
  .iaa-dialog-style-card-inner.selected {
    border-color: #2552F5;
    box-shadow: 0 2px 8px rgba(37, 82, 245, 0.2);
  }

  .iaa-dialog-style-card-inner img {
    width: 120px;
    height: 80px;
    object-fit: cover;
    margin-bottom: 8px;
  }

  .iaa-dialog-style-label {
    font-size: 12px;
    color: #606266;
  }

  /* 支付卡片预览样式 */
  .pay-card-image-preview {
    margin-top: 15px;
    display: flex;
    justify-content: center;
  }

  .pay-card-image-preview img {
    max-width: 100%;
    max-height: 200px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  /* 表单提示文本 */
  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }

  /* 登录类型选择样式 */
  .login-type-item {
    margin-bottom: 20px;
  }
.component-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  margin-top: 15px;
}
.component-item {
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  width: 250px;
  height: 100px;
  user-select: none;
  touch-action: none;
}

.component-item:active {
  cursor: grabbing;
}

.component-card {
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
  transform: translateY(0);
}

.component-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 配置完成状态样式 */
.component-completed {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%) !important;
  border: 1px solid #b7eb8f;
  position: relative;
}

.completion-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #52c41a;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.uncompletion-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #bcc0ba;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.component-item *) {
  pointer-events: none;
}
.main-content {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
}
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
.phone-frame {
  width: 320px;
  height: 650px;
  background: transparent;
  border-radius: 40px;
  border: 6px solid #333;
  padding: 0;
  position: relative;
  overflow: hidden;
}
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.phone-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  /* background: linear-gradient(180deg, var(--theme-color, ), #e4edfb00); */
  z-index: 0;
}

.top-gradient-container {
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.phone-status-bar {
  height: 44px;
  padding: 0 15px;
  position: relative;
  z-index: 1;
}

.app-title-bar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.phone-status-bar, .app-title-bar {
  box-sizing: border-box;
}

.app-title-bar {
  margin-top: 0;
}

.phone-status-bar {
  height: 44px;
  padding-top: 0;
}

.app-title-bar {
  height: 56px;
}

.phone-status-bar {
  height: 44px;
  background-color: transparent;
  display: flex;
  position: relative;
  z-index: 10;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
}
.status-bar-time{
  color: #fff;  
}

.status-bar-icons {
  display: flex;
  gap: 4px;
  position: relative;
  top: 44px;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
}
.phone-app-area {
  position: absolute;
  top: 84px;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
  z-index: 1;
}

.app-title-bar {
  height: 40px;
  -color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.module-placeholder {
  border: 1px dashed #409EFF;
  border-radius: 8px;
  position: absolute;
  background: rgba(64, 158, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.module-placeholder.occupied {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.05);
}

.module-placeholder.dragover {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.2);
  border-width: 2px;
   display: flex;
  align-items: center;
  justify-content: center;
}

.module-placeholder[data-module-type="basic-config"] {
  top: 59px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="general-config"] {
  top: 154px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="payment"] {
  top: 249px;
  left: 15px;
  width: calc(50% - 22.5px);
  height: 80px;
  float: left;
}

.module-placeholder[data-module-type="advertisement"] {
  top: 249px;
  left: calc(50% + 7.5px);
  width: calc(50% - 22.5px);
  height: 80px;
  float: right;
}

.module-placeholder[data-module-type="ui-config"] {
  top: 344px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="weiju-config"] {
  top: 439px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}



.placeholder-label {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-align: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.phone-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
}

.tab-bar-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
  object-fit: contain;
}

.component {
    position: absolute;
    width: 200px;
    height: 80px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: move;
    transition: all 0.3s ease;
    overflow: hidden;
    will-change: transform;
    z-index: 9999; /* 确保在最上层 */
    border: none;
    &:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  }

.component-header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px;
}

.delete-icon {
  color: #f56c6c;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.delete-icon:hover {
  background: rgba(255, 255, 255, 0.9);
}

.component-selected {
  border: none;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.4);
  z-index: 20;
  transition: all 0.3s ease-out;
}

.component:active {
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
  transition: all 0.1s ease;
}

.component:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;

}
.properties-panel {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
}
.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>