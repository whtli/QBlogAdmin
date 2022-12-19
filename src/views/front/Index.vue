<template>
  <div>
    <div style="margin: 1%">
      <el-input placeholder="请输入标题" v-model="queryInfo.title" clearable style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
      <el-input placeholder="请输入分类id" v-model="queryInfo.categoryId" :clearable="true" style="width: 200px" suffix-icon="el-icon-document"></el-input>
      <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">查询</el-button>
    </div>

    <div style="margin: 10px">
      <div style="border-bottom: 1px dashed #ccc" v-for="item in blogList" :key="item.id">
        <div class="pd-10" style="font-size: 20px; color: #3F5EFB; cursor: pointer" @click="readBlog(item.id)">{{ item.title }}</div>
        <div style="font-size: 14px; margin-top: 10px">
          <i class="el-icon-user-solid"></i> <span>{{ item.userId }}</span>
          <i class="el-icon-time" style="margin-left: 10px"></i> <span>{{ item.createTime }}</span>
        </div>
      </div>
    </div>

    <div>
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-size="pageSize"
        layout="total, prev, pager, next"
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
