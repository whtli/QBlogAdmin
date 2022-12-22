<template>
  <div class="dashboard-container">
    <div class="dashboard-text">当前登录用户: {{ name }}</div>
    <div>
      <el-button @click="testConnection"><label>{{ connection }}</label></el-button>
    </div>
    <h3>首页</h3>
    <h3>数据中心</h3>
    <h3>数据产品</h3>
    <h3>大数据分析与人工智能</h3>
    <h3>项目综合</h3>
    <h3>专项新闻</h3>
    <h3>关于我们</h3>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { testConn } from '@/api/test'

export default {
  name: 'Dashboard',
  data() {
    return {
      connection: JSON.parse(localStorage.getItem('userInfo')).username
    }
  },
  methods: {
    testConnection() {
      testConn(this.connection).then(res => {
        // console.log(res.code)
        this.connection = res.data.data.userBar
      })
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
