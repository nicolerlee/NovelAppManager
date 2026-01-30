<template>
  <div class="batch-config-step">
    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar">
      <el-button type="primary" @click="openBatchConfigDialog">
        批量配置
      </el-button>
      <el-button type="success" @click="incrementAllVersions" :loading="incrementLoading">
        版本号+1
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
              <el-form-item label="构建环境">
                <el-radio-group v-model="scope.row.config.environment" :disabled="testEnvironment">
                  <el-radio label="production">生产环境</el-radio>
                  <el-radio label="test" v-if="testEnvironment">测试环境</el-radio>
                </el-radio-group>
                <div v-if="testEnvironment" class="environment-notice">
                  <el-alert
                    title="注意：微距测试环境已固定为测试环境"
                    type="info"
                    show-icon
                    :closable="false"
                  />
                </div>
              </el-form-item>

              <el-form-item label="构建类型">
                <el-select v-model="scope.row.config.buildType" placeholder="请选择构建类型">
                  <el-option label="完整构建" value="full" />
                </el-select>
              </el-form-item>

              <el-form-item label="优化选项">
                <el-checkbox-group v-model="scope.row.config.optimizations">
                  <el-checkbox label="codeMinify" disabled>代码压缩</el-checkbox>
                  <el-checkbox label="imageCompress" disabled>图片压缩</el-checkbox>
                  <el-checkbox label="treeShaking" disabled>Tree Shaking</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item v-if="testEnvironment" label="business_type">
                <el-input
                  v-model="scope.row.config.businessType"
                  placeholder="请输入business_type"
                />
              </el-form-item>
              
              <el-form-item v-if="testEnvironment" label="public_switch">
                <el-input
                  v-model="scope.row.config.publicSwitch"
                  placeholder="请输入public_switch"
                />
              </el-form-item>
              
              <el-form-item v-if="testEnvironment" label="启用网络监控">
                <el-checkbox v-model="scope.row.config.useNetworkMonitorTest">启用网络监控</el-checkbox>
              </el-form-item>

              <el-form-item label="构建说明">
                <el-input
                  v-model="scope.row.config.description"
                  type="textarea"
                  rows="3"
                  placeholder="请输入本次构建的说明信息"
                  :rules="descriptionRules"
                />
              </el-form-item>

              <el-form-item label="版本号">
                <el-input
                  v-model="scope.row.config.version"
                  placeholder="请输入版本号"
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
            {{ scope.row.platformName }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="版本" width="100">
        <template #default="scope">
          {{ scope.row.config.version }}
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
      <el-table-column label="构建环境" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.config.environment === 'production' ? 'success' : (scope.row.config.environment === 'test' ? 'warning' : 'info')">
            {{ scope.row.config.environment === 'production' ? '生产环境' : (scope.row.config.environment === 'test' ? '测试环境' : '开发环境') }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="构建类型" width="120">
        <template #default="scope">
          {{ getBuildTypeName(scope.row.config.buildType) }}
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
            type="success"
            link
            @click="applyVersion(scope.row)"
          >
            应用
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
        <el-form-item label="构建环境">
          <el-radio-group v-model="batchConfig.environment" :disabled="testEnvironment">
            <el-radio label="production">生产环境</el-radio>
            <el-radio label="test" v-if="testEnvironment">测试环境</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="构建类型">
          <el-select v-model="batchConfig.buildType" placeholder="请选择构建类型">
            <el-option label="完整构建" value="full" />
          </el-select>
        </el-form-item>

        <el-form-item label="优化选项">
          <el-checkbox-group v-model="batchConfig.optimizations">
            <el-checkbox label="codeMinify" disabled>代码压缩</el-checkbox>
            <el-checkbox label="imageCompress" disabled>图片压缩</el-checkbox>
            <el-checkbox label="treeShaking" disabled>Tree Shaking</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="testEnvironment" label="启用网络监控">
          <el-checkbox v-model="batchConfig.useNetworkMonitorTest">启用网络监控</el-checkbox>
        </el-form-item>

        <el-form-item label="构建说明">
          <el-input
            v-model="batchConfig.description"
            type="textarea"
            rows="3"
            placeholder="请输入本次构建的说明信息"
          />
        </el-form-item>

        <el-form-item label="版本号">
          <el-input
            v-model="batchConfig.version"
            placeholder="请输入版本号"
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
          <el-button type="primary" @click="applyBatchConfig" :loading="loading">确定</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// Props
const props = defineProps({
  selectedApps: {
    type: Array,
    default: () => []
  },
  testEnvironment: {
    type: Boolean,
    default: false
  },
  adType: {
    type: String,
    default: 'tt-fun' // 默认为统一广告位
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
const loading = ref(false) // 用于控制批量配置的加载状态
const batchVersionLoading = ref(false) // 用于控制批量版本更新的加载状态
const incrementLoading = ref(false) // 用于控制版本号+1的加载状态

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
const getDefaultConfig = () => {
  return {
    environment: props.testEnvironment ? 'test' : 'production',
    buildType: 'full',
    optimizations: ['codeMinify', 'imageCompress', 'treeShaking'],
    description: '',
    version: '',
    useNetworkMonitorTest: true, // 默认启用网络监控
 }
}
// 批量配置
const batchConfig = ref({
  ...getDefaultConfig(),
 environment: props.testEnvironment ? 'test' : 'production', // 确保批量配置在测试环境模式下也使用测试环境
  applyScope: 'all', // all 或 selected
 enabled: '1',
  alias: '',
 priority: '0',
 useNetworkMonitorTest: true // 默认启用网络监控
})


// 初始化应用配置
const initializeAppConfigs = async () => {
  const configs = [];
  
  for (const app of props.selectedApps) {
    const config = {
      ...app,
      config: {
        ...getDefaultConfig(),
        version: app.version || '', // 使用后端返回的版本号，如果没有则使用空字符串
        environment: props.testEnvironment ? 'test' : getDefaultConfig().environment // 在测试环境模式下固定为测试环境
      }
    };
    // 如果是测试环境，需要从数据库获取business_type和public_switch
    if (props.testEnvironment) {
      // 如果adType是tt-fun，不需要请求后台接口，直接写死businessType和publicSwitch
      if (props.adType === 'tt-fun') {
        config.config.businessType = 'tt_miniapp_fun_business_type';
        config.config.publicSwitch = 'tt_miniapp_fun_public_switch';
      } else if (props.adType === 'no-ad') {
        // 无广告位：设置特殊标识，后端会识别并设置固定URL和空adId
        config.config.businessType = '__NO_AD__';
        config.config.publicSwitch = '__NO_AD__';
      } else {
        try {
          const response = await request.get(`/api/novel-apps/getByAppId?appId=${app.appId}`);
          if (response.code === 200 && response.data) {
            // 注意：根据NovelApp实体类，business_type映射到deliverId字段，这是一个错误的映射
            // 但在当前情况下，我们使用deliverId获取business_type的值
            config.config.businessType = response.data.deliverId || '';
            // 设置public_switch的值，如果后端数据中有对应字段则使用，否则使用默认值
            config.config.publicSwitch = response.data.bannerId || '';
          } else {
            config.config.businessType = '';
            config.config.publicSwitch = '';
          }
        } catch (error) {
          console.error(`获取应用 ${app.appId} 的business_type和public_switch失败:`, error);
          config.config.businessType = '';
          config.config.publicSwitch = '';
        }
      }
      // 设置默认的 useNetworkMonitorTest
      config.config.useNetworkMonitorTest = true;
    }
    
    configs.push(config);
  }
  
  appConfigs.value = configs;

}

// 方法 - 获取平台标签类型
const getPlatformTagType = (platform) => {
  const typeMap = {
    '微信': 'success',
    '支付宝': 'primary',
    '百度': 'warning',
    '字节': 'danger'
  }
  return typeMap[platform] || 'info'
}

// 方法 - 获取状态标签类型
const getStatusTagType = (status) => {
 const typeMap = {
    '1': 'success',
    '0': 'error',
  }
  return typeMap[status] || 'info'
}

// 方法 - 获取构建类型名称
const getBuildTypeName = (type) => {
  const types = {
    'full': '完整构建',
    'incremental': '增量构建',
    'quick': '快速构建'
  }
  return types[type] || type
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
  // 检查选中项的版本号是否一致
  if (selectedAppConfigs.value.length > 0) {
    // 获取第一个选中项的版本号作为基准
    const firstVersion = selectedAppConfigs.value[0].config.version
    // 检查所有选中项的版本号是否一致
    const allVersionsSame = selectedAppConfigs.value.every(app => app.config.version === firstVersion)
    
    // 如果版本号一致，则使用该版本号，否则设置为空
    batchConfig.value.version = allVersionsSame ? firstVersion : ''
    
    // 获取第一个选中项的business_type作为基准
    const firstBusinessType = selectedAppConfigs.value[0].config.businessType
    // 检查所有选中项的business_type是否一致
    const allBusinessTypesSame = selectedAppConfigs.value.every(app => app.config.businessType === firstBusinessType)
    
    // 如果business_type一致，则使用该值，否则设置为空
    batchConfig.value.businessType = allBusinessTypesSame ? firstBusinessType : ''
    
    // 获取第一个选中项的public_switch作为基准
    const firstPublicSwitch = selectedAppConfigs.value[0].config.publicSwitch
    // 检查所有选中项的public_switch是否一致
    const allPublicSwitchesSame = selectedAppConfigs.value.every(app => app.config.publicSwitch === firstPublicSwitch)
    
    // 如果public_switch一致，则使用该值，否则设置为空
    batchConfig.value.publicSwitch = allPublicSwitchesSame ? firstPublicSwitch : ''
    
  } else {
    // 如果没有选中项，则使用第一个小程序的版本号、business_type和public_switch作为默认值
    batchConfig.value.version = appConfigs.value.length > 0 ? appConfigs.value[0].config.version : ''
    batchConfig.value.businessType = appConfigs.value.length > 0 ? appConfigs.value[0].config.businessType : (props.adType === 'tt-fun' ? 'tt_miniapp_fun_business_type' : '')
    batchConfig.value.publicSwitch = appConfigs.value.length > 0 ? appConfigs.value[0].config.publicSwitch : (props.adType === 'tt-fun' ? 'tt_miniapp_fun_public_switch' : '')
  }
  
  batchConfigDialogVisible.value = true
}

// 方法 - 应用批量配置
const applyBatchConfig = async () => {
  // 设置加载状态
  loading.value = true
  
  try {
   // 根据应用范围更新配置
   if (batchConfig.value.applyScope === 'all') {
     // 应用到所有
     appConfigs.value.forEach(app => {
       // 保存原有配置并合并新配置
       let newConfig = { ...app.config, ...batchConfig.value }
       // 移除applyScope属性，因为它不是配置的一部分
       delete newConfig.applyScope
       // 如果是individual adType，不更新businessType和publicSwitch字段
       if (props.adType === 'individual') {
         const originalBusinessType = app.config.businessType
         const originalPublicSwitch = app.config.publicSwitch
         newConfig = {
           ...newConfig,
           businessType: originalBusinessType,
           publicSwitch: originalPublicSwitch
         }
       }
       // 如果是测试环境模式，确保环境固定为测试环境
       if (props.testEnvironment) {
         newConfig.environment = 'test'
       }
       app.config = newConfig
     })
   } else {
     // 应用到选中项
     selectedAppConfigs.value.forEach(selectedApp => {
       const appIndex = appConfigs.value.findIndex(app => app.id === selectedApp.id)
       if (appIndex >= 0) {
         // 保存原有配置并合并新配置
         let newConfig = { ...appConfigs.value[appIndex].config, ...batchConfig.value }
         // 移除applyScope属性
         delete newConfig.applyScope
         // 如果是individual adType，不更新businessType和publicSwitch字段
         if (props.adType === 'individual') {
           const originalBusinessType = appConfigs.value[appIndex].config.businessType
           const originalPublicSwitch = appConfigs.value[appIndex].config.publicSwitch
           newConfig = {
             ...newConfig,
             businessType: originalBusinessType,
             publicSwitch: originalPublicSwitch
           }
         }
         // 如果是测试环境模式，确保环境固定为测试环境
         if (props.testEnvironment) {
           newConfig.environment = 'test'
         }
         appConfigs.value[appIndex].config = newConfig
       }
     })
   }
    
    // 应用批量版本更新
    await applyBatchVersion()
    
    ElMessage.success('批量配置已应用')
    batchConfigDialogVisible.value = false
  } catch (error) {
    console.error('批量配置应用失败:', error)
    ElMessage.error('批量配置应用失败: ' + error.message)
  } finally {
    // 重置加载状态
    loading.value = false
  }
}

// 方法 - 重置单个小程序配置
const resetAppConfig = (app) => {
 const configIndex = appConfigs.value.findIndex(item => item.id === app.id)
  if (configIndex >= 0) {
    // 使用当前的 adType 设置默认 businessType 和 publicSwitch
    const resetConfig = {
      ...getDefaultConfig(),
      version: app.version || '', // 使用后端返回的版本号，如果没有则使用空字符串
      environment: props.testEnvironment ? 'test' : getDefaultConfig().environment, // 在测试环境模式下固定为测试环境
      businessType: props.adType === 'tt-fun' ? 'tt_miniapp_fun_business_type' : '',
      publicSwitch: props.adType === 'tt-fun' ? 'tt_miniapp_fun_public_switch' : '',
      useNetworkMonitorTest: props.testEnvironment ? true : undefined // 只在测试环境设置，默认true
    }
    appConfigs.value[configIndex].config = resetConfig
    ElMessage.success(`已重置 ${app.name} 的配置`)
  }
}

// 方法 - 应用版本
const applyVersion = async (app) => {
  try {
    // 获取应用的配置信息
    const appConfig = appConfigs.value.find(item => item.id === app.id);
    if (!appConfig) {
      ElMessage.error('未找到应用配置信息');
      return;
    }
    
    // 准备请求数据
    const requestData = {
      appId: appConfig.appId,
      version: appConfig.config.version
    };
    
    // 调用后端API更新版本号
    const response = await request.post('/api/novel-apps/updateVersion', requestData);
    
    if (response.code === 200) {
      // 更新本地的版本号
      appConfig.version = appConfig.config.version;
      ElMessage.success(`已应用 ${app.name} 的版本`);
    } else {
      ElMessage.error(`应用版本失败: ${response.message}`);
    }
  } catch (error) {
    console.error('应用版本时发生错误:', error);
    ElMessage.error(`应用版本失败: ${error.message}`);
  }
}

// 方法 - 批量版本号+1
const incrementAllVersions = async () => {
  // 确认操作
  try {
    await ElMessageBox.confirm(
      '确定要将所有应用的版本号+1吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return // 用户取消操作
  }
  
  // 设置加载状态
  incrementLoading.value = true
  
  try {
    // 获取所有应用的ID
    const appIds = appConfigs.value.map(app => app.appId).filter(id => id)
    
    if (appIds.length === 0) {
      ElMessage.warning('没有可更新的应用')
      return
    }
    
    // 调用后端API批量递增版本号
    const response = await request.post('/api/novel-apps/incrementVersions', {
      appIds: appIds
    })
    
    if (response.code === 200) {
      const result = response.data
      const successCount = result.successCount || 0
      const failedCount = result.failedCount || 0
      
      // 更新本地版本号
      if (result.details && Array.isArray(result.details)) {
        result.details.forEach(detail => {
          if (detail.success) {
            // 找到对应的应用并递增版本号
            const appConfig = appConfigs.value.find(app => app.appId === detail.appId)
            if (appConfig) {
              // 从消息中提取新版本号
              const match = detail.message.match(/更新到 (\d+\.\d+\.\d+)/)
              if (match) {
                const newVersion = match[1]
                appConfig.config.version = newVersion
                appConfig.version = newVersion
              } else {
                // 如果无法从消息中提取，手动递增
                appConfig.config.version = incrementVersionLocal(appConfig.config.version)
                appConfig.version = appConfig.config.version
              }
            }
          }
        })
      }
      
      // 显示成功信息
      if (failedCount === 0) {
        ElMessage.success(`批量版本号+1成功，共更新 ${successCount} 个应用`)
      } else {
        ElMessage.warning(`批量版本号+1完成，成功 ${successCount} 个，失败 ${failedCount} 个`)
        
        // 显示失败的详细信息
        const failedDetails = result.details?.filter(detail => !detail.success) || []
        if (failedDetails.length > 0) {
          console.warn('批量版本号+1失败详情:', failedDetails)
        }
      }
    } else {
      ElMessage.error(`批量版本号+1失败: ${response.message}`)
    }
  } catch (error) {
    console.error('批量版本号+1时发生错误:', error)
    ElMessage.error(`批量版本号+1失败: ${error.message}`)
  } finally {
    incrementLoading.value = false
  }
}

// 本地版本号递增函数（用于前端显示）
const incrementVersionLocal = (version) => {
  if (!version) return '1.0.0'
  
  const parts = version.split('.')
  if (parts.length !== 3) return version
  
  try {
    let major = parseInt(parts[0])
    let minor = parseInt(parts[1])
    let patch = parseInt(parts[2])
    
    // 规则1: 如果最后一位不是9，就+1
    if (patch !== 9) {
      return `${major}.${minor}.${patch + 1}`
    }
    
    // 规则2: 如果最后一位是9，中间位+1，最后一位归零
    if (minor !== 9) {
      return `${major}.${minor + 1}.0`
    }
    
    // 规则3: 如果中间位也是9，第一位+1，中间位归零，最后一位保持不变
    return `${major + 1}.0.${patch}`
  } catch {
    return version
  }
}

// 方法 - 批量应用版本
const applyBatchVersion = async () => {
  // 设置加载状态
  batchVersionLoading.value = true
  
  try {
    // 根据应用范围确定要更新的应用列表
    let appsToUpdate = [];
    if (batchConfig.value.applyScope === 'all') {
      // 应用到所有
      appsToUpdate = appConfigs.value;
    } else {
      // 应用到选中项
      appsToUpdate = selectedAppConfigs.value;
    }
    
    // 过滤掉没有appId或version的应用
    const validApps = appsToUpdate.filter(app => app.appId && app.config.version);
    
    // 如果没有有效的应用需要更新，直接返回
    if (validApps.length === 0) {
      return;
    }
    
    // 构建批量更新请求数据
    const batchData = {
      updates: validApps.map(app => ({
        appId: app.appId,
        version: app.config.version
      }))
    };
    
    // 调用后端API批量更新版本号
    const response = await request.post('/api/novel-apps/batchUpdateVersion', batchData);
    
    if (response.code === 200) {
      const result = response.data;
      const successCount = result.successCount || 0;
      const failedCount = result.failedCount || 0;
      
      // 更新成功应用的本地版本号
      if (result.details && Array.isArray(result.details)) {
        result.details.forEach(detail => {
          if (detail.success) {
            // 找到对应的应用并更新版本号
            const appConfig = appConfigs.value.find(app => app.appId === detail.appId);
            if (appConfig) {
              appConfig.version = detail.version || appConfig.config.version;
            }
          }
        });
      }
      
      // 显示成功信息
      if (failedCount === 0) {
        ElMessage.success(`批量版本更新成功，共更新 ${successCount} 个应用`);
      } else {
        // 有失败的情况，显示详细信息
        ElMessage.warning(`批量版本更新完成，成功 ${successCount} 个，失败 ${failedCount} 个`);
        
        // 显示失败的详细信息
        const failedDetails = result.details?.filter(detail => !detail.success) || [];
        if (failedDetails.length > 0) {
          console.warn('批量版本更新失败详情:', failedDetails);
          // 可以考虑显示更详细的错误信息给用户
        }
      }
    } else {
      ElMessage.error(`批量版本更新失败: ${response.message}`);
    }
  } catch (error) {
    console.error('批量版本更新时发生错误:', error);
    ElMessage.error(`批量版本更新失败: ${error.message}`);
  } finally {
    // 重置加载状态
    batchVersionLoading.value = false;
  }
}

// 方法 - 重置所有配置
const resetAllConfigs = () => {
  appConfigs.value.forEach(app => {
    app.config = {
      ...getDefaultConfig(),
      version: app.version || '', // 使用后端返回的版本号，如果没有则使用空字符串
      environment: props.testEnvironment ? 'test' : getDefaultConfig().environment, // 在测试环境模式下固定为测试环境
      businessType: props.adType === 'tt-fun' ? 'tt_miniapp_fun_business_type' : '',
      publicSwitch: props.adType === 'tt-fun' ? 'tt_miniapp_fun_public_switch' : '',
      useNetworkMonitorTest: props.testEnvironment ? true : undefined // 只在测试环境设置，默认true
    }
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
  // 如果是测试环境模式，检查所有应用的business_type和public_switch字段
  if (props.testEnvironment) {
    const emptyBusinessTypeApps = [];
    const emptyPublicSwitchApps = [];
    
    appConfigs.value.forEach(app => {
      // 检查business_type是否为空或只包含空白字符
      if (!app.config.businessType || app.config.businessType.trim() === '') {
        emptyBusinessTypeApps.push(app.name);
      }
      
      // 检查public_switch是否为空或只包含空白字符
      if (!app.config.publicSwitch || app.config.publicSwitch.trim() === '') {
        emptyPublicSwitchApps.push(app.name);
      }
    });
    
    // 如果有应用的business_type为空，显示错误信息并返回false
    if (emptyBusinessTypeApps.length > 0) {
      let errorMessage = '以下应用的business_type不能为空：\n';
      errorMessage += emptyBusinessTypeApps.join('\n');
      ElMessage.error(errorMessage);
      return false;
    }
    
    // 如果有应用的public_switch为空，显示错误信息并返回false
    if (emptyPublicSwitchApps.length > 0) {
      let errorMessage = '以下应用的public_switch不能为空：\n';
      errorMessage += emptyPublicSwitchApps.join('\n');
      ElMessage.error(errorMessage);
      return false;
    }
    
   }
  
  // 可以添加更多验证逻辑
  return true

}

// 方法 - 下一步
const goToNextStep = () => {
  // 验证配置并传递给父组件
  if (validateConfigs()) {
    // 只传递必要的数据给父组件
    const configData = appConfigs.value.map(app => ({
      id: app.id,
      name: app.name,
      platform: app.platform,
      platformName: app.platformName,
      config: app.config
    }))
    emit('next', configData)
  }
}

// 监听选中应用的变化
watch(
  () => props.selectedApps,
  async (newApps) => {
    // 当选中的应用发生变化时，更新配置
    await initializeAppConfigs();
  },
  { deep: true, immediate: true }
)

// 监听adType变化
watch(
  () => props.adType,
  async (newAdType) => {
    console.log('adType变化:', newAdType);
    // 当adType变化时，重新初始化配置
    await initializeAppConfigs();
  },
  { immediate: true }
)

// 组件挂载时的初始化逻辑
onMounted(async () => {
  // 初始化配置
 await initializeAppConfigs();
})
</script>

<style scoped lang="less">
.batch-config-step {
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

.environment-notice {
 margin-top: 10px;
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
  
  .environment-notice {
    margin-top: 5px;
  }
}
</style>
