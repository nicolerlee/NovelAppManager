<template>
  <div>
    <div class="narrow-form-container">
      <h4>步骤5: 配置通用信息</h4>
    <el-form :model="generalConfigForm" :rules="generalConfigFormRules" ref="generalConfigFormRef" label-width="120px">
      <el-form-item label="客服URL" prop="contact">
        <el-input 
          v-model="generalConfigForm.contact" 
          placeholder="请输入客服URL" 
          @input="handleInputChange('contact')"
        />
      </el-form-item>
      
      <el-form-item label="构建命令" prop="buildCode">
        <el-input 
          v-model="generalConfigForm.buildCode" 
          placeholder="请输入构建命令（输入npm run build:platform(tt/ks/wx..)-xx 的xx即可）"
          @input="handleInputChange('buildCode')"
          :disabled="buildCodeDisabled"
          :loading="generalConfigLoading"
        />
      </el-form-item>

      <!-- 登录类型选择 -->
      <el-form-item label="阅读器登录类型" class="login-type-item" prop="readerLoginType">
        <el-radio-group v-model="generalConfigForm.readerLoginType">
          <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
          <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
        </el-radio-group>
        <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
      </el-form-item>

      <el-form-item label="我的页面登录类型" class="login-type-item" prop="mineLoginType">
        <el-radio-group v-model="generalConfigForm.mineLoginType">
          <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
          <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
        </el-radio-group>
        <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
      </el-form-item>

      <!-- IAA模式选择 -->
      <el-form-item label="IAA模式">
        <div class="form-control-wrapper">
          <el-switch v-model="generalConfigForm.iaaMode" />
          <span class="form-tip">是否开启IAA(In-App-Advertising)模式</span>
        </div>
      </el-form-item>

      <!-- IAA弹窗样式选择 -->
      <el-form-item v-if="generalConfigForm.iaaMode" label="IAA弹窗样式" prop="iaaDialogStyle">
        <el-radio-group v-model="generalConfigForm.iaaDialogStyle" class="iaa-dialog-style-card-group">
          <el-radio-button
            v-for="item in iaaDialogStyleOptions"
            :key="item.value"
            :value="item.value"
            class="iaa-dialog-style-card"
          >
            <div class="iaa-dialog-style-card-inner" :class="{ selected: generalConfigForm.iaaDialogStyle === item.value }">
              <img :src="item.img" :alt="item.label" />
              <div class="iaa-dialog-style-label">{{ item.label }}</div>
            </div>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 特殊功能开关 -->
      <el-form-item label="隐藏支付入口">
        <div class="form-control-wrapper">
          <el-switch v-model="generalConfigForm.hidePayEntry" />
          <span class="form-tip">除微信IOS的非投流渠道，默认不屏蔽。审核失败时候可尝试屏蔽处理</span>
        </div>
      </el-form-item>

      <el-form-item label="隐藏积分兑换">
        <div class="form-control-wrapper">
          <el-switch v-model="generalConfigForm.hideScoreExchange" />
        </div>
      </el-form-item>

      <!-- 平台特定配置 -->
      <div v-if="getCurrentPlatform() !== ''" class="platform-specific-config">
        <h5>{{ getPlatformLabel() }}平台配置</h5>
        
        <template v-if="getCurrentPlatform() === 'douyin'">
          <el-form-item label="抖音IM ID" prop="douyinImId">
            <el-input v-model="generalConfigForm.douyinImId" placeholder="请输入抖音IM ID" />
          </el-form-item>
          <el-form-item label="抖音AppToken" prop="douyinAppToken">
            <el-input
              v-model="generalConfigForm.douyinAppToken"
              type="textarea"
              :rows="6"
              placeholder="请输入抖音AppToken（私钥内容）"
            />
            <span class="form-tip">抖音配置，需要审核时必填，非必填项</span>
          </el-form-item>
        </template>
        
        <template v-if="getCurrentPlatform() === 'weixin'">
          <el-form-item label="微信AppToken" prop="weixinAppToken">
            <el-input
              v-model="generalConfigForm.weixinAppToken"
              type="textarea"
              :rows="6"
              placeholder="请输入微信AppToken（私钥内容）"
            />
          </el-form-item>
        </template>
        
        <template v-if="getCurrentPlatform() === 'kuaishou'">
          <el-form-item label="快手Client ID" prop="kuaishouClientId">
            <el-input v-model="generalConfigForm.kuaishouClientId" placeholder="请输入快手Client ID" />
          </el-form-item>
          <el-form-item label="快手Client Secret" prop="kuaishouClientSecret">
            <el-input v-model="generalConfigForm.kuaishouClientSecret" placeholder="请输入快手Client Secret" show-password />
          </el-form-item>
          <el-form-item label="快手AppToken" prop="kuaishouAppToken">
            <el-input
              v-model="generalConfigForm.kuaishouAppToken"
              type="textarea"
              :rows="6"
              placeholder="请输入快手AppToken（私钥内容）"
            />
          </el-form-item>
        </template>

        <template v-if="getCurrentPlatform() === 'baidu'">
          <el-form-item label="百度AppToken" prop="baiduAppToken">
            <el-input
              v-model="generalConfigForm.baiduAppToken"
              type="textarea"
              :rows="6"
              placeholder="请输入百度AppToken（私钥内容）"
            />
          </el-form-item>
        </template>
      </div>
    </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, toRaw, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import request from '../../utils/request';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      buildCode: '',
      contact: '',
      readerLoginType: 'anonymousLogin',
      mineLoginType: 'anonymousLogin',
      iaaDialogStyle: 1,
      iaaMode: false,
      hidePayEntry: false,
      hideScoreExchange: false,
      douyinAppToken: '',
      douyinImId: '',
      kuaishouAppToken: '',
      kuaishouClientId: '',
      kuaishouClientSecret: '',
      weixinAppToken: ''
    })
  },
  platform: {
    type: String,
    default: 'douyin'
  },
  buildCodeDisabled: {
    type: Boolean,
    default: false
  },
  generalConfigLoading: {
    type: Boolean,
    default: false
  },
  // 添加基本配置属性，与FreeGeneralConfigPanel保持一致
  basicConfig: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// 通用配置表单数据
