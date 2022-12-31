<template>
  <div>
    <div id="main" style="margin-left: 10%; margin-right: 10%">
      <el-form ref="blogForm" :model="blogForm">
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
            <el-button><span> {{ category.categoryName }}</span></el-button>
          </el-col>
          <el-col :span="11">
            <span>     标签：</span>
            <el-button v-for="(tag, index) in tagList" :key="index" round>{{ tag.tagName }}</el-button>
          </el-col>
        </el-form-item>
        <!--<el-form-item label="描述" prop="description">
          <el-input v-model="blogForm.description" type="textarea" readonly/>
        </el-form-item>-->
        <el-form-item prop="content">
          <mavon-editor ref="md" v-model="blogForm.content" :subfield="false" :default-open="'preview'" :editable="false" :code-style="'a11y-dark'" :toolbars-flag="false" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 写评论区域-->
    <div style="margin-left: 10%; margin-right: 10%">
      <!-- 写评论-->
      <div>
        <div style="border-bottom: 1px solid orangered; padding: 10px 0; font-size: 20px">评论</div>
        <div style="padding: 10px 0">
          <el-input size="small" type="textarea" v-model="commentForm.content"/>
        </div>
        <div class="margin: 10px 0" style="text-align: right">
          <el-button type="primary" size="small" @click="saveComment">评论</el-button>
        </div>
      </div>
      <!--  评论列表-->
      <div>
        <div v-for="item in comments" :key="item.id" style="border-bottom: 1px solid #ccc; padding: 10px 0; ">
          <div style="display: flex">
            <!-- 头像-->
            <div style="width: 100px; text-align: center">
              <el-image :src="'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80'" style="width: 50px; height: 50px; border-radius: 50%"></el-image>
            </div>
            <!-- 内容-->
            <div style="flex: 1; font-size: 14px; padding: 5px 0; line-height: 25px">
              <b>{{ item.username }}：</b>
              <span>{{ item.content }}</span>

              <div style="display: flex; line-height: 20px; margin-top: 5px">
                <div style="width: 200px;">
                  <i class="el-icon-time"></i><span style="margin-left: 5px">{{ item.time }}</span>
                </div>
                <div style="text-align: right; flex: 1">
                  <el-button style="margin-left: 5px" type="text" @click="handleReply(item.id)">回复</el-button>
                  <el-button type="text" style="color: red" @click="deleteComment(item.id)" v-if="userInfo.id === item.userId">删除</el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- 回复列表-->
          <div v-if="item.children.length"  style="padding-left: 200px;">
            <div v-for="subItem in item.children" :key="subItem.id"  style="background-color: #f0f0f0; padding: 5px 20px">
              <!-- 内容-->
              <div style="font-size: 14px; padding: 5px 0; line-height: 25px">
                <div>
                  <b style="color: #3a8ee6" v-if="subItem.pusername">@{{ subItem.pusername }}</b>
                </div>
                <div style="padding-left: 5px">
                  <b>{{ subItem.username }}：</b>
                  <span>{{ subItem.content }}</span>
                </div>
                <div style="display: flex; line-height: 20px; margin-top: 5px; padding-left: 5px">
                  <div style="width: 200px;">
                    <i class="el-icon-time"></i><span style="margin-left: 5px">{{ subItem.time }}</span>
                  </div>
                  <div style="text-align: right; flex: 1">
                    <el-button style="margin-left: 5px" type="text" @click="handleReply(subItem.id)">回复</el-button>
                    <el-button type="text" style="color: red" @click="deleteComment(subItem.id)" v-if="userInfo.id === subItem.userId">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 回复评论弹窗-->
    <el-dialog title="回复" :visible.sync="dialogFormVisible" width="50%" >
      <el-form label-width="80px" size="small">
        <el-form-item label="回复内容">
          <el-input type="textarea" v-model="commentForm.contentReply" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false" size="small">取 消</el-button>
        <el-button type="primary" @click="saveComment"  size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBlogInfoById } from '@/api/blog/BlogWrite'
import { loadComment, saveComment, deleteCommentById } from '@/api/comment/Comment'
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
      category: {},
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {},
      blogId: this.$route.params.id,
      comments: [],
      commentForm: {},
      dialogFormVisible: false
    }
  },
  created() {
    // 当界面被创建时，监听是否有路由参数
    // 若有说明是阅读指定博客，此时需要先查询并显示
    // 若无说明是新增博客
    if (this.$route.params.id) {
      this.getBlogInfo(this.$route.params.id)
      this.loadComment(this.$route.params.id)
    }
  },
  methods: {
    // 根据id查询唯一的博客
    getBlogInfo(blogId) {
      getBlogInfoById(blogId).then(res => {
        // 把查询结果赋值给blogList、tagList、category，使其显示到编辑界面上
        this.tagList = res.data.tagList
        this.category = res.data.category
        this.blogForm = res.data.blog
        const createTime = this.blogForm.createTime.substring(0, 10)
        this.blogForm.createTime = createTime
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '获取博客信息失败，请重试'
        })
      })
    },
    loadComment(blogId) {
      loadComment(blogId).then(res => {
        this.comments = res.data
      })
    },
    saveComment() {
      if (!this.userInfo.id) {
        this.$message.warning('请登录后操作')
        return
      }
      this.commentForm.blogId = this.blogId
      if (this.commentForm.contentReply) {
        this.commentForm.content = this.commentForm.contentReply
      }
      saveComment(this.commentForm).then(res => {
        this.$message.success('评论成功')
        // 重置评论内容
        this.commentForm = {}
        // 刷新评论列表
        this.loadComment(this.blogId)
        // 关闭评论窗口
        this.dialogFormVisible = false
      }).catch(() => {
        this.$message.error('评论失败')
      })
    },
    deleteComment(id) {
      deleteCommentById(id).then(res => {
        this.$message.success('删除成功')
        this.loadComment(this.blogId)
      }).catch(() => {
        this.$message.error('删除失败')
      })
    },
    handleReply(pid) {
      this.commentForm = { pid: pid }
      this.dialogFormVisible = true
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
