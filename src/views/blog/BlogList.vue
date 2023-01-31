<template>
  <div>
    <div style="padding: 10px">
      <el-input placeholder="请输入标题" v-model="queryInfo.title" clearable style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
      <el-select v-model="queryInfo.categoryId" clearable placeholder="请选择分类" style="width: 200px" suffix-icon="el-icon-document">
        <el-option v-for="item in categoryList" :key="item.categoryName" :label="item.categoryName" :value="item.id">
          {{ item.categoryName }}
        </el-option>
      </el-select>
      <el-select v-model="queryInfo.tagIds" placeholder="请选择标签" clearable filterable multiple style="width: 200px">
        <el-option v-for="item in tagList" :key="item.id" :label="item.tagName" :value="item.id"></el-option>
      </el-select>
      <!--<el-select v-model="queryInfo.tagId" clearable placeholder="请选择分类名" style="width: 200px" suffix-icon="el-icon-document">
        <el-option v-for="item in tagList" :key="item.tagName" :label="item.tagName" :value="item.id">
          {{ item.tagName }}
        </el-option>
      </el-select>-->
      <el-button @click.native.prevent="loadBlogList" style="margin-left: 5px" type="primary">查询</el-button>
      <el-button type="warning" @click="reset">重置</el-button>
    </div>
    <div style="margin-left: 10px; width: 50%; display: flex; justify-content: space-between ">
      <el-button type="primary" @click="toBlogWritePage"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
      <el-button type="danger" @click="deleteBlogBatch"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
      <el-upload action :http-request="importBlog" :on-exceed="handleExceed" :before-upload="beforeMarkdownUpload" :show-file-list="false">
        <el-button type="primary"><i class="el-icon-top"></i> 单个（.md）导入</el-button>
      </el-upload>
      <el-upload action :http-request="importBlog" :on-exceed="handleExceed" :before-upload="beforeExcelUpload" :show-file-list="false">
        <el-button type="primary"><i class="el-icon-top"></i> 批量（.xlsx）导入</el-button>
      </el-upload>
      <el-button type="primary" @click="exportBlogBatch"><i class="el-icon-bottom"></i> 批量（.xlsx）导出</el-button>
    </div>
    <div style="margin: 10px; width: 99%">
      <el-table :data="blogList" border stripe v-loading="loading" :height="660" :header-cell-class-name="tableHeaderColor" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="序号" prop="id" width="50"> </el-table-column>
        <el-table-column label="标题" prop="title" width="100"> </el-table-column>
        <el-table-column label="描述" prop="description" width="200" :show-overflow-tooltip="true"> </el-table-column>
        <el-table-column label="可见性" prop="published" width="160"><template v-slot="scope">
          <el-switch
            v-model="scope.row.published"
            active-text="公开"
            inactive-text="隐藏"
            @change="changeBlogStatus(scope.row.id)"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template></el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="200"> </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="200"> </el-table-column>
        <el-table-column label="浏览量" prop="views" width="60"> </el-table-column>
        <el-table-column label="字数" prop="words" width="50"> </el-table-column>
<!--        <el-table-column label="分类" prop="categoryId" width="100"> </el-table-column>-->
        <el-table-column label="分类名" prop="categoryName" width="100"> </el-table-column>
        <el-table-column label="作者" prop="userId" width="50"> </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-view" @click="readBlog(scope.row.id)"> 查看</el-button>
            <el-button type="success" icon="el-icon-edit" @click="updateBlog(scope.row.id)"> 编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteBlog(scope.row.id)"> 删除</el-button>
            <el-button type="primary" icon="el-icon-bottom" @click="exportBlog(scope.row.id)"> 下载（.md）</el-button>
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
import { getBlogList, deleteBlogById, deleteBlogBatchByIds, uploadBlog, changeBlogStatusById } from '@/api/blog/BlogList'
import { getCategoryAndTag } from '@/api/blog/BlogWrite'

