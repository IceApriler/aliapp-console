import { makeLabel, strTrim, deepCopy, customStringify } from './utils.js'
let _log = console.log
let _info = console.info
let _error = console.error
let _warn = console.warn
let _request = my.request

let consoleConfig = {}
export const logsStore = {
  consoleLogs: [],
  requestLogs: [],
}

function print(fnType, sourceLogArr) {
  try {
    // 判断是否是关闭调试状态
    if (!consoleConfig.openDebug) return

    let formatLogArr

    formatLogArr = sourceLogArr

    const { consoleLogs = [] } = logsStore
    consoleLogs.push({
      fnType,
      label: formatLogArr.map((i) => makeLabel(i)).join(', '),
      value: formatLogArr,
      type: 'array',
    })
    // 最多保存100条
    const maxLength = 100
    if (consoleLogs.length > maxLength) {
      logsStore.consoleLogs = consoleLogs.splice(
        consoleLogs.length - maxLength,
        maxLength,
      )
    } else {
      logsStore.consoleLogs = consoleLogs
    }
  } catch (error) {
    console.error('print error', error)
  }
}
function requestPrint(fnType, e) {
  try {
    // 判断是否是关闭调试状态
    if (!consoleConfig.openDebug) return

    const { requestLogs = [] } = logsStore
    const requestId = Date.now()
    requestLogs.push({
      fnType,
      label: e.map((i) => makeLabel(i)).join(', '),
      value: e,
      type: 'array',
      requestId,
    })
    // 最多保存50条
    const maxLength = 50
    if (requestLogs.length > maxLength) {
      logsStore.requestLogs = requestLogs.splice(
        requestLogs.length - maxLength,
        maxLength,
      )
    } else {
      logsStore.requestLogs = requestLogs
    }
    return requestId
  } catch (error) {
    console.error('requestPrint error', error)
  }
}
export const initConsole = (config = {}) => {
  consoleConfig = config
  console.log = function (...argArr) {
    _log(...argArr)
    print('log', JSON.parse(customStringify(argArr)))
  }
  console.info = function (...argArr) {
    _info(...argArr)
    print('info', JSON.parse(customStringify(argArr)))
  }
  console.error = function (...argArr) {
    _error(...argArr)
    print('error', JSON.parse(customStringify(argArr)))
  }
  console.warn = function (...argArr) {
    _warn(...argArr)
    print('warn', JSON.parse(customStringify(argArr)))
  }
  console.errorSystem = function (err) {
    const { message, stack } = err || {}
    console.error('errorSystem:', err, message, stack)
  }
  console.req = function (...str) {
    return requestPrint('log', JSON.parse(customStringify(str)))
  }

  console.warn('console已劫持')
  // console.warn('如遇页面卡死，请先排查[*.wxs]文件下是否有console并移除')

  my.request = function (reqConfig) {
    try {
      // 判断是否是关闭调试状态
      if (!consoleConfig.openDebug) return _request(reqConfig)

      const _reqConfig = deepCopy(reqConfig)
      delete _reqConfig.success
      delete _reqConfig.fail
      // 去除右侧的/
      const _url = strTrim(_reqConfig.url, '/', 'right')
      const api = _url.substr(_url.lastIndexOf('/') + 1)
      const requestId = console.req(api, _reqConfig)

      function updateRequestLog(flag, data) {
        const { requestLogs } = logsStore
        const idx = requestLogs.findIndex((i) => {
          return i.requestId === requestId
        })
        if (idx > -1) {
          requestLogs[idx].value = [...requestLogs[idx].value, flag, data]
          requestLogs[idx].label = JSON.stringify(requestLogs[idx].value)
          if (flag === 'fail') {
            requestLogs[idx].fnType = 'error'
          }
        }
      }
      _request({
        ...reqConfig,
        success: (data) => {
          updateRequestLog('success', data)
          reqConfig.success(data)
        },
        fail: (data) => {
          updateRequestLog('fail', data)
          reqConfig.success(data)
        },
      })
    } catch (error) {
      console.error('my.request error', error)
    }
  }

  return logsStore
}
