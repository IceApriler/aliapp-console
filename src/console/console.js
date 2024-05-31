import { types, convertValue } from '../utils/utils'
const app = getApp()

Component({
  options: {
    observers: true,
  },
  /**
   * 组件的属性列表
   */
  props: {},

  /**
   * 组件的初始数据
   */
  data: {
    consoleLogs: [],
    requestLogs: [],
    localStorageLogs: [],
    showDebug: false,
    systemInfo: my.getSystemInfoSync(),

    menuList: [
      { label: 'Console', value: 'console', subMenuValue: 'all' },
      { label: 'Request', value: 'request', subMenuValue: 'brief' },
      { label: 'LocalStorage', value: 'localStorage', subMenuValue: '' },
    ],
    currentMenuItem: {
      label: 'Console',
      value: 'console',
      subMenuValue: 'all',
    },

    filterText: '',
    briefItemShowDetailList: [],
    consoleButtonStyle: '',

    // computed data
    subMenuList: [],
    filteredLogs: [],
    filteredRequestLogs: [],
    filteredRequestLogsBrief: [],
    filteredLocalStorageLogs: [],
  },

  observers: {
    'currentMenuItem.**': function (field) {
      this.setData({
        subMenuList: this.computed.subMenuList.call(this),
      })
      if (this.data.currentMenuItem.value === 'localStorage') {
        this.updateLocalStorageLogs()
      }
    },
    'currentMenuItem.**, filterText, consoleLogs': function (field) {
      this.setData({
        filteredLogs: this.computed.filteredLogs.call(this),
      })
    },
    'currentMenuItem.**, filterText, requestLogs': function (field) {
      this.setData({
        filteredRequestLogs: this.computed.filteredRequestLogs.call(this),
      })
    },
    'briefItemShowDetailList, filteredRequestLogs': function (field) {
      this.setData({
        filteredRequestLogsBrief: this.computed.filteredRequestLogsBrief.call(
          this,
        ),
      })
    },
    'currentMenuItem.**, filterText, localStorageLogs': function (field) {
      this.setData({
        filteredLocalStorageLogs: this.computed.filteredLocalStorageLogs.call(
          this,
        ),
      })
    },
  },
  didMount() {
    this.setData({
      currentMenuItem: this.data.currentMenuItem,
      consoleButtonStyle: app.globalData.logsStore.consoleButtonStyle || '',
    })
  },
  didUnmount() {},
  methods: {
    asyncData() {
      const { logsStore } = app.globalData
      const { consoleLogs, requestLogs } = logsStore
      this.setData({
        consoleLogs: [...consoleLogs], // 需要展开，不然模拟器会报错
        requestLogs: [...requestLogs],
      })
    },
    computed: {
      subMenuList() {
        switch (this.data.currentMenuItem.value) {
          case 'console':
            return [
              { label: 'All', value: 'all' },
              { label: 'log', value: 'log' },
              { label: 'info', value: 'info' },
              { label: 'warn', value: 'warn' },
              { label: 'error', value: 'error' },
            ]
          case 'request':
            return [
              { label: '简洁模式', value: 'brief' },
              { label: '完整模式', value: 'full' },
            ]
          case 'localStorage':
            return []
          default:
            return []
        }
      },
      filteredLogs() {
        if (this.data.currentMenuItem.value === 'console') {
          let res = this.data.consoleLogs
          if (this.data.filterText) {
            res = this.data.consoleLogs.filter((i) => {
              try {
                return JSON.stringify(i.value).search(this.data.filterText) > -1
              } catch (error) {
                console.error(error)
                return false
              }
            })
          }
          if (this.data.currentMenuItem.subMenuValue !== 'all') {
            res = res.filter((i) => {
              return i.fnType === this.data.currentMenuItem.subMenuValue
            })
          }
          return res
        }
        return this.data.consoleLogs
      },
      // request 默认模式
      filteredRequestLogs() {
        if (
          this.data.currentMenuItem.value === 'request' &&
          this.data.filterText
        ) {
          return this.data.requestLogs.filter((i) => {
            try {
              return JSON.stringify(i.value).search(this.data.filterText) > -1
            } catch (error) {
              console.error(error)
              return false
            }
          })
        }
        return this.data.requestLogs
      },
      // request 简洁模式
      filteredRequestLogsBrief() {
        const brief = this.data.filteredRequestLogs.map((item) => {
          const [urlName, config, stateText, response = {}] = item.value
          const { method, data: params } = config
          const { data: responseData, status } = response
          const res = {
            requestId: item.requestId,
            showDetail:
              this.data.briefItemShowDetailList.findIndex(
                (i) => i.requestId === item.requestId,
              ) > -1,
            fnType: item.fnType,
            urlName: convertValue(urlName),
            method: convertValue(method),
            params: convertValue(params),
            statusCode: convertValue(status),
            responseData: convertValue(responseData),
          }
          return res
        })
        return brief
      },
      filteredLocalStorageLogs() {
        if (
          this.data.currentMenuItem.value === 'localStorage' &&
          this.data.filterText
        ) {
          return this.data.localStorageLogs.filter((i) => {
            try {
              return JSON.stringify(i.key).search(this.data.filterText) > -1
            } catch (error) {
              console.error(error)
              return false
            }
          })
        }
        return this.data.localStorageLogs
      },
    },
    onInput(e) {
      const { field } = e.currentTarget.dataset
      this.setData({
        [field]: e.detail.value,
      })
    },
    toggleShowConsoleList() {
      this.setData({
        filterText: '',
        showDebug: !this.data.showDebug,
      })
      console.log('this.data.showDebug', this.data.showDebug)
      if (this.data.showDebug) {
        // 每次展开的时候，同步一下数据
        this.asyncData()
      }
    },
    selectMenu(e) {
      const { item } = e.currentTarget.dataset
      this.setData({
        filterText: '',
        currentMenuItem: item,
      })
    },
    selectSubMenu(e) {
      const { item } = e.currentTarget.dataset
      this.setData({
        'currentMenuItem.subMenuValue': item.value,
      })
    },
    // localStorage
    updateLocalStorageLogs() {
      setTimeout(() => {
        my.getStorageInfo({
          success: (res) => {
            const localStorageLogs = []
            res.keys.forEach((key) => {
              let value = my.getStorageSync({ key: key }).data
              localStorageLogs.push({ key, ...convertValue(value) })
            })
            this.setData({
              localStorageLogs,
            })
          },
        })
      }, 100)
    },
    clearLogs() {
      switch (this.data.currentMenuItem.value) {
        case 'console':
          app.globalData.logsStore.consoleLogs = []
          this.setData({
            consoleLogs: [],
          })
          break
        case 'request':
          app.globalData.logsStore.requestLogs = []
          this.setData({
            requestLogs: [],
          })
          break
        case 'localStorage':
          my.clearStorage()
          this.updateLocalStorageLogs()
          break
        default:
      }
    },
    briefShowDetail(e) {
      const { item } = e.currentTarget.dataset
      // const idx = this.requestLogs.findIndex(i => i.requestId === item.requestId);
      const idx = this.data.briefItemShowDetailList.findIndex(
        (i) => i.requestId === item.requestId,
      )
      if (idx > -1) {
        // 存在
        this.setData({
          briefItemShowDetailList: this.data.briefItemShowDetailList.filter(
            (i) => i.requestId !== item.requestId,
          ),
        })
      } else {
        // 不存在
        this.setData({
          briefItemShowDetailList: [...this.data.briefItemShowDetailList, item],
        })
      }
    },
    touchstart(e) {
      this._btnOldLeft = e.currentTarget.offsetLeft
      this._btnOldTop = e.currentTarget.offsetTop
      this._touchStartX = e.changedTouches[0].pageX
      this._touchStartY = e.changedTouches[0].pageY
    },
    touchmove(e) {
      if (this._time && Date.now() - this._time < 40) {
        return
      }
      this._time = Date.now()
      const { pageX, pageY } = e.changedTouches[0]
      const _touchDiffX = pageX - this._touchStartX
      const _touchDiffY = pageY - this._touchStartY
      let _newLeft = this._btnOldLeft + _touchDiffX
      let _newTop = this._btnOldTop + _touchDiffY
      if (_newTop < 0) {
        _newTop = 0
      }
      if (_newLeft < 0) {
        _newLeft = 0
      }
      if (_newTop > this.data.systemInfo.screenHeight - 35) {
        _newTop = this.data.systemInfo.screenHeight - 35
      }
      if (_newLeft > this.data.systemInfo.screenWidth - 100) {
        _newLeft = this.data.systemInfo.screenWidth - 100
      }

      const consoleButtonStyle = `left: ${_newLeft}px; top: ${_newTop}px; right: unset; bottom: unset;`
      this.setData({
        consoleButtonStyle,
      })
      app.globalData.logsStore.consoleButtonStyle = consoleButtonStyle
    },
    touchend(e) {},
  },
})
