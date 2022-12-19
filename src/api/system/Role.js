import request from '@/utils/request'

export function getRoleList(params) {
  return request({
    url: '/role/getRoleList',
    method: 'get',
    params: { ...params }
  })
}

export function saveOrUpdate(form) {
  return request({
    url: '/role/saveOrUpdate',
    method: 'POST',
    data: form
  })
}

export function deleteRoleById(id) {
  return request({
    url: '/role/deleteRoleById',
    method: 'delete',
    params: { id }
  })
}

export function updateRoleMenu(params) {
  return request({
    url: '/role/updateRoleMenu',
    method: 'POST',
    data: params
  })
}
