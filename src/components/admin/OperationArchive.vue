<template>
  <div class="operation-archive">
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入用户ID"
            :prefix-icon="Search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="14">
          <div style="display: flex; gap: 10px; align-items: center;">
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
              style="width: auto;"
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button type="default" @click="resetFilters">
              重置
            </el-button>
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
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
         <el-table-column prop="operationTime" label="时间" width="220">
          <template #default="scope">
            {{ formatDate(scope.row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationContent" label="操作" min-width="80" />
        <el-table-column prop="requestUrl" label="请求地址" min-width="200" />
        <el-table-column label="内容" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">查看详情</el-button>
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
        <pre v-if="selectedRow.requestParams">{{ formatJson(selectedRow.requestParams) }}</pre>
        <p v-else>无请求参数</p>
      </div>
      <div class="dialog-section">
        <h4>返回结果</h4>
        <pre v-if="selectedRow.responseResult">{{ formatJson(selectedRow.responseResult) }}</pre>
        <p v-else>无返回结果</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import request from '../../utils/request';

// 搜索参数
const searchKeyword = ref('');
const dateRange = ref([]);
const loading = ref(false);

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];

// 日期变化处理
const handleDateChange = (value) => {
  console.log('日期选择变化:', value);
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
    const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    // 如果解析失败，直接返回原始字符串
    return jsonString;
  }
};

// 获取归档数据的方法
const fetchArchiveData = async (params) => {
  try {
    const response = await request.get('/api/op-log/queryUserArchive', {
      params: {
        userId: params.userId,
        startTime: params.startTime,
        endTime: params.endTime
      }
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
        status: item.opStatus === 1 ? 'success' : 'danger',
        requestParams: item.requestParams, // 请求参数
        responseResult: item.responseResult // 返回结果
      }));
      
      return {
    data: formattedData
  };
    }
    
    return {
        data: []
      };
  } catch (error) {
    console.error('获取归档数据失败:', error);
    // 模拟数据，防止接口调不通时页面空白
    return {
      data: []
    };
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleString('zh-CN');
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateStr;
  }
};

// 搜索操作
const handleSearch = async () => {
  loading.value = true;
  try {
    const params = {
      userId: searchKeyword.value || null, // 使用searchKeyword作为userId
      startTime: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : null,
      endTime: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : null
    };
    
    const result = await fetchArchiveData(params);
    archiveData.value = result.data || [];
  } catch (error) {
    console.error('搜索操作失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = '';
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  flex: 1;
  overflow-y: auto;
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
</style>