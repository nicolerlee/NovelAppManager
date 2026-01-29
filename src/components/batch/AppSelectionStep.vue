<template>
  <div class="app-selection-step">
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索小程序名称"
        clearable
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="platformFilter"
        placeholder="平台筛选"
        clearable
        class="filter-select"
        @change="handleFilter"
      >
        <el-option
          v-for="platform in platformOptions"
          :key="platform.value"
          :label="platform.label"
          :value="platform.value"
        />
      </el-select>
      
      <el-select
        v-model="brandFilter"
        placeholder="产品线筛选"
        clearable
        class="filter-select"
        @change="handleFilter"
      >
        <el-option
          v-for="brand in brandOptions"
          :key="brand.value"
          :label="brand.label"
          :value="brand.value"
        />
      </el-select>

      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        clearable
        class="filter-select"
        @change="handleFilter"
      >
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      
      <div v-if="showAdSettings" class="weiju-filter-wrapper">
        <span class="weiju-label">微距:</span>
        <el-select
          v-model="adType"
          placeholder="微距广告位设置"
          class="filter-select ad-type-select"
          @change="handleAdTypeChange"
        >
        <el-option label="统一广告位(tt-fun)" value="tt-fun" />
        <el-option label="小程序各自广告位" value="individual" />
        <el-option label="不mock" value="no-ad" />
      </el-select>
      </div>
      
      <!-- 页面类型筛选功能已移除 -->
    </div>
    
    <!-- 小程序列表 -->
    <div class="app-list-section">
      <el-table
        :data="sortedFilteredApps"
        row-key="id"
        height="400"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="小程序名称" min-width="150">
          <template #default="scope">
            <div class="app-info">
              <el-avatar
                :src="scope.row.avatar"
                size="small"
                class="app-avatar"
              />
              <span class="app-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="appId" label="AppId" width="200" />
        <el-table-column prop="product" label="产品线" width="150" />
        <el-table-column prop="platform" label="平台" width="150">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(scope.row.platform)" effect="light">
              {{ isBatchBuild ? scope.row.platformName : getPlatformDisplayName(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="150" />
        <el-table-column prop="lastBuildTime" label="最后构建时间" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusDisplayName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 已选择小程序显示区域 -->
    <div class="selected-apps-section">
      <div class="selected-info">
        <span class="selected-count">已选择 {{ selectedApps.length }} 个小程序</span>
        <div class="selected-apps-tags">
          <el-tag
            v-for="app in selectedApps"
            :key="app.id"
            closable
            @close="removeSelectedApp(app)"
            class="selected-app-tag"
          >
            {{ props.isBatchBuild ? getPlatformDisplayName(app.platformName) + '-' + app.name : getPlatformDisplayName(app.platform) + '-' + app.name }}
          </el-tag>
        </div>
      </div>
      
      <!-- 下一步按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="goToNextStep"
          :disabled="selectedApps.length === 0"
        >
          下一步
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 防抖函数
const debounce = (func, delay) => {
 let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Props
const props = defineProps({
  apps: {
    type: Array,
    default: () => []
  },
  isBatchBuild: {
    type: Boolean,
    default: false
  },
  showAdSettings: {
    type: Boolean,
    default: false
  },
  adType: {
    type: String,
    default: 'no-ad'
  },
  showPageTypeFilter: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:selectedApps', 'next', 'update:adType'])

// 响应式数据
const searchKeyword = ref('')
const platformFilter = ref('')
const statusFilter = ref('')  // 默认不筛选状态
const brandFilter = ref('')
const adType = ref(props.adType)
const selectedApps = ref([])
const platformOptions = ref([
  { label: '微信', value: 'mp-weixin' },
  { label: '抖音', value: 'mp-toutiao' },
  { label: '快手', value: 'mp-kuaishou' },
  { label: '百度', value: 'mp-baidu' },
  { label: '支付宝', value: 'mp-alipay' }
])

// 计算属性 - 产品线选项
const brandOptions = computed(() => {
  const uniqueBrands = new Set()
  processedApps.value.forEach(app => {
    if (app.product) {
      uniqueBrands.add(app.product)
    }
  })
  
  return Array.from(uniqueBrands).map(brand => {
    const label = brand
    return { label, value: brand }
  })
})

// 计算属性 - 处理后的小程序列表
const processedApps = computed(() => {
  return props.apps.map(app => {
    if (app.appId) {
      return app
    }
    
    return {
      ...app,
      appId: app.id
    }
  })
})

// 计算属性 - 过滤后的小程序列表
const filteredApps = computed(() => {
  let result = processedApps.value
  
  if (searchKeyword.value) {
    result = result.filter(app =>
      app.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (platformFilter.value) {
    if (props.isBatchBuild) {
      result = result.filter(app => app.platformName === getPlatformDisplayName(platformFilter.value))
    } else {
      result = result.filter(app => app.platform === platformFilter.value)
    }
  }
  
  if (statusFilter.value !== null && statusFilter.value !== undefined && statusFilter.value !== '') {
    const filterValue = String(statusFilter.value);
    result = result.filter(app => {
      return String(app.status) === filterValue;
    });
  }
  
  if (brandFilter.value) {
    result = result.filter(app => app.product === brandFilter.value);
  }
  
  return result
})

// 计算属性 - 排序后的过滤小程序列表
const sortedFilteredApps = computed(() => {
  const filtered = filteredApps.value;
  
  return filtered.sort((a, b) => {
    const timeA = a.lastBuildTime ? new Date(a.lastBuildTime).getTime() : 0;
    const timeB = b.lastBuildTime ? new Date(b.lastBuildTime).getTime() : 0;
    
    return timeB - timeA;
  });
})

// 方法 - 处理搜索
const handleSearch = () => {
  // 搜索逻辑在computed中处理
}

// 方法 - 处理筛选
const handleFilter = () => {
 // 筛选逻辑在computed中处理
}

// 方法 - 处理选择变化
const handleSelectionChange = (selection) => {
  selectedApps.value = selection
  emit('update:selectedApps', selection)
}

// 方法 - 获取平台标签类型
const getPlatformTagType = (platform) => {
  if (props.isBatchBuild) {
    const typeMap = {
      'weixin': 'success',
      'toutiao': 'info',
      'kuaishou': 'danger',
      'baidu': 'warning',
      'alipay': 'primary'
    }
    return typeMap[platform] || 'info'
  } else {
    const typeMap = {
      'mp-weixin': 'success',
      'mp-toutiao': 'info',
      'mp-kuaishou': 'danger',
      'mp-baidu': 'warning',
      'mp-alipay': 'primary'
    }
    return typeMap[platform] || 'info'
  }
}

// 方法 - 获取平台显示名称
const getPlatformDisplayName = (platformCode) => {
  const nameMap = {
    'mp-weixin': '微信',
    'mp-toutiao': '抖音',
    'mp-kuaishou': '快手',
    'mp-baidu': '百度',
    'mp-alipay': '支付宝'
  }
  return nameMap[platformCode] || platformCode
}

// 方法 - 获取状态显示名称
const getStatusDisplayName = (status) => {
  const statusNum = Number(status);
  return statusNum === 1 ? '启用' : '禁用';
}

// 方法 - 获取状态标签类型
const getStatusTagType = (status) => {
  const statusNum = Number(status);
  return statusNum === 1 ? 'success' : 'error';
}

// 方法 - 移除已选择的小程序
const removeSelectedApp = (appToRemove) => {
  selectedApps.value = selectedApps.value.filter(app => app.id !== appToRemove.id)
  emit('update:selectedApps', selectedApps.value)
}

// 方法 - 下一步
const goToNextStep = () => {
  if (selectedApps.value.length > 0) {
    emit('next', selectedApps.value, adType.value)
 }
}

// 方法 - 处理广告位类型变化
const handleAdTypeChange = (value) => {
  emit('update:adType', value)
}

// 组件挂载时的初始化逻辑
onMounted(() => {
  // Preview 功能已移除
})
</script>

<style scoped lang="less">
.app-selection-step {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-filter-section {
  display: flex;
  gap: 20px;
 margin-bottom: 20px;
  align-items: center;
  
  .search-input {
    flex: 1;
    max-width: 300px;
  }
  
  .filter-select {
    width: 150px;
  }
  
  .page-type-select {
    width: 180px;
  }
  
  .weiju-filter-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    
    .ad-type-select {
      width: 220px;
    }
  }
  
  .weiju-label {
    color: #606266;
    font-size: 14px;
    line-height: 32px;
    white-space: nowrap;
  }
}

.app-list-section {
  margin-bottom: 20px;
  
  .app-info {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .app-avatar {
      background-color: #f5f7fa;
    }
    
    .app-name {
      font-weight: 500;
    }
  }
}

.selected-apps-section {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  
  .selected-info {
    margin-bottom: 20px;
    
    .selected-count {
      font-weight: 500;
      margin-bottom: 10px;
      display: block;
    }
    
    .selected-apps-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .selected-app-tag {
        margin: 0;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
    
    .search-input,
    .filter-select {
      max-width: 100%;
    }
  }
}
</style>
