<template>
  <div style="margin: 10px;">
    <!--搜索-->
    <el-form inline>
      <!--<el-form-item label="操作时间">
        <DateTimeRangePicker :date="queryInfo.date" :set-date="setDate" />
      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="logList">
      <el-table-column type="expand">
        <template v-slot="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item label="请求接口">
              <span>{{ props.row.uri }}</span>
            </el-form-item>
            <el-form-item label="请求参数">
              <span>{{ props.row.param }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" type="index" width="50" />
      <el-table-column label="操作者" prop="username" />
      <el-table-column label="请求方式" prop="method" width="80" />
      <el-table-column label="描述" prop="description" show-overflow-tooltip />
      <el-table-column label="ip" prop="ip" />
      <el-table-column label="ip来源" prop="ipSource" show-overflow-tooltip />
      <el-table-column label="操作系统" prop="os" />
      <el-table-column label="浏览器" prop="browser" show-overflow-tooltip />
      <el-table-column label="操作耗时" width="110">
        <template v-slot="scope">
          <el-tag size="small">{{ scope.row.times }}ms</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" width="170">
        <template v-slot="scope">{{ scope.row.createTime }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template v-slot="scope">
          <el-popconfirm title="确定删除吗？" icon="el-icon-delete" icon-color="red" @onConfirm="deleteLogById(scope.row.id)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div style="padding: 10px 0">
      <el-pagination
        background
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { getOperationLogList, deleteOperationLogById } from '@/api/log/OperationLog'

export default {
  name: 'OperationLog',
  data() {
    return {
      queryInfo: {
        date: [],
        pageNum: 1,
        pageSize: 10
      },
      logList: [],
      total: 0
    }
  },
  created() {
    this.getOperationLog()
  },
  methods: {
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getOperationLog()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getOperationLog()
    },
    getOperationLog() {
      const query = { ...this.queryInfo }
      if (query.date && query.date.length === 2) {
        query.date = query.date[0] + ',' + query.date[1]
      }
      getOperationLogList(query).then(res => {
        // console.log(res.data)
        this.logList = res.data.pageData.records
        this.total = res.data.total
      })
    },
    deleteLogById(id) {
      deleteOperationLogById(id).then(res => {
        this.$message.success(res.message)
        this.getOperationLog()
      })
    },
    search() {
      this.queryInfo.pageNum = 1
      this.queryInfo.pageSize = 10
      this.getOperationLog()
    },
    setDate(value) {
      this.queryInfo.date = value
    }
  }
}
</script>

<style scoped>
	.el-form--inline .el-form-item {
		margin-bottom: 0;
	}
</style>
