import { types, convertObject } from '../utils/utils'
const app = getApp()

Component({
  options: {
    observers: true,
  },
  /**
   * 组件的属性列表
   */
  props: {
    item: {},
    level: 1,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDetail: false,
    isLight: false,

    touchstartX: 0,
    touchstartY: 0,
    isMove: false,

    isArrayOrObject: false,

    list: undefined,
  },
  observers: {
    'item.**': function (field) {
      this.setData({
        isArrayOrObject: this.computed.isArrayOrObject.call(this),
      })
    },
  },

  didMount() {},
  didUpdate(prevProps, prevData) {},
  didUnmount() {},
  methods: {
    computed: {
      isArrayOrObject() {
        return (
          this.props.item.type === 'array' || this.props.item.type === 'object'
        )
      },
    },
    toggleShowDetail() {
      if (!this.data.showDetail && !this.data.list) {
        // 首次展开时，再转换
        this.setData({
          list: convertObject(this.props.item.value),
        })
        console.log(this.data.list)
      }
      this.setData({
        showDetail: !this.data.showDetail,
      })
    },
    touchstart(e) {
      this.isMove = false
      this.touchstartX = e.touches[0].clientX
      this.touchstartY = e.touches[0].clientY
    },
    touchmove(e) {
      const deltaX = e.changedTouches[0].clientX
      const deltaY = e.changedTouches[0].clientY
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.isMove = true
      }
    },
    // 长按复制
    longpress(e) {
      const { item } = e.currentTarget.dataset
      if (!this.isMove) {
        this.setData({
          isLight: true,
        })
        my.setClipboard({
          text: JSON.stringify(item.value),
          success: () => {
            my.showToast({
              content: '复制成功',
              duration: 3000,
            })
          },
          complete: () => {
            setTimeout(() => {
              this.setData({
                isLight: false,
              })
            }, 1500)
          },
        })
      }
    },
  },
})
