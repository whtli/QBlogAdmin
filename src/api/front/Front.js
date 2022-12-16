import request from '@/utils/request'

export function getBlogList(queryInfo) {
  return request({
    url: '/front/getBlogList',
    method: 'get',
    params: { ...queryInfo }
  })
}
