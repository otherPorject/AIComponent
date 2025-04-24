/*
 * @Date: 2024-04-24 15:50:50
 * @LastEditors: AaronChu
 * @LastEditTime: 2024-04-24 15:52:05
 */

import request from '@/utils/request'

export function queryFileAssistantDto(visitId) {
  return request.post('/ts-bs-his/ts-pfs-emr/queryFileAssistantDto', {
      visitId
  })
}
