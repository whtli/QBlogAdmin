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

permission.js   - >  router.beforeEach

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

Login.vue

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

request.js

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

Navbar.vue  ，退出时提示鉴权失败（后端有问题） ==> 没打开本地的redis服务。。。裂开

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

## 5. 添加markdown编辑器
### 使用[mavon-editor](github.com/hinesboy/mavonEditor)
+ 下载
  ```javascript
  npm install mavon-editor --save
  ```
+ 引入

  [main.js](./src/main.js)
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