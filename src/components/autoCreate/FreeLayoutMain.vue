<template>
  <div class="free-layout-module">
    <el-card class="main-card">
      <template #header>
        <div class="header-content">
          <h2>自由编排工作台</h2>
          <el-button type="primary" @click="handleSaveLayout">保存编排</el-button>
        </div>
      </template>
      <div class="workspace-container">
        <div class="sidebar">
          <h3>模块待选区</h3>
          <div class="component-list">
            <div 
                  v-for="item in filteredComponents" 
                        :key="item.type"

              class="component-item" 
              draggable="true" 
              @dragstart.native="handleDragStart" 
              :data-type="item.type"
            >
              <div :style="getComponentStyle(item)"
                  class="component-card">
                  <span style="color: white; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">{{ item.name }}</span>
                </div>
            </div>
          </div>
        </div>
      
        <div class="main-content">
          <div class="canvas-container" ref="canvasRef" @dragover.prevent @drop="handleDrop">
            <!-- 手机框架 -->
            <div class="phone-frame">
              <!-- 顶部渐变容器 -->
          <div class="top-gradient-container" 
          :style="{ 
            width: '100%',
            height: '120px', 
            background: `linear-gradient(180deg, ${uiConfig.secondTheme}, #f8f8f8)`
          }" 
          :key="themeUpdateKey">
            <!-- 状态栏 -->
            <div class="phone-status-bar">
              <div class="status-bar-time" :style="{ color: '#ffffff' }">&nbsp;9:41</div>
              <div class="status-bar-icons"></div>
            </div>
            <!-- 标题区域 -->
            <div class="app-title-bar"><div class="app-title">{{ appName }}</div></div>
          </div>
              <!-- 应用区域 -->
              <div class="phone-app-area">
                <!-- 固定模块区域占位符 -->
                <div class="module-placeholder" data-module-type="basic-config" style="top: 15px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 15px; left: 15px; width: calc(100% - 30px); height: 80px;" @dragover.prevent="handleDragOver($event, 'basic-config')" @dragenter.prevent="handleDragEnter($event, 'basic-config')">
                  <div class="placeholder-label">基础配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="general-config" style="top: 110px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 110px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">通用配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="payment" style="top: 205px; left: 15px; width: calc(50% - 22.5px); height: 80px;" data-original-style="top: 205px; left: 15px; width: calc(50% - 22.5px); height: 80px;">
                  <div class="placeholder-label">支付区域</div>
                </div>
                <div class="module-placeholder" data-module-type="advertisement" style="top: 205px; left: calc(50% + 7.5px); width: calc(50% - 22.5px); height: 80px;" data-original-style="top: 205px; left: calc(50% + 7.5px); width: calc(50% - 22.5px); height: 80px;">
                  <div class="placeholder-label">广告区域</div>
                </div>
                <div class="module-placeholder" data-module-type="ui-config" style="top: 300px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 300px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">UI配置区域</div>
                </div>
                <div class="module-placeholder" data-module-type="macro" style="top: 395px; left: 15px; width: calc(100% - 30px); height: 80px;" data-original-style="top: 395px; left: 15px; width: calc(100% - 30px); height: 80px;">
                  <div class="placeholder-label">微距区域</div>
                </div>
                
                <!-- 组件渲染区域 -->
                <div 
                    v-for="component in currentLayout" 
                    :key="component.id" 
                    :class="['component component-' + component.type, { 'component-selected': selectedComponent?.id == component.id, 'component-completed': component.isCompleted }]"
                    :style="[
                      { transform: `translate(${component.position.x}px, ${component.position.y}px) ${selectedComponent?.id == component.id ? 'scale(1.1)' : ''}` },
                      getCanvasComponentStyle(component)
                    ]"
                  :data-component-id="component.id"
                  @click="selectComponent(component)"
                  :data-id="component.id"
                >
                  <div class="component-header">
                    <ElIcon class="delete-icon" @click.stop="removeComponent(component)">
                      <Close />
                    </ElIcon>
                  </div>
                  <div class="component-label">{{ getComponentName(component.type) }}</div>
                  <span v-if="component.isCompleted" class="completion-tag">已编辑</span>
                </div>
              </div>
              <!-- 底部导航 -->
              <div class="phone-tab-bar">
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_shelf_nor.png" class="tab-bar-icon" alt="书架">
                  <div class="tab-bar-label">书架</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_home_nor.png" class="tab-bar-icon" alt="书城">
                  <div class="tab-bar-label">书城</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_category_nor.png" class="tab-bar-icon" alt="分类">
                  <div class="tab-bar-label">分类</div>
                </div>
                <div class="tab-bar-item">
                  <img src="/images/icon/tab_mine_nor.png" class="tab-bar-icon" alt="我的">
                  <div class="tab-bar-label">我的</div>
                </div>
              </div>
              </div>
            </div>
          
        </div>
        <!-- 属性面板 -->
        <div class="properties-panel">
          <h3>属性面板</h3>
          <div v-if="selectedComponent" class="component-properties">
            <h4>{{ getComponentName(selectedComponent.type) }} 属性</h4>
            <el-form ref="formRef" size="small" label-width="100px" class="basic-config-form" :model="generalConfig" :rules="generalConfigRules">
              <el-form-item label="组件类型">
                <el-input v-model="selectedComponent.type" disabled></el-input>
              </el-form-item>
              <template v-if="selectedComponent.type === 'basic-config'"><!-- 基础配置原有内容 -->
                <el-form-item label="appName">
                  <el-input v-model="basicConfig.appName" placeholder="请输入应用名称"></el-input>
                </el-form-item>
                <el-form-item label="platform">
                  <el-radio-group v-model="basicConfig.platform" class="platform-radio-group">
                    <el-radio-button label="douyin">
                      <el-icon style="vertical-align: middle; color: #2c2c2c; margin-right: 6px;"><Platform /></el-icon>
                      抖音小程序
                    </el-radio-button>
                    <el-radio-button label="kuaishou">
                      <el-icon style="vertical-align: middle; color: #ff4e33; margin-right: 6px;"><Share /></el-icon>
                      快手小程序
                    </el-radio-button>
                    <el-radio-button label="wechat">
                      <el-icon style="vertical-align: middle; color: #07c160; margin-right: 6px;"><ChatDotRound /></el-icon>
                      微信小程序
                    </el-radio-button>
                    <el-radio-button label="baidu">
                      <el-icon style="vertical-align: middle; color: #4e6ef2; margin-right: 6px;"><Connection /></el-icon>
                      百度小程序
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="version">
                  <el-input v-model="basicConfig.version" placeholder="请输入版本号"></el-input>
                </el-form-item>
                <el-form-item label="appCode">
                  <el-input v-model="basicConfig.appCode" placeholder="例：tt_miniapp_yunyounovel"></el-input>
                </el-form-item>
                <el-form-item label="product">
                  <el-input v-model="basicConfig.product" placeholder="例：yunyounovel"></el-input>
                </el-form-item>
                <el-form-item label="customer">
                  <el-input v-model="basicConfig.customer" placeholder="例：yunyounovel"></el-input>
                </el-form-item>
                <el-form-item label="appid">
                  <el-input v-model="basicConfig.appid" placeholder="请输入appId"></el-input>
                </el-form-item>
                <el-form-item label="tokenId">
                  <el-input-number v-model="basicConfig.tokenId" :min="0" controls-position="right" placeholder="请输入tokenId"></el-input-number>
                </el-form-item>
                <el-form-item label="cl">
                  <el-input v-model="basicConfig.cl" placeholder="例：yunyounovel"></el-input>
                </el-form-item>
              </template>
              <template v-else-if="selectedComponent.type === 'ui-config'">
                <el-form-item label="主题色">
                  <el-color-picker v-model="uiConfig.mainTheme" show-alpha color-format="hex"></el-color-picker>
                </el-form-item>
                <el-form-item label="次主题色">
                  <el-color-picker v-model="uiConfig.secondTheme" show-alpha color-format="hex"></el-color-picker>
                </el-form-item>
                <el-form-item label="预设主题">
                  <div class="predefined-themes-container">
                    <div v-for="theme in predefinedThemes" :key="theme.name" class="theme-option" @click="selectPredefinedTheme(theme)">
                      <div class="theme-colors">
                        <div class="main-color" :style="{ backgroundColor: theme.mainTheme }"></div>
                        <div class="second-color" :style="{ backgroundColor: theme.secondTheme }"></div>
                      </div>
                      <span class="theme-name">{{ theme.name }}</span>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="支付卡片样式" prop="payCardStyle" class="platform-radio-group">
                <el-radio-group v-model="uiConfig.payCardStyle" @change="handlePayCardStyleChange" class="platform-radio-group">
                  <el-radio-button :value="1">样式1</el-radio-button>
                  <el-radio-button :value="2">样式2</el-radio-button>
                  <el-radio-button :value="3">样式3</el-radio-button>
                  <el-radio-button :value="4">样式4</el-radio-button>
                </el-radio-group>
                <div v-if="uiConfig.selectedPayCardImage" class="pay-card-image-preview">
                  <img :src="uiConfig.selectedPayCardImage" alt="支付卡片样式预览" />
                </div>
              </el-form-item>
                <el-form-item label="首页卡片样式" prop="homeCardStyle" class="platform-radio-group">
                  <el-radio-group v-model="uiConfig.homeCardStyle" class="platform-radio-group">
                    <el-radio-button :value="1">样式1</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
              <template v-else-if="selectedComponent.type === 'general-config'">
                <el-form-item label="客服URL" prop="contact">
                  <el-input 
                    v-model="generalConfig.contact" 
                    placeholder="请输入客服URL" 
                    @input="handleInputChange('contact')"
                  />
                </el-form-item>
                <el-form-item label="构建命令" prop="buildCode">
                  <el-input 
                    v-model="generalConfig.buildCode" 
                    placeholder="请输入构建命令（输入npm run build:platform(tt/ks/wx..)-xx 的xx即可）"
                    @input="handleInputChange('buildCode')"
                  />
                </el-form-item>
                
                <!-- 平台特定配置 -->
                <template v-if="getCurrentPlatform() === 'douyin'">
                  <el-form-item label="抖音IM ID" prop="douyinImId">
                    <el-input v-model="generalConfig.douyinImId" placeholder="请输入抖音IM ID" />
                  </el-form-item>
                  <el-form-item label="抖音AppToken" prop="douyinAppToken">
                    <el-input
                      v-model="generalConfig.douyinAppToken"
                      type="textarea"
                      :rows="6"
                      placeholder="请输入抖音AppToken（私钥内容）"
                    />
                  </el-form-item>
                </template>
                
                <template v-if="getCurrentPlatform() === 'weixin'">
                  <el-form-item label="微信AppToken" prop="weixinAppToken">
                    <el-input
                      v-model="generalConfig.weixinAppToken"
                      type="textarea"
                      :rows="6"
                      placeholder="请输入微信AppToken（私钥内容）"
                    />
                  </el-form-item>
                </template>
                
                <template v-if="getCurrentPlatform() === 'kuaishou'">
                  <el-form-item label="快手Client ID" prop="kuaishouClientId">
                    <el-input v-model="generalConfig.kuaishouClientId" placeholder="请输入快手Client ID" />
                  </el-form-item>
                  <el-form-item label="快手Client Secret" prop="kuaishouClientSecret">
                    <el-input v-model="generalConfig.kuaishouClientSecret" placeholder="请输入快手Client Secret" show-password />
                  </el-form-item>
                  <el-form-item label="快手AppToken" prop="kuaishouAppToken">
                    <el-input
                      v-model="generalConfig.kuaishouAppToken"
                      type="textarea"
                      :rows="6"
                      placeholder="请输入快手AppToken（私钥内容）"
                    />
                  </el-form-item>
                </template>
                
                <el-form-item label="IAA模式">
                  <el-switch v-model="generalConfig.iaaMode" />
                  <span class="form-tip">是否开启IAA(In-App-Advertising)模式</span>
                </el-form-item>
                
                <el-form-item v-if="generalConfig.iaaMode" label="IAA弹窗样式" prop="iaaDialogStyle">
                  <el-radio-group v-model="generalConfig.iaaDialogStyle" class="iaa-dialog-style-card-group">
                    <el-radio-button
                      v-for="item in iaaDialogStyleOptions"
                      :key="item.value"
                      :value="item.value"
                      class="iaa-dialog-style-card"
                    >
                      <div class="iaa-dialog-style-card-inner" :class="{ selected: generalConfig.iaaDialogStyle === item.value }">
                        <img :src="item.img" :alt="item.label" />
                        <div class="iaa-dialog-style-label">{{ item.label }}</div>
                      </div>
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="屏蔽支付入口">
                  <el-switch v-model="generalConfig.hidePayEntry" />
                  <span class="form-tip">除微信IOS的非投流渠道，默认不屏蔽。审核失败时候可尝试屏蔽处理</span>
                </el-form-item>
                
                <el-form-item label="屏蔽积分入口">
                  <el-switch v-model="generalConfig.hideScoreExchange" />
                </el-form-item>
                
                <el-form-item label="我的页登录类型" class="login-type-item" prop="mineLoginType">
                  <el-radio-group v-model="generalConfig.mineLoginType" class="platform-radio-group">
                    <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
                    <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
                  </el-radio-group>
                  <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
                </el-form-item>
                
                <el-form-item label="阅读页登录类型" class="login-type-item" prop="readerLoginType">
                  <el-radio-group v-model="generalConfig.readerLoginType" class="platform-radio-group">
                    <el-radio-button value="anonymousLogin">静默登录</el-radio-button>
                    <el-radio-button value="phoneLogin">手机号授权登录</el-radio-button>
                  </el-radio-group>
                  <span class="form-tip">无手机号权限的小程序默认使用静默登录</span>
                </el-form-item>
              </template>
            </el-form>
          </div>
          <div v-else class="no-selection">
            <el-empty description="选择组件以编辑属性"></el-empty>
          </div>
        </div>
      </div>
      
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch ,nextTick} from 'vue'
import { useRouter } from 'vue-router'
import { Platform, Share, ChatDotRound, Connection, InfoFilled } from '@element-plus/icons-vue';

