<template>
  <div>
    <el-row class="panel-group" :gutter="20">
      <el-col :span="8">
        <el-card>
          <div ref="categoryEcharts" style="height:500px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getStatistic } from '@/api/statistic/Statistic'

export default {
  name: 'Statistic',
  data() {
    return {
      categoryEcharts: null,
      categoryOption: {
        title: {
          text: 'Statistical Data I',
          subtext: 'blog',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          left: 'center',
          top: 'bottom'
        },
        series: [
          {
            name: '数量',
            type: 'pie',
            radius: '50%',
            roseType: 'area',
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    // 进入界面后自动刷新统计数据
    this.refresh()
  },
  methods: {
    refresh() {
      getStatistic().then(response => {
        this.categoryOption.series[0].data = response.data.data.blogCountList
        this.categoryEcharts = echarts.init(this.$refs.categoryEcharts, 'light')
        this.categoryEcharts.setOption(this.categoryOption)
      })
    }
  }
}
</script>

<style scoped>

</style>
