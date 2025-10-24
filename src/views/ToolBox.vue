<template>
  <div class="toolbox-module">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" v-if="$route.path.includes('/toolbox/')" />
        <div v-else class="feature-grid">

       <el-card class="feature-card" shadow="hover" @click="generatePreviewCode">
          <div class="feature-icon release-check">
            <el-icon><Grid /></el-icon>
          </div>
          <div class="feature-title">生成预览码</div>
          <div class="feature-desc">一键生成指定path小程序预览码</div>
        </el-card>
        <el-card class="feature-card" shadow="hover" @click="appUploadCheck">
          <div class="feature-icon release-check">
            <el-icon><Check /></el-icon>
          </div>
          <div class="feature-title">发版前防呆检查</div>
          <div class="feature-desc">自动化检查发版前的各项配置和依赖，检查测试代码遗留等</div>
        </el-card>

       <el-card class="feature-card" shadow="hover"  @click="moreToolBox">
          <div class="feature-icon release-check">
            <el-icon><More /></el-icon>
          </div>
          <div class="feature-title">更多创新工具</div>
          <div class="feature-desc">正在开发中，敬请期待</div>
        </el-card>
        </div>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { Check, Star } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { ElMessage } from 'element-plus'

const auth = inject('auth')

const router = useRouter()

const appUploadCheck = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  // 跳转到appUploadCheck组件
  router.push('/toolbox/app-upload-check')
}

const generatePreviewCode = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  router.push('/toolbox/generate-preview-qrcode')
}

const moreToolBox = () => {
  ElMessage.error('正在开发中，敬请期待')
}
</script>

<style scoped>
/* 添加过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.toolbox-module {
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 32px;
}
.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 260px;
  border-radius: 16px;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  padding: 32px 16px 24px 16px;
  background: linear-gradient(135deg, #f8fafc 60%, #f0f5ff 100%);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.feature-card:hover {
  box-shadow: 0 6px 24px 0 rgba(97, 93, 229,0.12);
  transform: translateY(-4px) scale(1.03);
}
.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(97, 93, 229, 0.1) 0%, rgba(103, 194, 58, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.feature-card:hover::after {
  opacity: 1;
}
.feature-icon {
  font-size: 48px;
  margin-bottom: 18px;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feature-icon.release-check {
  color: #409eff;
}
.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
  text-align: center;
}
.feature-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 18px;
  text-align: center;
  min-height: 40px;
}
.el-button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

</style>