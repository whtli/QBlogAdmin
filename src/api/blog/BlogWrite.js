import request from '@/utils/request'

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

export function submitBlog(blog) {
  return request({
    url: '/blog/submitBlog',
    method: 'post',
    data: {
      ...blog
    }
  })
}

