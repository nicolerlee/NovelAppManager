<template>
  <div class="admin-container">
    <el-card class="admin-card">

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="用户管理" name="userManagement">
          <template v-if="activeTab === 'userManagement'">
            <UserManagement />
          </template>
        </el-tab-pane>
        <el-tab-pane label="日志查看" name="logs">
          <template v-if="activeTab === 'logs'">
            <LogViewer />
          </template>
        </el-tab-pane>
        <el-tab-pane label="重要操作数据归档" name="archive">
          <template v-if="activeTab === 'archive'">
            <OperationArchive />
          </template>
        </el-tab-pane>
        <el-tab-pane label="数据库导出" name="databaseExport">
          <template v-if="activeTab === 'databaseExport'">
            <DatabaseExport />
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
// 使用defineAsyncComponent定义异步组件，实现按需加载
const UserManagement = defineAsyncComponent(() => import('../components/admin/UserManagement.vue'));
const LogViewer = defineAsyncComponent(() => import('../components/admin/LogViewer.vue'));
const OperationArchive = defineAsyncComponent(() => import('../components/admin/OperationArchive.vue'));
const DatabaseExport = defineAsyncComponent(() => import('../components/admin/DatabaseExport.vue'));

// 当前激活的标签页
const activeTab = ref('userManagement');
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.admin-card {
  height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 自定义卡片式标签页样式 */
:deep(.el-tabs--card .el-tabs__item) {
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

:deep(.el-tabs--card .el-tabs__item.is-active) {
  color: #605ce5 !important;
  border-bottom-color: #605ce5 !important;
  font-weight: 600;
}

:deep(.el-tabs--card .el-tabs__item:hover:not(.is-active)) {
  color: #605ce5;
}
</style>