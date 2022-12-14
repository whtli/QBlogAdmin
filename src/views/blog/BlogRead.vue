<template>
  <div>
    <div id="main" style="margin-left: 10%; margin-right: 10%">
      <el-form ref="blogForm" :model="blogForm" >
        <el-form-item prop="title" style="text-align: center">
          <h1>{{ blogForm.title }}</h1>
        </el-form-item>
        <el-form-item class="m-padded-tb-small">
          <div class="m-center">
            <i class="el-icon-date m-datetime"><span> 发布时间：{{ blogForm.createTime }}</span></i>
            <i class="el-icon-view m-views"><span> 阅读量：{{ blogForm.views }}</span></i>
            <i class="el-icon-document m-words"><span> 字数：{{ blogForm.words }}</span></i>
            <i class="el-icon-timer m-read-time"><span> 阅读时长：{{ blogForm.readTime }} 分钟</span></i>
          </div>
        </el-form-item>
        <el-form-item align="center">
          <el-col :span="11">
              <span>   分类：</span>
              <el-button ><span> {{ category.categoryName }}</span></el-button>
          </el-col>
          <el-col :span="11">
            <span>     标签：</span>
            <el-button round v-for="(tag, index) in tagList" :key="index">{{ tag.tagName }}</el-button>
          </el-col>
        </el-form-item>
        <!--<el-form-item label="描述" prop="description">
          <el-input v-model="blogForm.description" type="textarea" readonly/>
        </el-form-item>-->
        <el-form-item prop="content">
          <mavon-editor ref="md" v-model="blogForm.content" :subfield="false" :defaultOpen="'preview'" :editable="false" :code-style="'a11y-dark'" :toolbarsFlag="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getBlogInfoById } from '@/api/blog/BlogWrite'

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
        createTime: null,
        updateTime: null,
        published: true,
        commentEnabled: false,
        views: 0,
        words: null,
        readTime: null,
        categoryId: null,
        top: false,
        password: ''
      },
      tagList: {},
      category: {}
    }
  },
  created() {
    // 当界面被创建时，监听是否有路由参数
    // 若有说明是阅读指定博客，此时需要先查询并显示
    // 若无说明是新增博客
    if (this.$route.params.id) {
      this.getBlogInfo(this.$route.params.id)
    }
  },
  methods: {
    // 根据id查询唯一的博客
    getBlogInfo(blogId) {
      getBlogInfoById(blogId).then(res => {
        // 把查询结果赋值给blogList、tagList、category，使其显示到编辑界面上
        this.tagList = res.data.data.tagList
        this.category = res.data.data.category
        this.blogForm = res.data.data.blog
        const createTime = this.blogForm.createTime.substring(0, 10)
        this.blogForm.createTime = createTime
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '获取博客信息失败，请重试'
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

.m-padded-tb-small {
  padding-top: 0.5em !important;
  padding-bottom: 0.5em !important;
}

.m-center {
  width: 70%;
  margin: auto !important;
  display: flex;
  justify-content: space-around;
  size: 14px;
  font-size: 14px;
}

.m-datetime {
  color: #00a7e0 !important;
}

.m-views {
  color: #ff3f1f !important;
}

.m-words {
  color: #000 !important;
}

.m-read-time {
  color: #B35B4B !important;
}

</style>
