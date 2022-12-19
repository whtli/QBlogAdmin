import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/getInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function getUserList(params) {
  return request({
    url: '/getUserList',
    method: 'get',
    params: { ...params }
  })
}

export function saveOrUpdate(form) {
  return request({
    url: '/saveOrUpdate',
    method: 'POST',
    data: form
  })
}

export function deleteUserById(id) {
  return request({
    url: '/deleteUserById',
    method: 'delete',
    params: { id }
  })
}
