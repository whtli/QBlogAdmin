import request from '@/utils/request'

export function getComment(blogId) {
  return request({
    url: '/comment/getComment',
    method: 'get',
    params: { blogId }
  })
}

export function saveComment(commentForm) {
  return request({
    url: '/comment/saveComment',
    method: 'post',
    data: commentForm
  })
}

export function deleteCommentById(id) {
  return request({
    url: '/comment/deleteCommentById',
    method: 'delete',
    params: { id }
  })
}

