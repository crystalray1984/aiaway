import { Readable, Writable, PassThrough } from 'stream'

/**
 * 将数据从一个流复制到另一个流
 * @param from 源流
 * @param to 目标流
 */
export function copyTo(from: Readable, to: Writable): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            from.on('error', reject)
                .on('end', () => resolve())
                .pipe(to.on('error', reject))
        } catch (err) {
            reject(err)
        }
    })
}

/**
 * 读取流内的数据，返回Buffer
 * @param from 源流
 */
export function readAsBuffer(from: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const buffers: Buffer[] = []
            const passthrough = new PassThrough()
            from.on('error', reject)
                .on('end', () => {
                    passthrough.destroy()
                    resolve(Buffer.concat(buffers))
                })
                .pipe(passthrough.on('data', (chunk: Buffer) => buffers.push(chunk)))
        } catch (err) {
            reject(err)
        }
    })
}

/**
 * 读取流内的数据，返回ArrayBuffer
 * @param from 源流
 */
export async function readAsArrayBuffer(from: Readable): Promise<ArrayBufferLike> {
    return (await readAsBuffer(from)).buffer
}

/**
 * 读取流内的数据，返回字符串
 * @param from 源流
 */
export async function readAsString(from: Readable, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return (await readAsBuffer(from)).toString(encoding)
}

/**
 * 读取流内的数据，返回JSON解析后的数据
 * @param from 源流
 */
export async function readAsJson<T>(from: Readable, encoding: BufferEncoding = 'utf-8'): Promise<T> {
    return JSON.parse(await readAsString(from, encoding))
}
