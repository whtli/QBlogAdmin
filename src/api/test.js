import request from '@/utils/request'

export function testConn(name) {
  return request({
    url: '/test',
    method: 'GET',
    params: { name }
  })
}
