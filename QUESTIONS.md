## 1. 跳过登录和退出验证

+ 修改login界面中的登录跳转

  ![登录跳转1](https://s2.loli.net/2022/11/09/HFiXOcQuIjKsTL5.png)
  ```vue
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$router.push({ path: '/dashboard' })
          // this.$store.dispatch('user/login', this.loginForm).then(() => {
          //   this.$router.push({ path: this.redirect || '/' })
          //   this.loading = false
          // }).catch(() => {
          //   this.loading = false
          // })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  ```
+ 修改logout的退出跳转

  ![退出跳转1](https://s2.loli.net/2022/11/09/jd8MG2nZ653pmvS.png)

+ 在permission.js中取消登录检验，并添加[next()](https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/permission.html#%E9%80%BB%E8%BE%91%E4%BF%AE%E6%94%B9)

  ![取消登录检验](https://s2.loli.net/2022/11/09/Ptur2RnospU8wil.png)

+ 取消request.js中的token检查（后续再用回来）

  ![image-20221109151012947](https://s2.loli.net/2022/11/09/o8WnkdFHyxLTK3z.png)

## 2. 完成跨域

+ 使用axios，修改vue.config.js中的devServer项，添加proxy代理，并注释掉前端mock。
+ ![image-20221109151343981](https://s2.loli.net/2022/11/09/lSZk5xyQN4j87Ug.png)

## 3. 完成登录权限打通

### 3.1 前端

[permission.js](./src/permission.js)   - >  router.beforeEach
```js
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // const hasToken = getToken()   // 注释掉
  const hasToken = localStorage.getItem('token')
  console.log('------------ hasToken: ' + hasToken)  // 新增
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        // 以下注释掉
        /*        try {
          // get user info
          await store.dispatch('user/getInfo')  // 也可以只注释这一行（主要是它会引起报错提示，则整个代码块不需要被整体注释，且不需要添加块末的两行新增）
          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }*/
        next()            // 新增
        NProgress.done()  // 新增
      }
    }
  } else {
    /!* has no token*!/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})
```

  [Login.vue](./src/views/login/Login.vue)
  ```js
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            // 主要是修改提交逻辑
            login(this.loginForm).then(res => {
              // console.log(res)
              const token = res.headers['authorization'] 			// 登录后获取token
              // console.log('token : ' + token)
              const userInfo = res.data.data
              // console.log('userInfo : ')
              // console.log(userInfo)
              // 把数据共享出去
              this.$store.commit('SET_TOKEN', token)	    		// 设置token
              this.$store.commit('SET_USERINFO', userInfo) 		// 设置userInfo
              // console.log(this.$store.getters.getUser)
              this.loading = false								// 停止登录加载转圈
              this.$router.push({ path: this.redirect || '/' })	// 登录成功后跳转到dashboard
            }).catch(() => {
              this.loading = false
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
  ```

  [request.js](./src/utils/request.js)
  ```js
  // request interceptor
  service.interceptors.request.use(
    config => {
      // do something before request is sent
      /* 模板写法，注释掉，后续可能考虑用回模板的getters.state   
      if (store.getters.token) {
        // let each request carry token
        // ['X-Token'] is a custom headers key
        // please modify it according to the actual situation
        config.headers['X-Token'] = getToken()
      }*/
      if (store.state.token) {	// 现在的token是存储在state.token和localStorage['token']中
        config.headers['Authorization'] = localStorage.getItem('token') // 让每个请求携带自定义token
        console.log(config)
      }
      return config
    },
    error => {
      // do something with request error
      console.log(error) // for debug
      return Promise.reject(error)
    }
  )
  ```



```js
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return response  // 此处将模板的res修改为了response，是为了在登录时获取token等信息并共享
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
```

store/index.js

```js
const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
  },
  // 以下为新增
  state: {
    token: '',
    userInfo: JSON.parse(sessionStorage.getItem('userInfo'))
  },
  mutations: {
    SET_TOKEN: (state, token) => {			// 对应Login.vue文件中登录成功之后的共享操作
      state.token = token					// 更新state的token值
      localStorage.setItem('token', token)  // 把token放到localStorage中
    },
    SET_USERINFO: (state, userInfo) => {	// 对应Login.vue文件中登录成功之后的共享操作
      state.userInfo = userInfo				// 更新state的userInfo值
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo)) // 把userInfo放到sessionStorage中
    },
    REMOVE_INFO: (state) => {				// 对应Navbar.vue文件中`Logout`之后的清除状态操作，之所以先退出登录再清除状态，是因为退出登录需要使用token做权限验证
      state.token = ''						// 将token置空
      state.userInfo = {}					// 将用户信息置空
      localStorage.setItem('token', '')		// 将localStorage中的token置空
      sessionStorage.setItem('userInfo', JSON.stringify('')) // 把sessionStorage中的userInfo置空
    }
  },
  actions: {
  },
  getters
})
```

store/getters.js

```js
  getUser: state => state.userInfo // 新增
```

Navbar.vue，退出时提示鉴权失败（后端有问题） ==> 没打开本地的redis服务。。。裂开

```js
    async logout() {
      logout().then(res => {
        console.log('logout succ')
        this.$store.commit('REMOVE_INFO')
        this.$router.push('/login')
      }).catch(error => {
        console.log(error)
      })
    }
```

## 4. 添加TagsView
+ [参考博客1](https://www.cnblogs.com/choii/p/15973265.html)

+ [参考博客2](https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/tags-view.html#visitedviews-cachedviews)

## 5. 添加markdown编辑器，完成新增博客功能
### 使用[mavon-editor](github.com/hinesboy/mavonEditor)
+ 下载
  ```javascript
  npm install mavon-editor --save
  ```

+ 在[main.js](./src/main.js)中引入
  ```javascript
  // 全局注册
  import mavonEditor from 'mavon-editor'
  import 'mavon-editor/dist/css/index.css'
  // use
  Vue.use(mavonEditor)
  ```
  
+ 完成新增博客功能
  [BlogWrite.vue](./src/views/blog/BlogWrite.vue)
  ```javascript
    <div id="main">
      <el-form ref="blogForm" :model="blogForm" :rules="rules" style="margin-left: 30px; margin-right: 30px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="blogForm.title" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="blogForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <br>
          <mavon-editor ref="md" v-model="blogForm.content" :html="false" @imgAdd="imgAdd" @imgDel="imgDel" @save="contentSave" />
        </el-form-item>
        <el-form-item label="字数" prop="words">
          <el-input v-model="blogForm.words" />
        </el-form-item>
        <el-form-item label="浏览次数" prop="words">
          <el-input v-model="blogForm.views" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="blogSubmit">
            发布
          </el-button>
          <el-button @click="blogReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  ```
  
  ```javascript
  data() {
    return {
      blogForm: {
        id: '',
        title: '',
        firstPicture: '',
        description: '',
        content: '',
        isPublished: false,
        isCommentEnabled: false,
        views: 0,
        words: null,
        readTime: null,
        categoryId: null,
        isTop: false,
        password: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 3, max: 100, message: '长度在3到100个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入摘要', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入正文', trigger: 'blur' }
        ]
      }
    }
  ```
  
  ```javascript
    // 保存博客内容
    contentSave(value, render) {
      console.log('this is render' + render)
      console.log('this is value' + value)
      console.log(this.$refs.md.d_render)
    }
  ```
  
  ```javascript
    // 提交（发布/更新）博客
    blogSubmit() {
      this.$refs.blogForm.validate((valid) => {
        if (valid) {
          submitBlog(this.blogForm).then(res => {
            console.log(res)
            this.$alert('发布成功', '提示', {
              confirmButtonText: '确定',
              callback: action => {
                this.$router.push('/blog/list')
                console.log(action)
              }
            })
          })
        } else {
          console.log('error submit!')
          return false
        }
      })
    }
  ```
  
+ 完成图像的上传与删除功能
  [BlogWrite.vue](./src/views/blog/BlogWrite.vue)
  ```vue
  <template>
    <mavon-editor ref=md @imgAdd="imgAdd" @imgDel="imgDel"></mavon-editor>
  </template>
  ```
  
  ```javascript
    // 上传图像，绑定@imgAdd event
    imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData()
      formdata.append('image', $file)
      console.log($file)
      addImage(formdata).then(res => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        if (res.status === 200) {
          const url = res.data.data.imageUrl
          this.$refs.md.$img2Url(pos, url)
        } else {
          this.$message({ type: res.status, message: 'Image upload failed!' })
        }
        // $vm 指为mavonEditor实例，可以通过如下两种方式获取
        // 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
        // 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
        // vm.$img2Url(pos, url)
      })
    }
  ```

  [BlogWrite.js](./src/api/blog/BlogWrite.js)
  ```javascript
    // 删除图像
    imgDel(pos) {
      const url = pos[0]
      deleteImg(url).then(response => {
        this.$alert('图片删除成功：' + response.data.data, '提示', {
          confirmButtonText: '确定'
        })
      }).catch(error => {
        this.$message({
          message: error,
          type: 'error',
          showClose: true,
          center: true }
        )
      })
    }
  ```

## 6. 完成博客的删、改、查(多参数查询、分页查询)功能
+ 在[BlogList.vue](./src/views/blog/BlogList.vue)界面中添加编辑、删除按钮，添加查询输入框和按钮，添加分页监听响应
  ```vue
  <template>
    <div>
      <div style="padding: 10px 0">
        <el-input placeholder="请输入标题" v-model="queryInfo.title" :clearable="true" style="width: 200px" suffix-icon="el-icon-document-remove"></el-input>
        <el-input placeholder="请输入描述" v-model="queryInfo.categoryId" :clearable="true" style="width: 200px" suffix-icon="el-icon-document"></el-input>
        <el-button @click.native.prevent="getBlogList" style="margin-left: 5px" type="primary">查询</el-button>
      </div>
      <div style="margin: 10px 0">
        <el-button type="primary"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
        <el-button type="danger"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
        <el-button type="primary"><i class="el-icon-bottom"></i> 导入</el-button>
        <el-button type="primary"><i class="el-icon-top"></i> 导出</el-button>
      </div>
      <el-table :data="blogList" border :stripe="true" :height="500" :header-cell-class-name="tableHeaderColor">
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" @click="readBlog(scope.row.id)"><i class="el-icon-view"> </i> 查看</el-button>
            <el-button type="success" @click="updateBlog(scope.row.id)"><i class="el-icon-edit"> </i> 编辑</el-button>
            <el-button type="danger" @click="deleteBlog(scope.row.id)"><i class="el-icon-remove"></i> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!--分页-->
      <div style="padding: 10px 0">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pageNum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </template>
  ```

+ 在[BlogList.vue](./src/views/blog/BlogList.vue)的methods中增加对应的功能函数
  ```javascript
  <script>
  import { getBlogs, deleteBlogById } from '@/api/blog/BlogList'
  
  export default {
    name: 'BlogList',
    data() {
      return {
        queryInfo: {
          title: '',
          categoryId: null,
          pageNum: 1,
          pageSize: 10
        },
        total: 0,
        blogList: [],
        tableHeaderColor: 'tableHeaderColor'
      }
    },
    watch: {
      $route: {
        // 监听路由变化，由其他界面跳转而来时，刷新博客列表
        handler(val, oldval) {
          // 新路由信息
          console.log(val)
          // 老路由信息
          console.log(oldval)
          this.getBlogList()
        },
        // 深度观察监听
        deep: true
      }
    },
    methods: {
      handleSizeChange(val) {
        // 每页显示的条数
        this.queryInfo.pageSize = val
        this.getBlogList()
        console.log(`每页 ${val} 条`)
      },
      handleCurrentChange(val) {
        // 显示第几页
        this.queryInfo.pageNum = val
        this.getBlogList()
        console.log(`当前页: ${val}`)
      },
      // 查询博客列表
      getBlogList() {
        getBlogs(this.queryInfo).then(res => {
          this.blogList = res.data.data.pageData.records
          this.total = res.data.data.total
        })
      },
      // 更新指定id的博客
      updateBlog(id) {
        this.$alert('即将进入博客编辑界面', '提示', {
          confirmButtonText: '确定',
          callback: action => {
            this.$router.push(`/blog/edit/${id}`)
            console.log(action)
          }
        })
      },
      // 根据id删除博客
      deleteBlog(id) {
        this.$confirm('此操作将永久删除该博客，是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {
          deleteBlogById(id).then(response => {
            this.$message.success(response.data.message)
            console.log(response.data.data.message)
            this.getBlogList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除操作'
          })
        })
      }
    },
    // 页面初始化之后默认查询所有博客并展示
    mounted() {
      this.getBlogList()
    }
  }
  </script>
  ```

+ 在[BlogList.js](./src/api/blog/BlogList.js)中增加对应的接口
  ```javascript
  import request from '@/utils/request'
  // 查询博客列表
  export function getBlogs(queryInfo) {
    return request({
      url: '/blog/getBlogs',
      method: 'get',
      params: { ...queryInfo }
    })
  }
  // 根据id删除博客
  export function deleteBlogById(id) {
    return request({
      url: '/blog/deleteBlogById',
      method: 'delete',
      params: { id }
    })
  }
  ```

+ 在[BlogWrite.vue](./src/views/blog/BlogWrite.vue)界面中增加相应的功能函数
  ```javascript
  <script>
  import { addImage, deleteImg, submitBlog, getBlogById } from '@/api/blog/BlogWrite'
  
  export default {
    created() {
      // 当界面被创建时，监听是否有路由参数
      // 若有说明是修改指定博客，此时需要先查询并显示
      // 若无说明是新增博客
      if (this.$route.params.id) {
        this.getBlog(this.$route.params.id)
      }
    },
    methods: {
      // 根据id查询唯一的博客
      getBlog(id) {
        getBlogById(id).then(res => {
          // 把查询结果赋值给this.blogList，使其显示到编辑界面上
          this.blogForm = res.data.data
        }).catch(() => {
          this.$message({
            type: 'warning',
            message: '获取文博客失败，请重试'
          })
        })
      }
    }
  }
  </script>
  ```
  
+ 在[BlogWrite.js](./src/api/blog/BlogWrite.js)中增加对应的接口
  ```javascript
  // 根据id查询唯一的博客
  export function getBlogById(id) {
    return request({
      url: '/blog/getBlogById',
      method: 'GET',
      params: { id }
    })
  }
  ```

## 7. 添加echarts
### 7.1 以饼状图为例的简单图表
+ 新建vue组件并将其添加到路由文件[index.js](./src/router/index.js)中
  ```javascript
  export const constantRoutes = [
    {
      path: '/login',
      component: () => import('@/views/login/Login'),
      hidden: true
    },
  
    {
      path: '/404',
      component: () => import('@/views/404'),
      hidden: true
    },
  
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [{
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }]
    },
  
    // 新增的统计数据界面路由
    {
      path: '/statistic',
      component: Layout,
      children: [
        {
          path: 'data',
          name: 'Statistic',
          component: () => import('@/views/statistic/Statistic'),
          meta: { title: 'Data Statistics', icon: 'el-icon-s-data' }
        }
      ]
    },
    
    // 404 page must be placed at the end !!!
    { path: '*', redirect: '/404', hidden: true }
  ]
  ```

+ 在[Statistic.vue](./src/views/statistic/Statistic.vue)中添加饼图
  ```vue
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
  ```

+ 在[Statistic.js](./src/api/statistic/Statistic.js)中定义接口函数，接收从后端传来的数据
  ```javascript
  import request from '@/utils/request'
  
  export function getStatistic() {
    return request({
      url: '/statistic/getStatistic',
      method: 'GET'
    })
  }
  ```

### 7.2 添加地图
+ TODO

### 7.3 以下是遇到的错误

1. Cannot read properties of undefined (reading 'init')
2. [ECharts] Unkown series undefined
        
    这两个是echart的版本问题导致的引入方式不对，只需要修改在组件中的引入方式即可，如[Statistic.vue](./src/views/statistic/Statistic.vue)
      ```javascript
      <script>
        import * as echarts from 'echarts'
        // 5以下的版本使用 import echarts from 'echarts' 因此产生报错
        export default {
          name: 'Statistic'
        }
      </script>
      ```
3. series not exists. Legend data should be same with series name or data name.

    避坑：echarts的饼图，一定使用跟官网示例中使用的属性名，如饼图中series的data属性需要用的是的name和value，后端传过来的也一定是有name和value的VO才能正确地将图绘制出来

## 8. 完成批量删除和列表界面和博客列表界面的功能键
### 8.1 批量删除
+ 关键在于表格绑定的 @selection-change="handleSelectionChange" 事件，这个事件可以拿到选框选中的值。
+ 然后在通过 map() 方法循环遍历拿到对应的id值，将拿到的id值赋值给后台需要的ids参数，最后将其传递给后台即可。

+ 在[BlogList.vue](./src/views/blog/BlogList.vue)组件中添加表格复选框、选中的值对应的数据和功能函数
  ```vue
      <div style="margin: 10px 0; margin-left: 1%">
        <el-button type="danger" @click="deleteBlogBatch"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
      </div>
      <div style="margin: 10px 0; margin-left: 1%">
        // 为了实现复选信息的获取，需要在el-table中绑定selection-change，当选择项发生变化时会触发该事件
        <el-table :data="blogList" border :stripe="true" :height="660" @selection-change="handleSelectionChange">
          // 安装element官网提示，实现多选只需要手动添加一个el-table-column，设type属性为selection即可
          <el-table-column type="selection" width="55"> </el-table-column>
        </el-table>
      </div>
  ```
  ```javascript
  <script>
  // 引入批量删除的接口deleteBlogBatchByIds
  import { getBlogs, deleteBlogById, deleteBlogBatchByIds } from '@/api/blog/BlogList'
  
  export default {
    name: 'BlogList',
    data() {
      return {
        blogList: [], // 表格数据
        selected: [], // 复选框选中的值列表
      }
    },
    methods: {
      // 获取选中的值
      handleSelectionChange(selected) {
        this.selected = selected
        console.log('选中的值', selected.map((item) => item.id))
      },
      // 根据id批量删除博客
      deleteBlogBatch() {
        const ids = this.selected.map(item => item.id).join()
        /* 根据后台想要的参数格式选择
        console.log(ids.join(",")); // string:1,2,3,4
        console.log(ids); // object:[1,2,3,4]
        */
        this.$confirm('此操作将永久删除所选的博客，是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {
          deleteBlogBatchByIds(ids).then(response => {
            this.$message.success(response.data.message + '，ID为： ' + ids)
            this.getBlogList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消批量删除操作'
          })
        })
      },
      // 查询博客列表
      getBlogList() {
        getBlogs(this.queryInfo).then(res => {
        this.blogList = res.data.data.pageData.records
        this.total = res.data.data.total
        })
      }
    }
  }
  </script>
  ```

+ 在[BlogList.js](./src/api/blog/BlogList.js)中定义批量删除的接口
  ```javascript
  export function deleteBlogBatchByIds(ids) {
    return request({
      url: '/blog/deleteBlogBatchByIds',
      method: 'delete',
      params: { ids }
    })
  }
  ```
  
### 8.2 ”新增博客“的功能键
+ 两种办法可以跳转，但是最终选择第二种，因为第一种在博客列表界面发生其他路由跳转（如编辑）之后，再回来经常失效，需要刷新界面才能重新起作用，见[BlogList.vue](./src/views/blog/BlogList.vue)
  - （1）在按钮中添加不带参数的跳转路由即可，
    ```vue
        <div style="margin: 10px 0; margin-left: 1%">
          <el-button type="primary"><i class="el-icon-circle-plus-outline"></i> <router-link :to="{ name: 'BlogWrite'}">新增</router-link></el-button>
        </div>
    ```
  - （2）在button上点击事件，然后从事件中跳转
  ```vue
    <div style="margin: 10px 0; margin-left: 1%">
      <el-button type="primary" @click="toBlogWritePage"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
    </div>
  ```
  ```javascript
    // 新增博客，跳转到写博客界面
    toBlogWritePage() {
      this.$router.push(`/blog/write`)
    }
  ```
  
### 8.3 ”阅读博客“的功能键
+ 在按钮上添加点击事件，并把被选择的博客id作为参数传递下去，见[BlogList.vue](./src/views/blog/BlogList.vue)
  ```vue
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" @click="readBlog(scope.row.id)"><i class="el-icon-view"> </i> 查看</el-button>
            </template>
          </el-table-column>
  ```
+ 新增一个命名[BlogRead.vue](./src/views/blog/BlogRead.vue)的组件
  - 精简其界面内容，只做展示，充分利用mavon-editor的参数
  - 参数使用，参考自[mavon-editor官方的参数解释](https://github.com/hinesboy/mavonEditor#props)：
    - :subfield="false" : true： 双栏(编辑预览同屏)， false： 单栏(编辑预览分屏)
    - :defaultOpen="'preview'" : 在单栏（subfield=false）时默认展示区域. edit： 默认展示编辑区域，preview： 默认展示预览区域，其他 = edit
    - :editable="false" : 是否允许编辑. true：允许，false：不允许
    - :code-style="'a11y-dark'" : markdown样式： 默认github, 可选[配色方案](https://github.com/hinesboy/mavonEditor/blob/master/src/lib/core/hljs/lang.hljs.css.js)
    - :toolbarsFlag="false" : 工具栏是否显示. true：显示，false：不显示
  - 详细内容见[BlogRead.vue](./src/views/blog/BlogRead.vue)
  ```vue
  <template>
    <div>
      <div id="main" style="margin-left: 10%; margin-right: 10%">
        <el-form ref="blogForm" :model="blogForm" >
          <el-form-item label="标题" prop="title">
            <el-input v-model="blogForm.title" readonly/>
          </el-form-item>
          <el-form-item>
            <el-col :span="11" style="margin-right: 10px">
              <el-form-item label="字数">
                <el-input readonly v-model="blogForm.words" style="width: 100%;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="阅读量" >
                <el-input readonly v-model="blogForm.views" style="width: 100%;"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="blogForm.description" type="textarea" readonly/>
          </el-form-item>
          <el-form-item label="正文" prop="content">
            <br>
            <mavon-editor ref="md" v-model="blogForm.content" :subfield="false" :defaultOpen="'preview'" :editable="false" :code-style="'a11y-dark'" :toolbarsFlag="false" />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </template>
  ```
  ```javascript
  
  <script>
  import { getBlogById } from '@/api/blog/BlogWrite'
  
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
          published: true,
          commentEnabled: false,
          views: 0,
          words: null,
          readTime: null,
          categoryId: null,
          top: false,
          password: ''
        }
      }
    },
    created() {
      // 当界面被创建时，监听是否有路由参数
      // 若有说明是修改指定博客，此时需要先查询并显示
      // 若无说明是新增博客
      if (this.$route.params.id) {
        this.getBlog(this.$route.params.id)
      }
    },
    methods: {
      // 根据id查询唯一的博客
      getBlog(id) {
        getBlogById(id).then(res => {
          // 把查询结果赋值给this.blogList，使其显示到编辑界面上
          this.blogForm = res.data.data
        }).catch(() => {
          this.$message({
            type: 'warning',
            message: '获取文博客失败，请重试'
          })
        })
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>
  
  ```

+ 在[router/index](./src/router/index.js)文件中为新界面添加路由
```javascript
  {
    path: '/blog',
    component: Layout,
    redirect: '/blog/list',
    name: 'Blog',
    meta: { title: 'Blog Management', icon: 'nested' },
    children: [
      {
        path: 'list',
        name: 'BlogList',
        component: () => import('@/views/blog/BlogList'),
        meta: { title: 'BlogList', icon: 'table' }
      },
      {
        path: 'write',
        name: 'BlogWrite',
        component: () => import('@/views/blog/BlogWrite'),
        meta: { title: 'BlogWrite', icon: 'tree' }
      },
      {
        path: 'edit/:id',
        name: 'BlogEdit',
        component: () => import('@/views/blog/BlogWrite'),
        meta: { title: 'BlogEdit', icon: 'el-icon-edit' },
        hidden: true
      },
      // 新节目的路由
      {
        path: 'read/:id',
        name: 'BlogRead',
        component: () => import('@/views/blog/BlogRead'),
        meta: { title: 'BlogRead' },
        hidden: true
      }
    ]
  },
```
+ 在[BlogList.vue](./src/views/blog/BlogList.vue)中的响应函数中做出跳转
  ```javascript
    // 阅读指定id的文章
    readBlog(id) {
      this.$router.push(`/blog/read/${id}`)
    }
  ```

## 9. 调整布局，新增图表
### 9.1 调整`博客列表`、`博客阅读`界面布局
+ [BlogList](src/views/blog/BlogList.vue)
  ```vue
      <div style="margin: 10px 0; margin-left: 1%">
        <el-table :data="blogList" border :stripe="true" :height="660" :header-cell-class-name="tableHeaderColor"  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"> </el-table-column>
          <!--<el-table-column label="序号" prop="id" width="50"> </el-table-column>-->
          <el-table-column label="标题" prop="title" width="100"> </el-table-column>
          <el-table-column label="描述" prop="description" width="200"> </el-table-column>
          <el-table-column label="公开" prop="published" width="60"><template v-slot="scope">
            {{scope.row.published ? "公开":"隐藏"}}
          </template> </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="200"> </el-table-column>
          <el-table-column label="更新时间" prop="updateTime" width="200"> </el-table-column>
          <el-table-column label="浏览量" prop="views" width="60"> </el-table-column>
          <el-table-column label="字数" prop="words" width="50"> </el-table-column>
          <el-table-column label="分类" prop="categoryId" width="100"> </el-table-column>
          <el-table-column label="作者" prop="userId" width="50"> </el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" @click="readBlog(scope.row.id)"><i class="el-icon-view"> </i> 查看</el-button>
              <el-button type="success" @click="updateBlog(scope.row.id)"><i class="el-icon-edit"> </i> 编辑</el-button>
              <el-button type="danger" @click="deleteBlog(scope.row.id)"><i class="el-icon-remove"></i> 删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  ```

+ [BlogRead](src/views/blog/BlogRead.vue)
  ```vue
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
  ```
  
  ```javascript
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
        }
      }
    },
    created() {
      // 当界面被创建时，监听是否有路由参数
      // 若有说明是修改指定博客，此时需要先查询并显示
      // 若无说明是新增博客
      if (this.$route.params.id) {
        this.getBlog(this.$route.params.id)
      }
    },
    methods: {
      // 根据id查询唯一的博客
      getBlog(id) {
        getBlogById(id).then(res => {
          // 把查询结果赋值给this.blogList，使其显示到编辑界面上
          this.blogForm = res.data.data
          const createTime = this.blogForm.createTime.substring(0, 19).replace('T', ' ')
          this.blogForm.createTime = createTime
        }).catch(() => {
          this.$message({
            type: 'warning',
            message: '获取文博客失败，请重试'
          })
        })
      }
    }
  }
  </script>
  ```
  
  ```css
  .m-padded-tb-small {
    padding-top: 0.5em !important;
    padding-bottom: 0.5em !important;
  }
  
  .m-center {
    width: 70%;
    margin: auto !important;
    display: flex;
    justify-content: space-around;
  }
  
  .m-datetime {
    color: #00a7e0 !important;
    size: 16px;
    font-size: 16px;
  }
  
  .m-views {
    color: #ff3f1f !important;
    size: 16px;
    font-size: 16px;
  }
  
  .m-words {
    color: #000 !important;
    size: 16px;
    font-size: 16px;
  }
  
  .m-read-time {
    color: #B35B4B !important;
    size: 16px;
    font-size: 16px;
  }
  ```

### 9.2 调整`博客编辑`界面的输入要求
+ [BlogWrite](src/views/blog/BlogRead.vue)
  ```vue
  <template>
    <div>
      <div id="main">
        <el-form ref="blogForm" :model="blogForm" :rules="rules" style="margin-left: 30px; margin-right: 30px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="blogForm.title"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="blogForm.description" type="textarea"></el-input>
          </el-form-item>
          <el-form-item label="正文" prop="content">
            <br>
            <mavon-editor ref="md" v-model="blogForm.content" @imgAdd="imgAdd" @imgDel="imgDel" @save="contentSave" />
          </el-form-item>
          <!--<el-form-item label="字数" prop="words">
            <el-input v-model="blogForm.words" />
          </el-form-item>
          <el-form-item label="浏览次数" prop="words">
            <el-input v-model="blogForm.views" />
          </el-form-item>-->
          <el-form-item>
            <el-button type="primary" @click="blogSubmit">
              发布
            </el-button>
            <el-button @click="blogReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </template>
  ```
  
  ```javascript
        rules: {
          title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
          ],
          description: [
            { required: true, message: '请输入摘要', trigger: 'blur' },
            { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '请输入正文', trigger: 'blur' }
          ]
        }
  ```

### 9.3 调整`统计数据`界面，新增年份数据
+ [Statistic](src/views/statistic/Statistic.vue)
  ```vue
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
  ```

## 10. 添加导入博客功能
+ [BlogList](src/views/blog/BlogList.vue)
  ```vue
      <div style="margin-left: 10px; width: 36%; display: flex; justify-content: space-between ">
        <div>
          <el-button type="primary" @click="toBlogWritePage"><i class="el-icon-circle-plus-outline"></i> 新增</el-button>
        </div>
        <div>
          <el-button type="danger" @click="deleteBlogBatch"><i class="el-icon-remove-outline"></i> 批量删除</el-button>
        </div>
        <div>
          <el-upload action :http-request="importBlog" :limit="fileLimit" :before-upload="beforeUpload" :on-exceed="handleExceed" :show-file-list="false">
            <el-button type="primary"><i class="el-icon-top"></i> 导入</el-button>
          </el-upload>
        </div>
        <div>
          <el-button type="primary"><i class="el-icon-bottom"></i> 导出</el-button>
        </div>
  
      </div>
  ```
  
  ```javascript
  export default {
    name: 'BlogList',
    data() {
      return {
        queryInfo: {
          title: '',
          categoryId: null,
          pageNum: 1,
          pageSize: 10
        },
        total: 0,
        blogList: [],
        // 复选框选中的值列表
        selected: [],
        tableHeaderColor: 'tableHeaderColor',
        // 允许上传的博客文件类型
        fileType: ['md'],
        // 运行上传文件大小，单位 M
        fileSize: 1,
        // 待导入博客文件数量限制
        fileLimit: 1
      }
    },
    watch: {
      $route: {
        // 监听路由变化，由其他界面跳转而来时，刷新博客列表
        handler(val, oldval) {
          // 新路由信息
          console.log(val)
          // 老路由信息
          console.log(oldval)
          this.getBlogList()
        },
        // 深度观察监听
        deep: true
      }
    },
    methods: {
      // 上传博客之前
      beforeUpload(file) {
        if (file.type !== '' || file.type != null || file.type !== undefined) {
          // 计算文件的大小
          const fileSize = file.size / 1024 / 1024
          // 这里做文件大小限制
          if (fileSize > this.fileSize) {
            this.$message('上传文件大小不能超过 1MB!')
            return false
          }
          // 截取文件的后缀，判断文件类型
          const FileExt = file.name.replace(/.+\./, '').toLowerCase()
          // 如果文件类型不在允许上传的范围内
          if (this.fileType.includes(FileExt)) {
            return true
          } else {
            this.$message.error('博客文件类型应为.md文件!')
            return false
          }
        }
      },
      // 超出文件个数的回调
      handleExceed(files) {
        this.$message.warning(`超出上传数量限制！最多上传 ${this.fileLimit} 个博客文件，选择了 ${files.length} 个博客文件`)
      },
      // 上传文件的事件
      importBlog(item) {
        this.$message('博客上传中······')
        // 上传文件的需要formdata类型
        const FormDatas = new FormData()
        FormDatas.append('file', item.file)
        uploadBlog(FormDatas).then(res => {
          this.$message(res.data.message)
          // 成功过后刷新列表，清空上传文件列表
          this.handleSuccess()
        })
      },
      // 上传成功后的回调
      handleSuccess() {
        this.getBlogList()
      }
    },
  }
  ```

+ [BlogList](src/api/blog/BlogList.js)
  ```javascript
  export function uploadBlog(blogFiles) {
    return request({
      url: '/blog/uploadBlog',
      method: 'post',
      header: { 'Content-Type': 'multipart/form-data' },
      data: blogFiles
    })
  }
  ```

## 11. 添加批量导入博客功能
+ 使用excel文件
+ [BlogList](src/views/blog/BlogList.vue)，复用了单个博客导入的事件importBlog、handleExceed、handleSuccess，单独写了导入之前校验的事件beforeExcelUpload
  ```vue
        <div>
          <el-upload action :http-request="importBlog" :on-exceed="handleExceed" :before-upload="beforeExcelUpload" :show-file-list="false">
            <el-button type="primary"><i class="el-icon-top"></i> 批量（.xlsx）导入</el-button>
          </el-upload>
        </div>
  ```
  ```javascript
      beforeExcelUpload(file) {
        if (file.type !== '' || file.type != null || file.type !== undefined) {
          // 计算文件的大小
          const fileSize = file.size / 1024 / 1024
          // 这里做文件大小限制
          if (fileSize > this.ExcelFileSize) {
            this.$message('上传文件大小不能超过 5MB!')
            return false
          }
          // 截取文件的后缀，判断文件类型
          const suffix = file.name.replace(/.+\./, '').toLowerCase()
          // 如果文件类型不在允许上传的范围内
          if (this.ExcelFileType.includes(suffix)) {
            return true
          } else {
            this.$message.error('博客文件类型应为.excel文件!')
            return false
          }
        }
      },
  ```

## 12. 添加博客分类、标签管理界面与功能
### 12.1 博客分类
+ 新增组件[Category](./src/views/blog/Category.vue)，完成基本的增删改查功能，因为博客分类在实际情况中不会太多，所以不提供条件查询功能

+ 新增对应的请求接口[Category](src/api/blog/Category.js)
  ```javascript
  import request from '@/utils/request'
  
  export function addCategory(form) {
    return request({
      url: '/category/addCategory',
      method: 'POST',
      data: { ...form }
    })
  }
  
  export function deleteCategoryById(id) {
    return request({
      url: '/category/deleteCategoryById',
      method: 'delete',
      params: { id }
    })
  }
  
  export function editCategory(form) {
    return request({
      url: '/category/editCategory',
      method: 'PUT',
      data: {
        ...form
      }
    })
  }
  
  export function getCategories(queryInfo) {
    return request({
      url: '/category/getCategories',
      method: 'get',
      params: { ...queryInfo }
    })
  }
  ```

### 12.2 博客标签
+ 新增组件[Tag](./src/views/blog/Tag.vue)，完成基本的增删改查功能，因为博客分类在实际情况中不会太多，所以不提供条件查询功能

+ 新增对应的请求接口[Tag](src/api/blog/Tag.js)
  ```javascript
  import request from '@/utils/request'
  
  export function addTag(form) {
    return request({
      url: '/tag/addTag',
      method: 'POST',
      data: { ...form }
    })
  }
  
  export function deleteTagById(id) {
    return request({
      url: '/tag/deleteTagById',
      method: 'delete',
      params: { id }
    })
  }
  
  export function editTag(form) {
    return request({
      url: '/tag/editTag',
      method: 'PUT',
      data: {
        ...form
      }
    })
  }
  
  export function getTags(queryInfo) {
    return request({
      url: '/tag/getTags',
      method: 'get',
      params: { ...queryInfo }
    })
  }
  ```

### 给分类和标签组件添加路由
+ 在[index.js](./src/router/index.js)中添加路由Category
  ```javascript
    {
    path: '/blog',
      component: Layout,
      redirect: '/blog/list',
      name: 'Blog',
      meta: { title: 'Blog Management', icon: 'nested' },
    children: [
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/blog/Category'),
        meta: { title: 'Category', icon: 'table' }
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('@/views/blog/Tag'),
        meta: { title: 'Tag', icon: 'table' }
      }
    ]
  },
  ```

## 13. 整合写博客、选择分类、选择标签
+ 在写博客界面[BlogWrite](src/views/blog/BlogWrite.vue)整合分类、标签的选择与创建功能
  ```vue
  <el-form-item>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="分类" prop="categoryList">
          <el-select v-model="blogForm.categoryId" placeholder="请选择分类" clearable :filterable="true" style="width: 100%;">
            <el-option :label="item.categoryName" :value="item.id" v-for="item in categoryList" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="标签" prop="tagList">
          <el-select v-model="selectedTags" placeholder="请选择标签（输入可添加新标签）" clearable :allow-create="true" :filterable="true" :multiple="true" style="width: 100%;">
            <el-option :label="item.tagName" :value="item.id" v-for="item in tagList" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form-item>
  ```
  
  ```javascript
  <script>
  import { addImage, deleteImg, submitBlog, getBlogById, getCategoryAndTag } from '@/api/blog/BlogWrite'
  
  export default {
    name: 'BlogWrite',
    data() {
      return {
        categoryList: [],
        tagList: [],
        selectedTags: [],
        blogForm: {
          id: '',
          title: '',
          firstPicture: '',
          description: '',
          content: '',
          published: true,
          commentEnabled: false,
          views: 0,
          words: null,
          readTime: null,
          categoryId: null,
          top: false,
          password: ''
        },
        rules: {
          title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
          ],
          description: [
            { required: true, message: '请输入摘要', trigger: 'blur' },
            { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '请输入正文', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      // 界面被创建后先把已有的分类和标签获取到，方便写博客的时候选择
      this.getCategoryAndTag()
      // 当界面被创建时，监听是否有路由参数
      // 若有说明是修改指定博客，此时需要先查询并显示
      // 若无说明是新增博客
      if (this.$route.params.id) {
        this.getBlog(this.$route.params.id)
      }
    },
    methods: {
      // 提交（发布/更新）博客
      blogSubmit() {
        this.$refs.blogForm.validate((valid) => {
          if (valid) {
            // 由原来的blogForm改为blog和tags，因为blog与tag是一对多的关系，所以tag不是blog的字段，两者的映射关系由另一个表来维护  
            const form = {
              blog: this.blogForm,
              tags: this.selectedTags
            }
            submitBlog(form).then(res => {
              console.log(res)
              this.$alert('发布成功', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.$router.push('/blog/list')
                  console.log(action)
                }
              })
            })
          } else {
            console.log('error submit!')
            return false
          }
        })
      },
      // 重置所有输入框中的内容
      blogReset() {
        this.$refs.blogForm.resetFields()
        // 选择的标签也要重置
        this.selectedTags = []
      },
      // 获取分类和标签
      getCategoryAndTag() {
        getCategoryAndTag().then(res => {
          this.categoryList = res.data.data.categoryList
          this.tagList = res.data.data.tagList
        })
      }
    }
  }
  </script>
  ```

+ 在[BlogWrite](src/api/blog/BlogWrite.js)中修改请求接口
  ```javascript
  export function submitBlog(form) {
    return request({
      url: '/blog/submitBlog',
      method: 'post',
      data: {
        ...form
      }
    })
  }
  ```

## 14. 在阅读界面中联动展示博客所属的分类及其标签
+ 在BlogRead中添加展示
  ```vue
          <el-form-item>
            <el-col :span="11" style="">
                <el-button ><span> 分类：{{ category.categoryName }}</span></el-button>
            </el-col>
            <el-col :span="11">
              <el-button round v-for="(tag, index) in tagList" :key="index">{{ tag.tagName }}</el-button>
            </el-col>
          </el-form-item>
  ```

+ 修改BlogRead中的事件并新增对应的变量用于绑定到展示位置
  ```javascript
  <script>
  import { getBlogInfoById } from '@/api/blog/BlogWrite'
  
  export default {
    name: 'BlogRead',
    data() {
      return {
        // 新增标签列表和分类接收变量  
        tagList: {},
        category: {}
      }
    },
    created() {
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
  ```

## 15. 添加操作日志记录展示
+ 界面组件[OperationLog](src/views/log/OperationLog.vue)
+ api文件[OperationLog](src/api/log/OperationLog.js)
+ 添加路由[index.js](src/router/index.js)
  ```javascript
    {
      path: '/Log',
      redirect: '/Log/operationLog',
      component: Layout,
      name: 'Log',
      meta: {
        title: 'Log',
        icon: 'el-icon-menu'
      },
      children: [
        {
          path: 'operationLog',
          name: 'OperationLog',
          component: () => import('@/views/log/OperationLog'),
          meta: { title: 'Operation Log', icon: 'el-icon-s-data' }
        }
      ]
    },
  ```
+ 

# 16. 添加访客界面，用于测试后端的redis
+ 界面见[Front.vue](src/views/front/Front.vue)组件
+ 接口见[Front.js](src/api/front/Front.js)文件
+ 在[index](src/router/index.js)中添加路由