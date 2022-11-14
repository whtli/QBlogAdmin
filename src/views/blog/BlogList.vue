<template>
  <div>
    <div style="padding: 10px 0">
      <el-input placeholder="请输入标题" :clearable="true" style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
      <el-input placeholder="请输入描述" :clearable="true" style="width: 200px" suffix-icon="el-icon-document"></el-input>
      <el-input placeholder="请输入作者" :clearable="true" style="width: 200px" suffix-icon="el-icon-user"></el-input>
      <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">搜索</el-button>
    </div>
    <div style="margin: 10px 0">
      <el-button type="primary"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
      <el-button type="danger"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
      <el-button type="primary"><i class="el-icon-bottom"></i> 导入</el-button>
      <el-button type="primary"><i class="el-icon-top"></i> 导出</el-button>
    </div>
    <el-table :data="blogList" border :stripe="true" :height="400" :header-cell-class-name="tableHeaderColor">
      <el-table-column label="序号" prop="categoryId" width="50"> </el-table-column>
      <el-table-column label="标题" prop="title" width="50"> </el-table-column>
      <el-table-column label="描述" prop="description" width="120"> </el-table-column>
      <el-table-column label="正文" prop="content" width="100"> </el-table-column>
      <el-table-column label="公开" prop="isPublished" width="50"> </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="150"> </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="150"> </el-table-column>
      <el-table-column label="浏览量" prop="views" width="60"> </el-table-column>
      <el-table-column label="字数" prop="words" width="50"> </el-table-column>
      <el-table-column label="分类" prop="categoryId" width="50"> </el-table-column>
      <el-table-column label="作者" prop="userId" width="50"> </el-table-column>
      <el-table-column label="操作">
        <template :slot-scope="scope">
          <el-button type="success"><i class="el-icon-edit"> </i>编辑</el-button>
          <el-button type="danger"><i class="el-icon-remove"></i>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="padding: 10px 0">
      <el-pagination
        :page-sizes="[5, 10, 15, 20]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getBlogListAuto } from '@/api/blog/BlogList'

export default {
  name: 'BlogList',
  data() {
    return {
      blogList: [],
      tableHeaderColor: 'tableHeaderColor'
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

<style>
.tableHeaderColor {
  background: #cccccc!important;
  color: black;
}
</style>