import { ElMessage, ElEmpty, ElCard, ElForm, ElFormItem, ElInput, ElIcon, ElSwitch, ElRadioGroup, ElRadio, ElRadioButton } from 'element-plus'
import { inject } from 'vue'

// 表单校验规则
const generalConfigRules = ref({
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
  contact: [{ required: true, message: '请输入客服URL', trigger: 'blur' }],
  iaaDialogStyle: [
    {
      validator: (rule, value, callback) => {
        if (generalConfig.value.iaaMode && !value) {
          callback(new Error('请选择IAA弹窗样式'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  mineLoginType: [{ required: true, message: '请选择我的页登录类型', trigger: 'change' }],
  readerLoginType: [{ required: true, message: '请选择阅读页登录类型', trigger: 'change' }]
});

const auth = inject('auth')
const router = useRouter()
const currentLayout = ref([])
const nextComponentId = ref(1)
const draggedComponent = ref(null)
const isDragging = ref(false)
  const usedComponentTypes = ref(new Set())
  const selectedComponent = ref(null)
const basicConfig = ref({})
const uiConfig = ref({})
const generalConfig = ref({})
// 表单引用
const formRef = ref(null);

// 输入变化时触发字段验证
const handleInputChange = (field) => {
  if (formRef.value && selectedComponent.value && selectedComponent.value.type === 'general-config') {
    // 延迟验证，避免频繁触发
    setTimeout(() => {
      formRef.value.validateField(field);
      // 同步更新组件完成状态
      checkGeneralConfigCompleted(selectedComponent.value);
    }, 100);
  }
};

// 预设主题色
const predefinedThemes = ref([
  { name: '阅界视窗主题', mainTheme: '#2552F5FF', secondTheme: '#DCE7FFFF' },
  { name: '悦动故事主题', mainTheme: '#EF5350FF', secondTheme: '#FFEBEEFF' },
  { name: '风行推广主题', mainTheme: '#F86003FF', secondTheme: '#FFEFE7FF' },
  { name: '漫影主题', mainTheme: '#FF4363FF', secondTheme: '#FFE5EBFF' }
])

// IAA弹窗样式选项
const iaaDialogStyleOptions = ref([
  { value: 1, label: '样式1', img: '/images/iaaDialogStyle/iaa_dialog_style1.jpg' },
  { value: 2, label: '样式2', img: '/images/iaaDialogStyle/iaa_dialog_style2.jpg' }
])



// 选择预设主题
const selectPredefinedTheme = (theme) => {
  uiConfig.value.mainTheme = theme.mainTheme;
  uiConfig.value.secondTheme = theme.secondTheme;
}

// 初始化基础配置数据
const initBasicConfig = (component) => {
  basicConfig.value = {
    appName: component.config?.appName || '',
    appCode: component.config?.appCode || '',
    platform: component.config?.platform || 'douyin',
    version: component.config?.version || '',
    product: component.config?.product || '',
    customer: component.config?.customer || '',
    appid: component.config?.appid || '',
    tokenId: component.config?.tokenId || '',
    cl: component.config?.cl || ''
  }
}

// 初始化通用配置数据
const initGeneralConfig = (component) => {
  generalConfig.value = {
    contact: component.config?.contact || '',
    buildCode: component.config?.buildCode || '',
    iaaMode: component.config?.iaaMode || false,
    iaaDialogStyle: component.config?.iaaDialogStyle || null,
    hidePayEntry: component.config?.hidePayEntry || false,
    hideScoreExchange: component.config?.hideScoreExchange || false,
    mineLoginType: component.config?.mineLoginType || 'anonymousLogin',
    readerLoginType: component.config?.readerLoginType || 'anonymousLogin',
    // 平台特定配置
    douyinImId: component.config?.douyinImId || '',
    douyinAppToken: component.config?.douyinAppToken || '',
    weixinAppToken: component.config?.weixinAppToken || '',
    kuaishouClientId: component.config?.kuaishouClientId || '',
    kuaishouClientSecret: component.config?.kuaishouClientSecret || '',
    kuaishouAppToken: component.config?.kuaishouAppToken || ''
  }
}

// 初始化UI配置数据
const initUIConfig = (component) => {
  uiConfig.value = {
    mainTheme: component.config?.mainTheme || '#2552F5FF',
    secondTheme: component.config?.secondTheme || '#DCE7FFFF',
    payCardStyle: component.config?.payCardStyle || 1,
    homeCardStyle: component.config?.homeCardStyle || 1,
    selectedPayCardImage: `/images/payStyle/pay_style${component.config?.payCardStyle || 1}.png`
  }
  // 确保UI更新后触发预览图加载
nextTick(() => {
  handlePayCardStyleChange(uiConfig.value.payCardStyle);
});
}

// 处理支付卡片样式变化
const handlePayCardStyleChange = (value) => {
  uiConfig.value.selectedPayCardImage = `/images/payStyle/pay_style${value}.png`;
}


const canvasRef = ref(null)
const appName = ref('小程序名称')

// 主题更新追踪键
const themeUpdateKey = ref(0);

// 监听主题色变化以更新渐变
watch(() => uiConfig.value.secondTheme, () => {
  // 触发重渲染
  themeUpdateKey.value++;
})

// 监听小程序名称变化，同步到手机模拟区
watch(() => basicConfig.value.appName, (newVal) => {
  if (newVal) {
    appName.value = newVal;
  }
})

// 监听基础配置变化，更新完成状态
watch(() => basicConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'basic-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听UI配置变化，更新完成状态
watch(() => uiConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'ui-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkUIConfigCompleted(selectedComponent.value);
  }
}, { deep: true })

// 监听通用配置变化，更新完成状态并触发表单校验
watch(() => generalConfig.value, (newVal) => {
  if (selectedComponent.value && selectedComponent.value.type === 'general-config') {
    // 更新组件配置
    selectedComponent.value.config = { ...newVal };
    // 检查完成状态
    checkGeneralConfigCompleted(selectedComponent.value);
    
    // 在表单有效时触发表单校验（主要针对buildCode字段）
    if (formRef.value && newVal.buildCode) {
      formRef.value.validateField('buildCode');
    }
  }
}, { deep: true })

// IAA模式切换时，自动选中样式1
watch(() => generalConfig.value.iaaMode, (val) => {
  if (val && (generalConfig.value.iaaDialogStyle === null || generalConfig.value.iaaDialogStyle === undefined)) {
    nextTick(() => {
      generalConfig.value.iaaDialogStyle = 1;
    });
  }
  if (!val) {
    generalConfig.value.iaaDialogStyle = null;
  }
})

const canvasBounds = ref({})
let draggedElement = null;
let dragStartPos = null;

  // 选择组件
  const selectComponent = (component) => {
  // 当选择通用配置时，先检查基础配置是否已设置平台
  if (component.type === 'general-config') {
    // 查找基础配置组件
    const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
    // 检查是否存在基础配置且平台已设置
    if (!basicConfigComponent || !basicConfigComponent.config || !basicConfigComponent.config.platform) {
      ElMessage.warning('请先在基础配置中设置平台信息');
      return; // 不进行后续操作
    }
  }
  
  selectedComponent.value = component;
  if (component.type === 'basic-config') {
    initBasicConfig(component);
    checkConfigCompleted(component);
  } else if (component.type === 'ui-config') {
    initUIConfig(component);
    checkUIConfigCompleted(component);
  } else if (component.type === 'general-config') {
    initGeneralConfig(component);
    checkGeneralConfigCompleted(component);
  }
}

// 检查基础配置是否完成
const checkConfigCompleted = (component) => {
  const config = component.config || {};
  const requiredFields = ['appName', 'platform', 'version', 'appCode', 'product', 'customer', 'appid', 'tokenId', 'cl'];
  const allCompleted = requiredFields.every(field => {
    const value = config[field];
    return value !== undefined && value !== null && value !== '';
  });
  component.isCompleted = allCompleted;
  return allCompleted;
}

// 检查UI配置是否完成
const checkUIConfigCompleted = (component) => {
  const config = component.config || {};
  const allCompleted = !!config.mainTheme && !!config.secondTheme && config.payCardStyle !== undefined && config.homeCardStyle !== undefined;
  component.isCompleted = allCompleted;
  return allCompleted;
}

// 检查通用配置是否完成
const checkGeneralConfigCompleted = (component) => {
  if (!component || component.type !== 'general-config') {
    return false;
  }
  
  // 直接使用generalConfig作为验证来源，确保与表单输入同步
  const config = generalConfig.value;
  // 基本字段验证
  const requiredFields = ['contact', 'buildCode', 'mineLoginType', 'readerLoginType'];
  const allRequiredCompleted = requiredFields.every(field => {
    const value = config[field];
    return value !== undefined && value !== null && value !== '';
  });
  
  // buildCode 特殊校验（格式校验通过表单验证规则实现，这里只做基本逻辑判断）
  let buildCodeValid = true;
  if (config.buildCode) {
    const isPureNumber = /^\d+$/.test(config.buildCode);
    const startsWithNumber = /^\d/.test(config.buildCode);
    
    if (isPureNumber || startsWithNumber) {
      buildCodeValid = false;
    }
  }
  
  // 平台特定字段验证
  let platformSpecificCompleted = true;
  const currentPlatform = getCurrentPlatform();
  
  if (currentPlatform === 'douyin') {
    platformSpecificCompleted = !!config.douyinImId;
  } else if (currentPlatform === 'kuaishou') {
    platformSpecificCompleted = !!config.kuaishouClientId && !!config.kuaishouClientSecret;
  }
  
  // IAA模式验证
  const iaaCompleted = !config.iaaMode || (config.iaaMode && config.iaaDialogStyle !== null && config.iaaDialogStyle !== undefined);
  
  component.isCompleted = allRequiredCompleted && platformSpecificCompleted && iaaCompleted && buildCodeValid;
  return component.isCompleted;
}

  // 获取组件样式
  const getComponentStyle = (item) => {
    return {
      background: item.gradient,
      borderRadius: '8px',
      padding: '20px',
      width: '100%',
      height: '80px',
      'box-sizing': 'border-box',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    };
  }

  // 初始化画布边界
  onMounted(() => {
  updateCanvasBounds();
  window.addEventListener('resize', updateCanvasBounds);
})

  // 更新画布边界
  const updateCanvasBounds = () => {
    if (canvasRef.value) {
      const rect = canvasRef.value.getBoundingClientRect();
      canvasBounds.value = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    }
  }


  // 可用组件列表
  const availableComponents = ref([
      { type: 'basic-config', name: '基础配置', color: '#409eff', gradient: 'linear-gradient(135deg, #409eff 0%, #69b1ff 100%)' },
      { type: 'general-config', name: '通用配置', color: '#67c23a', gradient: 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)' },
      { type: 'payment', name: '支付', color: '#e6a23c', gradient: 'linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%)' },
      { type: 'advertisement', name: '广告', color: '#f56c6c', gradient: 'linear-gradient(135deg, #f56c6c 0%, #f89898 100%)' },
      { type: 'ui-config', name: 'UI配置', color: '#13c2c2', gradient: 'linear-gradient(135deg, #13c2c2 0%, #1890ff 100%)' },
      { type: 'macro', name: '微距', color: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1 0%, #a06ee1 100%)' }
    ])
console.log('可用组件初始数据:', availableComponents.value);
  
// 过滤有效的组件
const filteredComponents = computed(() => {
  return availableComponents.value
    .filter(item => item && item.type)
    .filter(item => !usedComponentTypes.value.has(item.type));
})

  
  // 拖拽状态管理
  const draggedComponentType = ref(null);

  // 拖拽功能实现
  const handleDragStart = (e) => {
    const componentType = e.currentTarget.dataset.type;
    draggedComponentType.value = componentType;
    e.dataTransfer.setData('text/plain', componentType);
  
    e.dataTransfer.setData('text/plain', componentType);
    console.log('拖拽组件类型:', componentType);
  }
// 拖拽悬停处理
  const handleDragOver = (e, placeholderType) => {
    if (draggedComponentType.value === placeholderType && !document.querySelector(`.module-placeholder[data-module-type="${placeholderType}"].occupied`)) {
      e.currentTarget.classList.add('dragover');
    }
  };

  const handleDragEnter = (e, placeholderType) => {
    if (draggedComponentType.value === placeholderType && !document.querySelector(`.module-placeholder[data-module-type="${placeholderType}"].occupied`)) {
      e.currentTarget.classList.add('dragover');
    }
  };

  // 拖拽结束移除悬停样式
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault()
    // 获取组件类型
      const componentType = e.dataTransfer.getData('text/plain');
      console.log('组件类型:', componentType);
    if (!componentType) return

    // 获取画布容器
    const canvas = document.querySelector('.canvas-container')
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect()
    // 声明x, y, componentWidth和componentHeight变量
    let x, y, componentWidth, componentHeight;

    // 获取手机框架位置
    const phoneFrame = document.querySelector('.phone-frame')
    const appArea = document.querySelector('.phone-app-area')
    if (!phoneFrame || !appArea) return;
    const frameRect = phoneFrame.getBoundingClientRect();
    const appRect = appArea.getBoundingClientRect();
    const canvasWidth = appRect.width;
    const canvasHeight = appRect.height;
    // 使用实际渲染尺寸（与拖拽时保持一致）
    // 初始化默认尺寸
    componentWidth = 200;
    componentHeight = 100;

    // 根据组件类型获取对应模块区域位置
    // 根据组件类型获取对应模块区域位置
      // 精确匹配模块区域
        const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${componentType}"]`);
        console.log(`查找模块区域: ${componentType}`, modulePlaceholder);
    if (modulePlaceholder && !modulePlaceholder.classList.contains('occupied')) {
        componentWidth = modulePlaceholder.offsetWidth - 20;
        componentHeight = modulePlaceholder.offsetHeight - 20;
          const placeholderRect = modulePlaceholder.getBoundingClientRect();
          const appRect = appArea.getBoundingClientRect();
          // 计算相对于应用区域的精确位置
          x = placeholderRect.left - appRect.left + 5;
          y = placeholderRect.top - appRect.top + 5;
          componentWidth = modulePlaceholder.offsetWidth - 10;
          componentHeight = modulePlaceholder.offsetHeight - 10;
          // 标记占位区域为已占用
          modulePlaceholder.classList.add('occupied');
          modulePlaceholder.style.borderStyle = 'solid';
          modulePlaceholder.style.opacity = '0.3';
          modulePlaceholder.classList.remove('dragover');
          console.log(`组件${componentType}定位到区域:`, x, y);
        } else {
          console.error(`未找到${componentType}对应的模块区域`);
          // 根据组件类型设置备用位置（匹配占位符位置）
          const positions = {
            'basic-config': {x: 15, y: 59},
            'general-config': {x: 15, y: 154},
            'payment': {x: 15, y: 249},
            'advertisement': {x: 175, y: 249},
            'ui-config': {x: 15, y: 344},
            'macro': {x: 15, y: 439}
          };
          const pos = positions[componentType] || {x: 15, y: 15};
          x = pos.x;
          y = pos.y;
          console.log(`使用备用位置:`, x, y);
        componentWidth = Math.max(200, modulePlaceholder.offsetWidth - 20);
        componentHeight = Math.max(80, modulePlaceholder.offsetHeight - 20);
      }

    // 调试组件尺寸和位置
    // 调试应用区域尺寸
    console.log('应用区域尺寸:', appRect.width, appRect.height);
    console.log('创建组件:', componentType, '位置:', x, y, '尺寸:', componentWidth, componentHeight);
    // 创建带正确初始位置的组件
    const newComponent = {
      id: nextComponentId.value++,
      type: componentType,
      position: { x: x, y: y },
      width: componentWidth,
        height: componentHeight,
      props: {},
      isEditingComplete: false
    }

    // 确保组件属性有效
    if (typeof x === 'number' && typeof y === 'number' && componentWidth > 0 && componentHeight > 0) {
      // 添加到布局中
      currentLayout.value.push(newComponent);
      console.log('组件已添加到布局:', newComponent);
    } else {
      console.error('无效的组件属性:', {x, y, componentWidth, componentHeight});
      ElMessage.error('组件创建失败: 无效的位置或尺寸');
    }
    console.log('组件已添加到布局，当前数量:', currentLayout.value.length);
    // 标记组件类型为已使用
    usedComponentTypes.value.add(componentType)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    ElMessage.success(`已添加${getComponentName(componentType)}组件`)
  }

  // 根据组件类型获取渐变背景
  const getComponentGradient = (type) => {
    const component = availableComponents.value.find(item => item.type === type);
    return component ? component.gradient : 'linear-gradient(135deg, #409eff 0%, #69b1ff 100%)';
  }

  // 获取当前平台
const getCurrentPlatform = () => {
  // 查找基础配置组件
  const basicConfigComponent = currentLayout.value.find(item => item.type === 'basic-config');
  return basicConfigComponent?.config?.platform || 'douyin';
}

// 获取画布组件样式
const getCanvasComponentStyle = (component) => {
  // 使用动态宽高
  const style = {
    width: `${component.width}px`,
    height: `${component.height}px`,
    borderRadius: '8px',
    padding: '20px',
    'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
    'box-sizing': 'border-box',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    transition: 'all 0.3s ease'
  };
  // 根据编辑状态设置背景
  if (!component.isCompleted) {
    style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
    style.borderColor = '#ddd';
    style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  } else {
    style.background = 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)';
    style.borderColor = '#4caf50';
    style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.2)';
  }
  return style;
}


  // 获取组件名称
  const getComponentName = (type) => {
    const names = {
      'basic-config': '基础配置',
      'general-config': '通用配置',
      'payment': '支付',
      'advertisement': '广告',
      'ui-config': 'UI配置',
      'macro': '微距'
    }
    return names[type] || type
  }

// 拖拽中 - 平衡跟手性与流畅度
  const handleDrag = (e) => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value || !canvasBounds.value) return

    // 使用requestAnimationFrame优化性能，减少布局抖动
    requestAnimationFrame(() => {
      const offsetX = e.clientX - dragStartPos.startX;
      const offsetY = e.clientY - dragStartPos.startY;
      const newX = dragStartPos.initialX + offsetX;
      const newY = dragStartPos.initialY + offsetY;

      // 统一使用两位小数精度计算边界
      const canvasPadding = 15;
      const maxX = canvasBounds.value.width - 200 - canvasPadding;
      const maxY = canvasBounds.value.height - 100 - canvasPadding;
      const boundedX = Math.max(canvasPadding, Math.min(newX, maxX)).toFixed(2);
      const boundedY = Math.max(canvasPadding, Math.min(newY, maxY)).toFixed(2);

      // 应用硬件加速并更新位置
      draggedElement.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
    });
  }

  // 结束拖拽 - 精确同步位置并清理事件
  const stopDrag = () => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value) return

    // 精确提取transform值，避免舍入误差
    const transform = draggedElement.style.transform;
    const match = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
    if (match) {
        // 使用亚像素精度同步最终位置，避免释放时突变if (match) {
        // 统一使用parseFloat避免Number构造函数带来的精度问题
        draggedComponent.value.position = {
          x: parseFloat(parseFloat(match[1]).toFixed(2)),
          y: parseFloat(parseFloat(match[2]).toFixed(2))
        };
      }

    // 确保事件监听器正确移除
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);

    isDragging.value = false;
    // 清理样式和引用
    draggedElement.style.transition = '';
    draggedElement.style.willChange = 'auto';
    draggedElement.style.backfaceVisibility = 'visible';
    draggedElement = null;
    draggedComponent.value = null;
    dragStartPos = { x: 0, y: 0, startX: 0, startY: 0, initialX: 0, initialY: 0 };
  }

  // 删除组件
  const removeComponent = (component) => {
    // 从布局中移除组件
    currentLayout.value = currentLayout.value.filter(item => item.id !== component.id)
    // 从已使用类型中移除
    usedComponentTypes.value.delete(component.type)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    // 取消选中状态
    if (selectedComponent.value?.id === component.id) {
      selectedComponent.value = null
    }
    // 重置对应占位区域状态
    const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${component.type}"]`);
    if (modulePlaceholder) {
      modulePlaceholder.classList.remove('occupied', 'dragover');
      // 先清除所有内联样式，再恢复原始样式
        modulePlaceholder.removeAttribute('style');
        const originalStyle = modulePlaceholder.getAttribute('data-original-style');
        if (originalStyle) {
            modulePlaceholder.style.cssText = originalStyle;
            // 显式清除可能残留的内联样式
            modulePlaceholder.style.border = '';
            modulePlaceholder.style.borderStyle = '';
            modulePlaceholder.style.borderWidth = '';
            modulePlaceholder.style.borderColor = '';
            modulePlaceholder.style.backgroundColor = '';
            modulePlaceholder.style.opacity = '';
            // 触发重排确保样式立即应用
            modulePlaceholder.offsetHeight;
          }
      // 清除所有内联样式，恢复CSS类定义的默认样式
      // 使用border简写属性清除所有边框样式
      // 仅清除组件添加时设置的内联样式，保留原始定位样式
        // 显式重置为默认样式，确保视觉一致性
        // 完全重置边框样式为默认值
        // 清除内联样式，完全依赖CSS类定义
          modulePlaceholder.style.borderStyle = '';
          modulePlaceholder.style.borderWidth = '';
          modulePlaceholder.style.borderColor = '';
          modulePlaceholder.style.opacity = '';
    }
    ElMessage.success(`已移除${getComponentName(component.type)}组件`)
  }

