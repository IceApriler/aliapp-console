# aliapp-console 支付宝小程序console日志工具组件

## 1.安装

```bash
npm i aliapp-console --save
```

## 2.使用方式

### 2.1 mini.project.json

```json
// mini.project.json
{
  "format": 2,
  "compileOptions": {
    "component2": true,
  },
}
```

### 2.2 app.json

```json
// app.json
{
  "usingComponents": {
    "console-view": "aliapp-console/console-view/console-view"
  }
}

```

### 2.3 example.axml

```html
<!-- example.axml -->
<console-view class="page-todos">

</console-view>
```

### 2.4 app.js

```js
// app.js
import { initConsole } from 'aliapp-console'

App({
  onLaunch() {
    this.aliAppLogsStore = initConsole({
      // 开启日志记录功能
      open: true,
      defaultVisible: true, // 默认是否显示左下角的调试按钮
    })
  },
})
```

## 3.配置项


## 4.本地运行

```bash
npm i
npm run dev
```


## 5.开发计划

- [ ] 发布1.0.0
- [ ] 样式美化
- [ ] 支付宝小程序本地存储，一个key最多存储200k

## 6.本地打包测试

```bash
npm pack
```

```bash
npm install /path/to/your/test-1.0.0.tgz
```