<template>
  <div class="ui-config">
    <div class="layout-container">
      <!-- 左侧小程序列表 - 使用公共组件 -->
      <AppListSelector @app-selected="handleAppSelect" title="小程序列表" />

      <!-- 右侧UI配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="header">
            <h3 class="title-with-tag" v-if="selectedApp">
              UI配置 - {{ selectedApp.appName }}
              <el-tag :type="getPlatformType(selectedApp.platform)" effect="light" size="small" class="platform-tag">
                {{ selectedApp.platform }}
              </el-tag>
            </h3>
            <h3 v-else>UI配置</h3>
          </div>
        </template>

        <div class="config-content">
          <template v-if="selectedApp">
            <div class="config-form" v-loading="loadingConfig">
              <template v-if="!configForm.id && !tempShowConfig">
                <el-empty 
                  description="暂无配置信息" 
                  :image-size="100"
                >
                  <template #description>
                    <p>当前小程序尚未配置UI信息</p>
                    <p class="sub-text">点击下方按钮创建配置</p>
                  </template>
                  <el-button type="primary" @click="handleCreateConfig">
                    创建配置
                  </el-button>
                </el-empty>
              </template>
              <template v-else>
                <el-form ref="formRef" :model="configForm" :rules="formRules" label-width="160px">
                  <el-form-item label="AppID">
                    <span class="readonly-value">{{ configForm.appid }}</span>
                  </el-form-item>
                    
                  <!-- 主题色配置 -->
                  <el-form-item label="主主题色">
                    <el-color-picker 
                      v-model="configForm.mainTheme" 
                      show-alpha 
                      color-format="hex" 
                      :disabled="loadingConfig"
                    ></el-color-picker>
                  </el-form-item>
                    
                  <el-form-item label="次主题色">
                    <el-color-picker 
                      v-model="configForm.secondTheme" 
                      show-alpha 
                      color-format="hex" 
                      :disabled="loadingConfig"
                    ></el-color-picker>
                  </el-form-item>
                   
                  <el-form-item label="预设主题">
                    <div class="predefined-themes-container">
                      <div 
                        v-for="theme in predefinedThemes" 
                        :key="theme.name" 
                        class="theme-option"
                        :class="{ 
                          'theme-option-disabled': loadingConfig,
                          'theme-option-selected': configForm.mainTheme === theme.mainTheme && configForm.secondTheme === theme.secondTheme
                        }"
                        @click="selectPredefinedTheme(theme)"
                        :style="{ cursor: loadingConfig ? 'not-allowed' : 'pointer' }"
                      >
                        <div class="theme-colors">
                          <div class="main-color" :style="{ backgroundColor: theme.mainTheme }"></div>
                          <div class="second-color" :style="{ backgroundColor: theme.secondTheme }"></div>
                        </div>
                        <span class="theme-name">{{ theme.name }}</span>
                      </div>
                    </div>
                    <!-- 主题预览图 -->
                    <div v-if="selectedThemeImage" class="theme-image-preview">
                      <img :src="selectedThemeImage" alt="Theme Preview" class="preview-image" />
                    </div>
                  </el-form-item>
                   
                  <!-- 支付卡片样式 -->
                  <el-form-item label="支付卡片样式" class="platform-radio-group">
                    <el-radio-group v-model="configForm.payCardStyle" @change="handlePayCardStyleChange" class="platform-radio-group">
                      <el-radio-button :value="1">样式1</el-radio-button>
                      <el-radio-button :value="2">样式2</el-radio-button>
                      <el-radio-button :value="3">样式3</el-radio-button>
                      <el-radio-button :value="4">样式4</el-radio-button>
                    </el-radio-group>
                    <!-- 支付卡片样式预览图 -->
                    <div class="pay-card-preview">
                      <img :src="payCardStyleImage" alt="支付卡片样式预览" class="preview-image" />
                    </div>
                  </el-form-item>
                    
                  <el-form-item label="首页卡片样式" class="platform-radio-group">
                    <el-radio-group v-model="configForm.homeCardStyle" class="platform-radio-group">
                      <el-radio-button :value="1">样式1</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  
                <!-- 操作按钮 -->
                <div style="margin-top: 20px; text-align: center;">
                  <el-button v-if="!tempShowConfig" type="primary" @click="handleSaveConfig" :loading="saving">保存配置</el-button>
                </div>
              </el-form>
              </template>
            </div>
          </template>
          <template v-else>
            <el-empty 
              description="请先选择一个小程序"
              :image-size="200"
            >
              <template #description>
                <p>请从左侧列表选择一个小程序以进行UI配置</p>
              </template>
            </el-empty>
            </template>
          </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
