import { consoleConfig } from '../index.js'

Component({
  options: {
    virtualHost: false,
  },
  /**
   * 组件的属性列表
   */
  props: {},

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
  },

  didMount() {
    this.setData({
      visible: consoleConfig.defaultVisible || false,
    })
  },
  methods: {
    setVisible(visible) {
      if (visible) {
        this.setData({
          visible: true,
        })
      } else {
        this.setData({
          visible: false,
        })
      }
    },
  },
})
