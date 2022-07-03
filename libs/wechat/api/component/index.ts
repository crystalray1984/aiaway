import { URL } from 'url'
import { Expirable } from '../../types'
import { ApiAddons, request } from '../../utils/request'

export interface GetAccessTokenQuery {
    /**
     * 第三方平台 appid
     */
    component_appid: string
    /**
     * 第三方平台 appsecret
     */
    component_appsecret: string
    /**
     * 微信后台推送的 ticket
     */
    component_verify_ticket: string
}

export interface GetAccessTokenResult extends Expirable {
    /**
     * 第三方平台 access_token
     */
    component_access_token: string
}

/**
 * 获取第三方平台接口调用令牌
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html
 */
export function getAccessToken(data: GetAccessTokenQuery, options?: ApiAddons) {
    return request<GetAccessTokenResult>({
        ...options,
        url: '/cgi-bin/component/api_component_token',
        data,
    })
}

export interface GetPreAuthCodeQuery {
    /**
     * 第三方平台 appid
     */
    component_appid: string
    /**
     * 第三方平台 access_token
     */
    component_access_token: string
}

export interface GetPreAuthCodeResult extends Expirable {
    /**
     * 预授权码
     */
    pre_auth_code: string
}

/**
 * 获取预授权码
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/pre_auth_code.html
 */
export function getPreAuthCode(data: GetPreAuthCodeQuery, options?: ApiAddons) {
    const { component_appid, component_access_token } = data
    return request<GetPreAuthCodeResult>({
        ...options,
        url: '/cgi-bin/component/api_create_preauthcode',
        params: {
            component_access_token,
        },
        data: {
            component_appid,
        },
    })
}

export interface GetAuthorizeUrlQuery {
    /**
     * 链接类型，默认为`pc`
     */
    type?: 'pc' | 'mobile'
    /**
     * 第三方平台 appid
     */
    component_appid: string
    /**
     * 预授权码
     */
    pre_auth_code: string
    /**
     * 授权完成后的回调地址
     */
    redirect_uri: string
    /**
     * 允许授权的账号类型1-公众号 2-小程序 3-公众号和小程序，默认为`3`
     */
    auth_type?: 1 | 2 | 3
    /**
     * 指定授权的授权方appid
     */
    biz_appid?: string
    /**
     * 指定的权限集 id 列表，如果不指定，则默认拉取当前第三方账号已经全网发布的权限集列表
     */
    category_id_list?: number[]
}

/**
 * 获取授权页地址
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Authorization_Process_Technical_Description.html
 */
export function getAuthorizeUrl({
    type,
    component_appid,
    pre_auth_code,
    redirect_uri,
    auth_type,
    biz_appid,
    category_id_list,
}: GetAuthorizeUrlQuery) {
    const url = new URL(
        type === 'mobile'
            ? 'https://open.weixin.qq.com/wxaopen/safe/bindcomponent?action=bindcomponent&no_scan=1#wechat_redirect'
            : 'https://mp.weixin.qq.com/cgi-bin/componentloginpage'
    )
    url.searchParams.append('component_appid', component_appid)
    url.searchParams.append('pre_auth_code', pre_auth_code)
    url.searchParams.append('redirect_uri', redirect_uri)
    if (biz_appid) {
        url.searchParams.append('biz_appid', biz_appid)
    } else if (auth_type) {
        url.searchParams.append('auth_type', String(auth_type))
    }
    if (Array.isArray(category_id_list) && category_id_list.length > 0) {
        url.searchParams.append('biz_appid', category_id_list.join(','))
    }
    return url.href
}

export interface QueryAuthQuery {
    /**
     * 第三方平台 access_token
     */
    component_access_token: string
    /**
     * 第三方平台 appid
     */
    component_appid: string
    /**
     * 授权方的授权码
     */
    authorization_code: string
}

export interface AuthorizationInfo extends Expirable {
    /**
     * 授权方 appid
     */
    authorizer_appid: string
    /**
     * 接口调用令牌（在授权的公众号/小程序具备 API 权限时，才有此返回值）
     */
    authorizer_access_token: string
    /**
     * 刷新令牌（在授权的公众号具备 API 权限时，才有此返回值）
     */
    authorizer_refresh_token: string
    /**
     * 已授权的权限集
     */
    func_info: {
        funcscope_category: {
            id: number
        }
    }[]
}

/**
 * 使用授权码获取授权信息
 *
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorization_info.html
 */
