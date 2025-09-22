<template>
  <div class="narrow-form-container">
    <h4>步骤2: 配置UI信息</h4>
    <div class="theme-selection-content">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="主色调" prop="mainTheme">
          <el-color-picker v-model="form.mainTheme" show-alpha color-format="hex" :disabled="themeConfigured || loadingThemes" />
          <div v-if="themeConfigured" class="theme-configured-hint">
            <el-icon size="14"><InfoFilled /></el-icon>
            <span>主题色已根据历史配置自动填充，不可修改</span>
          </div>
        </el-form-item>
        <el-form-item label="辅助色" prop="secondTheme">
          <el-color-picker v-model="form.secondTheme" show-alpha color-format="hex" :disabled="themeConfigured || loadingThemes" />
        </el-form-item>
        <el-form-item v-if="loadingThemes">
          <el-skeleton :loading="loadingThemes" animated>
            <div class="loading-hint">加载历史主题色配置中...</div>
          </el-skeleton>
        </el-form-item>
        <el-form-item label="预设主题" prop="predefinedThemes">
          <div class="predefined-themes-container">
            <div
              v-for="theme in predefinedThemes"
              :key="theme.name"
              :class="['theme-option', { 'disabled': themeConfigured, 'selected': selectedThemeName === theme.name }]"
              @click="!themeConfigured && selectPredefinedTheme(theme)"
            >
              <div class="theme-colors">
                <div class="main-color" :style="{ backgroundColor: theme.main }"></div>
                <div class="second-color" :style="{ backgroundColor: theme.second }"></div>
              </div>
              <span class="theme-name">{{ theme.name }}</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="支付卡片样式" prop="payCardStyle" class="platform-radio-group">
          <el-radio-group v-model="form.payCardStyle" @change="handlePayCardStyleChange" class="platform-radio-group">
            <el-radio-button :value="1">样式1</el-radio-button>
            <el-radio-button :value="2">样式2</el-radio-button>
            <el-radio-button :value="3">样式3</el-radio-button>
            <el-radio-button :value="4">样式4</el-radio-button>
          </el-radio-group>
          <div v-if="selectedPayCardImage" class="pay-card-image-preview">
            <img :src="selectedPayCardImage" alt="支付卡片样式预览" />
          </div>
        </el-form-item>
        
        <el-form-item label="首页卡片样式" prop="homeCardStyle" class="platform-radio-group">
          <el-radio-group v-model="form.homeCardStyle" class="platform-radio-group">
            <el-radio-button :value="1">样式1</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div v-show="selectedThemeImage" class="theme-image-preview">
        <img v-if="selectedThemeImage" :src="selectedThemeImage" alt="Theme Preview" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import request from '../../utils/request';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  appName: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['update:modelValue']);

// 表单数据双向绑定
const form = ref({ 
  ...props.modelValue,
  payCardStyle: props.modelValue.payCardStyle || 1,
  homeCardStyle: props.modelValue.homeCardStyle || 1
});

// 监听 props 变化，更新本地表单数据
watch(() => props.modelValue, (newVal) => {
  nextTick(() => {
    // 避免不必要的更新
    if (JSON.stringify(newVal) !== JSON.stringify(form.value)) {
      form.value = { ...newVal };
    }
  });
}, { deep: true });

// 监听本地表单数据变化，触发更新事件
watch(form, (newVal) => {
  nextTick(() => {
    // 避免不必要的更新
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', { ...newVal });
    }
  });
}, { deep: true });

// 表单校验规则
const formRules = {
  mainTheme: [{
    required: true,
    message: '请选择主色调',
    trigger: 'blur'
  }],
  secondTheme: [{
    required: true,
    message: '请选择辅助色',
    trigger: 'blur'
  }],
  payCardStyle: [{
    required: true,
    message: '请选择支付卡片样式',
    trigger: 'change'
  }],
  homeCardStyle: [{
    required: true,
    message: '请选择首页卡片样式',
    trigger: 'change'
  }]
};

