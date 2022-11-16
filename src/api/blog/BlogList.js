import request from '@/utils/request'

export function getBlogs(queryInfo) {
  return request({
    url: '/blog/getBlogs',
    method: 'get',
    params: { ...queryInfo }
  })
}

export function deleteBlogById(id) {
  return request({
    url: '/blog/deleteBlogById',
    method: 'delete',
    params: { id }
  })
}
