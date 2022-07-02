import { IncomingMessage } from 'http'
import https from 'https'
import { readAsBuffer, readAsJson, readAsString } from '@aiaway/utils/stream'

/**
 * HTTP请求配置项
 */
export interface Options extends https.RequestOptions {
    url: string
    baseURL?: string
    query?: Record<string, any>
    data?: any
}

/**
 * HTTP响应体
 */
class Response extends IncomingMessage {}

/**
 * 执行原始HTTP请求
 */
export default function http(options: Options) {
    const { url, baseURL, query, data } = options
}
