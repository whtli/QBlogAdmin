<template>
  <div>
    <h1>Blog List</h1>
    <el-row>
      <el-col>
        <el-input placeholder="请输入标题" :clearable="true" style="min-width: 500px"></el-input>
      </el-col>
    </el-row>
    <el-button @click.native.prevent="getBlogList">刷新</el-button>
    <el-table :data="blogList">
      <el-table-column label="序号" prop="categoryId" width="50"> </el-table-column>
      <el-table-column label="标题" prop="title" width="100"> </el-table-column>
      <el-table-column label="描述" prop="description" width="150"> </el-table-column>
      <el-table-column label="文章正文" prop="content" width="150"> </el-table-column>
      <el-table-column label="公开" prop="isPublished" width="50"> </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="100"> </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="100"> </el-table-column>
      <el-table-column label="浏览量" prop="views" width="100"> </el-table-column>
      <el-table-column label="字数" prop="words" width="50"> </el-table-column>
      <el-table-column label="文章分类" prop="categoryId" width="100"> </el-table-column>
      <el-table-column label="文章作者" prop="userId" width="100"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getBlogListAuto } from '@/api/blog/BlogList'

export default {
  name: 'BlogList',
  data() {
    return {
      blogList: []
    }
  },
  methods: {
    getBlogList() {
      console.log('get blog list ... ')
      getBlogListAuto().then(res => {
        this.blogList = res.data.data.blogList
      })
    }
  },
  mounted() {
    this.getBlogList()
  }
}
</script>

<style scoped>

</style>
