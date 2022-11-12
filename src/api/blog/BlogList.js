import request from '@/utils/request'

export function getBlogListAuto() {
  return request({
    url: '/blog/list',
    method: 'get'
  })
}
