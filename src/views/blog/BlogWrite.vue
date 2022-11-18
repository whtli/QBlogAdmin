<template>
  <div>
    <div id="main">
      <el-form ref="blogForm" :model="blogForm" :rules="rules" style="margin-left: 30px; margin-right: 30px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="blogForm.title" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="blogForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <br>
          <mavon-editor ref="md" v-model="blogForm.content" @imgAdd="imgAdd" @imgDel="imgDel" @save="contentSave" />
        </el-form-item>
        <el-form-item label="字数" prop="words">
          <el-input v-model="blogForm.words" />
        </el-form-item>
        <el-form-item label="浏览次数" prop="words">
          <el-input v-model="blogForm.views" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="blogSubmit">
            发布
          </el-button>
          <el-button @click="blogReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { addImage, deleteImg, submitBlog, getBlogById } from '@/api/blog/BlogWrite'

export default {
  name: 'BlogWrite',
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
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入摘要', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入正文', trigger: 'blur' }
        ]
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
    },
    contentSave(value, render) {
      console.log('this is render' + render)
      console.log('this is value' + value)
      console.log(this.$refs.md.d_render)
    },
    // 上传图像，绑定@imgAdd event
    imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData()
      formdata.append('image', $file)
      console.log($file)
      addImage(formdata).then(res => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        if (res.status === 200) {
          const url = res.data.data.imageUrl
          this.$refs.md.$img2Url(pos, url)
        } else {
          this.$message({ type: res.status, message: 'Image upload failed!' })
        }
        // $vm 指为mavonEditor实例，可以通过如下两种方式获取
        // 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
        // 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
        // vm.$img2Url(pos, url)
      })
    },
    // 删除图像
    imgDel(pos) {
      const url = pos[0]
      deleteImg(url).then(response => {
        this.$alert('图片删除成功：' + response.data.data, '提示', {
          confirmButtonText: '确定'
        })
      }).catch(error => {
        this.$message({
          message: error,
          type: 'error',
          showClose: true,
          center: true }
        )
      })
    },
    // 提交（发布/更新）博客
    blogSubmit() {
      this.$refs.blogForm.validate((valid) => {
        if (valid) {
          submitBlog(this.blogForm).then(res => {
            console.log(res)
            this.$alert('发布成功', '提示', {
              confirmButtonText: '确定',
              callback: action => {
                this.$router.push('/blog/list')
                console.log(action)
              }
            })
          })
        } else {
          console.log('error submit!')
          return false
        }
      })
    },
    blogReset() {
      this.$refs.blogForm.resetFields()
    }
  }
}
</script>

<style scoped>

</style>
