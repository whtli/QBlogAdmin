<template>
  <div>
    <el-row class="panel-group" :gutter="20">
      <el-col :span="12">
        <el-card>
          <div ref="blogCategory" style="height:300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div ref="blogMonthly" style="height: 300px"></div>
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
      blogCategory: null,
      blogCategoryOption: {
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
            data: [],
            // 饼图图形上的文本标签
            label: {
              show: true,
              position: 'inner', // 标签的位置
              fontWeight: 300,
              fontSize: 12, // 文字的字体大小
              color: '#000',
              formatter: '{d}%'
            }
          }
        ]
      },
      blogMonthly: null,
      blogMonthlyOption: {
        title: {
          text: 'Statistical Data II',
          subtext: 'blog',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            type: 'line',
            smooth: true
          },
          {
            data: [],
            type: 'bar',
            smooth: true,
            label: {
              show: true,
              position: 'top',
              valueAnimation: true
            }
          }
        ]
      }
    }
  },
  // 页面元素渲染之后再触发
  mounted() {
    // 进入界面后自动刷新统计数据
    this.refresh()
  },
  methods: {
    refresh() {
      getStatistic().then(response => {
        // 饼图
        this.blogCategoryOption.series[0].data = response.data.data.blogCategoryList
        this.blogCategory = echarts.init(this.$refs.blogCategory)
        this.blogCategory.setOption(this.blogCategoryOption)
        // 圆滑折线图柱图
        this.blogMonthlyOption.series[0].data = response.data.data.blogMonthlyList
        this.blogMonthlyOption.series[1].data = response.data.data.blogMonthlyList
        this.blogMonthly = echarts.init(this.$refs.blogMonthly)
        this.blogMonthly.setOption(this.blogMonthlyOption)
      })
    }
  }
}
</script>

<style scoped>

</style>
