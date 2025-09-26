<template>
  <div class="admin-container">
    <el-card class="admin-card">

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="用户管理" name="userManagement">
          <UserManagement />
        </el-tab-pane>
        <el-tab-pane label="日志查看" name="logs">
          <LogViewer />
        </el-tab-pane>
        <el-tab-pane label="重要操作数据归档" name="archive">
          <OperationArchive />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 导入子组件
import UserManagement from '../components/admin/UserManagement.vue';
import LogViewer from '../components/admin/LogViewer.vue';
import OperationArchive from '../components/admin/OperationArchive.vue';

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