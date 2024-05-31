const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  props: {
    background: '#5582fa',
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
  },

  didMount() {
    this.setData({
      visible: app.aliConsole ? app.aliConsole.visible : false,
    })
    if (app.aliConsole) {
      app.aliConsole.self = this
    }
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
