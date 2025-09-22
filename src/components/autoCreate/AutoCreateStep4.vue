<template>
  <div class="config-panel">
    <h4>步骤4: 配置广告信息</h4>
    <el-form :model="adConfig" :rules="adConfigFormRules" ref="adConfigFormRef" style="width: 100%;">
      <div class="payment-config-grid">
        <!-- 激励广告配置 - 所有平台通用 -->
        <el-card v-if="currentPlatform === 'douyin' || currentPlatform === 'kuaishou' || currentPlatform === 'xiaohongshu'" class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': adConfig.rewardAd.enabled && adConfig.rewardAd.rewardAdId && adConfig.rewardAd.rewardCount > 0 }">
              <div class="payment-type-info">
                <el-icon><VideoPlay /></el-icon>
                <div class="payment-type-title">
                  <h4>激励广告</h4>
                </div>
              </div>
              <el-tag size="small" :type="adConfig.rewardAd.enabled ? 'success' : 'info'" effect="plain">
                {{ adConfig.rewardAd.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="adConfig.rewardAd.enabled" @change="handleAdTypeChange('rewardAd')" />
                </div>
                <el-form-item label="广告位ID" prop="rewardAd.rewardAdId" class="gateway-form-item">
                  <div v-if="adConfig.rewardAd.enabled">
                    <el-input v-model="adConfig.rewardAd.rewardAdId" placeholder="请输入激励广告ID" />
                  </div>
                </el-form-item>
                <el-form-item label="激励次数" prop="rewardAd.rewardCount" class="gateway-form-item">
                  <div v-if="adConfig.rewardAd.enabled">
                    <el-input-number v-model="adConfig.rewardAd.rewardCount" :min="1" style="width: 100%;" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 插屏广告配置 - 所有平台通用 -->
          <el-card v-if="currentPlatform === 'douyin' || currentPlatform === 'kuaishou' || currentPlatform === 'weixin'" class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': adConfig.interstitialAd.enabled && adConfig.interstitialAd.interstitialAdId && adConfig.interstitialAd.interstitialCount > 0 }">
              <div class="payment-type-info">
                <el-icon><Picture /></el-icon>
                <div class="payment-type-title">
                  <h4>插屏广告</h4>
                </div>
              </div>
              <el-tag size="small" :type="adConfig.interstitialAd.enabled ? 'success' : 'info'" effect="plain">
                {{ adConfig.interstitialAd.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="adConfig.interstitialAd.enabled" @change="handleAdTypeChange('interstitialAd')" />
                </div>
                <el-form-item label="广告位ID" prop="interstitialAd.interstitialAdId" class="gateway-form-item">
                  <div v-if="adConfig.interstitialAd.enabled">
                    <el-input v-model="adConfig.interstitialAd.interstitialAdId" placeholder="请输入插屏广告ID" />
                  </div>
                </el-form-item>
                <el-form-item label="展示次数" prop="interstitialAd.interstitialCount" class="gateway-form-item">
                  <div v-if="adConfig.interstitialAd.enabled">
                    <el-input-number v-model="adConfig.interstitialAd.interstitialCount" :min="1" style="width: 100%;" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 信息流广告配置 - 所有平台通用 -->
          <el-card v-if="currentPlatform === 'douyin' || currentPlatform === 'weixin'" class="payment-type-card" :body-style="{ padding: '0' }">
          <div class="payment-card-wrapper">
            <div class="payment-card-header" :class="{ 'configured': adConfig.nativeAd.enabled && adConfig.nativeAd.nativeAdId }">
              <div class="payment-type-info">
                <el-icon><Document /></el-icon>
                <div class="payment-type-title">
                  <h4>信息流广告</h4>
                </div>
              </div>
              <el-tag size="small" :type="adConfig.nativeAd.enabled ? 'success' : 'info'" effect="plain">
                {{ adConfig.nativeAd.enabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>

            <div class="payment-card-content">
              <div class="payment-info-list">
                <div class="payment-info-item">
                  <span class="label">状态</span>
                  <el-switch v-model="adConfig.nativeAd.enabled" @change="handleAdTypeChange('nativeAd')" />
                </div>
                <el-form-item label="广告位ID" prop="nativeAd.nativeAdId" class="gateway-form-item">
                  <div v-if="adConfig.nativeAd.enabled">
                    <el-input v-model="adConfig.nativeAd.nativeAdId" placeholder="请输入信息流广告ID" />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-card>
        </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { VideoPlay, Picture, Document } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      rewardAd: {
        enabled: false,
        rewardAdId: '',
        rewardCount: 1
      },
      interstitialAd: {
        enabled: false,
        interstitialAdId: '',
        interstitialCount: 1
      },
      nativeAd: {
        enabled: false,
        nativeAdId: ''
      }
    })
  },
  platform: {
    type: String,
    default: 'douyin'
  }
});

// 获取当前平台
const currentPlatform = computed(() => {
  return props.platform;
});

const emit = defineEmits(['update:modelValue']);

// 内部响应式表单，从modelValue初始化
const adConfig = reactive({ ...props.modelValue });

// 表单引用
const adConfigFormRef = ref(null);

// 处理广告类型开关变化
const handleAdTypeChange = (adType) => {
  // 当关闭广告类型时清空对应的广告位ID
  if (!adConfig[adType].enabled) {
    // 使用正确的属性名称
    if (adType === 'rewardAd') {
      adConfig[adType].rewardAdId = '';
      adConfig[adType].rewardCount = 1;
    } else if (adType === 'interstitialAd') {
      adConfig[adType].interstitialAdId = '';
      adConfig[adType].interstitialCount = 1;
    } else if (adType === 'nativeAd') {
      adConfig[adType].nativeAdId = '';
    }
  }
};

// 表单验证规则
const adConfigFormRules = reactive({
  'rewardAd.rewardAdId': [{
    validator: (rule, value, callback) => {
      if (adConfig.rewardAd.enabled && !value) {
        callback(new Error('请输入激励广告ID'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'rewardAd.rewardCount': [{
    validator: (rule, value, callback) => {
      if (adConfig.rewardAd.enabled) {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          callback(new Error('请输入有效激励次数'));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'interstitialAd.interstitialAdId': [{
    validator: (rule, value, callback) => {
      if (adConfig.interstitialAd.enabled && !value) {
        callback(new Error('请输入插屏广告ID'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'interstitialAd.interstitialCount': [{
    validator: (rule, value, callback) => {
      if (adConfig.interstitialAd.enabled && (!value || value <= 0)) {
        callback(new Error('请输入有效展示次数'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'nativeAd.nativeAdId': [{
    validator: (rule, value, callback) => {
      if (adConfig.nativeAd.enabled && !value) {
        callback(new Error('请输入信息流广告ID'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }]
});

// 监听配置变化，同步到父组件
watch(
  adConfig,
  (newValue) => {
    // 使用nextTick避免立即触发反向更新
    nextTick(() => {
      emit('update:modelValue', { ...newValue });
    });
  },
  { deep: true }
);

// 监听父组件传递的modelValue变化，更新内部配置
watch(
  () => props.modelValue,
  (newValue) => {
    // 避免在组件初始化时的循环更新
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(adConfig)) {
      // 深拷贝新值到adConfig
      Object.keys(newValue).forEach(key => {
        if (typeof newValue[key] === 'object' && newValue[key] !== null) {
          adConfig[key] = { ...newValue[key] };
        } else {
          adConfig[key] = newValue[key];
        }
      });
    }
  },
  { deep: true, immediate: false }
);

// 验证广告配置是否完整
const validate = async () => {
  try {
    if (!adConfigFormRef.value) return false;
    
    // 验证表单字段
    const valid = await adConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('请填写完整的广告配置！');
      return false;
    }
    
    // 检查是否至少启用了一种广告方式
    const hasEnabledAd = () => {
      const adsToCheck = [];
      
      // 根据当前平台决定需要检查的广告类型
      if (currentPlatform.value === 'douyin' || currentPlatform.value === 'kuaishou' || currentPlatform.value === 'xiaohongshu') {
        adsToCheck.push(adConfig.rewardAd);
      }
      
      if (currentPlatform.value === 'douyin' || currentPlatform.value === 'kuaishou' || currentPlatform.value === 'weixin') {
        adsToCheck.push(adConfig.interstitialAd);
      }
      
      if (currentPlatform.value === 'douyin' || currentPlatform.value === 'weixin') {
        adsToCheck.push(adConfig.nativeAd);
      }
      
      // 检查是否有启用的广告类型
      return adsToCheck.some(ad => 
        ad.enabled && 
        ((ad.rewardAdId || ad.interstitialAdId || ad.nativeAdId) &&
         (!ad.rewardCount || ad.rewardCount > 0) &&
         (!ad.interstitialCount || ad.interstitialCount > 0))
      );
    };
    
    if (!hasEnabledAd()) {
      ElMessage.warning('建议至少启用一种广告方式！');
    }
    
    return valid;
  } catch (error) {
    ElMessage.error('广告配置验证失败，请检查必填项');
    return false;
  }
};

const resetFields = () => {
  adConfigFormRef.value?.resetFields();
  Object.assign(adConfig, {
    rewardAd: {
      enabled: false,
      rewardAdId: '',
      rewardCount: 1
    },
    interstitialAd: {
      enabled: false,
      interstitialAdId: '',
      interstitialCount: 1
    },
    nativeAd: {
      enabled: false,
      nativeAdId: ''
    }
  });
};

defineExpose({ validate, resetFields });
</script>

<style scoped>
.config-panel {
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

.payment-type-title {
  display: flex;
  flex-direction: column;
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
}

/* 确保在不同宽度下都能正常显示 */
@media (max-width: 768px) {
  .payment-config-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .payment-config-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>