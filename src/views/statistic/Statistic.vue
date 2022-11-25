<template>
  <div>
    <el-row class="panel-group" :gutter="20">
      <el-col :span="12">
        <el-card>
          <div ref="blogYear" style="height:300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div ref="blogMonth" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="panel-group" :gutter="20">
      <el-col :span="12">
        <el-card>
          <div ref="blogCategory" style="height:300px;"></div>
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
          subtext: '不同分类下博客数量',
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
      blogYear: null,
      blogYearOption: {
        title: {
          text: 'Statistical Data I',
          subtext: '各年份发表博客数量',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          name: '年',
          type: 'category',
          data: []
        },
        yAxis: {
          name: '数量（篇）',
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
      },
      blogMonth: null,
      blogMonthOption: {
        title: {
          text: 'Statistical Data II',
          subtext: '当年各月份发表博客数量',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          name: '月份',
          type: 'category',
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        yAxis: {
          name: '数量（篇）',
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
        // 不同分类下博客数量，饼图
        this.blogCategoryOption.series[0].data = response.data.data.blogCategoryList
        this.blogCategory = echarts.init(this.$refs.blogCategory)
        this.blogCategory.setOption(this.blogCategoryOption)
        // 各年份发表博客数量，柱状图
        this.blogYearOption.xAxis.data = Object.keys(response.data.data.blogYearCount)
        this.blogYearOption.series[0].data = Object.values(response.data.data.blogYearCount)
        this.blogYearOption.series[1].data = Object.values(response.data.data.blogYearCount)
        this.blogYear = echarts.init(this.$refs.blogYear)
        this.blogYear.setOption(this.blogYearOption)
        // 当年各月份发表博客数量，圆滑折线柱状图
        this.blogMonthOption.series[0].data = response.data.data.blogMonthList
        this.blogMonthOption.series[1].data = response.data.data.blogMonthList
        this.blogMonth = echarts.init(this.$refs.blogMonth)
        this.blogMonth.setOption(this.blogMonthOption)
      })
    }
  }
}
</script>

<style scoped>

</style>
