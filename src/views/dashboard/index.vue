<template>
  <div class="dashboard-container">
    <div class="dashboard-text">当前登录用户: {{ connection }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      connection: JSON.parse(localStorage.getItem('userInfo')).username
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    test() {
      console.log(this.connection)
    }
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
