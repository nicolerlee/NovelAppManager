<template>
  <div>
    <!-- 基本信息表单 -->
    <div v-if="currentSubStep === 0" class="narrow-form-container">
      <h4>步骤1: 配置基本信息</h4>
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" style="margin-top: 20px;">
        <el-form-item label="appName" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入小程序名称" />
        </el-form-item>
        <el-form-item label="platform" prop="platform">
          <el-radio-group v-model="form.platform" class="platform-radio-group">
            <el-radio-button label="douyin">
              <el-icon style="vertical-align: middle; color: #2c2c2c; margin-right: 6px;"><Platform /></el-icon>
              抖音小程序
            </el-radio-button>
            <el-radio-button label="kuaishou">
              <el-icon style="vertical-align: middle; color: #ff4e33; margin-right: 6px;"><Share /></el-icon>
              快手小程序
            </el-radio-button>
            <el-radio-button label="weixin">
              <el-icon style="vertical-align: middle; color: #07c160; margin-right: 6px;"><ChatDotRound /></el-icon>
              微信小程序
            </el-radio-button>
            <el-radio-button label="baidu">
              <el-icon style="vertical-align: middle; color: #4e6ef2; margin-right: 6px;"><Connection /></el-icon>
              百度小程序
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="version" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="appCode" prop="appCode">
          <el-input v-model="form.appCode" placeholder="例：tt_miniapp_yunyounovel" />
        </el-form-item>
        <el-form-item label="product" prop="product">
          <el-input v-model="form.product" placeholder="例：yunyounovel" />
        </el-form-item>
        <el-form-item label="customer" prop="customer">
          <el-input v-model="form.customer" placeholder="例：tt_yunyounovel" />
        </el-form-item>
        <el-form-item label="appid" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入AppID" />
        </el-form-item>
        <el-form-item label="token_id" prop="token_id">
          <el-input-number v-model="form.token_id" :min="1" placeholder="请输入Token ID" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="cl" prop="cl">
          <el-input v-model="form.cl" placeholder="例：tt_miniapp_yunyounovel" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 微距配置 -->
    <div v-if="currentSubStep === 1" class="narrow-form-container">
      <h4>步骤1: 配置微距信息</h4>
      <el-form :model="form" :rules="microConfigRules" ref="microConfigFormRef" label-width="120px"  style="margin-top: 20px;">
        <el-form-item label="deliverId" prop="deliverId">
          <el-input v-model="form.deliverId" placeholder="请输入deliverId" />
          
        </el-form-item>
        <el-form-item label="bannerId" prop="bannerId">
          <el-input v-model="form.bannerId" placeholder="请输入bannerId" />
          
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Platform, Share, ChatDotRound, Connection, InfoFilled } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  currentSubStep: {
    type: Number,
    required: true
  }
});
const emit = defineEmits(['update:modelValue']);

// 表单数据双向绑定
const form = ref({ ...props.modelValue });

// 监听 props 变化，更新本地表单数据
watch(() => props.modelValue, (newVal) => {
  nextTick(() => {
    // 避免不必要的更新
    if (JSON.stringify(newVal) !== JSON.stringify(form.value)) {
      form.value = { ...newVal };
    }
});
}, { deep: true });

// 监听本地表单数据变化，触发更新事件
watch(form, (newVal) => {
  nextTick(() => {
    // 避免不必要的更新
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', { ...newVal });
    }
  });
}, { deep: true });

// 表单校验规则
const formRules = {
  appName: [{ required: true, message: 'Please input app name', trigger: 'blur' }],
  platform: [{ required: true, message: 'Please select platform', trigger: 'change' }],
  version: [{ required: true, message: 'Please input version', trigger: 'blur' }],
  appCode: [{ required: true, message: 'Please input app code', trigger: 'blur' }],
  product: [{ required: true, message: 'Please input product line', trigger: 'blur' }],
  customer: [{ required: true, message: 'Please input customer identifier', trigger: 'blur' }],
  appid: [{ required: true, message: 'Please input AppID', trigger: 'blur' }],
  token_id: [{ required: true, message: 'Please input Token ID', trigger: 'blur' }],
  cl: [{ required: true, message: 'Please input CL identifier', trigger: 'blur' }]
};

// 微距配置校验规则
const microConfigRules = {
  deliverId: [{ required: true, message: 'Please input deliverId', trigger: 'blur' }],
  bannerId: [{ required: true, message: 'Please input bannerId', trigger: 'blur' }]
};

// 表单ref和校验暴露
const formRef = ref(null);
const microConfigFormRef = ref(null);
const validate = async () => {
  if (props.currentSubStep === 0 && formRef.value) {
    return await formRef.value.validate().catch(() => false);
  } else if (props.currentSubStep === 1 && microConfigFormRef.value) {
    return await microConfigFormRef.value.validate().catch(() => false);
  }
  return false;
};

const resetFields = () => {
  if (props.currentSubStep === 0 && formRef.value) {
    formRef.value.resetFields();
  } else if (props.currentSubStep === 1 && microConfigFormRef.value) {
    microConfigFormRef.value.resetFields();
  }
};

defineExpose({ validate, resetFields });
</script>

<style scoped>
.narrow-form-container {
  max-width: 600px;
  min-height: 400px;
  margin: 0 auto;
}
.theme-selection-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}
.predefined-themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}
.theme-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  transition: all 0.2s ease-in-out;
}

.theme-option.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.theme-option.selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-radius: 4px;
}

.theme-configured-hint {
  display: flex;
  align-items: center;
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
}

.loading-hint {
  height: 32px;
  line-height: 32px;
  color: #909399;
  font-size: 12px;
}
.theme-option:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}
.theme-colors {
  display: flex;
  margin-right: 10px;
}
.main-color,
.second-color {
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
}
.main-color {
  border-radius: 4px 0 0 4px;
}
.second-color {
  border-radius: 0 4px 4px 0;
}
.theme-name {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
.theme-image-preview {
  width: 250px;
  height: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}
.theme-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.platform-radio-group {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}
:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  font-size: 15px;
  padding: 6px 18px;
}
</style>