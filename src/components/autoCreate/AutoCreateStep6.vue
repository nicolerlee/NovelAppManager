<template>
  <div class="final-config-container">
    <h4>步骤6: 核对所有配置数据</h4>
    <div class="config-display-area" ref="configDisplayAreaRef">
      <div v-for="(block, name) in formattedConfigData" :key="name" class="config-block">
        <h5>{{ blockTitles[name] || name }}</h5>
        <div class="json-highlight-wrapper">
          <pre v-html="highlightJson(block)"></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';

// 给可滚动的容器添加ref
const configDisplayAreaRef = ref(null);

const props = defineProps({
  basicInfoForm: { type: Object, required: true },
  uiConfigForm: { type: Object, required: true },
  microConfigForm: { type: Object, required: true },
  paymentConfigForm: { type: Object, required: true },
  adConfigForm: { type: Object, required: true },
  generalConfigForm: { type: Object, required: true },
});

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

// Computed property to combine and format all config data
const formattedConfigData = computed(() => {
  const platform = mapPlatformToEnglish(props.basicInfoForm.platform);
  
  const combinedData = {
    baseConfig: {
      appName: props.basicInfoForm.appName,
      appCode: props.basicInfoForm.appCode,
      platform: platform,
      version: props.basicInfoForm.version,
      product: props.basicInfoForm.product,
      customer: props.basicInfoForm.customer,
      appid: props.basicInfoForm.appid,
      tokenId: props.basicInfoForm.token_id,
      cl: props.basicInfoForm.cl,
      deliverId: props.basicInfoForm.deliverId,
      bannerId: props.basicInfoForm.bannerId,
    },
    uiConfig: {
      mainTheme: props.uiConfigForm.mainTheme,
      secondTheme: props.uiConfigForm.secondTheme,
      homeCardStyle: props.uiConfigForm.homeCardStyle,
      payCardStyle: props.uiConfigForm.payCardStyle,
    },
    payConfig: {
      renewPay: props.paymentConfigForm.renewPay,
      normalPay: props.paymentConfigForm.normalPay,
      orderPay: props.paymentConfigForm.orderPay,
      douzuanPay: props.paymentConfigForm.douzuanPay,
      imPay: props.paymentConfigForm.imPay,
      wxVirtualPay: props.paymentConfigForm.wxVirtualPay,
    },
    commonConfig: {
      buildCode: props.generalConfigForm.buildCode,
      contact: props.generalConfigForm.contact,
      douyinAppToken: platform === 'douyin' ? props.generalConfigForm.douyinAppToken : undefined,
      douyinImId: platform === 'douyin' ? props.generalConfigForm.douyinImId : undefined,
      kuaishouAppToken: platform === 'kuaishou' ? props.generalConfigForm.kuaishouAppToken : undefined,
      kuaishouClientId: platform === 'kuaishou' ? props.generalConfigForm.kuaishouClientId : undefined,
      kuaishouClientSecret: platform === 'kuaishou' ? props.generalConfigForm.kuaishouClientSecret : undefined,
      mineLoginType: props.generalConfigForm.mineLoginType,
      iaaMode: props.generalConfigForm.iaaMode,
      iaaDialogStyle: props.generalConfigForm.iaaDialogStyle,
      hidePayEntry: props.generalConfigForm.hidePayEntry,
      hideScoreExchange: props.generalConfigForm.hideScoreExchange,
      readerLoginType: props.generalConfigForm.readerLoginType,
      weixinAppToken: platform === 'weixin' ? props.generalConfigForm.weixinAppToken : undefined,
    },
    adConfig: {
      rewardAd: {
        rewardAdId: props.adConfigForm.rewardAd.rewardAdId,
        rewardCount: props.adConfigForm.rewardAd.rewardCount,
        enabled: props.adConfigForm.rewardAd.enabled,
      },
      interstitialAd: {
        interstitialAdId: props.adConfigForm.interstitialAd.interstitialAdId,
        interstitialCount: props.adConfigForm.interstitialAd.interstitialCount,
        enabled: props.adConfigForm.interstitialAd.enabled,
      },
      // 快手平台独有的广告配置
      bannerAd: platform === 'kuaishou' ? {
        bannerAdId: props.adConfigForm.bannerAd?.bannerAdId,
        enabled: props.adConfigForm.bannerAd?.enabled,
      } : undefined,
      feedAd: platform === 'kuaishou' ? {
        feedAdId: props.adConfigForm.feedAd?.feedAdId,
        enabled: props.adConfigForm.feedAd?.enabled,
      } : undefined
    },
  };
  
  // 根据不同平台过滤广告配置
  if (platform === 'weixin') {
    // 微信平台可能不支持某些广告类型 TODO
  } else if (platform === 'baidu') {
    // 百度平台可能有特殊配置需求 TODO
  }
  
  // 过滤undefined值，避免在JSON中显示
  Object.keys(combinedData).forEach(configType => {
    Object.keys(combinedData[configType]).forEach(key => {
      if (combinedData[configType][key] === undefined) {
        delete combinedData[configType][key];
      } else if (typeof combinedData[configType][key] === 'object' && combinedData[configType][key] !== null) {
        // 递归过滤嵌套对象
        Object.keys(combinedData[configType][key]).forEach(nestedKey => {
          if (combinedData[configType][key][nestedKey] === undefined) {
            delete combinedData[configType][key][nestedKey];
          }
        });
      }
    });
  });

  const formattedBlocks = {};
  for (const key in combinedData) {
    if (combinedData.hasOwnProperty(key)) {
      formattedBlocks[key] = JSON.stringify(combinedData[key], null, 2);
    }
  }
  return formattedBlocks;
});

