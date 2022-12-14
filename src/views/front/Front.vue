<template>
  <div>
    <div style="padding: 10px 0; margin-left: 1%">
      <el-input placeholder="请输入标题" v-model="queryInfo.title" :clearable="true" style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
      <el-input placeholder="请输入分类id" v-model="queryInfo.categoryId" :clearable="true" style="width: 200px" suffix-icon="el-icon-document"></el-input>
      <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">查询</el-button>
    </div>
    <div style="margin: 10px 0; margin-left: 1%">
      <el-table :data="blogList" border :stripe="true" :height="660">
        <el-table-column type="selection" width="55"> </el-table-column>
        <!--<el-table-column label="序号" prop="id" width="50"> </el-table-column>-->
        <el-table-column label="标题" prop="title" width="100"> </el-table-column>
        <el-table-column label="描述" prop="description" width="200" :show-overflow-tooltip="true"> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200"> </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="200"> </el-table-column>
        <el-table-column label="浏览量" prop="views" width="60"> </el-table-column>
        <el-table-column label="字数" prop="words" width="50"> </el-table-column>
        <el-table-column label="分类" prop="categoryName" width="100"> </el-table-column>
        <el-table-column label="作者" prop="userId" width="50"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-view" @click="readBlog(scope.row.id)"> 查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="padding: 10px 0">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getBlogList } from '@/api/front/Front'

export default {
  name: 'Front',
  data() {
    return {
      queryInfo: {
        title: '',
        categoryId: null
      },
      total: 0,
      pageNum: 1,
      pageSize: 10,
      blogList: []
    }
  },
  watch: {
    $route: {
      // 监听路由变化，由其他界面跳转而来时，刷新博客列表
      handler(val, oldval) {
        this.getBlogList()
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    handleCurrentChange(val) {
      // 显示第几页
      this.pageNum = val
      this.getBlogList()
      console.log(`当前页: ${val}`)
    },
    // 查询博客列表
    getBlogList() {
      // console.log('get blog list ... ')
      // console.log(this.queryInfo)
      getBlogList(this.queryInfo).then(res => {
        this.blogList = res.data.data
        this.total = this.blogList.length
      })
    },
    // 阅读指定id的文章
    readBlog(id) {
      this.$router.push(`/blog/read/${id}`)
    }
  },
  mounted() {
    this.getBlogList()
  }
}
</script>

<style scoped>

</style>
