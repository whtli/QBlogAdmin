import request from '@/utils/request'

export function getVisitLogList(queryInfo) {
  return request({
    url: '/log/getVisitLogList',
    method: 'GET',
    params: {
      ...queryInfo
    }
  })
}

export function deleteVisitLogById(id) {
  return request({
    url: '/log/deleteVisitLogById',
    method: 'DELETE',
    params: { id }
  })
}
