import request from '@/utils/request'

export function getStatistic() {
  return request({
    url: '/data/getStatistic',
    method: 'GET'
  })
}
