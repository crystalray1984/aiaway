import { URL } from 'url'
import { ApiAddons, request } from '../../utils/request'
import { AuthorizeScope, GetAccessTokenResult, RefreshAccessTokenQuery as BaseRefreshAccessTokenQuery } from '../web'

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
     * 第三方平台appid
     */
    component_appid: string
}

/**
 * 获取网页授权地址
 *
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
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
    url.searchParams.append('component_appid', data.component_appid)
    return url.href + '#wechat_redirect'
}

export interface GetAccessTokenQuery {
    /**
     * 公众号appid
     */
    appid: string
    /**
     * 第三方平台appid
     */
    component_appid: string
    /**
     * 第三方平台access_token
     */
    component_access_token: string
    /**
     * 用户授权码
     */
    code: string
}

/**
 * 获取网页授权access_token
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
 */
export function getAccessToken(params: GetAccessTokenQuery, options?: ApiAddons) {
    return request<GetAccessTokenResult>({
        ...options,
        url: '/sns/oauth2/component/access_token',
        params: {
            ...params,
            grant_type: 'authorization_code',
        },
    })
}

export interface RefreshAccessTokenQuery extends BaseRefreshAccessTokenQuery {
    /**
     * 第三方平台appid
     */
    component_appid: string
    /**
     * 第三方平台access_token
     */
    component_access_token: string
}

/**
 * 刷新网页授权access_token
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
 */
export function refreshAccessToken(params: RefreshAccessTokenQuery, options?: ApiAddons) {
    return request<GetAccessTokenResult>({
        ...options,
        url: '/sns/oauth2/component/refresh_token',
        params: {
            ...params,
            grant_type: 'refresh_token',
        },
    })
}
