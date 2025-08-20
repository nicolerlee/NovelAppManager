<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <span>后台管理中心</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="用户管理" name="userManagement">
          <UserManagement />
        </el-tab-pane>
        <el-tab-pane label="系统设置" name="systemSettings">
          <SystemSettings />
        </el-tab-pane>
        <el-tab-pane label="日志查看" name="logs">
          <LogViewer />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 导入子组件
import UserManagement from '../components/admin/UserManagement.vue';
import SystemSettings from '../components/admin/SystemSettings.vue';
import LogViewer from '../components/admin/LogViewer.vue';

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
</style>