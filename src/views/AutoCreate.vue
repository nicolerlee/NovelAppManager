<template>
  <div class="auto-create-module">
    <el-card class="workflow-container">
      <template #header>
        <div class="header">
          <h3>小程序生产工厂 - 向导式</h3>
        </div>
      </template>
      <div class="workflow-content">
        <CustomSteps :active-step="currentStep" :steps="stepsData" @step-click="handleStepClick" />

        <!-- 步骤内容 -->
        <div class="step-panel">
          <!-- 步骤1: 配置基本信息和微距 -->
          <div v-if="currentStep === 0">
            <AutoCreateStep1
              v-model="basicInfoForm"
              :current-sub-step="currentSubStep"
              @update:current-sub-step="currentSubStep = $event"
              ref="basicInfoStepRef"
            />
          </div>

          <!-- 步骤2: 配置UI信息 -->
          <div v-if="currentStep === 1">
            <AutoCreateStep2
              v-model="uiConfigForm"
              :appName="basicInfoForm.appName"
              ref="uiConfigFormRef"
            />
          </div>

          <!-- 步骤3: 配置支付信息 -->
          <div v-if="currentStep === 2">
            <AutoCreateStep3
              v-model="paymentConfigForm"
              :platform="basicInfoForm.platform"
              ref="paymentConfigFormRef"
            />
          </div>

          <!-- 步骤4: 配置广告信息 -->
          <div v-if="currentStep === 3">
            <AutoCreateStep4
              v-model="adConfigForm"
              :platform="basicInfoForm.platform"
              :basicConfig="{platform: basicInfoForm.platform}"
              ref="adConfigFormRef"
            />
          </div>

          <!-- 步骤5: 配置通用信息 -->
          <div v-if="currentStep === 4">
            <AutoCreateStep5
              v-model="generalConfigForm"
              :platform="basicInfoForm.platform"
              :basicConfig="{appName: basicInfoForm.appName, platform: basicInfoForm.platform}"
              ref="generalConfigFormRef"
            />
          </div>

          <!-- 步骤6: 展示配置数据并确认 -->
          <div v-if="currentStep === 5">
            <AutoCreateStep6
              :basicInfoForm="basicInfoForm"
              :uiConfigForm="uiConfigForm"
              :microConfigForm="microConfigForm"
              :paymentConfigForm="paymentConfigForm"
              :adConfigForm="adConfigForm"
              :generalConfigForm="generalConfigForm"
              @reset-wizard="resetWizard"
              ref="autoCreateStep6Ref"
            />
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="step-actions">
          <el-button v-if="currentStep > 0 || currentSubStep > 0" @click="prevStep">上一步</el-button>
          <el-button v-if="currentStep < 5" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-if="currentStep === 5" type="primary" @click="startGeneration">确认无误，开始生成小程序</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CustomSteps from '../components/common/CustomSteps.vue'
import AutoCreateStep1 from '../components/autoCreate/AutoCreateStep1.vue'
import AutoCreateStep2 from '../components/autoCreate/AutoCreateStep2.vue'
import AutoCreateStep3 from '../components/autoCreate/AutoCreateStep3.vue'
import AutoCreateStep4 from '../components/autoCreate/AutoCreateStep4.vue'
import AutoCreateStep5 from '../components/autoCreate/AutoCreateStep5.vue'
import AutoCreateStep6 from '../components/autoCreate/AutoCreateStep6.vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppGenerationStore } from '../stores/appGenerationStore'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()
const currentStep = ref(0)
const currentSubStep = ref(0)
const appGenerationStore = useAppGenerationStore()
// 新增：标识是否从FreelayoutMain跳转过来
const isFromFreelayoutMain = ref(false)

// 表单引用
const basicInfoStepRef = ref(null)
const uiConfigFormRef = ref(null)
const paymentConfigFormRef = ref(null)
const adConfigFormRef = ref(null)
const generalConfigFormRef = ref(null)
const autoCreateStep6Ref = ref(null)

// 表单数据模型
// 基本信息和微距配置
const basicInfoForm = ref({
  appName: '',
  platform: '',
  version: '',
  appCode: '',
  product: '',
  customer: '',
  appid: '',
  token_id: null,
  cl: '',
})

