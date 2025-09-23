<template>
  <div class="weiju-config-panel">
    <el-form-item label="deliverId">
      <el-input v-model="weijuConfig.deliverId" placeholder="请输入deliverId"></el-input>
    </el-form-item>
    <el-form-item label="bannerId">
      <el-input v-model="weijuConfig.bannerId" placeholder="请输入bannerId"></el-input>
    </el-form-item>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue';

// 定义props
const props = defineProps({
  weijuConfig: {
    type: Object,
    required: true,
    // 不设置默认空字符串，确保未配置时校验不通过
    default: () => ({ deliverId: undefined, bannerId: undefined })
  }
});

// 定义emits
const emit = defineEmits(['update:weijuConfig']);

// 监听weijuConfig变化并触发更新事件
Object.keys(props.weijuConfig).forEach(key => {
  watch(() => props.weijuConfig[key], (newVal) => {
    emit('update:weijuConfig', {
      ...props.weijuConfig,
      [key]: newVal
    });
  });
});
</script>

<style scoped>
.weiju-config-panel {
  padding: 0;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-input {
  width: 100%;
  max-width: 280px;
}

.el-form-item__label {
  padding-right: 10px;
}
</style>