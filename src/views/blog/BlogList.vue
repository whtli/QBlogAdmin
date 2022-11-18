<template>
  <div>
    <div style="padding: 10px 0; margin-left: 1%">
      <el-input placeholder="请输入标题" v-model="queryInfo.title" :clearable="true" style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
      <el-input placeholder="请输入描述" v-model="queryInfo.categoryId" :clearable="true" style="width: 200px" suffix-icon="el-icon-document"></el-input>
      <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">查询</el-button>
<!--      <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">刷新列表</el-button>-->
    </div>
    <div style="margin: 10px 0; margin-left: 1%">
      <el-button type="primary" @click="toBlogWritePage"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
      <el-button type="danger" @click="deleteBlogBatch"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
<!--      <el-button type="primary"><i class="el-icon-bottom"></i> 导入</el-button>-->
<!--      <el-button type="primary"><i class="el-icon-top"></i> 导出</el-button>-->
    </div>
    <div style="margin: 10px 0; margin-left: 1%">
      <el-table :data="blogList" border :stripe="true" :height="660" :header-cell-class-name="tableHeaderColor"  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="序号" prop="id" width="50"> </el-table-column>
        <el-table-column label="标题" prop="title" width="100"> </el-table-column>
        <el-table-column label="描述" prop="description" width="200"> </el-table-column>
        <el-table-column label="公开" prop="published" width="60"><template v-slot="scope">
          {{scope.row.published ? "公开":"隐藏"}}
        </template> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200"> </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="200"> </el-table-column>
        <el-table-column label="浏览量" prop="views" width="60"> </el-table-column>
        <el-table-column label="字数" prop="words" width="50"> </el-table-column>
        <el-table-column label="分类" prop="categoryId" width="100"> </el-table-column>
        <el-table-column label="作者" prop="userId" width="50"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" @click="readBlog(scope.row.id)"><i class="el-icon-view"> </i> 查看</el-button>
            <el-button type="success" @click="updateBlog(scope.row.id)"><i class="el-icon-edit"> </i> 编辑</el-button>
            <el-button type="danger" @click="deleteBlog(scope.row.id)"><i class="el-icon-remove"></i> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="padding: 10px 0">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getBlogs, deleteBlogById, deleteBlogBatchByIds } from '@/api/blog/BlogList'

export default {
  name: 'BlogList',
  data() {
    return {
      queryInfo: {
        title: '',
        categoryId: null,
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      blogList: [],
      selected: [], // 复选框选中的值列表
      tableHeaderColor: 'tableHeaderColor'
    }
  },
  watch: {
    $route: {
      // 监听路由变化，由其他界面跳转而来时，刷新博客列表
      handler(val, oldval) {
        // 新路由信息
        console.log(val)
        // 老路由信息
        console.log(oldval)
        this.getBlogList()
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    handleSizeChange(val) {
      // 每页显示的条数
      this.queryInfo.pageSize = val
      this.getBlogList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      // 显示第几页
      this.queryInfo.pageNum = val
      this.getBlogList()
      console.log(`当前页: ${val}`)
    },
    // 获取选中的值
    handleSelectionChange(selected) {
      this.selected = selected
      console.log('选中的值', selected.map((item) => item.id))
    },
    // 查询博客列表
    getBlogList() {
      // console.log('get blog list ... ')
      // console.log(this.queryInfo)
      getBlogs(this.queryInfo).then(res => {
        this.blogList = res.data.data.pageData.records
        this.total = res.data.data.total
      })
    },
    // 新增博客，跳转到写博客界面
    toBlogWritePage() {
      this.$router.push(`/blog/write`)
    },
    // 阅读指定id的文章
    readBlog(id) {
      this.$router.push(`/blog/read/${id}`)
    },
    // 更新指定id的博客
    updateBlog(id) {
      this.$alert('即将进入博客编辑界面', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          this.$router.push(`/blog/edit/${id}`)
          console.log(action)
        }
      })
    },
    // 根据id删除博客
    deleteBlog(id) {
      this.$confirm('此操作将永久删除该博客,是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteBlogById(id).then(response => {
          this.$message.success(response.data.message)
          this.getBlogList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        })
      })
    },
    // 根据id批量删除博客
    deleteBlogBatch() {
      const ids = this.selected.map(item => item.id).join()
      /* 根据后台想要的参数格式选择
      console.log(ids.join(",")); // string:1,2,3,4
      console.log(ids); // object:[1,2,3,4]
      */
      this.$confirm('此操作将永久删除所选的博客,是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteBlogBatchByIds(ids).then(response => {
          this.$message.success(response.data.message + ',ID为: ' + ids)
          this.getBlogList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批量删除操作'
        })
      })
    }
  },
  mounted() {
    this.getBlogList()
  }
}
</script>

<style>
.tableHeaderColor {
  background: #cccccc!important;
  color: black;
}
</style>
