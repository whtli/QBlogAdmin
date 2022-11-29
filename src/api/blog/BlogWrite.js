import request from '@/utils/request'

export function getBlogById(id) {
  return request({
    url: '/blog/getBlogById',
    method: 'GET',
    params: { id }
  })
}

export function addImage(formdata) {
  return request({
    url: '/blog/addImage',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formdata
  })
}

export function deleteImg(url) {
  return request({
    url: '/blog/deleteImg',
    method: 'post',
    headers: { 'Img-Delete': url }
  })
}

export function submitBlog(form) {
  return request({
    url: '/blog/submitBlog',
    method: 'post',
    data: {
      ...form
    }
  })
}

export function getCategoryAndTag() {
  return request({
    url: '/blog/getCategoryAndTag',
    method: 'GET'
  })
}