// 微距配置
const microConfigForm = ref({
  deliverId: '',
  bannerId: ''
})

// UI信息配置
const uiConfigForm = ref({
  mainTheme: '',
  secondTheme: ''
})

// 支付信息配置
const paymentConfigForm = ref({
  normalPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  orderPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  renewPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  douzuanPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  imPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
})

// 广告信息配置
const adConfigForm = ref({
  rewardAd: { enabled: false, rewardAdId: '', rewardCount: null },
  interstitialAd: { enabled: false, interstitialAdId: '', interstitialCount: null },
  bannerAd: { enabled: false, bannerAdId: '' },
  feedAd: { enabled: false, feedAdId: '' }
})

const stepsData = ref([
  {
    title: '基本信息和微距',
    description: '基本信息和微距'
  },
  {
    title: 'UI信息',
    description: '主题色和其他UI'
  },
  {
    title: '支付信息',
    description: '支付方式和网关'
  },
  {
    title: '广告信息',
    description: '广告类型和广告位ID'
  },
  {
    title: '通用信息',
    description: '其他通用设置'
  },
  {
    title: '确认配置',
    description: '核对所有配置数据并完成创建'
  }
]);

const handleStepClick = (index) => {
  currentStep.value = index;
  currentSubStep.value = 0;
}

// 通用信息配置
const generalConfigForm = ref({
  contact: '',
  payCardStyle: null,
  homeCardStyle: null,
  buildCode: '',
  mineLoginType: 'anonymousLogin',
  readerLoginType: 'anonymousLogin',
  douyinImId: '',
  douyinAppToken: '',
  weixinAppToken: '',
  kuaishouClientId: '',
  kuaishouClientSecret: '',
  kuaishouAppToken: '',
  iaaMode: false,
  iaaDialogStyle: null,
  hidePayEntry:true,
  hideScoreExchange: true,
})

const resetWizard = () => {
  currentStep.value = 0;
  currentSubStep.value = 0;
  basicInfoStepRef.value?.resetFields();
  uiConfigFormRef.value?.resetFields();
  paymentConfigFormRef.value?.resetFields();
  adConfigFormRef.value?.resetFields();
  generalConfigFormRef.value?.resetFields();
  // 清除localStorage中的表单数据
  localStorage.removeItem('autoCreateFormData');
  // 清除内存中存储的数据
  if (window.autoCreateFormData) {
    delete window.autoCreateFormData;
  }
};

