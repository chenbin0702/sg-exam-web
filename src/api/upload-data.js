import {VUE_APP_API_CONTEXT_PATH} from '@/utils/env'
import request from '@/router/axios'
// /v1/attachment/upload'
export function uploadData (data) {
  return request({
    url: VUE_APP_API_CONTEXT_PATH + '/v1/attachment/upload',
    method: 'post',
    data: data
  })
}
