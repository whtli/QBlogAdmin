import request from '@/utils/request'

export function getBlogList(queryInfo) {
  return request({
    url: '/blog/getBlogList',
    method: 'post',
    data: queryInfo
  })
}

export function deleteBlogById(id) {
  return request({
    url: '/blog/deleteBlogById',
    method: 'delete',
    params: { id }
  })
}

export function deleteBlogBatchByIds(ids) {
  return request({
    url: '/blog/deleteBlogBatchByIds',
    method: 'delete',
    params: { ids }
  })
}

export function uploadBlog(blogFiles) {
  return request({
    url: '/blog/uploadBlog',
    method: 'post',
    header: { 'Content-Type': 'multipart/form-data' },
    data: blogFiles
  })
}

export function changeBlogStatusById(blogId) {
  return request({
    url: '/blog/changeBlogStatusById',
    method: 'post',
    params: { blogId }
  })
}