// 从全局变量或localStorage加载表单数据
const loadFormDataFromLocalStorage = () => {
  try {
    // 首先尝试从全局变量加载数据
    const storedData = window.autoCreateFormData;
    if (storedData) {
      console.log('从全局变量加载表单数据:', storedData);
      
      // 加载基本信息表单数据（增加空对象默认值防止undefined错误）
      Object.assign(basicInfoForm.value, storedData.basicInfoForm || {});
      
      // 加载微距配置表单数据（增加空对象默认值防止undefined错误）
      Object.assign(basicInfoForm.value, storedData.microConfigForm || {});
      
      // 加载UI配置表单数据（增加空对象默认值防止undefined错误）
      Object.assign(uiConfigForm.value, storedData.uiConfigForm || {});
      
      // 加载支付配置表单数据（增加空对象默认值防止undefined错误）
      Object.assign(paymentConfigForm.value, storedData.paymentConfigForm || {});
      
      // 加载广告配置表单数据（增加空对象默认值防止undefined错误）
      Object.assign(adConfigForm.value, storedData.adConfigForm || {});
      
      // 加载通用配置表单数据（增加空对象默认值防止undefined错误）
      Object.assign(generalConfigForm.value, storedData.generalConfigForm || {});
      
      // 不再立即删除全局变量，以便从AutoCreateStep6返回到FreeLayoutMain时能恢复数据
      // 数据会在FreeLayoutMain成功恢复后自动处理
      return true;
    }
    
    // 如果全局变量没有数据，再尝试从localStorage加载
    const localStorageData = localStorage.getItem('autoCreateFormData');
    if (localStorageData) {
      const formData = JSON.parse(localStorageData);
      
      // 检查数据完整性
      if (formData.basicInfoForm && formData.microConfigForm && formData.uiConfigForm && 
          formData.paymentConfigForm && formData.adConfigForm && formData.generalConfigForm) {
        
        console.log('从localStorage加载表单数据:', formData);
        
        // 加载基本信息表单数据
        Object.assign(basicInfoForm.value, formData.basicInfoForm);
        
        // 加载微距配置表单数据
        Object.assign(microConfigForm.value, formData.microConfigForm || {});
        
        // 加载UI配置表单数据
        Object.assign(uiConfigForm.value, formData.uiConfigForm);
        
        // 加载支付配置表单数据
        Object.assign(paymentConfigForm.value, formData.paymentConfigForm);
        
        // 加载广告配置表单数据
        Object.assign(adConfigForm.value, formData.adConfigForm);
        
        // 加载通用配置表单数据
        Object.assign(generalConfigForm.value, formData.generalConfigForm);
        
        // 加载成功后清除localStorage中的数据，避免重复加载
        localStorage.removeItem('autoCreateFormData');
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to load form data:', error);
  }
  return false;
};

// 组件挂载时检查URL参数和localStorage
onMounted(() => {
  // 检查URL参数中是否指定了步骤
  const stepParam = route.query.step;
  if (stepParam) {
    const stepNum = parseInt(stepParam);
    if (!isNaN(stepNum) && stepNum >= 0 && stepNum < stepsData.value.length) {
      currentStep.value = stepNum;
      
      // 如果是跳转到第6步，尝试从localStorage加载数据
      if (stepNum === 5) {
        // 标记是从FreelayoutMain跳转过来的
        isFromFreelayoutMain.value = true;
        const loaded = loadFormDataFromLocalStorage();
        if (!loaded) {
          ElMessage.warning('无法加载配置数据，请先完成自由编排工作台的配置');
          // 如果加载失败，返回第1步
          currentStep.value = 0;
        } else {
          ElMessage.success('已加载配置数据');
          // 加载成功后不需要额外清除数据，因为loadFormDataFromLocalStorage函数内部已经处理了清除逻辑
        }
      }
    }
  }
});

// 导航函数
const nextStep = async () => {
  // 步骤1的校验
  if (currentStep.value === 0) {
    if (currentSubStep.value === 0) {
      const valid = await basicInfoStepRef.value.validate().catch(() => false);
      if (!valid) {
        ElMessage.error('请填写完整的基本信息！');
        return;
      }
      currentSubStep.value = 1;
      return;
    } else if (currentSubStep.value === 1) {
      const valid = await basicInfoStepRef.value.validate().catch(() => false);
      if (!valid) {
        ElMessage.error('请填写完整的微距配置！');
        return;
      }
    }
  } else if (currentStep.value === 1) {
    // 步骤2的校验
    const valid = await uiConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('请填写完整的UI配置！');
      return;
    }
  } else if (currentStep.value === 2) {
    // 步骤3的校验
    const valid = await paymentConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('请填写完整的支付配置！');
      return;
    }
  } else if (currentStep.value === 3) {
    // 步骤4的校验
    const valid = await adConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('请填写完整的广告配置！');
      return;
    }
  } else if (currentStep.value === 4) {
    // 步骤5的校验
    const valid = await generalConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('请填写完整的通用信息！');
      return;
    }
  }

  if (currentStep.value < stepsData.value.length - 1) {
    currentStep.value++;
    currentSubStep.value = 0;
  }
};

const prevStep = () => {
  if (currentStep.value === 0) {
    if (currentSubStep.value === 1) {
      currentSubStep.value = 0;
      return;
    }
  } else if (currentStep.value === 5) {
    // 修改：如果是从FreelayoutMain跳转过来的，则返回FreelayoutMain
    if (isFromFreelayoutMain.value) {
      router.push({ name: 'FreeLayout' });
      return;
    }
    currentStep.value--;
    currentSubStep.value = 0;
    return;
  } else if (currentStep.value > 0) {
    currentStep.value--;
    currentSubStep.value = 0;
  }
};

// Helper function to map Chinese platform names to English
const mapPlatformToEnglish = (platform) => {
  const platformMap = {
    '抖音': 'douyin',
    '快手': 'kuaishou',
    '微信': 'weixin',
    '百度': 'baidu',
  };
  return platformMap[platform] || platform;
};