const blockTitles = {
  baseConfig: '基础配置',
  uiConfig: 'UI配置',
  payConfig: '支付配置',
  commonConfig: '通用配置',
  adConfig: '广告配置',
};

// JSON语法高亮函数
const highlightJson = (jsonStr) => {
  if (!jsonStr) return '';
  
  // 转义HTML特殊字符
  let html = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // 语法高亮规则
  // 字符串
  html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="json-string">$&</span>');
  // 数字
  html = html.replace(/\b\d+\.?\d*\b/g, '<span class="json-number">$&</span>');
  // 布尔值
  html = html.replace(/\b(true|false)\b/g, '<span class="json-boolean">$&</span>');
  // null
  html = html.replace(/\bnull\b/g, '<span class="json-null">$&</span>');
  // 键名
  html = html.replace(/"([^"\\]|\\.)*":/g, '<span class="json-key">$&</span>');
  
  return html;
};

// 暴露scrollToBottom方法，供父组件调用
const scrollToBottom = () => {
  if (configDisplayAreaRef.value) {
    configDisplayAreaRef.value.scrollTo({
      top: configDisplayAreaRef.value.scrollHeight,
      behavior: 'smooth'
    });
    console.log('AutoCreateStep6滚动到底部');
  }
};

defineExpose({
  scrollToBottom
});
</script>

<style scoped>
.final-config-container {
  max-width: 800px;
  margin: 0 auto;
}

.config-display-area {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  max-height: 500px;
  overflow-y: auto;
}

.config-block {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.config-block:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-color: #e6e6e6;
}

.config-block h5 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.config-block pre {
  background: #f6f8fa;
  color: #444;
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 13px;
  padding: 12px 16px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  overflow-x: auto;
  line-height: 1.6;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  border-left: 4px solid #605ce5;
}

/* 优化滚动条样式 */
.config-block pre::-webkit-scrollbar {
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
}

.config-block pre::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}

.config-block pre::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}
  /* JSON语法高亮样式 */
  .json-highlight-wrapper {
    position: relative;
  }
  
  .json-highlight-wrapper pre {
    background: #f6f8fa !important;
    color: #444 !important;
    font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace !important;
    font-size: 13px !important;
    padding: 12px 16px !important;
    border-radius: 6px !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
    margin: 0 !important;
    overflow-x: auto !important;
    line-height: 1.6 !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04) !important;
    border-left: 4px solid #605ce5 !important;
  }
  
  /* JSON元素颜色样式 */
  .json-string {
    color: #e3116c !important;
  }
  
  .json-number {
    color: #098658 !important;
  }
  
  .json-boolean {
    color: #005cc5 !important;
    font-weight: bold !important;
  }
  
  .json-null {
    color: #5f6368 !important;
    font-style: italic !important;
  }
  
  .json-key {
    color: #605ce5 !important;
    font-weight: 600 !important;
  }
  
  /* 增强整体显示效果 */
  h4 {
    color: #303133;
    font-size: 18px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .final-config-container {
      max-width: 100%;
      padding: 0 16px;
    }
    
    .config-block pre {
      font-size: 12px !important;
    }
  }
</style>