export class ApiError extends Error {
    constructor(result: ApiResult) {
        super(JSON.stringify(result))
    }
}

export interface ApiResult {
    errcode: number
    errmsg: string
}

/**
 * 会过期的数据
 */
export interface Expirable {
    /**
     * 过期时间，单位秒
     */
    expires_in: number
}
