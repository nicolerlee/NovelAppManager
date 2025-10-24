<template>
  <div class="operation-archive">
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="输入任意关键字搜索"
            :prefix-icon="Search"
            clearable
          >
          </el-input>
        </el-col>
        <el-col :span="14">
          <div style="display: flex; gap: 10px; align-items: center">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
              unlink-panels
              @change="handleDateChange"
              clearable
              style="width: auto"
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button type="default" @click="resetFilters"> 重置 </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="table-section">
      <el-table
        :data="archiveData"
        style="width: 100%"
        stripe
        border
        v-loading="loading"
        empty-text="暂无操作记录数据"
        empty-image=""
      >
        <el-table-column prop="userId" label="用户ID" width="120">
          <template #default="scope">
            <span :class="{ 'highlight-id': searchKeyword && String(scope.row.userId).includes(searchKeyword) }">
              {{ scope.row.userId }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120">
          <template #default="scope">
            <span :class="{ 'h-keyword': searchKeyword && String(scope.row.username).toLowerCase().includes(String(searchKeyword).toLowerCase()) }">
              {{ scope.row.username }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="时间" width="220">
          <template #default="scope">
            {{ formatDate(scope.row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'success' ? 'success' : 'danger'"
            >
              {{ scope.row.status === "success" ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationContent" label="操作" min-width="80">
          <template #default="scope">
            <span :class="{ 'h-keyword': searchKeyword && String(scope.row.operationContent).toLowerCase().includes(String(searchKeyword).toLowerCase()) }">
              {{ scope.row.operationContent }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="requestUrl" label="请求地址" min-width="200">
          <template #default="scope">
            <span :class="{ 'h-keyword': searchKeyword && String(scope.row.requestUrl).toLowerCase().includes(String(searchKeyword).toLowerCase()) }">
              {{ scope.row.requestUrl }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="内容" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(scope.row)"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <!-- 详情弹窗 -->
  <el-dialog v-model="dialogVisible" title="操作详情" width="800px">
    <div v-if="selectedRow">
      <div class="dialog-section">
        <h4>请求参数</h4>
        <pre v-if="selectedRow.requestParams">{{
          formatJson(selectedRow.requestParams)
        }}</pre>
        <p v-else>无请求参数</p>
      </div>
      <div class="dialog-section">
        <h4>返回结果</h4>
        <pre v-if="selectedRow.responseResult">{{
          formatJson(selectedRow.responseResult)
        }}</pre>
        <p v-else>无返回结果</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "../../utils/request";

// 搜索参数
const searchKeyword = ref("");
const dateRange = ref([]);
const loading = ref(false);

// 日期快捷选项
const dateShortcuts = [
  {
    text: "今天",
    value: () => {
      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    },
  },
  {
    text: "最新三天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    },
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 日期变化处理
const handleDateChange = (value) => {
  console.log("日期选择变化:", value);
  dateRange.value = value;
  // 日期变化后自动搜索
  handleSearch();
};

// 归档数据
const archiveData = ref([]);

// 详情弹窗相关状态
const dialogVisible = ref(false);
const selectedRow = ref(null);

// 查看详情
const handleViewDetail = (row) => {
  selectedRow.value = row;
  dialogVisible.value = true;
};

// 格式化JSON显示
const formatJson = (jsonString) => {
  try {
    // 如果是字符串，尝试解析为JSON
    const obj =
      typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    // 如果解析失败，直接返回原始字符串
    return jsonString;
  }
};

// 获取归档数据的方法
const fetchArchiveData = async (params) => {
  try {
    const response = await request.get("/api/op-log/queryUserArchive", {
      params: {
        query: params.query,
        startTime: params.startTime,
        endTime: params.endTime,
      },
    });

    // 适配新的返回数据结构
    if (response.code === 200 && Array.isArray(response.data)) {
      // 将API返回的数据格式化为表格需要的格式
      const formattedData = response.data.map((item, index) => ({
        id: index + 1,
        username: item.userName,
        userId: item.userId,
        operationContent: item.opName,
        operationTime: item.updateTime,
        requestUrl: item.requestUrl,
        status: item.opStatus === 1 ? "success" : "danger",
        requestParams: item.requestParams, // 请求参数
        responseResult: item.responseResult, // 返回结果
      }));

      return {
        data: formattedData,
      };
    }

    return {
      data: [],
    };
  } catch (error) {
    console.error("获取归档数据失败:", error);
    // 模拟数据，防止接口调不通时页面空白
    return {
      data: [],
    };
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleString("zh-CN");
  } catch (error) {
    console.error("日期格式化失败:", error);
    return dateStr;
  }
};

// 高亮显示搜索关键字
const highlightKeyword = (text, keyword) => {
  if (!text || !keyword) {
    return text;
  }
  
  const textStr = String(text);
  const keywordStr = String(keyword);
  
  // 完全简化的高亮实现，只检查是否包含关键字
  // 这里不使用复杂的正则表达式，直接返回带有内联样式的整个文本
  // 确保HTML格式正确，避免Vue模板解析问题
  const lowerText = textStr.toLowerCase();
  const lowerKeyword = keywordStr.toLowerCase();
  
  if (lowerText.includes(lowerKeyword)) {
    // 为了确保v-html正确渲染，我们使用简单的HTML格式
    return `<span class="h-keyword">${textStr}</span>`;
  }
  
  return textStr;
};

// 搜索操作
const handleSearch = async () => {
  loading.value = true;
  try {
    const params = {
      query: searchKeyword.value, // 使用searchKeyword作为query参数
      startTime:
        dateRange.value && dateRange.value.length === 2
          ? dateRange.value[0]
          : null,
      endTime:
        dateRange.value && dateRange.value.length === 2
          ? dateRange.value[1]
          : null,
    };

    const result = await fetchArchiveData(params);
    archiveData.value = result.data || [];
  } catch (error) {
    console.error("搜索操作失败:", error);
  } finally {
    loading.value = false;
  }
};

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = "";
  dateRange.value = [];
  handleSearch();
};

// 组件挂载时加载数据
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.operation-archive {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  height: calc(100vh - 120px); /* 使用固定高度而不是最大高度，确保有足够空间 */
  overflow-y: auto;
  padding-bottom: 80px; /* 大幅增加底部padding */
  scrollbar-width: thin; /* Firefox */
  position: relative;
}

/* 高亮用户ID样式 */
.highlight-id {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

/* 高亮搜索关键字样式 */
/* 确保样式定义在最外层 */
.operation-archive {
  :deep(.h-keyword) {
    color: #f56c6c;
    font-weight: bold;
    background-color: #fff2f0;
    padding: 0 2px;
    border-radius: 2px;
  }
}

/* 强制表格高度适应容器 */
:deep(.el-table) {
  width: 100%;
  height: 100%;
  margin-bottom: 0 !important;
}

/* 确保表格主体可以完全滚动 */
:deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
  height: calc(100% - 40px) !important; /* 为表头留出空间 */
  padding-bottom: 40px !important;
}

/* 修复可能的滚动条遮挡问题 */
:deep(.el-table__body) {
  padding-bottom: 60px;
}

/* 优化滚动条样式，提升用户体验 */
.table-section::-webkit-scrollbar {
  width: 8px;
}

.table-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-section::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

.table-section::-webkit-scrollbar-thumb:hover {
  background: #605ce5;
}

/* 详情弹窗样式 */
.dialog-section {
  margin-bottom: 10px;
}

.dialog-section h4 {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

.dialog-section pre {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
}

:deep(.el-button--primary) {
  background-color: #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-button--primary:hover) {
  background-color: #5652d8 !important;
  border-color: #5652d8 !important;
}
:deep(.el-input--primary) {
  border-color: #605ce5 !important;
}

/* 输入框基础样式 */
:deep(.el-input__wrapper) {
  border-color: #605ce5 !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #605ce5 !important;
  box-shadow: 0 0 0 1px #605ce5 !important;
}

/* 输入框文本和占位符 */
:deep(.el-input__inner) {
  color: #605ce5 !important;
}

:deep(.el-input__inner::placeholder) {
  color: #a6a6a6 !important;
}

/* 搜索图标颜色 */
:deep(.el-input__prefix .el-icon),
:deep(.el-input__suffix .el-icon) {
  color: #605ce5 !important;
}

/* el-date-picker 控件样式 */
/* 基础CSS变量覆盖 */
:deep(.el-date-picker) {
  --el-date-picker-border-color: #605ce5 !important;
  --el-date-picker-cell-color: #605ce5 !important;
  --el-date-picker-cell-hover-color: #605ce5 !important;
  --el-date-picker-cell-hover-bg-color: #f5f3ff !important;
  --el-date-picker-cell-active-color: #fff !important;
  --el-date-picker-cell-active-bg-color: #605ce5 !important;
  --el-date-picker-range-separator-color: #605ce5 !important;
  --el-date-picker-header-color: #605ce5 !important;
  --el-date-picker-text-color: #605ce5 !important;
}

/* 日期选择器输入框 */
:deep(.el-date-editor) {
  --el-input-border-color: #605ce5 !important;
  --el-input-focus-border-color: #605ce5 !important;
  --el-input-focus-box-shadow: 0 0 0 1px #605ce5 !important;
}

:deep(.el-date-editor .el-input__wrapper) {
  border-color: #605ce5 !important;
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-date-editor .el-input__wrapper.is-focus) {
  border-color: #605ce5 !important;
  box-shadow: 0 0 0 1px #605ce5 !important;
}

/* 日历头部 */
:deep(.el-date-picker__header-label) {
  color: #605ce5 !important;
  font-weight: bold !important;
}

/* 月份导航按钮 - 包括默认和悬停状态 */
:deep(.el-date-picker__prev-btn svg),
:deep(.el-date-picker__next-btn svg) {
  color: #605ce5 !important;
}

:deep(.el-date-picker__prev-btn:hover svg),
:deep(.el-date-picker__next-btn:hover svg) {
  color: #5652d8 !important;
}

/* 快捷选项区域 */
:deep(.el-date-picker__quick-panel) {
  border-bottom: 1px solid #605ce5 !important;
}

:deep(.el-date-picker__shortcut) {
  color: #605ce5 !important;
}

:deep(.el-date-picker__shortcut:hover) {
  color: #5652d8 !important;
  background-color: #f5f3ff !important;
}

/* 月份和年份选择器 */
:deep(.el-year-table td:hover .el-year-table__cell),
:deep(.el-month-table td:hover .el-month-table__cell) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-year-table td .el-year-table__cell.current),
:deep(.el-month-table td .el-month-table__cell.current) {
  color: #605ce5 !important;
  font-weight: bold !important;
  background-color: #f5f3ff !important;
}

/* 日期单元格 - 加强覆盖 */
:deep(.el-date-table th) {
  color: #605ce5 !important;
}

:deep(.el-date-table td .el-date-table__cell) {
  color: #303133 !important;
}

:deep(.el-date-table td.available .el-date-table__cell) {
  color: #303133 !important;
}

:deep(.el-date-table td.available:hover .el-date-table__cell) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-date-table td.today .el-date-table__cell) {
  color: #605ce5 !important;
  font-weight: bold !important;
  position: relative;
}

:deep(.el-date-table td.today .el-date-table__cell::before) {
  border-color: #605ce5 !important;
}

:deep(.el-date-table td.current:not(.disabled) .el-date-table__cell) {
  color: #fff !important;
  background-color: #605ce5 !important;
  border-radius: 4px !important;
}

:deep(.el-date-table td.current:not(.disabled) .el-date-table__cell:hover) {
  color: #fff !important;
  background-color: #5652d8 !important;
}

:deep(.el-date-table td.in-range .el-date-table__cell) {
  background-color: #f5f3ff !important;
  color: #605ce5 !important;
}

:deep(.el-date-table td.in-range .el-date-table__cell:hover) {
  background-color: #f5f3ff !important;
  color: #605ce5 !important;
}

:deep(.el-date-table td.start-date .el-date-table__cell),
:deep(.el-date-table td.end-date .el-date-table__cell) {
  color: #fff !important;
  background-color: #605ce5 !important;
}

/* 时间选择器 */
:deep(.el-time-spinner__item:hover:not(.disabled)) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-time-spinner__item.active:not(.disabled)) {
  color: #605ce5 !important;
  font-weight: bold !important;
}

/* 范围选择器分隔符 */
:deep(.el-range-separator) {
  color: #605ce5 !important;
}

/* 日期选择器清除按钮 */
:deep(.el-date-editor .el-input__clear:hover) {
  color: #605ce5 !important;
}

/* 季度选择器 */
:deep(.el-quarter-table td .el-quarter-table__cell) {
  color: #303133 !important;
}

:deep(.el-quarter-table td:hover .el-quarter-table__cell) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-quarter-table td .el-quarter-table__cell.current) {
  color: #605ce5 !important;
  font-weight: bold !important;
  background-color: #f5f3ff !important;
}

/* 时间选择器 - 增强覆盖 */
:deep(.el-time-spinner__item) {
  color: #303133 !important;
}

:deep(.el-time-spinner__item:hover:not(.disabled)) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-time-spinner__item.active:not(.disabled)) {
  color: #605ce5 !important;
  font-weight: bold !important;
}

/* 时间选择器按钮 */
:deep(.el-time-panel__btn) {
  color: #605ce5 !important;
}

:deep(.el-time-panel__btn:hover) {
  color: #5652d8 !important;
}

/* 范围选择器 - 增强覆盖 */
:deep(.el-range-editor .el-input__wrapper) {
  border-color: #605ce5 !important;
}

:deep(.el-range-editor .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-range-editor .el-input__wrapper.is-focus) {
  border-color: #605ce5 !important;
  box-shadow: 0 0 0 1px #605ce5 !important;
}

/* 范围选择器分隔符 */
:deep(.el-range-separator) {
  color: #605ce5 !important;
}

/* 日期选择器按钮组 */
:deep(.el-date-picker__footer) {
  border-top: 1px solid #605ce5 !important;
}

:deep(.el-date-picker__footer .el-button) {
  color: #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-date-picker__footer .el-button:hover) {
  color: #5652d8 !important;
  border-color: #5652d8 !important;
}

/* 清除按钮 */
:deep(.el-date-editor .el-input__clear) {
  color: #c0c4cc !important;
}

:deep(.el-date-editor .el-input__clear:hover) {
  color: #605ce5 !important;
}

/* 修复日期选择器中可能的样式冲突 */
:deep(.el-date-picker *) {
  --el-color-primary: #605ce5 !important;
  --el-color-primary-light-9: #f5f3ff !important;
  --el-color-primary-dark-2: #5652d8 !important;
}
</style>