export function queryAuth({ component_access_token, ...data }: QueryAuthQuery, options?: ApiAddons) {
    return request<{
        authorization_info: AuthorizationInfo
    }>({
        ...options,
        url: '/cgi-bin/component/api_query_auth',
        params: {
            component_access_token,
        },
        data,
    })
}

export interface GetAuthorizerTokenQuery {
    /**
     * 第三方平台 access_token
     */
    component_access_token: string
    /**
     * 第三方平台 appid
     */
    component_appid: string
    /**
     * 授权方 appid
     */
    authorizer_appid: string
    /**
     * 刷新令牌
     */
    authorizer_refresh_token: string
}

export interface GetAuthorizerTokenResult extends Expirable {
    /**
     * 接口调用令牌
     */
    authorizer_access_token: string
    /**
     * 刷新令牌
     */
    authorizer_refresh_token: string
}

/**
 * 获取/刷新授权方token
 *
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html
 */
export function getAuthorizerToken({ component_access_token, ...data }: GetAuthorizerTokenQuery, options?: ApiAddons) {
    return request<{
        authorization_info: AuthorizationInfo
    }>({
        ...options,
        url: '/cgi-bin/component/api_authorizer_token',
        params: {
            component_access_token,
        },
        data,
    })
}

export interface GetAuthorizerInfoQuery {
    /**
     * 第三方平台接口调用凭证
     */
    access_token: string

    component_appid: string

    authorizer_appid: string
}

/**
 * 授权方信息
 */
export interface AuthorizerInfo {
    /**
     * 昵称
     */
    nick_name: string
    /**
     * 头像
     */
    head_img: string

    /**
     * 公众号/小程序类型
     */
    service_type_info: {
        /**
         * 类型id
         */
        id: number
        /**
         * 类型说明
         */
        name: string
    }

    /**
     * 公众号/小程序认证类型
     */
    verify_type_info: {
        /**
         * 类型id
         */
        id: number
        /**
         * 类型说明
         */
        name: string
    }

    /**
     * 原始ID
     */
    user_name: string

    /**
     * 公众号所设置的微信号，可能为空
     */
    alias: string

    /**
     * 二维码图片的 URL
     */
    qrcode_url: string

    /**
     * 用以了解功能的开通状况（0代表未开通，1代表已开通）
     */
    business_info: {
        open_pay: number
        open_shake: number
        open_scan: number
        open_card: number
        open_store: number
    }

    /**
     * 主体名称
     */
    principal_name: string

    /**
     * 小程序帐号介绍
     */
    signature: string

    /**
     * 小程序配置信息，可根据这个字段判断是否为小程序类型授权
     */
    MiniProgramInfo: {
        /**
         * 小程序配置的合法域名信息
         */
        network: {
            /**
             * request合法域名
             */
            RequestDomain: string[]
            /**
             * socket合法域名
             */
            WsRequestDomain: string[]
            /**
             * uploadFile合法域名
             */
            UploadDomain: string[]
            /**
             * downloadFile合法域名
             */
            DownloadDomain: string[]
            /**
             * udp合法域名
             */
            UDPDomain: string[]
            /**
             * tcp合法域名
             */
            TCPDomain: string[]
        }

        /**
         * 小程序配置的类目信息
         */
        categories: {
            /**
             * 一级类目
             */
            first: string
            /**
             * 二级类目
             */
            second: string
        }[]
    }

    /**
     * 小程序注册方式
     */
    register_type: number

    /**
     * 帐号状态
     */
    account_status: number

    /**
     * 基础配置信息
     */
    basic_config: {
        /**
         * 是否已经绑定手机号
         */
        is_phone_configured: boolean

        /**
         * 是否已经绑定邮箱，不绑定邮箱帐号的不可登录微信公众平台
         */
        is_email_configured: boolean
    }
}

/**
 * 获取授权方信息
 *
 * @see https://developers.weixin.qq.com/doc/oplatform/openApi/OpenApiDoc/authorization-management/getAuthorizerInfo.html
 */
export function getAuthorizerInfo({ access_token, ...data }: GetAuthorizerInfoQuery, options?: ApiAddons) {
    return request<{
        authorizer_info: AuthorizerInfo
        authorization_info: AuthorizationInfo
    }>({
        ...options,
        url: '/cgi-bin/component/api_get_authorizer_info',
        params: {
            access_token,
        },
        data,
    })
}

export * as web from './web'