// 预设主题色数据
const predefinedThemes = ref([
  { name: '阅界视窗主题色', main: '#2552F5FF', second: '#DCE7FFFF', image: 'theme_yuejie.jpg' },
  { name: '悦动故事主题色', main: '#EF5350FF', second: '#FFEBEEFF', image: 'theme_yuedong.jpg' },
  { name: '风行推广主题色', main: '#F86003FF', second: '#FFEFE7FF', image: 'theme_fun.jpg' },
  { name: '漫影主题色', main: '#FF4363FF', second: '#FFE5EBFF', image: 'theme_manying.jpg' },
]);
const selectedThemeImage = ref('');
const selectedPayCardImage = ref('/images/payStyle/pay_style1.png');
const themeConfigured = ref(false);
const loadingThemes = ref(false);
const selectedThemeName = ref('');

// 请求主题色配置
const fetchThemeConfig = async () => {
  if (!props.appName) return;

  loadingThemes.value = true;
  try {
    const response = await request.get('/api/novel-ui/getUiConfigByAppName', {
      params: { appName: props.appName }
    });
    
    if (response.code === 200 && response.data && response.data.length > 0) {
      // 有配置，使用第一条数据
      const firstTheme = response.data[0];
      form.value.mainTheme = firstTheme.mainTheme;
      form.value.secondTheme = firstTheme.secondTheme;
      themeConfigured.value = true;
      ElMessage.success('已加载历史主题色配置');
    } else {
      // 无配置，允许用户设置
      themeConfigured.value = false;
    }
  } catch (error) {
    console.error('获取主题色配置失败:', error);
    ElMessage.error('获取主题色配置失败，将使用默认配置');
  } finally {
    loadingThemes.value = false;
  }
};

// 组件挂载时执行一次，并且当appName变化时重新获取配置
watch(
  () => props.appName,
  (newVal) => {
    if (newVal) {
      // 延迟执行，避免频繁请求
      setTimeout(fetchThemeConfig, 500);
    }
  },
  { immediate: true }
);

// 选择预设主题色
const selectPredefinedTheme = (theme) => {
  selectedThemeName.value = theme.name;
  // 创建一个新的对象来更新表单数据
  const newForm = {
    ...form.value,
    mainTheme: theme.main,
    secondTheme: theme.second
  };
  form.value = newForm;
  selectedThemeImage.value = `/images/theme/${theme.image}`;
  ElMessage.success(`已应用预设主题: ${theme.name}`);
};

// 处理支付卡片样式变化
const handlePayCardStyleChange = (value) => {
  selectedPayCardImage.value = `/images/payStyle/pay_style${value}.png`;
  form.value.payCardStyle = value;
  ElMessage.success(`已应用支付卡片样式${value}`);
};

// 表单ref和校验暴露
const formRef = ref(null);
const validate = async () => {
  if (!formRef.value) return false;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请填写完整的UI配置！');
  }
  return valid;
};

const resetFields = () => {
  formRef.value?.resetFields();
  Object.assign(form.value, {
    mainTheme: '',
    secondTheme: ''
  });
};

defineExpose({ validate, resetFields });
</script>

<style scoped>
.narrow-form-container {
  max-width: 600px;
  margin: 0 auto;
}

h4 {
  margin-bottom: 20px;
  text-align: left;
  color: #303133;
}

.theme-selection-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.predefined-themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.theme-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  transition: all 0.2s ease-in-out;
}

.theme-option.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.theme-option.selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-radius: 4px;
}

.theme-configured-hint {
  display: flex;
  align-items: center;
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
}

.loading-hint {
  height: 32px;
  line-height: 32px;
  color: #909399;
  font-size: 12px;
}

.theme-option:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.theme-colors {
  display: flex;
  margin-right: 10px;
}

.main-color,
.second-color {
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
}

.main-color {
  border-radius: 4px 0 0 4px;
}

.second-color {
  border-radius: 0 4px 4px 0;
}

.theme-name {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.theme-image-preview {
  width: 250px;
  height: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}

.theme-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.platform-radio-group {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.pay-card-image-preview {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-width: 280px;
}

.pay-card-image-preview img {
  max-width: 100%;
  height: auto;
}
</style>