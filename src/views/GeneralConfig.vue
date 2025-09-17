<template>
  <div class="general-config">
    <div class="layout-container">
      <!-- 左侧小程序列表 - 使用公共组件 -->
      <AppListSelector @app-selected="handleAppSelect" title="小程序列表" />

      <!-- 右侧通用配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="header">
            <h3 class="title-with-tag" v-if="selectedApp">
              通用配置 - {{ selectedApp.appName }}
              <el-tag :type="getPlatformType(selectedApp.platform)" effect="light" size="small" class="platform-tag">
                {{ selectedApp.platform }}
              </el-tag>
            </h3>
            <h3 v-else>通用配置</h3>
          </div>
        </template>

        <div class="config-content">
          <template v-if="selectedApp">
            <div class="config-form" v-loading="loadingConfig">
              <template v-if="!configForm.id && !tempShowConfig">
                <el-empty 
                  description="暂无配置信息" 
                  :image-size="100"
                >
                  <template #description>
                    <p>当前小程序尚未配置通用信息</p>
                    <p class="sub-text">点击下方按钮创建配置</p>
                  </template>
                  <el-button type="primary" @click="handleCreateConfig">
                    创建配置
                  </el-button>
                </el-empty>
              </template>
              <template v-else>
                <el-form ref="formRef" :model="configForm" :rules="formRules" label-width="160px">
                  <el-form-item label="AppID">
                    <span class="readonly-value">{{ configForm.appId }}</span>
                  </el-form-item>
                  
                  <!-- Conditionally show Douyin field -->
                  <template v-if="selectedApp.platform === '抖音'">
                    <el-form-item label="抖音IM ID">
                      <el-input v-model="configForm.douyinImId" placeholder="请输入抖音IM ID" />
                    </el-form-item>
                    <el-form-item label="抖音AppToken">
                      <el-input
                        v-model="configForm.douyinAppToken"
                        type="textarea"
                        :rows="6"
                        placeholder="请输入抖音AppToken（私钥内容）"
                      />
                    </el-form-item>
                  </template>

                  <!-- Conditionally show Weixin fields -->
                  <template v-if="selectedApp.platform === '微信'">
                    <el-form-item label="微信AppToken">
                      <el-input
                        v-model="configForm.weixinAppToken"
                        type="textarea"
                        :rows="6"
                        placeholder="请输入微信AppToken（私钥内容）"
                      />
                    </el-form-item>
                  </template>

                  <!-- Conditionally show Kuaishou fields -->
                  <template v-if="selectedApp.platform === '快手'">
                    <el-form-item label="快手Client ID">
                      <el-input v-model="configForm.kuaishouClientId" placeholder="请输入快手Client ID" />
                    </el-form-item>
                    <el-form-item label="快手Client Secret">
                      <el-input v-model="configForm.kuaishouClientSecret" placeholder="请输入快手Client Secret" show-password />
                    </el-form-item>
                    <el-form-item label="快手AppToken">
                      <el-input
                        v-model="configForm.kuaishouAppToken"
                        type="textarea"
                        :rows="6"
                        placeholder="请输入快手AppToken（私钥内容）"
                      />
                    </el-form-item>
                  </template>
            
                  <el-form-item label="客服URL">
                    <el-input v-model="configForm.contact" placeholder="请输入客服URL" />
                  </el-form-item>
            
                  <el-form-item label="构建命令" prop="buildCode">
                    <el-input v-model="configForm.buildCode" placeholder="请输入构建命令（如 npm run build:xxx）" />
                  </el-form-item>
                  
                  <el-form-item label="IAA模式">
                    <el-switch v-model="configForm.iaaMode" />
                    <span class="form-tip">是否开启IAA(In-App-Advertising)模式</span>
                  </el-form-item>
                  <el-form-item v-if="configForm.iaaMode" label="IAA弹窗样式">
                    <el-radio-group v-model="configForm.iaaDialogStyle" class="iaa-dialog-style-card-group">
                      <el-radio-button
                        v-for="item in iaaDialogStyleOptions"
                        :key="item.value"
                        :label="item.value"
                        class="iaa-dialog-style-card"
                      >
                        <div class="iaa-dialog-style-card-inner" :class="{ selected: configForm.iaaDialogStyle === item.value }">
                          <img :src="item.img" :alt="item.label" />
                          <div class="iaa-dialog-style-label">{{ item.label }}</div>
                        </div>
                      </el-radio-button>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="屏蔽支付入口">
                    <el-switch v-model="configForm.hidePayEntry" />
                    <span class="form-tip">除微信IOS的非投流渠道，默认不屏蔽。审核失败时候可尝试屏蔽处理</span>
                  </el-form-item>
                  <el-form-item label="屏蔽移动积分兑换入口">
                    <el-switch v-model="configForm.hideScoreExchange" />
                  </el-form-item>
                 
                  <!-- 我的页登录类型 -->
                  <el-form-item label="我的页登录类型" class="login-type-item">
                    <el-radio-group v-model="configForm.mineLoginType">
                      <el-radio label="anonymousLogin">静默登录</el-radio>
                      <el-radio label="phoneLogin">
                        手机号授权登录
                        <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
            
                  <!-- 阅读页登录类型 -->
                  <el-form-item label="阅读页登录类型" class="login-type-item">
                    <el-radio-group v-model="configForm.readerLoginType">
                      <el-radio label="anonymousLogin">静默登录</el-radio>
                      <el-radio label="phoneLogin">
                        手机号授权登录
                        <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
            
                  <el-form-item>
                    <el-button v-if="tempShowConfig" type="primary" @click="handleCreateConfig">创建配置</el-button>
                    <el-button v-if="!tempShowConfig" type="primary" @click="handleSaveConfig" :loading="saving">保存配置</el-button>
                    <!-- <el-button v-if="!tempShowConfig && configForm.id" type="danger" @click="handleDeleteConfirm">删除配置</el-button> -->
                    <el-button v-if="!tempShowConfig" @click="handleCopyGeneralConfig">复制配置</el-button>
                    <el-button v-if="!tempShowConfig" @click="handlePasteGeneralConfig">粘贴配置</el-button>
                  </el-form-item>
                </el-form>
              </template>
            </div>
          </template>
          <template v-else>
            <el-empty 
              description="请先选择一个小程序" 
              :image-size="200"
            >
              <template #description>
                <p>请从左侧列表选择一个小程序以进行通用配置</p>
              </template>
            </el-empty>
          </template>
      </div>
    </el-card>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除该配置吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted ,ref, inject, watch ,computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import request from '../utils/request'
