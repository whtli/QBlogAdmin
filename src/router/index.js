import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
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
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }]
  },

  /*  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: '界面管理',
      icon: 'el-icon-menu'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        name: 'Menu2',
        meta: { title: 'menu2' }
      }
    ]
  },*/

  {
    path: '/external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/whtli',
        meta: { title: '外链', icon: 'link' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
// TODO: 先单独使用动态路由接受权限列表，再将静态路由和动态路由拼装起来
// export const asyncRoutes = []

// 注意：刷新页面会导致页面路由重置
export function setRouterMenus() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  if (userInfo) {
    const menus = userInfo.menuList
    if (menus) {
      // 获取当前的路由对象名称数组
      const currentRouteNames = router.getRoutes().map(v => v.name)
      menus.forEach(item => {
        // 避免重复
        if (!currentRouteNames.includes(item.name)) {
          console.log('Add dynamic routers')
          // 拼装动态路由，外层是一级菜单，内层children是二级菜单
          const firstLevel = {
            path: item.path,
            component: Layout,
            name: item.name,
            alwaysShow: item.alwaysShow,
            hidden: item.hidden,
            meta: {
              title: item.title,
              icon: item.icon
            },
            children: []
          }
          // 处理二级菜单
          if (item.children) {
            item.children.forEach(subItem => {
              const secondLevel = {
                path: subItem.path.replace('/', ''),
                // component: () => import('@/views' + item.path + '/' + subItem.component),
                component: resolve => require([`@/views${item.path}/${subItem.component}`], resolve),
                name: subItem.name,
                hidden: subItem.hidden,
                meta: {
                  title: subItem.title,
                  icon: item.icon
                }
              }
              firstLevel.children.push(secondLevel)
            })
          }
          // 动态添加到现在的路由对象中去
          constantRoutes.push(firstLevel)
        }
      })
    }
  }
}

export default router
