<template>
  <div class="ui-config-panel">
    <el-form-item label="主题色">
      <el-color-picker 
        v-model="uiConfig.mainTheme" 
        show-alpha 
        color-format="hex" 
        :disabled="uiConfigThemeConfigured || uiConfigLoading"
        :loading="uiConfigLoading"
      ></el-color-picker>
      <el-tag v-if="uiConfigThemeConfigured" type="info" size="small" class="ml-2">历史配置已加载，不可修改</el-tag>
    </el-form-item>
    <el-form-item label="次主题色">
      <el-color-picker 
        v-model="uiConfig.secondTheme" 
        show-alpha 
        color-format="hex" 
        :disabled="uiConfigThemeConfigured || uiConfigLoading"
        :loading="uiConfigLoading"
      ></el-color-picker>
    </el-form-item>
    <el-form-item label="预设主题">
      <div class="predefined-themes-container">
        <div 
          v-for="theme in predefinedThemes" 
          :key="theme.name" 
          class="theme-option" 
          @click="selectPredefinedTheme(theme)"
          :class="{ 'theme-option-disabled': uiConfigThemeConfigured || uiConfigLoading }"
          :style="{ cursor: (uiConfigThemeConfigured || uiConfigLoading) ? 'not-allowed' : 'pointer' }"
        >
          <div class="theme-colors">
            <div class="main-color" :style="{ backgroundColor: theme.mainTheme }"></div>
            <div class="second-color" :style="{ backgroundColor: theme.secondTheme }"></div>
          </div>
          <span class="theme-name">{{ theme.name }}</span>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="支付卡片样式" prop="payCardStyle" class="platform-radio-group">
      <el-radio-group v-model="uiConfig.payCardStyle" @change="handlePayCardStyleChange" class="platform-radio-group">
        <el-radio-button :value="1">样式1</el-radio-button>
        <el-radio-button :value="2">样式2</el-radio-button>
        <el-radio-button :value="3">样式3</el-radio-button>
        <el-radio-button :value="4">样式4</el-radio-button>
      </el-radio-group>
      <div v-if="uiConfig.selectedPayCardImage" class="pay-card-image-preview">
        <img :src="uiConfig.selectedPayCardImage" alt="支付卡片样式预览" />
      </div>
    </el-form-item>
    <el-form-item label="首页卡片样式" prop="homeCardStyle" class="platform-radio-group">
      <el-radio-group v-model="uiConfig.homeCardStyle" class="platform-radio-group">
        <el-radio-button :value="1">样式1</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, nextTick ,watch} from 'vue';

// 定义props
const props = defineProps({
  uiConfig: {
    type: Object,
    required: true
  },
  uiConfigThemeConfigured: {
    type: Boolean,
    default: false
  },
  uiConfigLoading: {
    type: Boolean,
    default: false
  }
});

// 定义emits
const emit = defineEmits(['update:uiConfig']);

// 预设主题色
const predefinedThemes = ref([
  { name: '阅界视窗主题', mainTheme: '#2552F5FF', secondTheme: '#DCE7FFFF' },
  { name: '悦动故事主题', mainTheme: '#EF5350FF', secondTheme: '#FFEBEEFF' },
  { name: '风行推广主题', mainTheme: '#F86003FF', secondTheme: '#FFEFE7FF' },
  { name: '漫影主题', mainTheme: '#FF4363FF', secondTheme: '#FFE5EBFF' }
]);

// 选择预设主题
const selectPredefinedTheme = (theme) => {
  if (props.uiConfigThemeConfigured || props.uiConfigLoading) {
    return;
  }
  emit('update:uiConfig', {
    ...props.uiConfig,
    mainTheme: theme.mainTheme,
    secondTheme: theme.secondTheme
  });
};

// 处理支付卡片样式变化
const handlePayCardStyleChange = (value) => {
  const updatedConfig = {
    ...props.uiConfig,
    payCardStyle: value,
    selectedPayCardImage: `/images/payStyle/pay_style${value}.png`
  };
  emit('update:uiConfig', updatedConfig);
};
</script>

<style scoped>
.ui-config-panel {
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

/* 主题选择样式 */
.predefined-themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.theme-option {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.theme-option:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.theme-colors {
  display: flex;
  margin-bottom: 8px;
}

.main-color, .second-color {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  margin: 0 2px;
  border: 1px solid #e0e0e0;
}

.theme-name {
  font-size: 12px;
  color: #606266;
}

.pay-card-image-preview {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pay-card-image-preview img {
  max-width: 100%;
  height: auto;
}
</style>