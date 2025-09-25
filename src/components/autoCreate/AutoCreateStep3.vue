<template>
  <div class="wide-form-container">
    <h4>步骤3: 配置支付信息</h4>
    <el-form :model="paymentConfigForm" :rules="paymentConfigFormRules" ref="paymentConfigFormRef" style="width: 100%;">
      <div class="payment-config-grid">
        <!-- 普通支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.normalPay.enabled && paymentConfigForm.normalPay.gatewayAndroid && paymentConfigForm.normalPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Money /></el-icon>
                <div class="payment-type-title">
                  <h4>普通支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfigForm.normalPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfigForm.normalPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfigForm.normalPay.enabled" />
                </div>
                <el-form-item label="网关(A)" prop="normalPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfigForm.normalPay.enabled">
                    <el-input v-model="paymentConfigForm.normalPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="normalPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfigForm.normalPay.enabled">
                    <el-input v-model="paymentConfigForm.normalPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.orderPay.enabled && paymentConfigForm.orderPay.gatewayAndroid && paymentConfigForm.orderPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Goods /></el-icon>
                <div class="payment-type-title">
                  <h4>通用交易支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfigForm.orderPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfigForm.orderPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfigForm.orderPay.enabled" />
                </div>
                <el-form-item label="网关(A)" prop="orderPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfigForm.orderPay.enabled">
                    <el-input v-model="paymentConfigForm.orderPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="orderPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfigForm.orderPay.enabled">
                    <el-input v-model="paymentConfigForm.orderPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 连包支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.renewPay.enabled && paymentConfigForm.renewPay.gatewayAndroid && paymentConfigForm.renewPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Calendar /></el-icon>
                <div class="payment-type-title">
                  <h4>连包支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfigForm.renewPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfigForm.renewPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfigForm.renewPay.enabled" />
                </div>
                <el-form-item label="网关(A)" prop="renewPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfigForm.renewPay.enabled">
                    <el-input v-model="paymentConfigForm.renewPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="renewPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfigForm.renewPay.enabled">
                    <el-input v-model="paymentConfigForm.renewPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 抖钻支付配置 (抖音平台特有) -->
        <template v-if="platform === 'douyin'">
          <el-card class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.douzuanPay.enabled && paymentConfigForm.douzuanPay.gatewayAndroid && paymentConfigForm.douzuanPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Star /></el-icon>
                  <div class="payment-type-title">
                    <h4>抖钻支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfigForm.douzuanPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfigForm.douzuanPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfigForm.douzuanPay.enabled" />
                  </div>
                  <el-form-item label="网关(A)" prop="douzuanPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfigForm.douzuanPay.enabled">
                      <el-input v-model="paymentConfigForm.douzuanPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="douzuanPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfigForm.douzuanPay.enabled">
                      <el-input v-model="paymentConfigForm.douzuanPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>

           <el-card class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.imPay.enabled && paymentConfigForm.imPay.gatewayAndroid && paymentConfigForm.imPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Star /></el-icon>
                  <div class="payment-type-title">
                    <h4>IM支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfigForm.imPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfigForm.imPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfigForm.imPay.enabled" />
                  </div>
                  <el-form-item label="网关(A)" prop="imPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfigForm.imPay.enabled">
                      <el-input v-model="paymentConfigForm.imPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="imPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfigForm.imPay.enabled">
                      <el-input v-model="paymentConfigForm.imPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>
        </template>

        <!-- 微信虚拟支付配置 (微信平台特有) -->
        <template v-if="platform === 'weixin'">
          <el-card class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': paymentConfigForm.wxVirtualPay.enabled && paymentConfigForm.wxVirtualPay.gatewayAndroid && paymentConfigForm.wxVirtualPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Wallet /></el-icon>
                  <div class="payment-type-title">
                    <h4>微信虚拟支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfigForm.wxVirtualPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfigForm.wxVirtualPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfigForm.wxVirtualPay.enabled" />
                  </div>
                  <el-form-item label="网关(A)" prop="wxVirtualPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfigForm.wxVirtualPay.enabled">
                      <el-input v-model="paymentConfigForm.wxVirtualPay.gatewayAndroid" placeholder="请输入网关 (Android)" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="wxVirtualPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfigForm.wxVirtualPay.enabled">
                      <el-input v-model="paymentConfigForm.wxVirtualPay.gatewayIos" placeholder="请输入网关 (iOS)" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>
        </template>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { Money, Goods, Calendar, Star, Wallet } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      normalPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      orderPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      renewPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      douzuanPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      imPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' }
    })
  },
  platform: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// 支付配置表单数据
