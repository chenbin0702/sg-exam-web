import request from '@/router/axios'
import {VUE_APP_API_CONTEXT_PATH} from '@/utils/env'
const baseUrl = VUE_APP_API_CONTEXT_PATH + '/v1/homework/'

export function homeworkSaveOrUpdate (data) {
  return request({
    url: baseUrl + 'saveOrUpdate',
    method: 'post',
    data
  })
}

export function homeworkList (params) {
  return request({
    url: baseUrl + 'list',
    method: 'get',
    params
  })
}


