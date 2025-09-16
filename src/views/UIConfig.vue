<template>
  <div class="ui-config">
    <div class="layout-container">
      <!-- 左侧小程序列表 -->
      <el-card class="app-list-card">
      <template #header>
        <div class="header">
            <h3>小程序列表</h3>
            <div>
              <el-input
                v-model="searchQuery"
                placeholder="搜索小程序"
                style="width: 200px; margin-right: 15px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="fetchApps">刷新数据</el-button>
            </div>
        </div>
      </template>

        <div v-loading="loadingApps">
          <template v-if="filteredApps.length === 0">
            <el-empty 
              :image-size="200"
              description="暂无小程序数据"
            >
              <template #description>
                <div class="empty-description">
                  <p>还没有找到任何小程序</p>
                  <p class="sub-text">点击刷新按钮获取最新数据</p>
                </div>
              </template>
              <el-button type="primary" @click="fetchApps">
                <el-icon><Refresh /></el-icon>
                立即刷新
              </el-button>
            </el-empty>
          </template>
          
          <el-table 
            v-else
            :data="filteredApps" 
            style="width: 100%"
            @row-click="handleAppSelect"
            row-key="id"
            :highlight-current-row="true"
          >
            <el-table-column prop="platform" label="平台" width="80">
              <template #default="scope">
                <el-tag :type="getPlatformType(scope.row.platform)" effect="light" size="small">
                  {{ scope.row.platform }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="appName" label="小程序名称" width="180" />
            <el-table-column prop="appid" label="AppID" width="220" />
          </el-table>
        </div>
      </el-card>

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
import { ref, computed, onMounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '../utils/request'
import { pinyin } from 'pinyin-pro'

const auth = inject('auth')

// 状态变量
const searchQuery = ref('')
const loadingApps = ref(false)
const loadingConfig = ref(false)
const apps = ref([])
const selectedApp = ref(null)
const configForm = ref({
  id: null,
  appId: '',
  
  // 后续添加更多UI配置字段
})
const formRef = ref(null)

// 表单验证规则
const formRules = {
  // 后续添加验证规则
}

// 过滤小程序列表
const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  const isSingleCharQuery = query.length === 1;
  return apps.value.filter(app => {
    const name = app.appName || ''
    // 获取全拼和首字母
    const namePinyinFirst = pinyin(name, {
      pattern: 'first',
      type: 'array',
      toneType: 'none',
      nonZh: 'consecutive'
    }).join('').toLowerCase()
    const namePinyinFull = pinyin(name, {
      pattern: 'pinyin',
      type: 'array',
      toneType: 'none',
      nonZh: 'consecutive'
    }).join('').toLowerCase()

    // 检查原始名称
    if (name.toLowerCase().includes(query)) return true

    // 检查拼音首字母
    if (isSingleCharQuery) {
      // 对于单字符查询，严格匹配首字母
      if (namePinyinFirst.length > 0 && namePinyinFirst[0] === query) return true;
    } else {
      // 对于多字符查询，检查是否以首字母开头
      if (namePinyinFirst.startsWith(query)) return true
    }

    // 检查全拼
    if (namePinyinFull.includes(query)) return true

    // 检查其他字段
    return (app.appid && app.appid.toLowerCase().includes(query))
  })
})

// 获取平台对应的标签类型
const getPlatformType = (platform) => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
};

// 获取平台名称
const getPlatformName = (platformCode) => {
  const platforms = {
    'douyin': '抖音',
    'kuaishou': '快手',
    'weixin': '微信',
    'baidu': '百度'
  }
  return platforms[platformCode] || platformCode
}

// 获取小程序列表
const fetchApps = async () => {
  loadingApps.value = true
  try {
    const res = await request.get('/api/novel-apps/appLists')
    const data = res.data

    let appList = []
    Object.values(data).forEach(platformApps => {
      appList = [...appList, ...platformApps.map(app => ({
        id: app.id,
        platform: getPlatformName(app.platform),
        appName: app.appName,
        appid: app.appid
      }))]
    })

    apps.value = appList
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    ElMessage.error('获取小程序列表失败')
    apps.value = []
  } finally {
    loadingApps.value = false
  }
}

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

// 组件挂载时获取数据
onMounted(() => {
  fetchApps();
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

.app-list-card {
  flex: 0 0 500px;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.app-list-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.app-list-card .el-table {
  height: 100%;
}

.app-list-card :deep(.el-card__body)::-webkit-scrollbar {
  width: 6px;
}

.app-list-card :deep(.el-card__body)::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.app-list-card :deep(.el-card__body)::-webkit-scrollbar-track {
  background: #f5f7fa;
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