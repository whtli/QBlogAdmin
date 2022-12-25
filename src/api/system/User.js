import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/getInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getUserList(params) {
  return request({
    url: '/user/getUserList',
    method: 'get',
    params: { ...params }
  })
}

export function saveOrUpdate(form) {
  return request({
    url: '/user/saveOrUpdate',
    method: 'POST',
    data: form
  })
}

export function deleteUserById(id) {
  return request({
    url: '/user/deleteUserById',
    method: 'delete',
    params: { id }
  })
}
