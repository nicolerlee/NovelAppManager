<template>
  <div class="general-config-panel">
    <el-form-item label="客服URL" prop="contact">
      <el-input 
        v-model="generalConfig.contact" 
        placeholder="请输入客服URL" 
        @input="handleInputChange('contact')"
      />
    </el-form-item>
    <el-form-item label="构建命令" prop="buildCode">
      <el-input 
        v-model="generalConfig.buildCode" 
        placeholder="请输入构建命令（输入npm run build:platform(tt/ks/wx..)-xx 的xx即可）"
        @input="handleInputChange('buildCode')"
      />
    </el-form-item>
    
    <!-- 平台特定配置 -->
    <template v-if="getCurrentPlatform() === 'douyin'">
      <el-form-item label="抖音IM ID" prop="douyinImId">
        <el-input v-model="generalConfig.douyinImId" placeholder="请输入抖音IM ID" />
      </el-form-item>
      <el-form-item label="抖音AppToken" prop="douyinAppToken">
        <el-input
          v-model="generalConfig.douyinAppToken"
          type="textarea"
          :rows="6"
          placeholder="请输入抖音AppToken（私钥内容）"
        />
      </el-form-item>
    </template>
    
    <template v-if="getCurrentPlatform() === 'weixin'">
      <el-form-item label="微信AppToken" prop="weixinAppToken">
        <el-input
          v-model="generalConfig.weixinAppToken"
          type="textarea"
          :rows="6"
          placeholder="请输入微信AppToken（私钥内容）"
        />
      </el-form-item>
    </template>
    
    <template v-if="getCurrentPlatform() === 'kuaishou'">
      <el-form-item label="快手Client ID" prop="kuaishouClientId">
        <el-input v-model="generalConfig.kuaishouClientId" placeholder="请输入快手Client ID" />
      </el-form-item>
      <el-form-item label="快手Client Secret" prop="kuaishouClientSecret">
        <el-input v-model="generalConfig.kuaishouClientSecret" placeholder="请输入快手Client Secret" show-password />
      </el-form-item>
      <el-form-item label="快手AppToken" prop="kuaishouAppToken">
        <el-input
          v-model="generalConfig.kuaishouAppToken"
          type="textarea"
          :rows="6"
          placeholder="请输入快手AppToken（私钥内容）"
        />
      </el-form-item>
    </template>
    
    <el-form-item label="IAA模式">
      <el-switch v-model="generalConfig.iaaMode" />
      <span class="form-tip">是否开启IAA(In-App-Advertising)模式</span>
    </el-form-item>
    
    <el-form-item v-if="generalConfig.iaaMode" label="IAA弹窗样式" prop="iaaDialogStyle">
      <el-radio-group v-model="generalConfig.iaaDialogStyle" class="iaa-dialog-style-card-group">
        <el-radio-button
          v-for="item in iaaDialogStyleOptions"
          :key="item.value"
          :value="item.value"
          class="iaa-dialog-style-card"
        >
          <div class="iaa-dialog-style-card-inner" :class="{ selected: generalConfig.iaaDialogStyle === item.value }">
            <img :src="item.img" :alt="item.label" />
            <div class="iaa-dialog-style-label">{{ item.label }}</div>
          </div>
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    
    <el-form-item label="屏蔽支付入口">
      <el-switch v-model="generalConfig.hidePayEntry" />
      <span class="form-tip">除微信IOS的非投流渠道，默认不屏蔽。审核失败时候可尝试屏蔽处理</span>
    </el-form-item>
    
    <el-form-item label="屏蔽积分入口">
      <el-switch v-model="generalConfig.hideScoreExchange" />
    </el-form-item>
    
    <el-form-item label="我的页登录类型" class="login-type-item" prop="mineLoginType">
      <el-radio-group v-model="generalConfig.mineLoginType" class="platform-radio-group">
        <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
        <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
      </el-radio-group>
      <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
    </el-form-item>
    
    <el-form-item label="阅读页登录类型" class="login-type-item" prop="readerLoginType">
      <el-radio-group v-model="generalConfig.readerLoginType" class="platform-radio-group">
        <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
        <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
      </el-radio-group>
      <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, nextTick,watch } from 'vue';

// 定义props
const props = defineProps({
  generalConfig: {
    type: Object,
    required: true
  },
  basicConfig: {
    type: Object,
    required: true
  },
  formRef: {
    type: Object,
    required: true
  }
});

// 定义emits
const emit = defineEmits(['update:generalConfig']);

// IAA弹窗样式选项
const iaaDialogStyleOptions = ref([
  { value: 1, label: '样式1', img: '/images/iaaDialogStyle/iaa_dialog_style1.jpg' },
  { value: 2, label: '样式2', img: '/images/iaaDialogStyle/iaa_dialog_style2.jpg' }
]);

// 获取当前平台
const getCurrentPlatform = () => {
  return props.basicConfig?.platform || 'douyin';
};

// 输入变化时触发字段验证
const handleInputChange = (field) => {
  if (props.formRef && field === 'buildCode') {
    // 延迟验证，避免频繁触发
    setTimeout(() => {
      props.formRef.validateField(field);
    }, 100);
  }
};

// 监听IAA模式变化
watch(() => props.generalConfig.iaaMode, (val) => {
  if (val && (props.generalConfig.iaaDialogStyle === null || props.generalConfig.iaaDialogStyle === undefined)) {
    nextTick(() => {
      emit('update:generalConfig', {
        ...props.generalConfig,
        iaaDialogStyle: 1
      });
    });
  }
  if (!val) {
    emit('update:generalConfig', {
      ...props.generalConfig,
      iaaDialogStyle: null
    });
  }
});
</script>

<style scoped>
.general-config-panel {
  padding: 0;
}

.platform-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-input, .el-select {
  width: 100%;
  max-width: 280px;
}

.el-form-item__label {
  padding-right: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

/* IAA弹窗样式卡片布局 */
.iaa-dialog-style-card-group {
  display: flex;
  gap: 12px;
  margin: 12px 0 32px 0;
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
  border-radius: 6px;
  background: #fff;
  padding: 2px 8px 2px 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  min-width: 140px;
  min-height: 180px;
}

.iaa-dialog-style-card-inner:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.iaa-dialog-style-card-inner.selected {
  background-color: #f0f9ff;
  border-color: #1677ff;
}

.iaa-dialog-style-card-inner img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
}

.iaa-dialog-style-label {
  font-size: 12px;
  color: #666;
}

.login-type-item {
  margin-bottom: 0 !important;
}
</style>