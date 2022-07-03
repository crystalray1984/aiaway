/**
 * @file 公众号网页相关接口
 */
import { URL } from 'url'
import { signature } from '../security/helpers'
import { Expirable } from '../types'
import { ApiAddons, ApiOptions, request } from '../utils/request'

/**
 * 应用授权作用域
 */
export type AuthorizeScope = 'snsapi_base' | 'snsapi_userinfo'

export interface GetAuthorizeUrlQuery {
    /**
     * 公众号appid
     */
    appid: string
    /**
     * 授权后重定向的回调链接地址
     */
    redirect_uri: string
    /**
     * 应用授权作用域，默认为`'snsapi_userinfo'`
     */
    scope?: AuthorizeScope
    /**
     * 自定义参数
     */
    state?: string

    /**
     * 强制此次授权需要用户弹窗确认；默认为`false`；需要注意的是，若用户命中了特殊场景下的静默授权逻辑，则此参数不生效
     */
    forcePopup?: boolean

    /**
     * 强制此次授权进入快照页；默认为`false`；需要注意的是，若本次登录命中了近期登录过免授权逻辑逻辑或特殊场景下的静默授权逻辑，则此参数不生效
     */
    forceSnapShot?: boolean
}

/**
 * 获取网页授权地址
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#0
 */
export function getAuthorizeUrl(data: GetAuthorizeUrlQuery) {
    const url = new URL('https://open.weixin.qq.com/connect/oauth2/authorize')
    url.searchParams.append('appid', data.appid)
    url.searchParams.append('redirect_uri', data.redirect_uri)
    url.searchParams.append('response_type', 'code')
    if (data.scope === 'snsapi_userinfo') {
        url.searchParams.append('scope', 'snsapi_userinfo')
    } else {
        url.searchParams.append('scope', 'snsapi_base')
    }
    if (typeof data.state === 'string' && /^[a-z0-9]{0,128}$/.test(data.state)) {
        url.searchParams.append('state', data.state)
    }
    if (data.forcePopup) {
        url.searchParams.append('forcePopup', 'true')
    }
    if (data.forceSnapShot) {
        url.searchParams.append('forceSnapShot', 'true')
    }
    return url.href + '#wechat_redirect'
}

export interface GetAccessTokenQuery {
    /**
     * 公众号appid
     */
    appid: string
    /**
     * 公众号的appsecret
     */
    secret: string
    /**
     * 用户授权码
     */
    code: string
}

export interface GetAccessTokenResult extends Expirable {
    /**
     * 网页授权接口调用凭证
     */
    access_token: string
    /**
     * 刷新凭证
     */
    refresh_token: string
    /**
     * 用户openid
     */
    openid: string
    /**
     * 授权的作用域
     */
    scope: string
}

/**
 * 获取网页授权access_token
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
 */
export function getAccessToken(params: GetAccessTokenQuery, options?: ApiAddons) {
    return request<GetAccessTokenResult>({
        ...options,
        url: '/sns/oauth2/access_token',
        params: {
            ...params,
            grant_type: 'authorization_code',
        },
    })
}

export interface RefreshAccessTokenQuery {
    /**
     * 公众号appid
     */
    appid: string

    /**
     * 刷新凭证
     */
    refresh_token: string
}

/**
 * 刷新网页授权access_token
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#2
 */
export function refreshAccessToken(params: RefreshAccessTokenQuery, options?: ApiAddons) {
    return request<GetAccessTokenResult>({
        ...options,
        url: '/sns/oauth2/refresh_token',
        params: {
            ...params,
            grant_type: 'refresh_token',
        },
    })
}

export interface GetUserInfoQuery {
    /**
     * 网页授权接口调用凭证
     */
    access_token: string
    /**
     * 用户openid
     */
    openid: string
    /**
     * 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语
     */
    lang: 'zh_CN' | 'zh_TW' | 'en'
}

/**
 * 用户信息
 */
export interface UserInfo {
    /**
     * 用户openid
     */
    openid: string
    /**
     * 用户昵称
     */
    nickname: string
    /**
     * 用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
     */
    sex: number
    /**
     * 省份
     */
    province: string
    /**
     * 城市
     */
    city: string
    /**
     * 国家
     */
    country: string
    /**
     * 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像 URL 将失效。
     */
    headimgurl: string
    /**
     * 用户特权信息
     */
    privilege: string[]
    /**
     * 只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。
     */
    unionid: string
}

/**
 * 获取用户信息
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#3
 */
export function getUserInfo(params: GetUserInfoQuery, options?: ApiAddons) {
    return request<UserInfo>({
        ...options,
        url: '/sns/userinfo',
        params,
    })
}

export interface GetJsApiTicketQuery {
    /**
     * 公众号接口调用凭证
     */
    access_token: string
}

export interface GetJsapiTicketResult extends Expirable {
    /**
     * JSSDK票据
     */
    ticket: string
}

/**
 * 获取JSSDK票据
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
 */
export function getJsapiTicket(params: GetJsApiTicketQuery, options?: ApiAddons) {
    return request<GetJsapiTicketResult>({
        ...options,
        url: '/cgi-bin/ticket/getticket',
        params,
    })
}

export interface GetJssdkSignatureQuery {
    /**
     * 随机字符串
     */
    noncestr: string
    /**
     * JSSDK票据
     */
    jsapi_ticket: string
    /**
     * UNIX时间戳
     */
    timestamp: number | string
    /**
     * 网页地址
     */
    url: string
}

/**
 * 计算JSSDK签名
 *
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
 */
export function getJssdkSignature({ noncestr, jsapi_ticket, timestamp, url }: GetJssdkSignatureQuery) {
    return signature('sha1', [
        `noncestr=${noncestr}`,
        `jsapi_ticket=${jsapi_ticket}`,
        `timestamp=${timestamp}`,
        `url=${url}`,
    ])
}
