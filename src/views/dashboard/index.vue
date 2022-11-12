<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
    <div>
      <el-button @click="testConnection"><label>{{ connection }}</label></el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { testConn } from '@/api/test'

export default {
  name: 'Dashboard',
  data() {
    return {
      connection: 'whtli'
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