import AppListSelector from '../components/common/AppListSelector.vue'

const auth = inject('auth')

// 状态变量
const loadingConfig = ref(false)
const saving = ref(false)
const selectedApp = ref(null)
const tempShowConfig = ref(false)
// 确保configForm始终是一个完整的对象，避免undefined错误
const configForm = ref({
  id: null,
  appid: '',
  mainTheme: '#2552F5FF',
  secondTheme: '#DCE7FFFF',
  payCardStyle: 1,
  homeCardStyle: 1
})

// 预设主题色（添加image属性用于预览）
const predefinedThemes = ref([
  { name: '阅界视窗主题', mainTheme: '#2552F5FF', secondTheme: '#DCE7FFFF', image: 'theme_yuejie.jpg' },
  { name: '悦动故事主题', mainTheme: '#EF5350FF', secondTheme: '#FFEBEEFF', image: 'theme_yuedong.jpg' },
  { name: '风行推广主题', mainTheme: '#F86003FF', secondTheme: '#FFEFE7FF', image: 'theme_fun.jpg' },
  { name: '漫影主题', mainTheme: '#FF4363FF', secondTheme: '#FFE5EBFF', image: 'theme_manying.jpg' }
]);
// 主题预览图
const selectedThemeImage = ref('');
// 支付卡片预览图
const payCardStyleImage = ref('/images/payStyle/pay_style1.png');
const formRef = ref(null)

// 表单验证规则
const formRules = {
  // 后续添加验证规则
}

// 获取平台对应的标签类型 - 保留用于右侧配置面板的平台标签显示
const getPlatformType = (platform) => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
};

// 选择小程序
const handleAppSelect = async (app) => {
  selectedApp.value = app;
  await loadConfig(app.appid);
};

// 处理支付卡片样式变化
const handlePayCardStyleChange = (value) => {
  payCardStyleImage.value = `/images/payStyle/pay_style${value}.png`;
};

// 加载UI配置
const loadConfig = async (appId) => {
  if (!appId) return
  
  loadingConfig.value = true
  try {
    // 调用API获取UI配置
    const response = await request.get('/api/novel-ui/getUiConfig', {
      params: { appId }
    });
    
    if (response.code === 200) {
      configForm.value = {
        id: response.data?.id || null,
        appid: response.data?.appid || '',
        mainTheme: response.data?.mainTheme || '#2552F5FF',
        secondTheme: response.data?.secondTheme || '#DCE7FFFF',
        payCardStyle: response.data?.payCardStyle || 1,
        homeCardStyle: response.data?.homeCardStyle || 1
      }
      // 初始化预览图
      payCardStyleImage.value = `/images/payStyle/pay_style${configForm.value.payCardStyle}.png`;
      // 检查是否匹配预设主题
      const matchedTheme = predefinedThemes.value.find(theme => 
        theme.mainTheme === configForm.value.mainTheme && 
        theme.secondTheme === configForm.value.secondTheme
      );
      if (matchedTheme) {
        selectedThemeImage.value = `/images/theme/${matchedTheme.image}`;
      }
      tempShowConfig.value = false;
    } else {
      // 如果没有配置，设置默认值
      configForm.value = {
        id: null,
        appid: appId,
        mainTheme: '#2552F5FF',
        secondTheme: '#DCE7FFFF',
        payCardStyle: 1,
        homeCardStyle: 1
      }
      tempShowConfig.value = false;
      ElMessage.warning(response.message || '获取配置失败，可能该小程序未创建UI配置');
    }
  } catch (error) {
    console.error('获取UI配置失败:', error)
    ElMessage.error('获取UI配置失败')
    // 设置默认值
    configForm.value = {
      id: null,
      appid: appId,
      mainTheme: '#2552F5FF',
      secondTheme: '#DCE7FFFF',
      payCardStyle: 1,
      homeCardStyle: 1
    }
    tempShowConfig.value = false;
  } finally {
    loadingConfig.value = false
  }
};

// 选择预设主题
const selectPredefinedTheme = (theme) => {
  if (loadingConfig.value) return;
  
  configForm.value.mainTheme = theme.mainTheme;
  configForm.value.secondTheme = theme.secondTheme;
  selectedThemeImage.value = `/images/theme/${theme.image}`;
  ElMessage.success(`已应用预设主题: ${theme.name}`);
};


