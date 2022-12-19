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
      meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
    }]
  },

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
        meta: { title: 'BlogWrite', icon: 'el-icon-edit' }
      },
      {
        path: 'edit/:id',
        name: 'BlogEdit',
        component: () => import('@/views/blog/BlogWrite'),
        meta: { title: 'BlogEdit', icon: 'el-icon-edit' },
        hidden: true
      },
      {
        path: 'read/:id',
        name: 'BlogRead',
        component: () => import('@/views/blog/BlogRead'),
        meta: { title: 'BlogRead' },
        hidden: true
      },
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

  {
    path: '/data',
    component: Layout,
    alwaysShow: true,
    name: 'Data',
    meta: { title: 'Data Management', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'statistic',
        name: 'Statistic',
        component: () => import('@/views/statistic/Statistic'),
        meta: { title: 'Data Statistics', icon: 'el-icon-s-data' }
      }
    ]
  },

  {
    path: '/log',
    component: Layout,
    alwaysShow: true,
    name: 'Log',
    meta: { title: 'Log Management', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'operationLog',
        name: 'OperationLog',
        component: () => import('@/views/log/OperationLog'),
        meta: { title: 'Operation Log', icon: 'el-icon-s-data' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    name: 'System Management',
    meta: { title: '系统管理', icon: 'nested' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/User'),
        meta: { title: '用户管理', icon: 'el-icon-s-custom' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/Role'),
        meta: { title: '角色管理', icon: 'el-icon-s-custom' }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/Menu'),
        meta: { title: '菜单管理', icon: 'el-icon-s-custom' }
      }
    ]
  },
  {
    path: '/front',
    component: Layout,
    alwaysShow: true,
    name: 'Front',
    meta: { title: '前端', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/front/Index'),
        meta: { title: '首页', icon: 'el-icon-s-data' }
      }
    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Page Management',
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
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
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

export default router
