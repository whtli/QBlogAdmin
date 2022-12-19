import request from '@/utils/request'

export function saveOrUpdate(form) {
  return request({
    url: '/menu/save',
    method: 'POST',
    data: form
  })
}

export function getMenuList(menuName) {
  return request({
    url: '/menu/getMenuList',
    method: 'get',
    params: { menuName }
  })
}

export function getAllMenuIds() {
  return request({
    url: '/menu/getAllMenuIds',
    method: 'get'
  })
}

export function getMenusByRoleId(roleId) {
  return request({
    url: '/menu/getMenusByRoleId',
    method: 'get',
    params: { roleId }
  })
}

export function getIconList() {
  return request({
    url: '/menu/getIconList',
    method: 'get'
  })
}

export function deleteMenuById(id) {
  return request({
    url: '/menu/deleteMenuById',
    method: 'delete',
    params: { id }
  })
}