// 创建配置
const handleCreateConfig = async () => {
  if (!selectedApp.value?.appid) {
    ElMessage.warning('请先选择小程序')
    return
  }
  
  if (!tempShowConfig.value) {
    tempShowConfig.value = true
    return
  }
  
  saving.value = true
  try {
    // 准备请求数据
    const requestData = {
      appId: selectedApp.value.appid,
      mainTheme: configForm.value.mainTheme,
      secondTheme: configForm.value.secondTheme,
      payCardStyle: configForm.value.payCardStyle,
      homeCardStyle: configForm.value.homeCardStyle
    }

    const res = await request.post('/api/novel-ui/createUiConfig', requestData)
    
    if (res.code === 200) {
      ElMessage.success('配置创建成功')
      // 直接使用返回的数据更新表单
      configForm.value = {
        id: res.data.id,
        appid: res.data.appid,
        mainTheme: res.data.mainTheme || '#2552F5FF',
        secondTheme: res.data.secondTheme || '#DCE7FFFF',
        payCardStyle: res.data.payCardStyle || 1,
        homeCardStyle: res.data.homeCardStyle || 1
      }
      tempShowConfig.value = false
    } else {
      throw new Error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建配置失败:', error)
    ElMessage.error(error.message || '创建配置失败')
  } finally {
    saving.value = false
  }
};

// 保存配置
const handleSaveConfig = async () => {
  if (!configForm.value.id) {
    ElMessage.warning('请先创建配置')
    return
  }
  
  saving.value = true
  try {
    // 准备请求数据
    const requestData = {
      id: configForm.value.id,
      appid: selectedApp.value?.appid || configForm.value.appid,
      mainTheme: configForm.value.mainTheme,
      secondTheme: configForm.value.secondTheme,
      payCardStyle: configForm.value.payCardStyle,
      homeCardStyle: configForm.value.homeCardStyle
    }

    const res = await request.post('/api/novel-ui/updateUiConfig', requestData)
    
    if (res.code === 200) {
      ElMessage.success('配置保存成功')
      // 更新配置表单，使用返回的数据
      configForm.value = {
        id: res.data.id,
        appid: res.data.appid,
        mainTheme: res.data.mainTheme,
        secondTheme: res.data.secondTheme,
        payCardStyle: res.data.payCardStyle,
        homeCardStyle: res.data.homeCardStyle
      }
    } else {
      throw new Error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error(error.message || '保存配置失败')
  } finally {
    saving.value = false
  }
};

// 删除配置
const handleDeleteConfig = async () => {
  if (!configForm.value.id) {
    ElMessage.warning('请先创建配置')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除UI配置吗？此操作将对代码进行修改，请谨慎操作。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const res = await request.delete(`/api/novel-ui/deleteUiConfig/${configForm.value.id}`);

    if (res.code === 200) {
      ElMessage.success('配置删除成功');
      configForm.value = {
        id: null,
        appid: selectedApp.value.appid,
        mainTheme: '#2552F5FF',
        secondTheme: '#DCE7FFFF',
        payCardStyle: 1,
        homeCardStyle: 1
      };
      tempShowConfig.value = false;
    } else {
      throw new Error(res.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除配置失败');
  }
};

// 页面挂载时，如果有选中的小程序，则加载配置
onMounted(() => {
if (selectedApp.value?.appid) {
    loadConfig(selectedApp.value.appid);
}
});

</script>

<style scoped>
.ui-config {
  padding: 20px;
}

.layout-container {
  display: flex;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-card {
  flex: 1;
  min-width: 0;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.config-card :deep(.el-card__body) {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 24px;
}

.config-content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
}

.title-with-tag {
  display: flex;
  align-items: center;
  margin: 0;
  gap: 10px;
}

.platform-tag {
  margin-left: 8px;
}

.empty-description {
  text-align: center;
  color: #909399;
}

.empty-description .sub-text {
  font-size: 12px;
  margin-top: 8px;
  color: #C0C4CC;
}

.el-empty {
  padding: 40px 0;
}

.config-form {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.readonly-value {
  color: #606266;
  font-size: 14px;
}

.sub-text {
  font-size: 12px;
  margin-top: 8px;
  color: #C0C4CC;
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

.theme-option-disabled {
  opacity: 0.6;
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

/* 平台单选组样式 */
.platform-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 预览图样式 */
.theme-image-preview,
.pay-card-preview {
  margin-top: 15px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
    max-width: 100%;
    max-height: 200px;
    width: auto;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

/* 主题选项选中状态 */
.theme-option-selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  background-color: #f0f7ff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .layout-container {
    gap: 15px;
  }
  
  .app-list-card {
    flex: 0 0 400px;
  }
}

@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }
  
  .app-list-card {
    flex: none;
    max-height: 300px;
  }
}
</style>