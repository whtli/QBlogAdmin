<template>
  <div>
    <div id="main" style="margin-left: 10%; margin-right: 10%">
      <el-form ref="blogForm" :model="blogForm" >
        <el-form-item label="标题" prop="title">
          <el-input v-model="blogForm.title" readonly/>
        </el-form-item>
        <el-form-item>
          <el-col :span="11" style="margin-right: 10px">
            <el-form-item label="字数">
              <el-input readonly v-model="blogForm.words" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="阅读量" >
              <el-input readonly v-model="blogForm.views" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="blogForm.description" type="textarea" readonly/>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <br>
          <mavon-editor ref="md" v-model="blogForm.content" :subfield="false" :defaultOpen="'preview'" :editable="false" :code-style="'a11y-dark'" :toolbarsFlag="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getBlogById } from '@/api/blog/BlogWrite'

export default {
  name: 'BlogRead',
  data() {
    return {
      blogForm: {
        id: '',
        title: '',
        firstPicture: '',
        description: '',
        content: '',
        published: true,
        commentEnabled: false,
        views: 0,
        words: null,
        readTime: null,
        categoryId: null,
        top: false,
        password: ''
      }
    }
  },
  created() {
    // 当界面被创建时，监听是否有路由参数
    // 若有说明是修改指定博客，此时需要先查询并显示
    // 若无说明是新增博客
    if (this.$route.params.id) {
      this.getBlog(this.$route.params.id)
    }
  },
  methods: {
    // 根据id查询唯一的博客
    getBlog(id) {
      getBlogById(id).then(res => {
        // 把查询结果赋值给this.blogList，使其显示到编辑界面上
        this.blogForm = res.data.data
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '获取文博客失败，请重试'
        })
      })
    }
  }
}
</script>

<style scoped>
/** 默认样式 */
.input-border-style{
  border:1px solid #47c9FF;
  border-radius:3px;
  padding-left: 10px;
}
/** el-input disabled时的文字颜色*/
.el-input.is-disabled .el-input__inner{
  color:#d61616;
}
/** el-input disabled时的背景和边框*/
.el-input.is-disabled{
  background:#dbdada;
  border: 1px solid #868686;
}
/** el-input 正常模式下、readonly模式下的文字颜色 */
.el-input__inner{
  color:#00ccff;
}
</style>
