<template>
  <div class="macro-config-panel">
    <el-form-item label="deliverId">
      <el-input v-model="macroConfig.deliverId" placeholder="请输入deliverId"></el-input>
    </el-form-item>
    <el-form-item label="bannerId">
      <el-input v-model="macroConfig.bannerId" placeholder="请输入bannerId"></el-input>
    </el-form-item>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue';

// 定义props
const props = defineProps({
  macroConfig: {
    type: Object,
    required: true,
    default: () => ({ deliverId: '', bannerId: '' })
  }
});

// 定义emits
const emit = defineEmits(['update:macroConfig']);

// 监听macroConfig变化并触发更新事件
Object.keys(props.macroConfig).forEach(key => {
  watch(() => props.macroConfig[key], (newVal) => {
    emit('update:macroConfig', {
      ...props.macroConfig,
      [key]: newVal
    });
  });
});
</script>

<style scoped>
.macro-config-panel {
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