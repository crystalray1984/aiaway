import { BinaryLike, createHash } from 'crypto'

export function md5(data: BinaryLike) {
    return createHash('MD5').update(data).digest('hex')
}

export function sha1(data: BinaryLike) {
    return createHash('SHA1').update(data).digest('hex')
}

/**
 * 将待签名的参数按ASCII排序后，计算签名
 * @param type 签名方法
 * @param list 参数值
 * @param sep 连接参数时的分隔符，默认为`&`
 * @param append 尾部追加的字符串
 */
export function signature(type: 'md5' | 'sha1', list: string[], sep = '&', append = '') {
    const baseStr = `${list.sort().join(sep)}${append}`
    switch (type) {
        case 'md5':
            return md5(baseStr)
        case 'sha1':
            return sha1(baseStr)
        default:
            return ''
    }
}
