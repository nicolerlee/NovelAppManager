<template>
  <div class="final-config-container">
    <h4>步骤6: 核对所有配置数据</h4>
    <div class="config-display-area">
      <div v-for="(block, name) in formattedConfigData" :key="name" class="config-block">
        <h5>{{ blockTitles[name] || name }}</h5>
        <pre>{{ block }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

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
</script>

<style scoped>
.final-config-container {
  max-width: 800px;
  margin: 0 auto;
}

.config-display-area {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.config-block {
  margin-bottom: 20px;
}

.config-block h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
}

.config-block pre {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}
</style>