import AppListSelector from '../components/common/AppListSelector.vue'

const auth = inject('auth')

// 状态变量
const loadingConfig = ref(false)
const saving = ref(false)
const selectedApp = ref(null)
const deleteDialogVisible = ref(false)
const tempShowConfig=ref(false)
const configForm = ref({
  id: null,
  appId: '',
  contact: '',
  douyinImId: '',
  kuaishouClientId: '',
  kuaishouClientSecret: '',
  buildCode: '',
  kuaishouAppToken: '',
  douyinAppToken: '',
  weixinAppToken: '',
  mineLoginType: 'anonymousLogin',
  readerLoginType: 'anonymousLogin',
  iaaMode: false,
  iaaDialogStyle: null,
  hidePayEntry:false,
  hideScoreExchange: true,
})
const formRef = ref(null)

const formRules = {
  buildCode: [
    { required: true, message: '请输入构建命令', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (/^\d+$/.test(value)) {
          callback(new Error('构建命令不能为纯数字'));
        } else if (/^\d/.test(value)) {
          callback(new Error('构建命令不能以数字开头'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  // ... 你可以把其他字段的校验规则也写在这里
}

// 获取通用配置
const fetchConfig = async (appId) => {
  if (!appId) return

  loadingConfig.value = true
  try {
    const res = await request.get('/api/novel-common/getAppCommonConfig', {
      params: { appId }
    })
    if (res.code === 200) {
      configForm.value = {
        id: res.data.id || null,
        appId: res.data.appId || '',
        contact: res.data.contact || '',
        douyinImId: res.data.douyinImId || '',
        kuaishouClientId: res.data.kuaishouClientId || '',
        kuaishouClientSecret: res.data.kuaishouClientSecret || '',
        buildCode: res.data.buildCode || '',
        kuaishouAppToken: res.data.kuaishouAppToken || '',
        douyinAppToken: res.data.douyinAppToken || '',
        weixinAppToken: res.data.weixinAppToken || '',
        mineLoginType: res.data.mineLoginType || 'anonymousLogin',
        readerLoginType: res.data.readerLoginType || 'anonymousLogin',
        iaaMode: res.data.iaaMode ?? false,
        iaaDialogStyle: res.data.iaaDialogStyle ?? null,
        hidePayEntry:res.data.hidePayEntry ?? false,
        hideScoreExchange:res.data.hideScoreExchange ?? false,
      }
    } else {
      ElMessage.warning(res.message || '获取配置失败，可能该小程序未创建通用配置');
      configForm.value = {
        id: null,
        appId: selectedApp.value.appid,
        contact: '',
        douyinImId: '',
        kuaishouClientId: '',
        kuaishouClientSecret: '',
        buildCode: '',
        kuaishouAppToken: '',
        douyinAppToken: '',
        weixinAppToken: '',
        mineLoginType: 'anonymousLogin',
        readerLoginType: 'anonymousLogin',
        iaaMode: false,
        iaaDialogStyle: null,
        hidePayEntry:false,
        hideScoreExchange:true
      }
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    configForm.value = {
      id: null,
      appId: selectedApp.value.appid,
      contact: '',
      douyinImId: '',
      kuaishouClientId: '',
      kuaishouClientSecret: '',
      buildCode: '',
      kuaishouAppToken: '',
      douyinAppToken: '',
      weixinAppToken: '',
      mineLoginType: 'anonymousLogin',
      readerLoginType: 'anonymousLogin',
      iaaMode: false,
      iaaDialogStyle: null,
      hidePayEntry:false,
      hideScoreExchange:true
    }
  } finally {
    loadingConfig.value = false
  }
}

// 平台类型转换 - 保留用于右侧配置面板的平台标签显示
const getPlatformType = (platform) => {
  const types = {
    '抖音': 'info',
    '快手': 'danger',
    '微信': 'success',
    '百度': 'primary'
  }
  return types[platform] || 'info'
}

// 选择小程序
const handleAppSelect = (app) => {
  selectedApp.value = app
  fetchConfig(app.appid)
}

// 保存配置
const handleSaveConfig = async () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  if (!selectedApp.value?.appid) {
    ElMessage.warning('请先选择小程序')
    return
  }
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请检查表单填写是否正确');
    return;
  }

  // 保存前增加二次确认弹窗
  try {
    await ElMessageBox.confirm(
      '保存将会同步修改代码，请谨慎操作',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch (e) {
    // 用户取消
    return
  }

  saving.value = true
  try {
    // 只提交必要的字段
    const requestData = {
      id: configForm.value.id,
      appId: selectedApp.value.appid,
      contact: configForm.value.contact,
      douyinImId: configForm.value.douyinImId,
      kuaishouClientId: configForm.value.kuaishouClientId,
      kuaishouClientSecret: configForm.value.kuaishouClientSecret,
      buildCode: configForm.value.buildCode,
      kuaishouAppToken: configForm.value.kuaishouAppToken,
      douyinAppToken: configForm.value.douyinAppToken,
      weixinAppToken: configForm.value.weixinAppToken,
      mineLoginType: configForm.value.mineLoginType,
      readerLoginType: configForm.value.readerLoginType,
      iaaMode: configForm.value.iaaMode,
      iaaDialogStyle: configForm.value.iaaMode ? configForm.value.iaaDialogStyle : null,
      hidePayEntry: configForm.value.hidePayEntry,
      hideScoreExchange: configForm.value.hideScoreExchange,
    }

    const res = await request.post('/api/novel-common/updateAppCommonConfig', requestData)
    
    if (res.code === 200) {
      ElMessage.success('配置保存成功')
    } else {
      throw new Error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error(error.message || '保存配置失败')
  } finally {
    saving.value = false
  }
}

// 创建配置
const handleCreateConfig = async () => {
  if (!selectedApp.value?.appid) {
    ElMessage.warning('请先选择小程序')
    return
  }
  // const valid = await formRef.value?.validate().catch(() => false);
  // if (!valid) {
  //   ElMessage.error('请检查表单填写是否正确');
  //   return;
  // }
  if(!tempShowConfig.value){
    tempShowConfig.value = true
    return
  }
  saving.value = true
  try {
    // 只提交必要的字段
    const requestData = {
      appId: selectedApp.value.appid,
      contact: configForm.value.contact,
      douyinImId: configForm.value.douyinImId,
      kuaishouClientId: configForm.value.kuaishouClientId,
      kuaishouClientSecret: configForm.value.kuaishouClientSecret,
      buildCode: configForm.value.buildCode,
      kuaishouAppToken: configForm.value.kuaishouAppToken,
      douyinAppToken: configForm.value.douyinAppToken,
      weixinAppToken: configForm.value.weixinAppToken,
      mineLoginType: configForm.value.mineLoginType,
      readerLoginType: configForm.value.readerLoginType,
      iaaMode: configForm.value.iaaMode,
      iaaDialogStyle: configForm.value.iaaMode ? configForm.value.iaaDialogStyle : null,
      hidePayEntry: configForm.value.hidePayEntry,
      hideScoreExchange: configForm.value.hideScoreExchange,
    }

    const res = await request.post('/api/novel-common/createAppCommonConfig', requestData)
    
    if (res.code === 200) {
      ElMessage.success('配置创建成功')
      // 直接使用返回的数据更新表单
      configForm.value = {
        id: res.data.id,
        appId: res.data.appId,
        contact: res.data.contact || '',
        douyinImId: res.data.douyinImId || '',
        kuaishouClientId: res.data.kuaishouClientId || '',
        kuaishouClientSecret: res.data.kuaishouClientSecret || '',
        buildCode: res.data.buildCode || '',
        kuaishouAppToken: res.data.kuaishouAppToken || '',
        douyinAppToken: res.data.douyinAppToken || '',
        weixinAppToken: res.data.weixinAppToken || '',
        mineLoginType: res.data.mineLoginType || 'anonymousLogin',
        readerLoginType: res.data.readerLoginType || 'anonymousLogin',
        iaaMode: res.data.iaaMode ?? false,
        iaaDialogStyle: res.data.iaaDialogStyle ?? null,
        hidePayEntry: res.data.hidePayEntry ?? false,
        hideScoreExchange: res.data.hideScoreExchange ?? true,

      }
      tempShowConfig.value = false
    } else {
      throw new Error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建配置失败:', error)
    ElMessage.error(error.message || '创建配置失败')
  } finally {
    saving.value = false
  }
}

// 显示删除确认对话框
const handleDeleteConfirm = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  deleteDialogVisible.value = true
}

// 执行删除操作
const handleDeleteConfig = async () => {
  if (!selectedApp.value?.appid) {
    ElMessage.warning('请先选择小程序')
    return
  }

  loadingConfig.value = true
  try {
    await ElMessageBox.confirm(
      '确定要删除通用配置吗？此操作将对代码进行修改，请谨慎操作。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const res = await request.delete(`/api/novel-common/deleteAppCommonConfig/${configForm.value.id}`);

    if (res.code === 200) {
      ElMessage.success('配置删除成功');
      resetForm();
    } else {
      throw new Error(res.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除配置失败');
  } finally {
    loadingConfig.value = false
  }
};
const handleCopyGeneralConfig = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  try {
    // 复制包含新字段的数据
    const dataToCopy = {
      ...configForm.value,
      mineLoginType: configForm.value.mineLoginType,
      readerLoginType: configForm.value.readerLoginType,
      iaaMode: configForm.value.iaaMode,
      iaaDialogStyle: configForm.value.iaaDialogStyle,
      hidePayEntry: configForm.value.hidePayEntry,
      hideScoreExchange: configForm.value.hideScoreExchange,
    }
    localStorage.setItem('generalConfigCopy', JSON.stringify(dataToCopy))
    ElMessage.success('通用配置已复制')
  } catch (e) {
    console.error('复制失败:', e)
    ElMessage.error('复制失败')
  }
}

const handlePasteGeneralConfig = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  try {
    const data = localStorage.getItem('generalConfigCopy')
    if (data) {
      const parsedData = JSON.parse(data);
      // 粘贴时更新新字段
      configForm.value = {
        ...configForm.value,
        ...parsedData,
        mineLoginType: parsedData.mineLoginType ?? 'anonymousLogin',
        readerLoginType: parsedData.readerLoginType ?? 'anonymousLogin',
        iaaMode: parsedData.iaaMode ?? false,
        iaaDialogStyle: parsedData.iaaDialogStyle ?? null,
        hidePayEntry: parsedData.hidePayEntry ?? false,
        hideScoreExchange: parsedData.hideScoreExchange ?? true,
      }
      ElMessage.success('通用配置已粘贴')
    } else {
      ElMessage.warning('没有可粘贴的配置')
    }
  } catch (e) {
    console.error('粘贴失败:', e)
    ElMessage.error('粘贴失败')
  }
}

// IAA弹窗样式选项
const iaaDialogStyleOptions = [
  { value: 1, label: '样式1', img: '/images/iaaDialogStyle/iaa_dialog_style1.jpg' },
  { value: 2, label: '样式2', img: '/images/iaaDialogStyle/iaa_dialog_style2.jpg' }
]

// IAA模式切换时，自动选中样式1
watch(() => configForm.value.iaaMode, (val) => {
  if (val && !configForm.value.iaaDialogStyle) {
    configForm.value.iaaDialogStyle = 1
  }
  if (!val) {
    configForm.value.iaaDialogStyle = null
  }
})

// 注意：不需要在这里调用fetchApps()，因为AppListSelector组件内部会处理数据加载
</script>

<style scoped>
.general-config {
  padding: 20px;
}

.layout-container {
  display: flex;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-card {
  flex: 1;
  min-width: 0;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.config-card :deep(.el-card__body) {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 24px;
}

.config-content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
}

.title-with-tag {
  display: flex;
  align-items: center;
  margin: 0;
}

.platform-tag {
  margin-left: 8px;
}

.empty-description {
  text-align: center;
  color: #909399;
}

.empty-description .sub-text {
  font-size: 12px;
  margin-top: 8px;
  color: #C0C4CC;
}

.el-empty {
  padding: 40px 0;
}

.config-form {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.readonly-value {
  color: #606266;
  font-size: 14px;
}

.sub-text {
  font-size: 12px;
  margin-top: 8px;
  color: #C0C4CC;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 15px;
  white-space: nowrap;
}

.login-type-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.login-type-item :deep(.el-form-item__content .el-radio-group) {
  align-self: center;
  flex-shrink: 0;
}

.login-type-item :deep(.el-radio__label) {
  display: inline-flex;
  align-items: center;
}

/* 新增IAA弹窗样式卡片布局 */
.iaa-dialog-style-card-group {
  display: flex;
  gap: 12px;
  margin: 12px 0 32px 0;
}
.iaa-dialog-style-card {
  padding: 0;
  border: none;
  background: none;
  box-shadow: none;
}
.iaa-dialog-style-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  padding: 2px 8px 2px 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  min-width: 140px;
  min-height: 180px;
}
.iaa-dialog-style-card-inner.selected,
.iaa-dialog-style-card-inner:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px 0 rgba(64,158,255,0.06); /* 只做轻微阴影，不要蓝色 */
}
.iaa-dialog-style-card-inner img {
  width: 160px;
  height: 240px;
  object-fit: contain;
  border-radius: 4px;
  margin-bottom: 10px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
}
.iaa-dialog-style-label {
  font-size: 15px;
  color: #333;
  margin-top: 2px;
  font-weight: 500;
  text-align: center;
}
</style>