<template>
  <div class="user-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" size="small" @click="handleAddUser">新增用户</el-button>
        </div>
      </template>
      
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="userName" label="用户名" width="180" />
        <el-table-column prop="email" label="邮箱" width="250" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="type" label="用户类型" width="120" :formatter="formatUserType" />
        <el-table-column prop="status" label="状态" width="100" :formatter="formatStatus" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 模拟用户数据
const userList = ref([
  { id: 1, userName: 'admin', email: 'admin@example.com', phone: '13800138000', type: 0, status: 1, createTime: '2023-01-01 10:00:00' },
  { id: 2, userName: 'product', email: 'product@example.com', phone: '13900139000', type: 1, status: 1, createTime: '2023-01-02 10:00:00' },
  { id: 3, userName: 'test', email: 'test@example.com', phone: '13700137000', type: 2, status: 1, createTime: '2023-01-03 10:00:00' },
]);

const total = ref(3);
const currentPage = ref(1);
const pageSize = ref(10);

// 格式化用户类型
const formatUserType = (row) => {
  switch(row.type) {
    case 0: return '研发';
    case 1: return '产品';
    case 2: return '测试';
    default: return '未知';
  }
};

// 格式化状态
const formatStatus = (row) => {
  return row.status === 1 ? '启用' : '禁用';
};

// 处理新增用户
const handleAddUser = () => {
  ElMessage.info('新增用户功能待实现');
};

// 处理编辑用户
const handleEditUser = (user) => {
  ElMessage.info(`编辑用户: ${user.userName}`);
};

// 处理删除用户
const handleDeleteUser = (id) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟删除操作
      const index = userList.value.findIndex(item => item.id === id);
      if (index !== -1) {
        userList.value.splice(index, 1);
        total.value--;
        ElMessage.success('删除成功');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 组件挂载时执行
onMounted(() => {
  // 模拟从API获取数据
  console.log('用户管理组件已挂载');
});
</script>

<style scoped>
.user-management-container {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>