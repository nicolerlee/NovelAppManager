<template>
  <el-card class="app-list-card">
    <template #header>
      <div class="header">
        <h3>{{ title || '小程序列表' }}</h3>
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
          <div class="refresh-btn" @click="handleRefresh">刷新数据</div>
          
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
          <el-button type="primary" @click="handleRefresh">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { pinyin } from 'pinyin-pro'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '小程序列表'
  },
  // 可以传入自定义的获取数据方法
  customFetchMethod: {
    type: Function,
    default: null
  }
})

// Emits
const emit = defineEmits(['app-selected', 'data-loaded'])

// 状态变量
const searchQuery = ref('')
const loadingApps = ref(false)
const apps = ref([])

// 过滤小程序列表
const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  const isSingleCharQuery = query.length === 1
  
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
      if (namePinyinFirst.length > 0 && namePinyinFirst[0] === query) return true
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
const getPlatformType = (platform: string): string => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
}

// 获取平台名称
const getPlatformName = (platformCode: string): string => {
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
    if (props.customFetchMethod) {
      // 如果提供了自定义的获取方法，使用它
      const result = await props.customFetchMethod()
      apps.value = result || []
    } else {
      // 否则使用默认的获取方法
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
    }
    emit('data-loaded', apps.value)
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    ElMessage.error('获取小程序列表失败')
    apps.value = []
  } finally {
    loadingApps.value = false
  }
}

// 刷新小程序列表
const handleRefresh = () => {
  fetchApps()
}

// 选择小程序
const handleAppSelect = (app: any) => {
  emit('app-selected', app)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApps()
})

// 暴露一些方法给父组件
defineExpose({
  refresh: handleRefresh,
  getApps: () => apps.value,
  getFilteredApps: () => filteredApps.value
})
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-list-card {
    flex: 0 0 400px;
  }
}

@media (max-width: 768px) {
  .app-list-card {
    flex: none;
    max-height: 300px;
  }
}

.refresh-btn{
  width: 96px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background-color: #605ce5;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
</style>