export default {
  name: 'BlogList',
  data() {
    return {
      queryInfo: {
        title: '',
        categoryId: null,
        tagIds: [],
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      blogList: [],
      categoryList: [],
      tagList: [],
      loading: false,
      // 复选框选中的值列表
      selected: [],
      tableHeaderColor: 'tableHeaderColor',
      // 允许上传的博客文件类型
      MarkdownFileType: ['md'],
      ExcelFileType: ['xlsx', 'xls'],
      // 运行上传文件大小，单位 M
      MarkdownFileSize: 1,
      ExcelFileSize: 1
    }
  },
  created() {
    this.loadBlogList()
    this.getCategoryAndTag()
  },
  watch: {
    $route: {
      // 监听路由变化，由其他界面跳转而来时，刷新博客列表
      handler(val, oldval) {
        // 新路由信息
        console.log(val)
        // 老路由信息
        console.log(oldval)
        this.loadBlogList()
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    handleSizeChange(val) {
      // 每页显示的条数
      this.queryInfo.pageSize = val
      this.loadBlogList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      // 显示第几页
      this.queryInfo.pageNum = val
      this.loadBlogList()
      console.log(`当前页: ${val}`)
    },
    // 获取选中的值
    handleSelectionChange(selected) {
      this.selected = selected
      // console.log('选中的值', selected.map((item) => item.id))
    },
    // 查询博客列表
    loadBlogList() {
      this.loading = true
      getBlogList(this.queryInfo).then(res => {
        this.blogList = res.data.pageData.records
        this.total = res.data.total
        this.loading = false
      })
    },
    // 清空查询条件查询所有博客
    reset() {
      this.queryInfo.title = ''
      this.queryInfo.categoryId = null
      this.loadBlogList()
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
          // console.log(action)
        }
      })
    },
    // 更改指定博客的可见性
    changeBlogStatus(id) {
      changeBlogStatusById(id).then(res => {
        this.$message.success(res.message)
        this.loadBlogList()
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
        deleteBlogById(id).then(res => {
          this.$message.success(res.message)
          this.loadBlogList()
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
        deleteBlogBatchByIds(ids).then(res => {
          this.$message.success(res.message + ',ID为: ' + ids)
          this.loadBlogList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批量删除操作'
        })
      })
    },
    // 根据id下载博客文件（.md）
    exportBlog() {
      // window.open('http://localhost:8080/admin/blog/export')
    },
    exportBlogBatch() {
      // window.open('http://localhost:8080/admin/blog/export')
    },
    // 上传Markdown文件之前
    beforeMarkdownUpload(file) {
      if (file.type !== '' || file.type != null || file.type !== undefined) {
        // 计算文件的大小
        const fileSize = file.size / 1024 / 1024
        // 这里做文件大小限制
        if (fileSize > this.MarkdownFileSize) {
          this.$message('上传文件大小不能超过 1MB!')
          return false
        }
        // 截取文件的后缀，判断文件类型
        const suffix = file.name.replace(/.+\./, '').toLowerCase()
        // 如果文件类型不在允许上传的范围内
        if (this.MarkdownFileType.includes(suffix)) {
          return true
        } else {
          this.$message.error('博客文件类型应为.md文件!')
          return false
        }
      }
    },
    // 上传Excel文件之前
    beforeExcelUpload(file) {
      if (file.type !== '' || file.type != null || file.type !== undefined) {
        // 计算文件的大小
        const fileSize = file.size / 1024 / 1024
        // 这里做文件大小限制
        if (fileSize > this.ExcelFileSize) {
          this.$message('上传文件大小不能超过 5MB!')
          return false
        }
        // 截取文件的后缀，判断文件类型
        const suffix = file.name.replace(/.+\./, '').toLowerCase()
        // 如果文件类型不在允许上传的范围内
        if (this.ExcelFileType.includes(suffix)) {
          return true
        } else {
          this.$message.error('博客文件类型应为.excel文件!')
          return false
        }
      }
    },
    // 超出文件个数的回调
    handleExceed(files) {
      this.$message.warning(`超出上传数量限制！最多上传 ${this.fileLimit} 个博客文件，选择了 ${files.length} 个博客文件`)
    },
    // 上传文件的事件
    importBlog(item) {
      this.$message('博客上传中······')
      // 上传文件的需要formdata类型
      const FormDatas = new FormData()
      FormDatas.append('file', item.file)
      uploadBlog(FormDatas).then(res => {
        this.$message.success(res.data.message)
        // 成功过后刷新列表，清空上传文件列表
        this.handleSuccess()
      })
    },
    // 上传成功后的回调
    handleSuccess() {
      this.loadBlogList()
    },
    // 获取分类和标签
    getCategoryAndTag() {
      getCategoryAndTag().then(res => {
        this.categoryList = res.data.categoryList
        this.tagList = res.data.tagList
      })
    }
  }
}
</script>

<style>
.tableHeaderColor {
  background: #cccccc!important;
  color: black;
}
</style>
