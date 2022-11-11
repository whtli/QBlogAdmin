import request from '@/utils/request'

export function login(param) {
  return request({
    url: '/login',
    method: 'POST',
    data: { ...param }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'get'
  })
}