// 开始拖拽 - 优化事件绑定和初始位置
const startDrag = (component, e) => {
  const el = e.currentTarget;
  if (!el || !component || !canvasBounds.value) return

  // 移除旧事件监听防止多重绑定
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);

  draggedComponent.value = component;
  draggedElement = el;
  // 使用精确初始位置，避免取整导致偏移
  dragStartPos = {
    startX: e.clientX,
    startY: e.clientY,
    initialX: parseFloat(component.position.x.toFixed(2)),
    initialY: parseFloat(component.position.y.toFixed(2))
  };
  isDragging.value = true;
  // 优化样式提升性能
  el.style.transition = 'none';
  el.style.willChange = 'transform';
  el.style.backfaceVisibility = 'hidden';

  // 添加新事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

// 保存编排
const handleSaveLayout = () => {
  if (!currentLayout.value) {
    ElMessage.warning('请先创建布局')
    return
  }
  
  // 验证当前选中的通用配置表单
  if (selectedComponent.value && selectedComponent.value.type === 'general-config' && formRef.value) {
    formRef.value.validate((valid) => {
      if (!valid) {
        ElMessage.error('请检查通用配置中的错误项')
        return
      }
      
      // 保存所有配置数据
      currentLayout.value.forEach(component => {
        if (component.type === 'basic-config') {
          component.config = { ...basicConfig.value };
        } else if (component.type === 'ui-config') {
          component.config = { ...uiConfig.value };
        } else if (component.type === 'general-config') {
          component.config = { ...generalConfig.value };
        }
      });
      
      // 这里可以将currentLayout.value转换为所需JSON格式
      console.log('保存布局数据:', JSON.stringify(currentLayout.value))
      ElMessage.success('布局保存成功')
    })
  } else {
    // 保存所有配置数据（当没有选中通用配置或表单引用不存在时）
    currentLayout.value.forEach(component => {
      if (component.type === 'basic-config') {
        component.config = { ...basicConfig.value };
      } else if (component.type === 'ui-config') {
        component.config = { ...uiConfig.value };
      } else if (component.type === 'general-config') {
        component.config = { ...generalConfig.value };
      }
    });
    
    // 这里可以将currentLayout.value转换为所需JSON格式
    console.log('保存布局数据:', JSON.stringify(currentLayout.value))
    ElMessage.success('布局保存成功')
  }
}
</script>

