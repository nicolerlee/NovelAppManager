<template>
  <div class="free-pay-config-panel">
    <el-form :model="paymentConfig" :rules="paymentConfigRules" ref="paymentConfigFormRef" style="width: 100%;">
      <div class="payment-config-grid">
        <!-- 普通支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfig.normalPay.enabled && paymentConfig.normalPay.gatewayAndroid && paymentConfig.normalPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Money /></el-icon>
                <div class="payment-type-title">
                  <h4>普通支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfig.normalPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfig.normalPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfig.normalPay.enabled" @change="handlePaymentChange" />
                </div>
                <el-form-item label="网关(A)" prop="normalPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfig.normalPay.enabled">
                    <el-input v-model="paymentConfig.normalPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="normalPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfig.normalPay.enabled">
                    <el-input v-model="paymentConfig.normalPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfig.orderPay.enabled && paymentConfig.orderPay.gatewayAndroid && paymentConfig.orderPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Goods /></el-icon>
                <div class="payment-type-title">
                  <h4>通用交易支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfig.orderPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfig.orderPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfig.orderPay.enabled" @change="handlePaymentChange" />
                </div>
                <el-form-item label="网关(A)" prop="orderPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfig.orderPay.enabled">
                    <el-input v-model="paymentConfig.orderPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="orderPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfig.orderPay.enabled">
                    <el-input v-model="paymentConfig.orderPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 连包支付配置 -->
        <el-card class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': paymentConfig.renewPay.enabled && paymentConfig.renewPay.gatewayAndroid && paymentConfig.renewPay.gatewayIos }">
              <div class="payment-type-info">
                <el-icon><Calendar /></el-icon>
                <div class="payment-type-title">
                  <h4>连包支付</h4>
                </div>
              </div>
              <el-tag size="small" :type="paymentConfig.renewPay.enabled ? 'success' : 'info'" effect="plain">
                {{ paymentConfig.renewPay.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="paymentConfig.renewPay.enabled" @change="handlePaymentChange" />
                </div>
                <el-form-item label="网关(A)" prop="renewPay.gatewayAndroid" class="gateway-form-item">
                  <div v-if="paymentConfig.renewPay.enabled">
                    <el-input v-model="paymentConfig.renewPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                  </div>
                </el-form-item>
                <el-form-item label="网关(I)" prop="renewPay.gatewayIos" class="gateway-form-item">
                  <div v-if="paymentConfig.renewPay.enabled">
                    <el-input v-model="paymentConfig.renewPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
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
              <div class="payment-card-header" :class="{ 'configured': paymentConfig.douzuanPay.enabled && paymentConfig.douzuanPay.gatewayAndroid && paymentConfig.douzuanPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Star /></el-icon>
                  <div class="payment-type-title">
                    <h4>抖钻支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfig.douzuanPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfig.douzuanPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfig.douzuanPay.enabled" @change="handlePaymentChange" />
                  </div>
                  <el-form-item label="网关(A)" prop="douzuanPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfig.douzuanPay.enabled">
                      <el-input v-model="paymentConfig.douzuanPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="douzuanPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfig.douzuanPay.enabled">
                      <el-input v-model="paymentConfig.douzuanPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>

            <el-card class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': paymentConfig.imPay.enabled && paymentConfig.imPay.gatewayAndroid && paymentConfig.imPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Star /></el-icon>
                  <div class="payment-type-title">
                    <h4>IM支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfig.imPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfig.imPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfig.imPay.enabled" @change="handlePaymentChange" />
                  </div>
                  <el-form-item label="网关(A)" prop="imPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfig.imPay.enabled">
                      <el-input v-model="paymentConfig.imPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="imPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfig.imPay.enabled">
                      <el-input v-model="paymentConfig.imPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
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
              <div class="payment-card-header" :class="{ 'configured': paymentConfig.wxVirtualPay.enabled && paymentConfig.wxVirtualPay.gatewayAndroid && paymentConfig.wxVirtualPay.gatewayIos }">
                <div class="payment-type-info">
                  <el-icon><Wallet /></el-icon>
                  <div class="payment-type-title">
                    <h4>微信虚拟支付</h4>
                  </div>
                </div>
                <el-tag size="small" :type="paymentConfig.wxVirtualPay.enabled ? 'success' : 'info'" effect="plain">
                  {{ paymentConfig.wxVirtualPay.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="paymentConfig.wxVirtualPay.enabled" @change="handlePaymentChange" />
                  </div>
                  <el-form-item label="网关(A)" prop="wxVirtualPay.gatewayAndroid" class="gateway-form-item">
                    <div v-if="paymentConfig.wxVirtualPay.enabled">
                      <el-input v-model="paymentConfig.wxVirtualPay.gatewayAndroid" placeholder="请输入网关 (Android)" @input="handleConfigChange" />
                    </div>
                  </el-form-item>
                  <el-form-item label="网关(I)" prop="wxVirtualPay.gatewayIos" class="gateway-form-item">
                    <div v-if="paymentConfig.wxVirtualPay.enabled">
                      <el-input v-model="paymentConfig.wxVirtualPay.gatewayIos" placeholder="请输入网关 (iOS)" @input="handleConfigChange" />
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, Goods, Calendar, Star, Wallet } from '@element-plus/icons-vue'
import { toRaw } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      normalPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      orderPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      renewPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      douzuanPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      imPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
      wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    })
  },
  platform: {
    type: String,
    default: 'douyin'
  }
})

