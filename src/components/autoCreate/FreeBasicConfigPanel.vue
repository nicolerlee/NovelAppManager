<template>
  <div class="basic-config-panel">
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
  </div>
</template>

<script setup>
import { Platform, Share, ChatDotRound, Connection } from '@element-plus/icons-vue';
import { defineProps, defineEmits,watch } from 'vue';

// 定义props
const props = defineProps({
  basicConfig: {
    type: Object,
    required: true
  }
});

// 定义emits
const emit = defineEmits(['update:basicConfig']);

// 监听basicConfig变化并触发更新事件
Object.keys(props.basicConfig).forEach(key => {
  watch(() => props.basicConfig[key], (newVal) => {
    emit('update:basicConfig', {
      ...props.basicConfig,
      [key]: newVal
    });
  });
});
</script>

<style scoped>
.basic-config-panel {
  padding: 0;
}

.platform-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-input, .el-select {
  width: 100%;
  max-width: 280px;
}

.el-form-item__label {
  padding-right: 10px;
}
</style>