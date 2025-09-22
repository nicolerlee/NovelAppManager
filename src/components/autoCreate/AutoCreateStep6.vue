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
  const combinedData = {
    baseConfig: {
      appName: props.basicInfoForm.appName,
      appCode: props.basicInfoForm.appCode,
      platform: mapPlatformToEnglish(props.basicInfoForm.platform),
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
      douyinAppToken: props.generalConfigForm.douyinAppToken,
      douyinImId: props.generalConfigForm.douyinImId,
      kuaishouAppToken: props.generalConfigForm.kuaishouAppToken,
      kuaishouClientId: props.generalConfigForm.kuaishouClientId,
      kuaishouClientSecret: props.generalConfigForm.kuaishouClientSecret,
      mineLoginType: props.generalConfigForm.mineLoginType,
      iaaMode: props.generalConfigForm.iaaMode,
      iaaDialogStyle: props.generalConfigForm.iaaDialogStyle,
      hidePayEntry: props.generalConfigForm.hidePayEntry,
      hideScoreExchange: props.generalConfigForm.hideScoreExchange,
      readerLoginType: props.generalConfigForm.readerLoginType,
      weixinAppToken: props.generalConfigForm.weixinAppToken,
    },
    adConfig: {
      reward: {
        rewardAdId: props.adConfigForm.rewardAd.adUnitId,
        rewardCount: props.adConfigForm.rewardAd.rewardNum,
        isRewardAdEnabled: props.adConfigForm.rewardAd.enabled,
      },
      interstitial: {
        interstitialAdId: props.adConfigForm.interstitialAd.adUnitId,
        interstitialCount: props.adConfigForm.interstitialAd.showNum,
        isInterstitialAdEnabled: props.adConfigForm.interstitialAd.enabled,
      },
      nativeAd: {
        nativeAdId: props.adConfigForm.nativeAd.adUnitId,
        isNativeAdEnabled: props.adConfigForm.nativeAd.enabled,
      },
    },
  };

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