const paymentConfigForm = reactive({ ...toRaw(props.modelValue) });

// 监听props变化，更新表单数据
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(toRaw(newVal)) !== JSON.stringify(toRaw(paymentConfigForm))) {
    Object.assign(paymentConfigForm, toRaw(newVal));
  }
}, { deep: true });

// 监听表单数据变化，触发更新事件
watch(paymentConfigForm, (newVal) => {
  if (JSON.stringify(toRaw(newVal)) !== JSON.stringify(toRaw(props.modelValue))) {
    emit('update:modelValue', { ...toRaw(newVal) });
  }
}, { deep: true });

// 表单校验规则
const paymentConfigFormRules = reactive({
  'normalPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.normalPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'normalPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.normalPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'orderPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.orderPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'orderPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.orderPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'renewPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.renewPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'renewPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfigForm.renewPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'douzuanPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'douyin' && paymentConfigForm.douzuanPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'douzuanPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'douyin' && paymentConfigForm.douzuanPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'imPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'douyin' && paymentConfigForm.imPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'imPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'douyin' && paymentConfigForm.imPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'wxVirtualPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'weixin' && paymentConfigForm.wxVirtualPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'wxVirtualPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (props.platform === 'weixin' && paymentConfigForm.wxVirtualPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }]
});

// 表单ref和校验暴露
const paymentConfigFormRef = ref(null);
const validate = async () => {
  if (!paymentConfigFormRef.value) return false;
  const valid = await paymentConfigFormRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请填写完整的支付配置！');
    return false;
  }
  
  // 检查是否至少启用了一种支付方式
  const hasEnabledPayment = Object.values(paymentConfigForm).some(payment =>
    payment.enabled &&
    ((payment.gatewayAndroid && payment.gatewayIos) ||
     (props.platform === 'douyin' && payment === paymentConfigForm.douzuanPay) ||
      (props.platform === 'douyin' && payment === paymentConfigForm.imPay) ||
     (props.platform === 'weixin' && payment === paymentConfigForm.wxVirtualPay))
  );
  
  if (!hasEnabledPayment) {
    ElMessage.error('请至少启用并配置一种支付方式！');
    return false;
  }
  
  return valid;
};

const resetFields = () => {
  paymentConfigFormRef.value?.resetFields();
  Object.assign(paymentConfigForm, {
    normalPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    orderPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    renewPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    douzuanPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    imPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' }
  });
};

defineExpose({ validate, resetFields });
</script>

<style scoped>
.wide-form-container {
  max-width: 1000px;
  margin: 0 auto;
}

h4 {
  margin-bottom: 20px;
  text-align: left;
  color: #303133;
}

.payment-config-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 24px;
}

.payment-type-card {
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.payment-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.payment-card-wrapper {
  display: flex;
  flex-direction: column;
}

.payment-card-content {
  padding: 20px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.payment-card-header {
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-card-header.configured {
  background-color: #f0f9eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.payment-type-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-type-info .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.payment-type-title h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.payment-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.payment-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-info-item .label {
  color: #909399;
  font-size: 14px;
}

.gateway-form-item {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 0 !important;
}

.gateway-form-item :deep(.el-form-item__label) {
  flex-shrink: 0;
  text-align: left !important;
  color: #909399;
  font-size: 14px;
  padding: 0 !important;
  margin-right: 12px;
  line-height: var(--el-input-height, 32px);
}

.gateway-form-item :deep(.el-form-item__content) {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 0 !important;
  line-height: var(--el-input-height, 32px);
}

.payment-card-content :deep(.el-form-item) {
  margin-bottom: 22px;
  padding: 0;
  display: block;
}

.payment-card-content :deep(.el-form-item__label) {
  display: flex;
  text-align: right;
  vertical-align: middle;
  font-size: var(--el-form-label-font-size, inherit);
  color: var(--el-text-color-regular);
  line-height: 32px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

.payment-card-content :deep(.el-form-item__content) {
  line-height: 32px;
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.payment-card-content :deep(.el-input) {
  width: 100%;
}

.payment-card-content :deep(.el-input .el-input__inner) {
  text-align: left;
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.payment-card-content :deep(.el-switch) {
  width: auto;
  flex-shrink: 0;
  height: auto;
  line-height: normal;
  display: flex;
  align-items: center;
}
</style>