import request from '@/utils/request'

export function getStatistic() {
  return request({
    url: '/statistic/getStatistic',
    method: 'GET'
  })
}
