import http, { ClientRequest } from 'http'
import https from 'https'
import { Readable } from 'stream'
import { URL } from 'url'
import { Response } from './response'
import FormData from 'form-data'
import { isArrayBuffer } from 'util/types'
import { copyTo } from '@aiaway/utils/stream'

export interface RequestOptions extends https.RequestOptions {
    url: string | URL
    baseURL?: string | URL | null
    params?: Record<string, any> | string | null
    data?: Readable | Buffer | ArrayBufferLike | FormData | string | null
    dataEncoding?: BufferEncoding
}

export { Response } from './response'

export default function (options: RequestOptions): Promise<Response> {
    const { url, baseURL, params, data, dataEncoding, ...rest } = options

    const requestUrl = new URL(url.toString(), baseURL || undefined)
    if (typeof params === 'object' && params) {
        for (const name in params) {
            requestUrl.searchParams.append(name, params[name])
        }
    }

    let targetUrl = requestUrl.href
    if (typeof params === 'string' && params) {
        targetUrl += (targetUrl.includes('?') ? '&' : '?') + params
    }

    let request: ClientRequest
    if (requestUrl.protocol === 'https') {
        request = https.request(targetUrl, rest)
    } else {
        request = http.request(targetUrl, rest)
    }

    return new Promise((resolve, reject) => {
        if (isArrayBuffer(data) || Buffer.isBuffer(data)) {
            request.end(data)
        } else if (typeof data === 'string') {
            request.end(Buffer.from(data, dataEncoding || 'utf-8'))
        } else if (data instanceof Readable) {
            if (data instanceof FormData) {
                const headers = data.getHeaders()
                for (const name in headers) {
                    request.setHeader(name, headers[name])
                }
            }
            copyTo(data, request)
                .then(() => request.end())
                .catch(reject)
        } else {
            request.end()
        }
        request
            .on('error', reject)
            .on('timeout', reject)
            .on('response', resp => {
                resolve(Object.setPrototypeOf(resp, Response))
            })
    })
}
