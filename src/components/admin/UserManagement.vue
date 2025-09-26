<template>
  <div class="user-management-container">
    <div class="card-header">
      <div class="search-container">
        <el-input
          v-model="searchKey"
          placeholder="输入用户ID或用户名搜索..."
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
    <div class="user-management-content">
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="200" />
        <el-table-column prop="userName" label="用户名" width="200" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="type" label="用户类型" width="120">
          <template #default="scope">
            <span :class="getUserTypeClass(scope.row.type)">{{
              formatUserType(scope.row)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">{{
              formatStatus(scope.row)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="avatar" label="头像" width="120">
          <template #default="scope">
            <img
              v-if="scope.row.avatar"
              :src="scope.row.avatar"
              alt="头像"
              class="avatar"
              width="36"
              height="36"
            />
            <span v-else>无头像</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 1"
              type="primary"
              size="small"
              @click="handleApproveUser(scope.row.id)"
              >通过审核</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteUser(scope.row.id)"
              >删除</el-button
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../utils/request";

const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKey = ref("");

// 格式化用户类型
const formatUserType = (row) => {
  switch (row.type) {
    case 0:
      return "研发";
    case 1:
      return "产品";
    case 2:
      return "测试";
    default:
      return "未知";
  }
};

// 格式化状态
const formatStatus = (row) => {
  switch (row.status) {
    case 0:
      return "审核通过";
    case 1:
      return "待审核";
    case 2:
      return "审核失败";
    default:
      return "未知状态";
  }
};

// 获取用户类型对应的样式类
const getUserTypeClass = (type) => {
  switch (type) {
    case 0:
      return "type-developer";
    case 1:
      return "type-product";
    case 2:
      return "type-tester";
    default:
      return "type-unknown";
  }
};

// 获取状态对应的样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0:
      return "status-approved";
    case 1:
      return "status-pending";
    case 2:
      return "status-rejected";
    default:
      return "";
  }
};

// 处理审核通过
const handleApproveUser = (id) => {
  ElMessageBox.confirm("确定要通过该用户的审核吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 调用审核通过的API接口
        const res = await request.get(`/api/novel-auth/users/approve/${id}`);

        if (res.code === 200) {
          ElMessage.success("审核已通过");
          // 刷新用户列表
          fetchUserList();
        } else {
          ElMessage.error("审核失败: " + res.message);
        }
      } catch (error) {
        console.error("审核用户失败:", error);
        ElMessage.error("审核用户失败: 网络异常");
      }
    })
    .catch(() => {
      ElMessage.info("已取消审核");
    });
};

// 处理删除用户
const handleDeleteUser = (id) => {
  ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 调用删除用户的API接口
        const res = await request.get(`/api/novel-auth/users/delete/${id}`);

        if (res.code === 200) {
          ElMessage.success("删除成功");
          // 刷新用户列表
          fetchUserList();
        } else {
          ElMessage.error("删除失败: " + res.message);
        }
      } catch (error) {
        console.error("删除用户失败:", error);
        ElMessage.error("删除用户失败: 网络异常");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 搜索用户
const handleSearch = () => {
  currentPage.value = 1; // 重置为第一页
  fetchUserList();
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await request.get("/api/novel-auth/users", {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        ...(searchKey.value && { keyword: searchKey.value }),
      },
    });
    console.log("fetchUserList:", res);
    if (res.code === 200) {
      userList.value = res.data.records;
      total.value = res.data.total;
    } else {
      ElMessage.error("获取用户列表失败: " + res.message);
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败: 网络异常");
  }
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchUserList();
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
  fetchUserList();
};

// 组件挂载时执行
onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-management-container {
  padding: 10px;
}
.user-management-content {
  max-height: 800px;
  overflow-y: auto;
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
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
}

/* 状态样式 */
.status-approved {
  color: #4caf50; /* 绿色 */
  font-weight: bold;
}

.status-pending {
  color: #ffc107; /* 黄色 */
  font-weight: bold;
}

.status-rejected {
  color: #f44336; /* 红色 */
  font-weight: bold;
}

/* 用户类型样式 */
.type-developer {
  background-color: #4285f4; /* 蓝色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.type-product {
  background-color: #0f9d58; /* 绿色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.type-tester {
  background-color: #f4b400; /* 黄色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.type-unknown {
  background-color: #9e9e9e; /* 灰色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
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

/* ElMessageBox弹窗样式 */
:deep(.el-message-box) {
  border-color: #605ce5 !important;
}

:deep(.el-message-box__title) {
  color: #605ce5 !important;
  font-weight: bold !important;
}

/* 弹窗按钮样式 */
:deep(.el-message-box__btns .el-button--primary) {
  background-color: #605ce5 !important;
  border-color: #605ce5 !important;
  transition: all 0.3s ease !important;
}

:deep(.el-message-box__btns .el-button--primary:hover) {
  background-color: #5652d8 !important;
  border-color: #5652d8 !important;
}

:deep(.el-message-box__btns .el-button--default) {
  color: #303133 !important;
  border-color: #dcdfe6 !important;
  transition: all 0.3s ease !important;
}

:deep(.el-message-box__btns .el-button--default:hover) {
  color: #605ce5 !important;
  border-color: #605ce5 !important;
}

/* 弹窗内容文字颜色 */
:deep(.el-message-box__content) {
  color: #606266 !important;
}

/* 弹窗图标颜色 */
:deep(.el-message-box__status svg) {
  color: #605ce5 !important;
}
</style>