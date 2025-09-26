<template>
  <div class="log-viewer-container">
    <div class="card-header">
      <div class="search-container">
        <el-input
          v-model="userId"
          placeholder="输入用户ID搜索..."
          prefix-icon="Search"
          :style="{ width: '200px' }"
        />
        <el-button
          type="primary"
          size="middle"
          @click="handleSearch"
          :style="{ marginLeft: '10px' }"
        >
          搜索
        </el-button>
      </div>
    </div>

    <div class="log-content">
      <el-table :data="logList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="100" />
        <el-table-column prop="opType" label="操作类型" width="100">
          <template #default="{ row }">
            <span v-html="formatOpType(row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          prop="opStatus"
          label="操作状态"
          width="100"
          :formatter="formatOpStatus"
        />
        <el-table-column prop="methodName" label="方法名" width="200" />
        <el-table-column prop="requestType" label="请求类型" width="80" />
        <el-table-column prop="requestUrl" label="请求URL" width="200" />
        <el-table-column prop="requestIp" label="请求IP" width="150" />
        <el-table-column prop="updateTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="操作日志详情" width="800px">
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
import { ElDialog, ElButton } from "element-plus";
import { ElMessage } from "element-plus";
import request from "../../utils/request";

// 日志数据
const logList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const userId = ref("");
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

// 格式化操作类型
const formatOpType = (row) => {
  // 根据实际业务需求添加映射

  switch (row.opType) {
    case 1:
      return "查询";
    case 2:
      // 新增操作标红
      return '<span style="color: #f56c6c;">新增</span>';
    case 3:
      // 修改操作标红
      return '<span style="color: #f56c6c;">修改</span>';
    case 4:
      // 删除操作标红
      return '<span style="color: #f56c6c;">删除</span>';
    case 5:
      return "导出";
    case 6:
      return "导入";
    default:
      return "其他";
  }
};

// 格式化操作状态
const formatOpStatus = (row) => {
  return row.opStatus === 1 ? "成功" : "失败";
};

// 获取日志数据
const fetchLogData = async () => {
  try {
    // 根据是否有userId决定调用哪个接口
    const url = userId.value
      ? "/api/op-log/queryUserAllOp"
      : "/api/op-log/queryAllOp";

    const response = await request({
      url,
      method: "GET",
      params: {
        page: currentPage.value,
        size: pageSize.value,
        ...(userId.value && { userId: userId.value }),
      },
    });

    if (response.code === 200) {
      logList.value = response.data.records || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error("获取日志数据失败");
      console.error("获取日志数据失败:", response);
    }
  } catch (error) {
    ElMessage.error("获取日志数据异常");
    console.error("获取日志数据异常:", error);
  }
};

// 搜索日志
const handleSearch = () => {
  currentPage.value = 1; // 重置为第一页
  fetchLogData();
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchLogData();
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
  fetchLogData();
};

// 组件挂载时执行
onMounted(() => {
  fetchLogData();
});
</script>

<style scoped>
.log-viewer-container {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.log-content {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 10px;
}

.expand-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.expand-section {
  margin-bottom: 10px;
}

.expand-section h4 {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

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

.expand-section pre {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 自定义审核通过按钮样式 */
:deep(.el-button--primary) {
  background-color: #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-button--primary:hover) {
  background-color: #5652d8 !important;
  border-color: #5652d8 !important;
}
/* 自定义分页组件样式 - 全面覆盖所有元素 */

/* 基础颜色设置 */
:deep(.el-pagination.is-background) {
  --el-pagination-button-color: #605ce5 !important;
  --el-pagination-hover-color: #605ce5 !important;
  --el-pagination-active-color: #605ce5 !important;
}

/* 分页数字按钮 - 全面覆盖 */
:deep(.el-pagination.is-background .el-pager li) {
  color: #605ce5 !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
  font-weight: bold !important;
}

/* 上一页/下一页按钮 */
:deep(.el-pagination__prev.is-arrow),
:deep(.el-pagination__next.is-arrow) {
  color: #605ce5 !important;
}

:deep(.el-pagination__prev.is-arrow:not(.disabled):hover),
:deep(.el-pagination__next.is-arrow:not(.disabled):hover) {
  color: #605ce5 !important;
  background-color: #f5f3ff !important;
}

/* 每页显示条数选择框 - 完整样式 */
:deep(.el-pagination__sizes .el-input__wrapper) {
  border-color: #605ce5 !important;
}

:deep(.el-pagination__sizes .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-pagination__sizes .el-input__inner) {
  color: #605ce5 !important;
}

:deep(.el-pagination__sizes .el-input__inner:focus) {
  border-color: #605ce5 !important;
}

/* 下拉选项框 */
:deep(.el-select-dropdown__item) {
  color: #605ce5 !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #605ce5 !important;
  font-weight: bold !important;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: #f5f3ff !important;
  color: #605ce5 !important;
}

/* 分页文本和输入框 */
:deep(.el-pagination__total),
:deep(.el-pagination__jump),
:deep(.el-pagination__jump .el-input__inner) {
  color: #605ce5 !important;
}

:deep(.el-pagination__jump .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #605ce5 !important;
  border-color: #605ce5 !important;
}

:deep(.el-pagination__jump .el-input__inner:focus) {
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
</style>