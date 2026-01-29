<template>
  <div class="batch-publish-config-step">
    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar">
      <el-button type="primary" @click="openBatchConfigDialog">
        批量配置
      </el-button>
      <el-button @click="resetAllConfigs">
        重置所有配置
      </el-button>
      <div class="selected-info">
        已选择 {{ selectedApps.length }} 个小程序
      </div>
    </div>

    <!-- 小程序配置列表 -->
    <el-table
      :data="appConfigs"
      row-key="id"
      height="500"
      ref="tableRef"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column type="selection" width="55" />
      
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template #default="scope">
          <div class="config-detail">
            <el-form
              :model="scope.row.config"
              label-width="120px"
              class="config-form"
            >
              <el-form-item label="版本号" required>
                <el-input
                  v-model="scope.row.version"
                  placeholder="版本号"
                  readonly
                />
                <div class="version-info">版本号不可修改，使用当前应用的版本</div>
              </el-form-item>

              <el-form-item label="发布模式">
                <el-radio-group v-model="scope.row.config.publishMode">
                  <el-radio label="preview">仅预览</el-radio>
                  <el-radio label="publish">发布并预览</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="发布说明" required>
                <el-input
                  v-model="scope.row.config.description"
                  type="textarea"
                  rows="3"
                  placeholder="请输入本次发布的说明信息"
                  :rules="descriptionRules"
                />
              </el-form-item>
            </el-form>
          </div>
        </template>
      </el-table-column>

      <!-- 小程序信息列 -->
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

      <el-table-column prop="platform" label="平台" width="100">
        <template #default="scope">
          <el-tag :type="getPlatformTagType(scope.row.platform)">
            {{ getPlatformDisplayName(scope.row.platform) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 状态列 -->
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status === 1 ? '启用' : (scope.row.status === 0 ? '禁用' : '正常') }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 配置预览列 -->
      <el-table-column label="版本号" width="120">
        <template #default="scope">
          {{ scope.row.config.version }}
        </template>
      </el-table-column>

      <el-table-column label="发布说明" min-width="200">
              <template #default="scope">
                {{ scope.row.config.description }}
              </template>
            </el-table-column>
      
            <el-table-column label="发布模式" width="120">
              <template #default="scope">
                {{ scope.row.config.publishMode === 'preview' ? '仅预览' : '发布并预览' }}
              </template>
            </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            link
            @click="expandRow(scope.row)"
          >
            {{ isRowExpanded(scope.row) ? '收起' : '展开' }}
          </el-button>
          <el-button
            type="danger"
            link
            @click="resetAppConfig(scope.row)"
          >
            重置
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量配置对话框 -->
    <el-dialog
      v-model="batchConfigDialogVisible"
      title="批量配置"
      width="600px"
    >
      <el-form
        :model="batchConfig"
        label-width="120px"
        class="batch-config-form"
      >

        <el-form-item label="发布模式">
          <el-radio-group v-model="batchConfig.publishMode">
            <el-radio label="preview">仅预览</el-radio>
            <el-radio label="publish">发布并预览</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="发布说明" required>
          <el-input
            v-model="batchConfig.description"
            type="textarea"
            rows="3"
            placeholder="请输入本次发布的说明信息"
          />
        </el-form-item>

        <el-form-item label="应用范围">
          <el-radio-group v-model="batchConfig.applyScope">
            <el-radio label="all">应用到所有</el-radio>
            <el-radio label="selected">应用到选中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="applyBatchConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认"
      width="400px"
    >
      <div>1.  确认下 【发布说明】内容是否正确</div>
      <div>2.  确认下 【发布模式】是否符合要求</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelNextStep">取消</el-button>
          <el-button type="primary" @click="confirmAndProceed">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="goToPreviousStep">上一步</el-button>
      <el-button
        type="primary"
        @click="goToNextStep"
        :disabled="selectedApps.length === 0"
      >
        下一步
      </el-button>
    </div>
 </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  selectedApps: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:configs', 'previous', 'next'])

// 响应式数据
const tableRef = ref(null)
const batchConfigDialogVisible = ref(false)
const expandedRows = ref([])
const appConfigs = ref([])
const selectedAppConfigs = ref([])
const confirmDialogVisible = ref(false)
const pendingNextStep = ref(false)

// 描述字段验证规则
const descriptionRules = [
  {
    validator: (rule, value, callback) => {
      if (value === ',' || /^,*$/.test(value)) {
        callback(new Error('任务描述不能为逗号'))
      } else if (value && value.trim() === '') {
        callback(new Error('任务描述不能为空'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
]

// 默认配置
const defaultConfig = {
  publishMode: 'preview', // 添加发布模式，默认为仅预览
  description: '修复已知问题，增加产品稳定性'
}

// 批量配置
const batchConfig = ref({
  ...defaultConfig,
  applyScope: 'all' // all 或 selected
})

// 初始化应用配置
const initializeAppConfigs = () => {
  appConfigs.value = props.selectedApps.map(app => ({
    ...app,
    config: {
      version: app.version || '',
      ...defaultConfig
    }
  }))
}

// 方法 - 获取平台标签类型
const getPlatformTagType = (platform) => {
  const typeMap = {
    'mp-weixin': 'success',
    'mp-toutiao': 'info',
    'mp-kuaishou': 'danger',
    'mp-baidu': 'warning'
  }
  
  // 检查平台代码
  if (platform.includes('mp-weixin')) return 'success'  // 绿色
  if (platform.includes('mp-toutiao')) return 'info'     // 灰色
  if (platform.includes('mp-kuaishou')) return 'danger'   // 红色
  if (platform.includes('mp-baidu')) return 'warning'  // 黄色
  
  // 检查简写平台代码
  return typeMap[platform] || 'info'
}

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

// 方法 - 获取状态标签类型
const getStatusTagType = (status) => {
 const typeMap = {
    '1': 'success',
    '0': 'error',
  }
  return typeMap[status] || 'info'
}

// 方法 - 展开/收起行
const expandRow = (row) => {
  const index = expandedRows.value.findIndex(r => r.id === row.id)
  if (index >= 0) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(row)
  }
  tableRef.value?.toggleRowExpansion(row, index < 0)
}

// 方法 - 检查行是否已展开
const isRowExpanded = (row) => {
  return expandedRows.value.some(r => r.id === row.id)
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedAppConfigs.value = selection
}

// 方法 - 打开批量配置对话框
const openBatchConfigDialog = () => {
  batchConfigDialogVisible.value = true
}

// 方法 - 应用批量配置
const applyBatchConfig = () => {
  // 根据应用范围更新配置
  if (batchConfig.value.applyScope === 'all') {
    // 应用到所有
    appConfigs.value.forEach(app => {
      // 保存原有配置并合并新配置
      const newConfig = { ...app.config, ...batchConfig.value }
      // 移除applyScope属性，因为它不是配置的一部分
      delete newConfig.applyScope
      app.config = newConfig
    })
  } else {
    // 应用到选中项
    selectedAppConfigs.value.forEach(selectedApp => {
      const appIndex = appConfigs.value.findIndex(app => app.id === selectedApp.id)
      if (appIndex >= 0) {
        // 保存原有配置并合并新配置
        const newConfig = { ...appConfigs.value[appIndex].config, ...batchConfig.value }
        // 移除applyScope属性
        delete newConfig.applyScope
        appConfigs.value[appIndex].config = newConfig
      }
    })
  }
  
  ElMessage.success('批量配置已应用')
  batchConfigDialogVisible.value = false
}

// 方法 - 重置单个小程序配置
const resetAppConfig = (app) => {
  const configIndex = appConfigs.value.findIndex(item => item.id === app.id)
  if (configIndex >= 0) {
    appConfigs.value[configIndex].config = { ...defaultConfig }
    ElMessage.success(`已重置 ${app.name} 的配置`)
  }
}

// 方法 - 重置所有配置
const resetAllConfigs = () => {
  appConfigs.value.forEach(app => {
    app.config = { ...defaultConfig }
  })
  ElMessage.success('已重置所有配置')
}

// 方法 - 上一步
const goToPreviousStep = () => {
  emit('previous')
}

// 方法 - 验证配置
const validateConfigs = () => {
  // 检查是否所有应用都有配置
  if (!appConfigs.value || appConfigs.value.length === 0) {
    ElMessage.error('没有配置任何小程序')
    return false
  }
  
  // 检查每个应用的必填字段
  for (const app of appConfigs.value) {
    if (!app.config.version || !app.config.description) {
      ElMessage.error(`请完善 ${app.name} 的配置信息`)
      return false
    }
  }
  
  return true
}

// 方法 - 下一步
const goToNextStep = () => {
  // 验证配置并传递给父组件
  if (validateConfigs()) {
    // 显示确认对话框
    confirmDialogVisible.value = true
    pendingNextStep.value = true
  }
}

// 方法 - 确认并继续下一步
const confirmAndProceed = () => {
  confirmDialogVisible.value = false
  pendingNextStep.value = false
  
  // 只传递必要的数据给父组件
  const configData = appConfigs.value.map(app => ({
    id: app.id,
    name: app.name,
    platform: app.platform,
    projectPath: app.projectPath, // 添加projectPath参数
    config: app.config
  }))
  emit('next', configData)
}

// 方法 - 取消下一步操作
const cancelNextStep = () => {
  confirmDialogVisible.value = false
  pendingNextStep.value = false
}

// 监听选中应用的变化
watch(
  () => props.selectedApps,
  (newApps) => {
    // 当选中的应用发生变化时，更新配置
    initializeAppConfigs()
  },
  { deep: true, immediate: true }
)

// 组件挂载时的初始化逻辑
onMounted(() => {
  // 初始化配置
  initializeAppConfigs()
})
</script>

<style scoped lang="less">
.batch-publish-config-step {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  .selected-info {
    font-weight: 500;
  }
}

.config-detail {
  padding: 20px;
  background-color: #f9f9f9;
  
  .config-form {
    max-width: 600px;
    margin: 0 auto;
  }
}

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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.batch-config-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-toolbar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

.version-info {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
