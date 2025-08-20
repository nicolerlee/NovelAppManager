<template>
  <div class="system-settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-button type="primary" size="small" @click="handleSaveSettings">保存设置</el-button>
        </div>
      </template>
      
      <el-form :model="systemSettings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="systemSettings.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="系统版本">
          <el-input v-model="systemSettings.version" placeholder="请输入系统版本" disabled />
        </el-form-item>
        <el-form-item label="API接口地址">
          <el-input v-model="systemSettings.apiUrl" placeholder="请输入API接口地址" />
        </el-form-item>
        <el-form-item label="数据备份间隔">
          <el-input-number v-model="systemSettings.backupInterval" :min="1" :max="24" placeholder="小时" />
        </el-form-item>
        <el-form-item label="日志保留天数">
          <el-input-number v-model="systemSettings.logRetentionDays" :min="1" :max="365" placeholder="天" />
        </el-form-item>
        <el-form-item label="开启调试模式">
          <el-switch v-model="systemSettings.debugMode" />
        </el-form-item>
        <el-form-item label="允许匿名访问">
          <el-switch v-model="systemSettings.allowAnonymousAccess" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 系统设置数据
const systemSettings = ref({
  systemName: '文曲-小说小程序创作中心',
  version: '1.0.0',
  apiUrl: 'https://api.example.com',
  backupInterval: 24,
  logRetentionDays: 30,
  debugMode: false,
  allowAnonymousAccess: false
});

// 保存系统设置
const handleSaveSettings = () => {
  // 模拟保存操作
  ElMessage.success('系统设置保存成功');
  console.log('保存系统设置:', systemSettings.value);
};

// 组件挂载时执行
onMounted(() => {
  // 模拟从API获取数据
  console.log('系统设置组件已挂载');
});
</script>

<style scoped>
.system-settings-container {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>