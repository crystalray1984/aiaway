import http, { RequestOptions, Response } from '@aiaway/http'
import { ApiError, ApiResult } from '../types'
import { WECHAT_API_BASE } from './constrants'

export interface ApiAddons {
    baseURL?: RequestOptions['baseURL']
    throwOnError?: boolean
    data?: any
}

/**
 * 微信接口调用附加配置项
 */
export interface ApiOptions extends Omit<RequestOptions, 'data'>, ApiAddons {}

export function raw(options: RequestOptions) {
    const { baseURL, ...rest } = options
    return http({
        ...rest,
        baseURL: baseURL || WECHAT_API_BASE,
    })
}

export async function request<T = {}>(options: ApiOptions): Promise<ApiResult & T> {
    const { baseURL, throwOnError, data, ...rest } = options
    const resp = await http({
        ...rest,
        baseURL: baseURL || WECHAT_API_BASE,
        data: typeof data === 'object' && data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    })
    const result = await resp.readAsJson<ApiResult>()
    if (typeof result === 'object' && result && result.errcode) {
        if (throwOnError !== false) {
            throw new ApiError(result)
        }
    }
    return result as ApiResult & T
}