<style scoped>
.free-layout-module {
  padding: 10px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.workspace-container {
  display: grid;
  grid-template-columns: 280px 1fr 400px;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 220px);
}

/* 确保属性面板正确显示 */
.properties-panel {
  display: block !important;
}

.basic-config-form .el-form-item {
  margin-bottom: 15px;
}

.basic-config-form .el-input, .basic-config-form .el-select {
  width: 100%;
  max-width: 280px;
}

.basic-config-form .el-form-item__label {
  padding-right: 10px;
}
.sidebar {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  min-height: 300px;
  /* 隐藏滚动条但保留滚动功能 */
  ::-webkit-scrollbar {width: 0;}
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 主题选择样式 */
.predefined-themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.theme-option {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

/* IAA弹窗样式卡片布局 */
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
  border-color: #4096ff;
  box-shadow: 0 0 10px rgba(64, 150, 255, 0.2);
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



.login-type-item {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.theme-option:hover {
  border-color: #c0c0c0;
  background-color: #f9f9f9;
}

.theme-colors {
  display: flex;
  margin-bottom: 8px;
}

.main-color, .second-color {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.main-color {
  margin-right: 5px;
}

.theme-name {
  font-size: 12px;
  color: #666;
}

.pay-card-image-preview {
  margin-top: 15px;
  text-align: center;
}

.pay-card-image-preview img {
  width: 120px;
  height: 140px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
.component-item {
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  user-select: none;
  touch-action: none;
}

.component-item:active {
  cursor: grabbing;
}

.component-card {
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
  transform: translateY(0);
}

.component-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 配置完成状态样式 */
.component-completed {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%) !important;
  border: 1px solid #b7eb8f;
  position: relative;
}

.completion-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #52c41a;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.component-item *) {
  pointer-events: none;
}
.main-content {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
}
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
.phone-frame {
  width: 320px;
  height: 650px;
  background: transparent;
  border-radius: 40px;
  border: 6px solid #333;
  padding: 0;
  position: relative;
  overflow: hidden;
}
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.phone-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  /* background: linear-gradient(180deg, var(--theme-color, ), #e4edfb00); */
  z-index: 0;
}

.top-gradient-container {
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.phone-status-bar {
  height: 44px;
  padding: 0 15px;
  position: relative;
  z-index: 1;
}

.app-title-bar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.phone-status-bar, .app-title-bar {
  box-sizing: border-box;
}

.app-title-bar {
  margin-top: 0;
}

.phone-status-bar {
  height: 44px;
  padding-top: 0;
}

.app-title-bar {
  height: 56px;
}

.phone-status-bar {
  height: 44px;
  background-color: transparent;
  display: flex;
  position: relative;
  z-index: 10;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
}
.status-bar-time{
  color: #fff;  
}

.status-bar-icons {
  display: flex;
  gap: 4px;
  position: relative;
  top: 44px;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
}
.phone-app-area {
  position: absolute;
  top: 84px;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
  z-index: 1;
}

.app-title-bar {
  height: 40px;
  -color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.module-placeholder {
  border: 1px dashed #409EFF;
  border-radius: 8px;
  position: absolute;
  background: rgba(64, 158, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.module-placeholder.occupied {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.05);
}

.module-placeholder.dragover {
  border-color: #409EFF;
  background: rgba(64, 158, 255, 0.2);
  border-width: 2px;
   display: flex;
  align-items: center;
  justify-content: center;
}

.module-placeholder[data-module-type="basic-config"] {
  top: 59px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="general-config"] {
  top: 154px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="payment"] {
  top: 249px;
  left: 15px;
  width: calc(50% - 22.5px);
  height: 80px;
  float: left;
}

.module-placeholder[data-module-type="advertisement"] {
  top: 249px;
  left: calc(50% + 7.5px);
  width: calc(50% - 22.5px);
  height: 80px;
  float: right;
}

.module-placeholder[data-module-type="ui-config"] {
  top: 344px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}

.module-placeholder[data-module-type="macro"] {
  top: 439px;
  left: 15px;
  width: calc(100% - 30px);
  height: 80px;
}



.placeholder-label {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-align: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.phone-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
}

.tab-bar-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
  object-fit: contain;
}

.component {
    position: absolute;
    width: 200px;
    height: 80px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: move;
    transition: all 0.3s ease;
    overflow: hidden;
    will-change: transform;
    z-index: 9999; /* 确保在最上层 */
    border: none;
    &:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  }

.component-header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px;
}

.delete-icon {
  color: #f56c6c;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.delete-icon:hover {
  background: rgba(255, 255, 255, 0.9);
}

.component-selected {
  border: none;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.4);
  z-index: 20;
  transition: all 0.3s ease-out;
}

.component:active {
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
  transition: all 0.1s ease;
}

.component:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;

}
.properties-panel {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
}
.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>