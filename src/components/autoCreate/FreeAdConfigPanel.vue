<template>
  <div class="config-panel">
     <el-form :model="adConfig" :rules="adConfigFormRules" ref="adConfigFormRef" style="width: 100%;">
        <div class="payment-config-grid">
          <!-- 激励广告配置 - 抖音、快手平台 -->
          <el-card v-if="currentPlatform === 'douyin' || currentPlatform === 'kuaishou'" class="payment-type-card" :body-style="{ padding: '0' }">
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
                      <el-input-number v-model="adConfig.rewardAd.rewardCount" :min="1" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 插屏广告配置 - 抖音、快手平台 -->
          <el-card v-if="currentPlatform === 'douyin' || currentPlatform === 'kuaishou'" class="payment-type-card" :body-style="{ padding: '0' }">
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

          <!-- Banner广告配置 - 快手平台 -->
          <el-card v-if="currentPlatform === 'kuaishou'" class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': adConfig.bannerAd.enabled && adConfig.bannerAd.bannerAdId }">
                <div class="payment-type-info">
                  <el-icon><Monitor /></el-icon>
                  <div class="payment-type-title">
                    <h4>Banner广告</h4>
                  </div>
                </div>
                <el-tag size="small" :type="adConfig.bannerAd.enabled ? 'success' : 'info'" effect="plain">
                  {{ adConfig.bannerAd.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="adConfig.bannerAd.enabled" @change="handleAdTypeChange('bannerAd')" />
                  </div>
                  <el-form-item label="广告位ID" prop="bannerAd.bannerAdId" class="gateway-form-item">
                    <div v-if="adConfig.bannerAd.enabled">
                      <el-input v-model="adConfig.bannerAd.bannerAdId" placeholder="请输入Banner广告ID" />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 信息流广告配置 - 快手平台 -->
          <el-card v-if="currentPlatform === 'kuaishou'" class="payment-type-card" :body-style="{ padding: '0' }">
            <div class="payment-card-wrapper">
              <div class="payment-card-header" :class="{ 'configured': adConfig.feedAd.enabled && adConfig.feedAd.feedAdId }">
                <div class="payment-type-info">
                  <el-icon><Document /></el-icon>
                  <div class="payment-type-title">
                    <h4>信息流广告</h4>
                  </div>
                </div>
                <el-tag size="small" :type="adConfig.feedAd.enabled ? 'success' : 'info'" effect="plain">
                  {{ adConfig.feedAd.enabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>

              <div class="payment-card-content">
                <div class="payment-info-list">
                  <div class="payment-info-item">
                    <span class="label">状态</span>
                    <el-switch v-model="adConfig.feedAd.enabled" @change="handleAdTypeChange('feedAd')" />
                  </div>
                  <el-form-item label="广告位ID" prop="feedAd.feedAdId" class="gateway-form-item">
                    <div v-if="adConfig.feedAd.enabled">
                      <el-input v-model="adConfig.feedAd.feedAdId" placeholder="请输入信息流广告ID" />
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
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Picture, Document, Monitor } from '@element-plus/icons-vue'

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
      bannerAd: {
        enabled: false,
        bannerAdId: ''
      },
      feedAd: {
        enabled: false,
        feedAdId: ''
      }
    })
  },
  platform: {
    type: String,
    default: 'douyin'
  }
})

// 获取当前平台
const currentPlatform = computed(() => {
  return props.platform;
});

const emit = defineEmits(['update:modelValue'])

// 内部响应式表单，从modelValue初始化
const adConfig = reactive({ ...props.modelValue })

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
    } else if (adType === 'bannerAd') {
      adConfig[adType].bannerAdId = '';
    } else if (adType === 'feedAd') {
      adConfig[adType].feedAdId = '';
    }
  }
};

// 表单引用
const adConfigFormRef = ref(null)

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
  'bannerAd.bannerAdId': [{
    validator: (rule, value, callback) => {
      if (adConfig.bannerAd.enabled && !value) {
        callback(new Error('请输入Banner广告ID'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'feedAd.feedAdId': [{
    validator: (rule, value, callback) => {
      if (adConfig.feedAd.enabled && !value) {
        callback(new Error('请输入信息流广告ID'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
})

// 监听配置变化，同步到父组件
// 使用防抖和值比较避免循环更新
let updateTimer = null;
watch(
  adConfig,
  (newValue) => {
    // 清除之前的定时器
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
    // 使用定时器防抖
    updateTimer = setTimeout(() => {
      // 只有当值确实变化时才触发更新
      if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
        emit('update:modelValue', { ...newValue });
      }
    }, 100); // 100ms防抖
  },
  { deep: true }
)

// 移除监听父组件modelValue的监听器，避免循环更新
// 内部配置由父组件通过props初始化，后续更新通过用户操作触发emit，不再需要从父组件同步回来


// 验证广告配置是否完整
const validateForm = async () => {
  try {
    if (!adConfigFormRef.value) return false;
    
    // 验证表单字段
    const valid = await adConfigFormRef.value.validate().catch(() => false);
    if (!valid) {
      ElMessage.error('广告配置验证失败，请检查必填项');
      return false;
    }
    
    // 检查是否至少启用了一种广告方式
    const hasEnabledAd = () => {
      const adsToCheck = [];
      
      // 根据当前平台决定需要检查的广告类型
      if (currentPlatform.value === 'douyin' || currentPlatform.value === 'kuaishou') {
        adsToCheck.push(adConfig.rewardAd);
        adsToCheck.push(adConfig.interstitialAd);
      }
      
      if (currentPlatform.value === 'kuaishou') {
        adsToCheck.push(adConfig.bannerAd);
        adsToCheck.push(adConfig.feedAd);
      }
      
      // 检查是否有启用的广告类型
      return adsToCheck.some(ad => 
        ad.enabled && 
        ((ad.rewardAdId || ad.interstitialAdId || ad.bannerAdId || ad.feedAdId) &&
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
}

// 暴露验证方法给父组件
defineExpose({
  validateForm
})
</script>

<style scoped>
.config-panel {
  height: 100%;
  overflow-y: auto;
}

.config-panel-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.config-panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

/* 固定为2列布局 */
.payment-config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 8px;
  max-height: 600px;
  overflow-y: auto;
}

/* .payment-type-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  min-width: 0;
} */

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
  position: relative;
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

.payment-card-content {
  padding: 12px;
}

.payment-info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 12px;
  color: #606266;
}

.gateway-form-item {
  margin-bottom: 10px;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
}

/* 确保标签与输入框保持水平并适当减少输入框宽度 */
.gateway-form-item :deep(.el-form-item__content) {
  flex: 1 !important;
  margin-left: 0 !important;
}

.gateway-form-item :deep(.el-input),
.gateway-form-item :deep(.el-input-number) {
  width: 100% !important;
  min-width: 100px;
  max-width: 140px;
}

/* 调整标签样式 */
.gateway-form-item :deep(.el-form-item__label) {
  font-size: 12px !important;
  padding-right: 0 !important;
  min-width: 60px !important;
  text-align: left !important;
}

.gateway-form-item:last-child {
  margin-bottom: 0;
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