const emit = defineEmits(['update:modelValue', 'configChange'])

// 内部响应式数据，从modelValue初始化
const paymentConfig = reactive({ ...toRaw(props.modelValue) })

// 表单引用
const paymentConfigFormRef = ref(null)

// 表单校验规则
const paymentConfigRules = reactive({
  'normalPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.normalPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'normalPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.normalPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'orderPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.orderPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'orderPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.orderPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'renewPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.renewPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'renewPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.renewPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'douzuanPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.douzuanPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'douzuanPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.douzuanPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
    'imPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.imPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'imPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.imPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'wxVirtualPay.gatewayAndroid': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.wxVirtualPay.enabled && !value) {
        callback(new Error('请输入网关 (Android)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'wxVirtualPay.gatewayIos': [{
    validator: (rule, value, callback) => {
      if (paymentConfig.wxVirtualPay.enabled && !value) {
        callback(new Error('请输入网关 (iOS)'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
})

// 监听外部modelValue变化，同步到内部状态
watch(() => props.modelValue, (newValue) => {
  Object.assign(paymentConfig, toRaw(newValue))
}, { deep: true })

// 处理支付状态变更
const handlePaymentChange = () => {
  // 触发表单重新校验
  paymentConfigFormRef.value?.clearValidate()
  // 发送配置变更事件
  emitConfigChange()
}

// 处理配置变更
const handleConfigChange = () => {
  // 发送配置变更事件
  emitConfigChange()
}

// 发送配置变更事件
const emitConfigChange = () => {
  // 通过v-model更新父组件数据
  emit('update:modelValue', { ...paymentConfig })
  // 额外发送configChange事件以便父组件处理
  emit('configChange', { ...paymentConfig })
}

// 校验表单
const validate = () => {
  return new Promise((resolve) => {
    paymentConfigFormRef.value?.validate((valid) => {
      resolve(valid)
    })
  })
}

// 重置表单
const resetFields = () => {
  paymentConfigFormRef.value?.resetFields()
  Object.assign(paymentConfig, {
    normalPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    orderPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    renewPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    douzuanPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    imPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
    wxVirtualPay: { enabled: false, gatewayAndroid: '', gatewayIos: '' },
  })
  emitConfigChange()
}

// 导出方法供父组件调用
defineExpose({
  validate,
  resetFields
})
</script>

<style scoped>
.free-pay-config-panel {
  padding: 5px 0;
  overflow-x: hidden;
}

/* 优化网格布局，适应属性面板的空间 */
.payment-config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 8px;
  max-height: 600px;
  overflow-y: auto;
}

/* 调整卡片尺寸 */
.payment-type-card {
  transition: all 0.3s ease;
  border: none;
  border-radius: 6px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.payment-type-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.07);
}

.payment-card-wrapper {
  display: flex;
  flex-direction: column;
}

/* 优化卡片内容区域 */
.payment-card-content {
  padding: 12px;
  min-height: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.payment-card-content :deep(.el-form-item) {
  margin-bottom: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  width: 100%;
}

.payment-card-content :deep(.el-form-item__label) {
  text-align: right;
  vertical-align: middle;
  font-size: 12px;
  color: #606266;
  line-height: 24px;
  padding: 0 8px 0 0;
  box-sizing: border-box;
  white-space: nowrap;
  width: 50px;
  flex-shrink: 0;
}

.payment-card-content :deep(.el-form-item__content) {
  line-height: 24px;
  position: relative;
  font-size: 12px;
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 0;
}

.payment-card-content :deep(.el-input) {
  width: 100%;
}

.payment-card-content :deep(.el-input .el-input__inner) {
  text-align: left;
  color: #303133;
  font-size: 12px;
  height: 24px;
  line-height: 24px;
}

.payment-card-content :deep(.el-switch) {
  width: auto;
  flex-shrink: 0;
  height: auto;
  line-height: normal;
  display: flex;
  align-items: center;
}

.payment-info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.payment-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-info-item .label {
  color: #606266;
  font-size: 12px;
}

.payment-info-item .value {
  color: #303133;
  font-weight: 500;
}

/* 优化卡片头部 */
.payment-card-header {
  padding: 10px 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
}

.payment-card-header.configured {
  background-color: #f0f9eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.payment-card-header :deep(.el-tag.el-tag--success.el-tag--plain) {
  background-color: var(--el-tag-bg-color, var(--el-fill-color-light));
  border-color: var(--el-tag-border-color, var(--el-border-color-light));
  color: var(--el-tag-text-color, var(--el-color-success));
  font-size: 10px;
  height: 20px;
  line-height: 18px;
}

.payment-type-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-type-info .el-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.payment-type-title {
  display: flex;
  flex-direction: column;
}

.payment-type-title h4 {
  margin: 0;
  font-size: 13px;
  color: #303133;
}

.gateway-form-item {
  display: flex !important;
  justify-content: space-between !important;
}

/* 优化滚动条样式 */
.payment-config-grid::-webkit-scrollbar {
  width: 4px;
}

.payment-config-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.payment-config-grid::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.payment-config-grid::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 确保在不同宽度下都能正常显示 */
@media (max-width: 480px) {
  .payment-config-grid {
    gap: 8px;
    padding: 5px;
  }
  
  .payment-card-header {
    padding: 8px 10px;
  }
  
  .payment-card-content {
    padding: 8px;
  }
  
  .payment-type-title h4 {
    font-size: 12px;
  }
}
</style>