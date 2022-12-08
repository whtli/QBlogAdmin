import request from '@/utils/request'

export function getOperationLogList(queryInfo) {
  return request({
    url: '/log/getOperationLogList',
    method: 'GET',
    params: {
      ...queryInfo
    }
  })
}

export function deleteOperationLogById(id) {
  return request({
    url: '/log/deleteOperationLogById',
    method: 'DELETE',
    params: { id }
  })
}