const startGeneration = async () => {
  const platform = mapPlatformToEnglish(basicInfoForm.value.platform);
  
  // 收集所有配置数据 - 根据新的数据结构重组
  const params = {
    baseConfig: {
      ...basicInfoForm.value,
      deliverId: basicInfoForm.value.deliverId,
      bannerId: basicInfoForm.value.bannerId
    },
    uiConfig: {
      mainTheme: uiConfigForm.value.mainTheme,
      secondTheme: uiConfigForm.value.secondTheme,
      homeCardStyle: uiConfigForm.value.homeCardStyle,
      payCardStyle: uiConfigForm.value.payCardStyle
    },
    paymentConfig: paymentConfigForm.value,
    adConfig: {
      rewardAd: {
        rewardAdId: adConfigForm.value.rewardAd.rewardAdId,
        rewardCount: adConfigForm.value.rewardAd.rewardCount,
        enabled: adConfigForm.value.rewardAd.enabled,
      },
      interstitialAd: {
        interstitialAdId: adConfigForm.value.interstitialAd.interstitialAdId,
        interstitialCount: adConfigForm.value.interstitialAd.interstitialCount,
        enabled: adConfigForm.value.interstitialAd.enabled,
      },
      // 快手平台独有的广告配置
      bannerAd: platform === 'kuaishou' ? {
        bannerAdId: adConfigForm.value.bannerAd?.bannerAdId,
        enabled: adConfigForm.value.bannerAd?.enabled,
      } : undefined,
      feedAd: platform === 'kuaishou' ? {
        feedAdId: adConfigForm.value.feedAd?.feedAdId,
        enabled: adConfigForm.value.feedAd?.enabled,
      } : undefined
    },
    commonConfig: {
      ...generalConfigForm.value,
      // 移除不再需要的字段
      homeCardStyle: undefined,
      payCardStyle: undefined
    }
  };
  
  // 根据不同平台过滤广告配置
  if (platform === 'weixin') {
    // 微信平台可能不支持某些广告类型 TODO
  } else if (platform === 'baidu') {
    // 百度平台可能有特殊配置需求 TODO
  }
  
  // 根据平台过滤通用配置
  if (platform !== 'douyin') {
    delete params.commonConfig.douyinAppToken;
    delete params.commonConfig.douyinImId;
  }
  
  if (platform !== 'kuaishou') {
    delete params.commonConfig.kuaishouAppToken;
    delete params.commonConfig.kuaishouClientId;
    delete params.commonConfig.kuaishouClientSecret;
  }
  
  if (platform !== 'weixin') {
    delete params.commonConfig.weixinAppToken;
  }
  
  // 过滤undefined值，避免在JSON中显示
  Object.keys(params).forEach(configType => {
    Object.keys(params[configType]).forEach(key => {
      if (params[configType][key] === undefined) {
        delete params[configType][key];
      } else if (typeof params[configType][key] === 'object' && params[configType][key] !== null) {
        // 递归过滤嵌套对象
        Object.keys(params[configType][key]).forEach(nestedKey => {
          if (params[configType][key][nestedKey] === undefined) {
            delete params[configType][key][nestedKey];
          }
        });
      }
    });
  });

  try {
    const res = await request.post('/api/novel-create/createNovelApp', params);
    if (!res || res.code !== 200 || !res.data?.taskId) {
      ElMessage.error(res.message || '创建任务失败');
      return;
    }
    // 将配置数据存储到 Pinia store（如后续页面还需用到）
    // appGenerationStore.setConfigData(configData);
    
    // 清除内存中存储的数据，防止下次进入自由编排时数据依然存在
    if (window.autoCreateFormData) {
      delete window.autoCreateFormData;
    }
    
    // 跳转到生成模块，并带上taskId
    router.push({
      name: 'generate-app',
      query: { taskId: res.data.taskId }
    });
  } catch (e) {
    // ElMessage.error(e.message || '请求失败');
  }
};
</script>

<style scoped>


.workflow-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.workflow-content {
  padding: 10px;
}

.step-panel {
  padding: 10px 0;
  min-height: 250px;
}

.step-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>