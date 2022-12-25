<template>
  <div style="margin: 20px">
    <el-row :gutter="20" style="margin: 20px">
      <el-col :span="6">
        <el-card style="color: #409EFF">
          <div class="el-icon-s-management"> 博客总数</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ blogCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #F56C6C">
          <div class="el-icon-s-marketing"> TODO1</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">XXX</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #67C23A">
          <div class="el-icon-user-solid"> TOTO2</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">XXX</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #E6A23C">
          <div class="el-icon-s-opportunity"> 评论数</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ totalComment }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 20px">
      <el-col :span="6">
        <el-card style="color: #409EFF">
          <div class="el-icon-s-management"> 总PV</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ totalPageView }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #F56C6C">
          <div class="el-icon-s-marketing"> 日PV</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ todayPageView }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #67C23A">
          <div class="el-icon-user-solid"> 总UV</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ totalUniqueVisitor }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="color: #E6A23C">
          <div class="el-icon-s-opportunity"> 日UV</div>
          <div style="padding: 10px 0; text-align: center; font-weight: bold">{{ todayUniqueVisitor }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 20px">
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
    <el-row :gutter="20" style="margin: 20px" >
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
import { getStatistic } from '@/api/data/Statistic'

export default {
  name: 'Statistic',
  data() {
    return {
      blogCount: 0,
      totalPageView: 0,
      todayPageView: 0,
      totalUniqueVisitor: 0,
      todayUniqueVisitor: 0,
      totalComment: 0,
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
        // 博客总数
        this.blogCount = response.data.data.blogCount
        // 总页面访问量
        this.totalPageView = response.data.data.totalPageView
        // 今日页面访问量
        this.todayPageView = response.data.data.todayPageView
        // 总独立访客数
        this.totalUniqueVisitor = response.data.data.totalUniqueVisitor
        // 今日独立访客数
        this.todayUniqueVisitor = response.data.data.todayUniqueVisitor
        // 总评论数
        this.totalComment = response.data.data.totalComment
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
