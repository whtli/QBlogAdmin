import request from '@/utils/request'

export function addCategory(form) {
  return request({
    url: '/category/addCategory',
    method: 'POST',
    data: { ...form }
  })
}

export function deleteCategoryById(id) {
  return request({
    url: '/category/deleteCategoryById',
    method: 'delete',
    params: { id }
  })
}

export function editCategory(form) {
  return request({
    url: '/category/editCategory',
    method: 'PUT',
    data: {
      ...form
    }
  })
}

export function getCategories(queryInfo) {
  return request({
    url: '/category/getCategories',
    method: 'get',
    params: { ...queryInfo }
  })
}
