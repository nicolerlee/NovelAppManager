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
              <template v-if="!configForm.value.id">
                <el-empty 
                  description="暂无UI配置信息" 
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
                <el-form ref="formRef" :model="configForm.value" :rules="formRules" label-width="160px">
                  <el-form-item label="AppID">
                    <span class="readonly-value">{{ configForm.value.appId }}</span>
                  </el-form-item>
                  
                  <!-- UI配置面板内容 - 后续再完善 -->
                  <div class="ui-config-placeholder">
                    <p class="placeholder-text">UI配置面板正在开发中，敬请期待...</p>
                    <p class="placeholder-subtext">后续将提供更多丰富的UI配置选项</p>
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
import { ref, inject } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import AppListSelector from '../components/common/AppListSelector.vue'

const auth = inject('auth')

// 状态变量
const loadingConfig = ref(false)
const selectedApp = ref(null)
const configForm = ref({
  id: null,
  appId: ''
})
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

// 加载UI配置
const loadConfig = async (appId) => {
  if (!appId) return
  
  loadingConfig.value = true
  try {
    // 这里应该调用API获取UI配置
    // 由于API尚未实现，我们暂时设置为空
    configForm.value = {
      id: null,
      appId: appId
    }
  } catch (error) {
    console.error('获取UI配置失败:', error)
    ElMessage.error('获取UI配置失败')
  } finally {
    loadingConfig.value = false
  }
};

// 创建UI配置
const handleCreateConfig = async () => {
  if (!selectedApp.value?.appid) {
    ElMessage.warning('请先选择小程序')
    return
  }
  
  loadingConfig.value = true
  try {
    // 这里应该调用API创建UI配置
    // 由于API尚未实现，我们暂时直接设置一个模拟ID
    configForm.value = {
      id: 'mock-ui-config-' + Date.now(),
      appId: selectedApp.value.appid
    }
    
    ElMessage.success('UI配置创建成功')
  } catch (error) {
    console.error('创建UI配置失败:', error)
    ElMessage.error('创建UI配置失败')
  } finally {
    loadingConfig.value = false
  }
};


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

.ui-config-placeholder {
  text-align: center;
  padding: 100px 0;
  color: #909399;
}

.placeholder-text {
  font-size: 18px;
  margin-bottom: 10px;
}

.placeholder-subtext {
  font-size: 14px;
  color: #c0c4cc;
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