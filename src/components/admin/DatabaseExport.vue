<template>
  <div class="database-export-container">
    <el-card class="export-card">
      <template #header>
        <div class="card-header">
          <span>数据库导出</span>
        </div>
      </template>
      
      <div class="export-content">
        <el-alert
          v-if="exportStatus === 'error'"
          title="数据库导出功能当前不可用"
          type="error"
          description="请检查数据库连接配置或联系系统管理员"
          show-icon
          closable
        />
        
        <el-alert
          v-if="exportStatus === 'checking'"
          title="正在检查导出功能状态"
          type="info"
          description="请稍候..."
          show-icon
          closable
        />
        
        <el-alert
          v-if="exportStatus === 'available'"
          title="数据库导出功能可用"
          type="success"
          description="点击下方按钮导出数据库为SQL文件"
          show-icon
          closable
        />
        
        <div class="export-controls" v-if="exportStatus === 'available'">
          <!-- 导出格式选择 -->
          <div class="export-format-selector">
            <el-radio-group v-model="exportFormat" size="large">
              <el-radio-button label="sql">单个SQL文件</el-radio-button>
              <el-radio-button label="zip">ZIP包(3个SQL文件)</el-radio-button>
            </el-radio-group>
            <el-popover
              placement="top"
              title="导出格式说明"
              width="300"
              trigger="hover"
            >
              <template #reference>
                <el-icon class="info-icon"><QuestionFilled /></el-icon>
              </template>
              <div class="format-info">
                <p><strong>单个SQL文件：</strong>包含所有表数据的完整SQL文件</p>
                <p><strong>ZIP包：</strong>包含3个分离的SQL文件</p>
                <ul>
                  <li>novel.sql：除微剧和日志表外的所有表</li>
                  <li>novel_weiju.sql：微剧相关表（app_weiju_banner, app_weiju_deliver）</li>
                  <li>novel_log.sql：日志表（user_op_log, user_task, user_task_log）</li>
                </ul>
              </div>
            </el-popover>
          </div>
          
          <el-button
            type="primary"
            :loading="isExporting"
            @click="exportDatabase"
            size="large"
            icon="Download"
          >
            {{ isExporting ? '正在导出...' : '导出数据库' }}
          </el-button>
          
          <div class="export-info" v-if="lastExportTime">
            <p>上次导出时间: {{ lastExportTime }}</p>
          </div>
        </div>
        
        <div class="export-progress" v-if="isExporting">
          <el-progress 
            type="circle" 
            :percentage="exportProgress" 
            :status="exportProgress === 100 ? 'success' : ''"
          />
          <p class="progress-text">正在导出数据库，请稍候...</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import request from '../../utils/request'

// 响应式数据
const exportStatus = ref('checking') // 'checking', 'available', 'error'
const isExporting = ref(false)
const exportProgress = ref(0)
const lastExportTime = ref('')
const exportFormat = ref('zip') // 'sql' for single file, 'zip' for zip package

// 检查导出功能状态
const checkExportStatus = async () => {
  try {
    exportStatus.value = 'checking'
    const response = await request.get('/api/database/export/status')
    if (response.code === 200) {
      exportStatus.value = 'available'
    } else {
      exportStatus.value = 'error'
    }
  } catch (error) {
    console.error('检查导出状态失败:', error)
    exportStatus.value = 'error'
    ElMessage.error('检查导出状态失败: ' + (error.message || '未知错误'))
  }
}

// 导出数据库
const exportDatabase = async () => {
  try {
    isExporting.value = true
    exportProgress.value = 0
    
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (exportProgress.value < 90) {
        exportProgress.value += 10
      }
    }, 200)
    
    // 根据选择的格式确定API端点和文件类型
    let apiUrl, fileType, fileExtension
    if (exportFormat.value === 'zip') {
      apiUrl = '/api/database/export-zip'
      fileType = 'application/zip'
      fileExtension = 'zip'
    } else {
      apiUrl = '/api/database/export'
      fileType = 'application/sql'
      fileExtension = 'sql'
    }
    
    // 发起导出请求
    const response = await request({
      url: apiUrl,
      method: 'GET',
      responseType: 'blob' // 重要：设置响应类型为blob以处理文件下载
    })
    
    // 清除进度更新
    clearInterval(progressInterval)
    exportProgress.value = 100
    
    // 处理文件下载
    const blob = new Blob([response.data], { type: fileType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 根据格式确定文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    if (exportFormat.value === 'zip') {
      link.download = `novel_database_export_${timestamp}.zip`
    } else {
      link.download = `novel_database_export_${timestamp}.sql`
    }
    
    link.click()
    
    // 清理URL对象
    window.URL.revokeObjectURL(url)
    
    // 更新最后导出时间
    lastExportTime.value = new Date().toLocaleString('zh-CN')
    
    // 显示成功通知
    ElNotification({
      title: '导出成功',
      message: exportFormat.value === 'zip'
        ? '数据库已成功导出为ZIP包并下载'
        : '数据库已成功导出为SQL文件并下载',
      type: 'success',
      duration: 3000
    })
  } catch (error) {
    console.error('导出数据库失败:', error)
    ElMessage.error('导出数据库失败: ' + (error.message || '未知错误'))
  } finally {
    isExporting.value = false
  }
}

// 组件挂载时检查导出状态
onMounted(() => {
  checkExportStatus()
})
</script>

<style scoped>
.database-export-container {
  padding: 20px;
  height: 100%;
}

.export-card {
  height: calc(100vh - 300px);
}

.export-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 30px;
}

.export-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.export-format-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.info-icon {
  cursor: pointer;
  color: #909399;
}

.format-info p {
  margin: 5px 0;
}

.format-info ul {
  margin: 5px 0;
  padding-left: 20px;
}

.export-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.export-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.progress-text {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
