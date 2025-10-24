<template>
  <div class="create-mode-selection">
    <el-card class="selection-container">
      <div class="selection-header">
        <h3>请选择创建方式</h3>
        <p>根据您的需求选择适合的小程序创建流程</p>
      </div>
      <div class="selection-grid">
        <el-card class="mode-card" shadow="hover" @click="handleWizardCreate">
          <div class="mode-icon">
            <el-icon><MagicStick /></el-icon>
          </div>
          <div class="mode-title">向导式创建</div>
          <div class="mode-desc">通过引导式流程，快速创建标准化小程序</div>
          <div class="mode-action">
            <el-button type="primary" size="small">开始创建</el-button>
          </div>
        </el-card>
        <el-card class="mode-card" shadow="hover" @click="handleFreeLayout">
          <div class="mode-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <div class="mode-title">自由编排</div>
          <div class="mode-desc">自定义页面布局和功能模块，灵活配置小程序</div>
          <div class="mode-action">
            <el-button type="primary" size="small">开始编排</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { MagicStick, Grid } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 向导式创建 - 跳转到现有创建流程
const handleWizardCreate = () => {
  router.push('/wenqu-auto/auto-create');
};

// 自由编排 - 跳转到自由编排主界面
const handleFreeLayout = () => {
  router.push('/wenqu-auto/free-layout');
};
</script>

<style scoped>
.create-mode-selection {
  padding: 30px;
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
}

.selection-container {
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.selection-header {
  text-align: center;
  margin-bottom: 40px;
}

.selection-header h3 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.selection-header p {
  color: #6c7a89;
  font-size: 16px;
  max-width: 700px;
  margin: 0 auto;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 380px;
  border-radius: 12px;
  border: 1px solid #e1e5eb;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mode-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.mode-card:hover::before {
  opacity: 1;
}

.mode-icon {
  font-size: 56px;
  color: #409eff;
  margin-bottom: 25px;
  transition: all 0.3s ease;
  text-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.mode-card:hover .mode-icon {
  transform: scale(1.1);
  color: #409eff;
}

.mode-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
}

.mode-desc {
  text-align: center;
  color: #6c7a89;
  margin-bottom: 30px;
  flex-grow: 1;
  font-size: 15px;
  line-height: 1.6;
  max-width: 300px;
}

.mode-action {
  margin-top: auto;
}

.mode-card .el-button {
  padding: 12px 30px;
  font-size: 15px;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.mode-card:hover .el-button {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.mode-card:nth-child(2) .mode-icon {
  color: #f56c6c;
}

.mode-card:nth-child(2):hover .mode-icon {
  color: #f56c6c;
}

.mode-card:nth-child(2)::before {
  background: linear-gradient(90deg, #f56c6c 0%, #e6a23c 100%);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .selection-grid {
    grid-template-columns: 1fr;
  }
  .mode-card {
    padding: 30px 20px;
  }
  .selection-container {
    padding: 20px;
    margin: 0 15px;
  }
}
</style>