const generalConfigForm = reactive({ ...toRaw(props.modelValue) });

// 防止循环更新的标志位
let isUpdating = false;

// 构建命令相关状态
const buildCodeDisabled = ref(props.buildCodeDisabled || false);
const generalConfigLoading = ref(props.generalConfigLoading || false);
// 上次查询的appName缓存
const lastQueriedAppName = ref('');

// 请求查询应用通用配置
const fetchAppCommonConfigByAppName = async () => {
  if (!props.basicConfig || !props.basicConfig.appName) {
    return;
  }

  const currentAppName = props.basicConfig.appName;
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
        // 只有当buildCode为空时才更新，避免覆盖用户已输入的内容
        if (!generalConfigForm.buildCode) {
          generalConfigForm.buildCode = appConfig.buildCode;
        }
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

// 监听props变化，更新表单数据
watch(() => props.modelValue, (newVal) => {
  // 如果正在更新中，不执行操作
  if (isUpdating) return;
  
  const newValRaw = toRaw(newVal);
  const currentValRaw = toRaw(generalConfigForm);
  
  // 只有当实际值发生变化时才更新
  if (JSON.stringify(newValRaw) !== JSON.stringify(currentValRaw)) {
    isUpdating = true;
    nextTick(() => {
      Object.assign(generalConfigForm, newValRaw);
      isUpdating = false;
    });
  }
}, { deep: true });

// 监听basicConfig变化，触发通用配置查询
watch(() => props.basicConfig?.appName, (newAppName) => {
  if (newAppName) {
    fetchAppCommonConfigByAppName();
  }
}, { immediate: true });

// 监听props中的buildCodeDisabled变化，同步到组件内部状态
watch(() => props.buildCodeDisabled, (newVal) => {
  if (typeof newVal === 'boolean') {
    buildCodeDisabled.value = newVal;
  }
});

// 监听props中的generalConfigLoading变化，同步到组件内部状态
watch(() => props.generalConfigLoading, (newVal) => {
  if (typeof newVal === 'boolean') {
    generalConfigLoading.value = newVal;
  }
});

// 监听表单数据变化，触发更新事件
watch(generalConfigForm, (newVal) => {
  // 如果正在更新中，不执行操作
  if (isUpdating) return;
  
  const newValRaw = toRaw(newVal);
  const currentPropsRaw = toRaw(props.modelValue);
  
  // 只有当实际值发生变化时才触发emit
  if (JSON.stringify(newValRaw) !== JSON.stringify(currentPropsRaw)) {
    isUpdating = true;
    nextTick(() => {
      emit('update:modelValue', { ...newValRaw });
      isUpdating = false;
    });
  }
}, { deep: true });

// 获取当前平台，优先使用basicConfig中的platform值
const getCurrentPlatform = () => {
  return props.basicConfig?.platform || props.platform;
};

// 获取平台显示标签
const getPlatformLabel = () => {
  const platformMap = {
    'douyin': '抖音',
    'weixin': '微信',
    'kuaishou': '快手',
    'baidu': '百度'
  };
  return platformMap[props.platform] || props.platform;
};

// IAA弹窗样式选项
const iaaDialogStyleOptions = ref([
  { value: 1, label: '样式1', img: '/images/iaaDialogStyle/iaa_dialog_style1.jpg' },
  { value: 2, label: '样式2', img: '/images/iaaDialogStyle/iaa_dialog_style2.jpg' }
]);

// 表单校验规则
const generalConfigFormRules = reactive({
  buildCode: [
    {
      required: true,
      message: '请输入构建命令',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (/^\d+$/.test(value) || /^\d/.test(value)) {
          callback(new Error('构建命令不能为纯数字或以数字开头'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  contact: [
    {
      required: true,
      message: '请输入客服URL',
      trigger: 'blur'
    }
  ],
  readerLoginType: [
    {
      required: true,
      message: '请选择阅读器登录类型',
      trigger: 'change'
    }
  ],
  mineLoginType: [
    {
      required: true,
      message: '请选择我的页面登录类型',
      trigger: 'change'
    }
  ],
  iaaDialogStyle: [
    {
      required: () => generalConfigForm.iaaMode,
      message: '请选择IAA弹窗样式',
      trigger: 'change'
    }
  ]
});

// 输入变化时触发字段验证
const handleInputChange = (field) => {
  if (generalConfigFormRef.value && field === 'buildCode') {
    // 延迟验证，避免频繁触发
    setTimeout(() => {
      generalConfigFormRef.value.validateField(field);
    }, 100);
  }
};

// 监听IAA模式变化
watch(() => generalConfigForm.iaaMode, (val) => {
  // 使用临时变量避免直接触发深度watch循环
  const currentIaaDialogStyle = generalConfigForm.iaaDialogStyle;
  let newValue = { ...generalConfigForm };
  
  if (val && (currentIaaDialogStyle === null || currentIaaDialogStyle === undefined)) {
    newValue.iaaDialogStyle = 1;
  } else if (!val) {
    newValue.iaaDialogStyle = null;
  }
  
  // 只有当实际值发生变化时才触发emit
  if (val && currentIaaDialogStyle !== 1 || !val && currentIaaDialogStyle !== null) {
    nextTick(() => {
      emit('update:modelValue', { ...newValue });
    });
  }
});

// 表单ref和校验暴露
const generalConfigFormRef = ref(null);
const validate = async () => {
  if (!generalConfigFormRef.value) return false;
  const valid = await generalConfigFormRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请填写完整的通用配置！');
    return false;
  }
  return valid;
};

const resetFields = () => {
  generalConfigFormRef.value?.resetFields();
  Object.assign(generalConfigForm, {
    buildCode: '',
    contact: '',
    readerLoginType: 'anonymousLogin',
    mineLoginType: 'anonymousLogin',
    iaaDialogStyle: null,
    iaaMode: false,
    hidePayEntry: false,
    hideScoreExchange: false,
    douyinAppToken: '',
    douyinImId: '',
    kuaishouAppToken: '',
    kuaishouClientId: '',
    kuaishouClientSecret: '',
    weixinAppToken: ''
  });
};

defineExpose({ validate, resetFields });
</script>

<style scoped>
/* 容器样式 */
.narrow-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h4 {
  margin-bottom: 24px;
  text-align: center;
  color: #303133;
  font-weight: 500;
}

/* Element-UI表单默认样式调整 */
.el-form {
  --el-form-item-margin-bottom: 20px;
}

/* 表单控件包装器，确保对齐 */
.form-control-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.form-control-wrapper .el-switch {
  margin-right: 8px;
}

/* 表单提示文本样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

/* 登录类型项的特殊处理 */
.login-type-item .el-form-item__content {
  align-items: flex-start;
}

/* 平台特定配置样式 */
.platform-specific-config {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.platform-specific-config h5 {
  color: #303133;
  font-weight: 500;
  margin-bottom: 16px;
  font-size: 14px;
}

/* IAA弹窗样式卡片布局 */
.iaa-dialog-style-card-group {
  display: flex;
  gap: 20px;
  margin: 12px 0 16px 0;
  flex-wrap: wrap;
}

.iaa-dialog-style-card {
  padding: 0;
  border: none;
  background: none;
  box-shadow: none;
}

.iaa-dialog-style-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  padding: 12px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 100px;
  min-height: 140px;
}

.iaa-dialog-style-card-inner:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.iaa-dialog-style-card-inner.selected {
  background-color: #f0f9ff;
  border-color: #1677ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.iaa-dialog-style-card-inner img {
  width: 120px;
  height: 160px;
  object-fit: contain;
  margin-bottom: 12px;
}

.iaa-dialog-style-label {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .narrow-form-container {
    padding: 0 16px;
  }
  
  .el-form {
    label-width: 100px !important;
  }
  
  .iaa-dialog-style-card-group {
    justify-content: center;
  }
}
</style>