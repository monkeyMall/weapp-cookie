import CookieStore from './CookieStore'

/**
 * 微信 Cookie 代理
 * @param  {Object} wx      微信 API 对象
 * @param  {Object} request 微信请求函数
 */
const cookieStore = (function (wx, request) {
  // 创建 cookieStore 实例
  const cookieStore = new CookieStore()

  /**
   * 定义请求代理函数
   * @param  {Object} options 请求参数
   */
  function requestProxy (options) {
    // 是否启用 cookie（默认 true）
    options.cookie = options.cookie == undefined || !!options.cookie
    if (options.cookie) {
      // 域名
      let domain = new URL(options.url).host

      // 获取请求 cookies
      let requestCookies = cookieStore.getCookies(domain)
      console.info('request cookies: ', requestCookies)

      // 请求时带上设置的 cookies
      options.header = options.header || {}
      options.header['Cookie'] = requestCookies

      // 原始成功回调
      let successHandler = options.success

      // 代理原始成功回调
      options.success = function (response) {
        // 获取响应 cookies
        let responseCookies = response.header['set-cookie']
        console.info('response cookies: ', responseCookies)
        // 设置 cookies，以便下次请求带上
        cookieStore.setCookies(domain, responseCookies)
        // 调用原始回调
        successHandler && successHandler(response)
      }
    }

    // 发送网络请求
    request(options)
  }

  // 使用 requestProxy 覆盖微信原生 request
  Object.defineProperties(wx, {
     request: {
        value: requestProxy
     }
  })

  // 返回 cookieStore
  return cookieStore
})(wx, wx.request)

// 导出 cookieStore 实例
export default cookieStore
