<template>
  <div class="home-container">
    <img class="home-bg" src="/images/home/home_bg.png" />
    <video
      class="home-bg-video"
      src="/videos/home_bg.webm"
      autoplay="true"
      muted="true"
      loop="true"
    ></video>

    <div class="home-content">
      <div class="home-title">
        <div class="home-title-left">文曲一下，</div>
        <div class="home-title-right">
          <div class="home-title-right-item">
            <div class="text-item" :class="{ 'active': activeTexts[0] === 0 }">需</div>
            <div class="text-item from-bottom" :class="{ 'active': activeTexts[0] === 1 }">开</div>
          </div>
          <div class="home-title-right-item">
            <div class="text-item" :class="{ 'active': activeTexts[1] === 0 }">求</div>
            <div class="text-item from-bottom" :class="{ 'active': activeTexts[1] === 1 }">发</div>
          </div>
          <div class="home-title-right-item">
            <div class="text-item" :class="{ 'active': activeTexts[2] === 0 }">变</div>
            <div class="text-item from-bottom" :class="{ 'active': activeTexts[2] === 1 }">更</div>
          </div>
          <div class="home-title-right-item">
            <div class="text-item" :class="{ 'active': activeTexts[3] === 0 }">简</div>
            <div class="text-item from-bottom" :class="{ 'active': activeTexts[3] === 1 }">高</div>
          </div>
          <div class="home-title-right-item">
            <div class="text-item" :class="{ 'active': activeTexts[4] === 0 }">单</div>
            <div class="text-item from-bottom" :class="{ 'active': activeTexts[4] === 1 }">效</div>
          </div>
        </div>
      </div>
      <div class="home-entry">
        <div class="home-entry-item" 
             @mouseenter="hoveredItems[0] = true" 
             @mouseleave="hoveredItems[0] = false">
          <img class="home-entry-item-bg" src="/images/home/home_entry_1_bg.png"/>
          <img class="home-entry-item-icon" 
               :src="hoveredItems[0] ? '/images/home/home_entry_1_hover.svg' : '/images/home/home_entry_1_normal.svg'"/>
          <div class="home-entry-item-title">小程序管理</div>
          <div class="home-entry-item-desc">各个模块灵活配置，编辑</div>
        </div>
        <div class="home-entry-item" 
             @mouseenter="hoveredItems[1] = true" 
             @mouseleave="hoveredItems[1] = false">
          <img class="home-entry-item-bg" src="/images/home/home_entry_2_bg.png"/>
          <img class="home-entry-item-icon" 
               :src="hoveredItems[1] ? '/images/home/home_entry_2_hover.svg' : '/images/home/home_entry_2_normal.svg'"/>
           <div class="home-entry-item-title">文曲自动化</div>
          <div class="home-entry-item-desc">全自动生产，构建，发布</div>
        </div>

        <div class="home-entry-item" 
             @mouseenter="hoveredItems[2] = true" 
             @mouseleave="hoveredItems[2] = false">
          <img class="home-entry-item-bg" src="/images/home/home_entry_3_bg.png"/>
          <img class="home-entry-item-icon" 
               :src="hoveredItems[2] ? '/images/home/home_entry_3_hover.svg' : '/images/home/home_entry_3_normal.svg'"/>
          <div class="home-entry-item-title">文曲AI</div>
          <div class="home-entry-item-desc">智能体，大模型，MCP</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 创建响应式数据来跟踪每个文字的当前活动文本索引
const activeTexts = ref([0, 0, 0, 0, 0]);
let animationTimer = null;

// 跟踪每个入口项的悬停状态
const hoveredItems = ref([false, false, false]);

// 文字轮换动画函数
const startTextAnimation = () => {
  // 清除之前的定时器（如果有）
  if (animationTimer) {
    clearInterval(animationTimer);
  }
  
  // 每隔5秒触发一次动画
  animationTimer = setInterval(() => {
    // 按顺序更新每个文字
    for (let i = 0; i < 5; i++) {
      // 使用setTimeout创建顺序动画效果
      setTimeout(() => {
        // 切换当前活动文本（0和1之间切换）
        activeTexts.value[i] = activeTexts.value[i] === 0 ? 1 : 0;
      }, i * 150); // 每个文字之间延迟150ms
    }
  }, 4000); // 每5秒执行一次完整动画
};

// 组件挂载时启动动画
onMounted(() => {
  startTextAnimation();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (animationTimer) {
    clearInterval(animationTimer);
  }
});
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.home-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}
.home-bg-video {
  position: absolute;
  width: 750px;
  height: 750px;
  z-index: 1;
  right: 150px;
  top: 100px;
}

.home-content {
  padding: 0px 40px 40px;
  position: relative;
  height: 100%;
  min-width: 1066px;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.home-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72px;
  margin-top: 200px;
}

.home-title-left {
  height: 72px;
  line-height: 72px;
  font-size: 52px;
  color: rgb(39, 38, 77);
  font-weight: 700;
}

.home-title-right {
  height: 72px;
  display: flex;
  flex-direction: row;
}

.home-title-right-item {
  height: 72px;
  line-height: 72px;
  font-size: 52px;
  color: rgb(96, 92, 229);
  font-weight: 700;
  overflow: hidden;
  position: relative;
  width: 60px;
}

.text-item {
  position: absolute;
  width: 100%;
  text-align: center;
  transition: transform 0.5s ease;
  transform: translateY(-100%); /* 非活动状态的文本：在视口外部上方 */
}

/* 活动状态的文本：在视口中间 */
.text-item.active {
  transform: translateY(0);
}

/* 从底部进入的文本的初始位置 */
.text-item.from-bottom {
  transform: translateY(100%);
}

/* 确保从底部进入的文本在激活状态时正确显示 */
.text-item.from-bottom.active {
  transform: translateY(0);
}

.home-entry{
  margin-top: 7vh;
  height: 280px;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

}

.home-entry-item{ 
  position: relative;
  width: 265px;
  height: 246px;
  background-size: 100% 100%;
  border-radius: 8px;
  margin-right: 4vh;
  transition: transform 0.3s ease;
}

/* 鼠标悬停时整体放大 */
.home-entry-item:hover {
  transform: scale(1.05);
}

.home-entry-item-bg{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  transition: transform 0.3s ease;
}

.home-entry-item:hover .home-entry-item-bg {
  transform: scale(1.05);
}

.home-entry-item-icon{
  position: absolute;
  width: 100px;
  height: 100px;
  top: -50px;
  left: 0;
  z-index: 0;
  transition: transform 0.3s ease;
}

.home-entry-item:hover .home-entry-item-icon {
  transform: scale(1.05);
}

.home-entry-item-title{ 
  padding-top: 54px;
  padding-left: 22px;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 6px;
  color: rgb(39, 38, 77);
  font-weight: 600;
}
.home-entry-item-desc{ 
    font-size: 14px;
    line-height: 24px;
    padding-left: 24px;
}

</style>
