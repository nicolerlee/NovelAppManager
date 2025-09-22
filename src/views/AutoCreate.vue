<template>
  <div class="auto-create-module">
    <el-card class="workflow-container">
      <template #header>
        <div class="header">
          <h3>创意小程序孵化器 - 创建向导</h3>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import CustomSteps from '../components/common/CustomSteps.vue'
import AutoCreateStep1 from '../components/autoCreate/AutoCreateStep1.vue'
import AutoCreateStep2 from '../components/autoCreate/AutoCreateStep2.vue'
import AutoCreateStep3 from '../components/autoCreate/AutoCreateStep3.vue'
import AutoCreateStep4 from '../components/autoCreate/AutoCreateStep4.vue'
import AutoCreateStep5 from '../components/autoCreate/AutoCreateStep5.vue'
import AutoCreateStep6 from '../components/autoCreate/AutoCreateStep6.vue'
import { useRouter } from 'vue-router'
import { useAppGenerationStore } from '../stores/appGenerationStore'
import request from '../utils/request'

const router = useRouter()
const currentStep = ref(0)
const currentSubStep = ref(0)
const appGenerationStore = useAppGenerationStore()

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
  wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
})

// 广告信息配置
const adConfigForm = ref({
  rewardAd: { enabled: false, adUnitId: '', rewardNum: null },
  interstitialAd: { enabled: false, adUnitId: '', showNum: null },
  nativeAd: { enabled: false, adUnitId: '' },
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
};

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
    currentStep.value--;
    currentSubStep.value = 0;
    return;
  } else if (currentStep.value > 0) {
    currentStep.value--;
    currentSubStep.value = 0;
  }
};

const startGeneration = async () => {
  // 收集所有配置数据 - 根据新的数据结构重组
  const params = {
    baseConfig: {
      ...basicInfoForm.value,
      deliverId: microConfigForm.value.deliverId,
      bannerId: microConfigForm.value.bannerId
    },
    uiConfig: {
      mainTheme: uiConfigForm.value.mainTheme,
      secondTheme: uiConfigForm.value.secondTheme,
      homeCardStyle: generalConfigForm.value.homeCardStyle,
      payCardStyle: generalConfigForm.value.payCardStyle
    },
    paymentConfig: paymentConfigForm.value,
    adConfig: {
      rewardAd: adConfigForm.value.rewardAd,
      interstitialAd: adConfigForm.value.interstitialAd,
      nativeAd: adConfigForm.value.nativeAd
    },
    commonConfig: {
      ...generalConfigForm.value,
      // 移除不再需要的字段
      homeCardStyle: undefined,
      payCardStyle: undefined
    }
  };

  try {
    const res = await request.post('/api/novel-create/createNovelApp', params);
    if (!res || res.code !== 200 || !res.data?.taskId) {
      ElMessage.error(res.message || '创建任务失败');
      return;
    }
    // 将配置数据存储到 Pinia store（如后续页面还需用到）
    // appGenerationStore.setConfigData(configData);
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
. {
  padding: 20px;
}

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