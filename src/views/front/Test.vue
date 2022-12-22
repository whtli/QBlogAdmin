<template>
  <div>
    <div style="margin: 1%">
      <el-input v-model="queryInfo.title" placeholder="请输入标题" clearable style="width: 200px" suffix-icon="el-icon-document-remove" />
      <el-input v-model="queryInfo.categoryId" placeholder="请输入分类id" :clearable="true" style="width: 200px" suffix-icon="el-icon-document" />
      <el-button style="margin-left: 5px" type="primary" @click.native.prevent="getBlogList">查询</el-button>
    </div>

    <div>
      <div class="ui padded attached segment m-padded-tb-large m-margin-bottom-big m-box" v-for="item in blogList" :key="item.id">
        <div class="ui large red right corner label" v-if="item.top">
          <i class="arrow alternate circle up icon"></i>
        </div>
        <div class="ui middle aligned mobile reversed stackable">
          <div class="ui grid m-margin-lr">
            <!--标题-->
            <div class="row m-padded-tb-small">
              <h2 class="ui header m-center m-scaleup">
                <a href="javascript:;" @click.prevent="readBlog(item)" class="m-black">{{ item.title }}</a>
              </h2>
            </div>
            <!--文章简要信息-->
            <div class="row m-padded-tb-small">
              <div class="ui horizontal link list m-center">
                <div class="item m-datetime">
                  <i class="small calendar icon"></i><span>{{ item.createTime }}</span>
                </div>
                <div class="item m-views">
                  <i class="small eye icon"></i><span>{{ item.views }}</span>
                </div>
                <div class="item m-common-black">
                  <i class="small pencil alternate icon"></i><span>字数≈{{ item.words }}字</span>
                </div>
                <div class="item m-common-black">
                  <i class="small clock icon"></i><span>阅读时长≈{{ item.readTime }}分</span>
                </div>
              </div>
            </div>
            <!--分类-->
            <!--<router-link :to="`/category/${item.category.name}`" class="ui orange large ribbon label">
              <i class="small folder open icon"></i><span class="m-text-500">{{ item.category.name }}</span>
            </router-link>-->
            <!--文章Markdown描述-->
            <div class="typo m-padded-tb-small line-numbers match-braces rainbow-braces" v-html="item.description"></div>
            <!--阅读全文按钮-->
            <div class="row m-padded-tb-small m-margin-top">
              <a href="javascript:;" @click.prevent="readBlog(item)" class="color-btn">阅读全文</a>
            </div>
            <!--横线-->
            <div class="ui section divider m-margin-lr-no"></div>
            <!--标签-->
            <!--<div class="row m-padded-tb-no">
              <div class="column m-padding-left-no">
                <router-link :to="`/tag/${tag.name}`" class="ui tag label m-text-500 m-margin-small" :class="tag.color" v-for="(tag,index) in item.tags" :key="index">{{ tag.name }}</router-link>
              </div>
            </div>-->
          </div>
        </div>
      </div>
    </div>

    <div>
      <el-pagination
        background
        :current-page="pageNum"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="handleCurrentChange"
      />
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
  mounted() {
    this.getBlogList()
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
  }
}
</script>

<style scoped>
  .m-padded-tb-large {
    padding-top: 2em !important;
    padding-bottom: 2em !important;
  }
  .m-margin-bottom-big {
    margin-bottom: 3em !important;
  }
  .m-box {
    transition: all 0.25s ease 0s, opacity 0.6s cubic-bezier(0.5, 0, 0, 1) 0s !important;
  }
  .m-margin-lr {
    margin-left: 0.5em !important;
    margin-right: 0.5em !important;
  }
  .m-padded-tb-small {
    padding-top: 0.5em !important;
    padding-bottom: 0.5em !important;
  }
  .m-center {
    margin: auto !important;
  }
  .m-scaleup {
    transition: .3s ease !important;
  }

  .m-scaleup:hover {
    transform: scale(1.1) !important;
  }
  .m-black {
    color: #333 !important;
  }
  .m-padded-tb-small {
    padding-top: 0.5em !important;
    padding-bottom: 0.5em !important;
  }
  .m-center {
    margin: auto !important;
  }
  .m-datetime {
    color: #00a7e0 !important;
  }
  .m-views {
    color: #ff3f1f !important;
  }
  .m-common-black {
    color: #000 !important;
  }
  .m-common-black {
    color: #000 !important;
  }

  .m-padded-tb-small {
    padding-top: 0.5em !important;
    padding-bottom: 0.5em !important;
  }
  .m-margin-top {
    margin-top: 1em !important;
  }
  .m-margin-lr-no {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .m-padded-tb-no {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .m-padding-left-no {
    padding-left: 0 !important;
  }
  .m-text-500 {
    font-weight: 500 !important;
  }
  .m-margin-small {
    margin: 3px 10px !important;
  }
</style>
