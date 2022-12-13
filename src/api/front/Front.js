import request from '@/utils/request'

export function getBlogList(queryInfo) {
  return request({
    url: '/guest/getBlogList',
    method: 'get',
    params: { ...queryInfo }
  })
}
