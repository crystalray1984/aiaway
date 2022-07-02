import { readAsBuffer, readAsString } from '@aiaway/utils/stream'
import { IncomingMessage } from 'http'
import { decode } from 'iconv-lite'

const rawBufferEncodings = [
    'ascii',
    'utf8',
    'utf-8',
    'utf16le',
    'ucs2',
    'ucs-2',
    'base64',
    'base64url',
    'latin1',
    'binary',
    'hex',
]

/**
 * HTTP响应体
 */
export class Response extends IncomingMessage {
    readAsBuffer() {
        return readAsBuffer(this)
    }

    readAsString(encoding?: string) {
        let contentEncoding: string
        if (typeof encoding === 'string' && encoding) {
            contentEncoding = encoding
        } else {
            const contentType = this.headers['content-type']
            if (!contentType) {
                contentEncoding = 'utf-8'
            } else {
                const match = /charset=([A-Za-z0-9_\-]+)/.exec(contentType)
                if (match) {
                    contentEncoding = match[1]
                } else {
                    contentEncoding = 'utf-8'
                }
            }
        }

        if (rawBufferEncodings.includes(contentEncoding)) {
            return readAsString(this, contentEncoding as BufferEncoding)
        } else {
            return new Promise<string>((resolve, reject) => {
                readAsBuffer(this)
                    .then(buffer => {
                        try {
                            resolve(decode(buffer, contentEncoding, { stripBOM: true, defaultEncoding: 'utf-8' }))
                        } catch (err) {
                            reject(err)
                        }
                    })
                    .catch(reject)
            })
        }
    }

    async readAsJson<T>(encoding?: string) {
        return JSON.parse(await this.readAsString(encoding)) as T
    }
}
