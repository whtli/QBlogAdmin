import request from '@/utils/request'

export function addTag(form) {
  return request({
    url: '/tag/addTag',
    method: 'POST',
    data: { ...form }
  })
}

export function deleteTagById(id) {
  return request({
    url: '/tag/deleteTagById',
    method: 'delete',
    params: { id }
  })
}

export function editTag(form) {
  return request({
    url: '/tag/editTag',
    method: 'PUT',
    data: {
      ...form
    }
  })
}

export function getTags(queryInfo) {
  return request({
    url: '/tag/getTags',
    method: 'get',
    params: { ...queryInfo }
  })
}
