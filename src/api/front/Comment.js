import request from '@/utils/request'

export function loadComment(blogId) {
  return request({
    url: '/front/loadComment',
    method: 'get',
    params: { blogId }
  })
}

export function saveComment(commentForm) {
  return request({
    url: '/front/saveComment',
    method: 'post',
    data: commentForm
  })
}

export function deleteCommentById(id) {
  return request({
    url: '/front/deleteCommentById',
    method: 'delete',
    params: { id }
  })
}

