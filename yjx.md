## Vue源码解析-响应式原理
### 课程目标
- Vue.js 的静态成员和实例成员初始过程
- 首次渲染的过程
- **数据响应式原理**

### 准备工作

#### Vue源码的获取
- 项目地址 https://github.com/vuejs/vue
- Fork 一份到自己的仓库,克隆到本地,可以自己写注释提交到github
- 为什么分析Vue2.6
  - 到目前为止 Vue3.0 的正式版本还没有发布
  - 新版本发布后,现有的项目不会升级到3.0, 2.x还有很长的一段过渡期
  - 3.0项目地址: https://github.com/vuejs/vue-next

#### 源码目录结构
重点看src下面的目录结构
```
src
  compiler        编译相关
  core            Vue 核心库
  platforms       平台相关代码
  server          SSR,服务端渲染
  sfc             .vue 文件编译为 js对象
  shared          公共的代码

```
- compiler 编译器把模板转换成render函数,render函数会帮我们创建虚拟DOM
- core components 中定义了keep-alive组件,接下来是global-api, 它定义了Vue的静态方法, `assets` `extend`, `mixin`, `use`等方法
- instance 是创建Vue实例的位置,这里定义了Vue的构造函数,以及Vue的初始化,还有Vue生命周期函数
- observer Vue响应式核心
- util 公共成员
- vdom 虚拟DOM
- platforms 平台相关代码 web weex
- server  vue2.0支持SSR,服务端渲染
- sfc 将.vue 文件编译为 js对象
- shared公共的代码

#### 了解Flow
- 官网: https://flow.org/
- JavaScript 的静态资源类型检测器
- Flow的静态文件类型检查错误是通过静态类型推断实现的
- 文件开头通过 // @flow 或者 、/* @flow */ 声明,如下

```js
/* @flow */
function square(n: number): number {
  return n * n;
}
square("2"); // Error
```
### 调试设置 
如何对Vue源码进行打包和调试

**打包**
- 打包工具Rollup
- Vue.js源码的打包工具使用的是Rollup,相比Webpack更轻量
- Webpack 把所有文件当做模块,Rollup 只处理js文件更适合在Vue.js这样的库中使用
- Rollup 打包不会生成冗余的代码

**安装依赖**

```js
npm i
```
设置SourceMap

- package.json 文件中的dev脚本中添加参数 --sourcemap,方便我们调试

```js
"dev": "rollup -w -c script/config.js --sourcemap --environment TARGET:web-full-dev"
```
- 执行dev
  - npm run dev 执行打包, 用的是rollup, -w参数是监听文件的变化,文件变化自动重新打包
  - 结果:## Vue源码解析-响应式原理
### 课程目标
- Vue.js 的静态成员和实例成员初始过程
- 首次渲染的过程
- **数据响应式原理**

### 准备工作

#### Vue源码的获取
- 项目地址 https://github.com/vuejs/vue
- Fork 一份到自己的仓库,克隆到本地,可以自己写注释提交到github
- 为什么分析Vue2.6
  - 到目前为止 Vue3.0 的正式版本还没有发布
  - 新版本发布后,现有的项目不会升级到3.0, 2.x还有很长的一段过渡期
  - 3.0项目地址: https://github.com/vuejs/vue-next

#### 源码目录结构
重点看src下面的目录结构
```
src
  compiler        编译相关
  core            Vue 核心库
  platforms       平台相关代码
  server          SSR,服务端渲染
  sfc             .vue 文件编译为 js对象
  shared          公共的代码

```
- compiler 编译器把模板转换成render函数,render函数会帮我们创建虚拟DOM
- core components 中定义了keep-alive组件,接下来是global-api, 它定义了Vue的静态方法, `assets` `extend`, `mixin`, `use`等方法
- instance 是创建Vue实例的位置,这里定义了Vue的构造函数,以及Vue的初始化,还有Vue生命周期函数
- observer Vue响应式核心
- util 公共成员
- vdom 虚拟DOM
- platforms 平台相关代码 web weex
- server  vue2.0支持SSR,服务端渲染
- sfc 将.vue 文件编译为 js对象
- shared公共的代码

#### 了解Flow
- 官网: https://flow.org/
- JavaScript 的静态资源类型检测器
- Flow的静态文件类型检查错误是通过静态类型推断实现的
- 文件开头通过 // @flow 或者 、/* @flow */ 声明,如下

```js
/* @flow */
function square(n: number): number {
  return n * n;
}
square("2"); // Error
```
### 调试设置 
如何对Vue源码进行打包和调试

**打包**
- 打包工具Rollup
- Vue.js源码的打包工具使用的是Rollup,相比Webpack更轻量
- Webpack 把所有文件当做模块,Rollup 只处理js文件更适合在Vue.js这样的库中使用
- Rollup 打包不会生成冗余的代码

**安装依赖**

```js
npm i
```
设置SourceMap

- package.json 文件中的dev脚本中添加参数 --sourcemap,方便我们调试,出现错误可以看到具体的位置

```js
"dev": "rollup -w -c script/config.js --sourcemap --environment TARGET:web-full-dev"
```
- 执行dev
  - npm run dev 执行打包, 用的是rollup, -w参数是监听文件的变化,文件变化自动重新打包
  - 结果:

###

```js
"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev",
"dev:cjs": "rollup -w -c scripts/config.js --environment TARGET:web-runtime-cjs-dev",
"dev:esm": "rollup -w -c scripts/config.js --environment TARGET:web-runtime-esm",

```
-w watch
-c 设置配置文件 scripts/config.js
--environment 环境变量,用来打包生成不同版本Vue

执行打包命令 npm run dev 
- 打包过程会先找到入口文件,然后会编译到dist 目录vue.js中
- 此时dist中会生成两个文件vue.js 和vue.js.map


### Vue 的不同构建版本
- npm run build 重新打包所有文件
- 官方文档- 对不同构建版本的解释
- dist\REMADME.md
- 图片

### 术语
- **完整版**: 同时包含**编译器**和**运行时**的版本
- **编译器**: 用来将模板字符串编译为JavaScript 渲染函数的代码,体积大,效率低
- **运行时**: 用来创建Vue实例、渲染并处理虚拟DOM等代码,体积小、效率高,基本就是出去编译器的代码
- **UMD**: UMD版本**通用的模块版本**，支持多种模块方式。vue. js默认文件就是运行时+编译器的UMD版本
- **CommonJS(cjs)**: CommonJS版本用来配合老的打包工具比如Browserify 或webpack 1.
- **ES Module**:从2.6开始Vue会提供两个ES Modules (ESM)构建文件，为现代打包工具提供的版本。
  - ESM格式被设计为可以被静态分析，所以打包工具可以利用这一点来进行 tree shaking并将用不到的代码排除出最终的包。
  - ES6模块与CommonJS模块的差异

### 执行命令 vue inspect > output.js 输出文件 查看webpack配置

- 我们在创建Vue-cli项目中使用的Vue版本就是vue.runtime.esm.js运行时的版本
- 推荐使用运行时的版本

### 寻找入口文件
- 查看dist/vue.js 的构建过程
**执行构建**

```js
npm run dev
# "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev",
# --environment TARGET:web-full-dev 设置环境变量TARGET
```
- script/config.js 的执行过程
- 作用: 生成rolllup 构建的配置文件
- 使用环境变量TARGET = web-full-dev

```js
// 判断环境变量是否有TARGET
// 如果有的话使用genConfig() 生成rollup 配置文件
if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else{
  // 否则获取全部配置
  exports.getBuild = genConfig
  exports.getAllBuilds = () => object.keys(builds).map(genConfig)
}
```
在package.json文件中 

```js
"script": {
  "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev",
  "build": "node scripts/build.js",
}
```
- dev打包就是dist文件中的一个版本
- build是所有的版本
- TARGET:web-full-dev需要打包的版本


### 从入口开始
- src/platform/web/entry-runtime-with-compiler.js

### 通过查看源码解决下面问题
- 观察以下代码,通过阅读源码,回答在页面上输出的结果
```js
const vm = new Vue({
  el: '#app',
  template: '<h3> Hello template</h3>',
  render (h) {
    return h('h4', 'Hello render')
  }
})
```
如果传入了render函数 不处理template,直接调用mount方法

### 阅读源码记录
- el不能是body或者html标签
- 如果没有render,把template 转换成render函数
- 如果有render方法,直接调用mount挂载DOM

```js
  // el不能是body 或者html
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 把template/el 转换成render函数
  if (!options.render) {
    ...
    // 2把template/el转换成render 函数
  }
  // 3调用mount 方法,挂载DOM
  - 调试代码
  - 调试的方法
```

```js
const vm = new Vue({
  el: '#app',
  template: '<h3> Hello template</h3>',
  render (h) {
    return h('h4', 'Hello render')
  }
})
```

### 7.Vue 初始化过程

##### 四个导出Vue的模块

- sl/platforms/wb/entry runtime with compilrjis
  - web平台相关的入口
  - 重写了平台相关的Smount)方法
  - 注册了Vue compile()方法，传递一个HTML字符串返回render函数
- src/platforms/web/runtime/index.js
  - web平台相关
  - 注册和平台相关的全局指令: v-model. v-show
  - 注册和平台相关的全局组件: Vtransion. vtansition-group
  - 全局方法:
    - patch _:把虚拟DOM转换成真实DOM

    - $mount:挂载方法

- src/core/index.js
- 与平台无关
  - 设置了Vue的静态方法，itiltbalaPl(Vue)
- src/core/instance/index.js
  - 与平台无关
  - 定义了构造函数，调用了this, iptons)方法
  - 给Vue中混入了常用的实例成员

- 在platforms/web/runtime/index.js下的文件主要做了以下事情
在这个文件中所有代码都是和平台相关的,注册了平台相关的一些指令
patch函数以及$mount这个两个方法

- `import Vue from 'core/index'` 导入了构造函数

- 在core/index.js中,调用了 initGlobalAPI(Vue)方法,给vue的构造函数增加以下静态方法,其他内容都是调用Object.defineProperty给Vue增加了一些成员,还有服务端渲染SSR,

- core/global-api初始化了Vue的静态方法
- instance/index.js 创建了Vue构造函数,设置了Vue实例成员

### 8.Vue 初始化问题
- Flow 语法红线   "javascript.validate.enable": false
- TS代码高亮 Babel JavaScript 插件

### 9. Vue初始化-静态成员

### 10. Vue初始化实例
- instance文件夹
- index.js 定义了Vue的构造函数,并且调用了 initMixin(Vue), stateMixin(Vue),eventsMixin(Vue), lifecycleMixin(Vue)
renderMixin(Vue)

- initMixin(Vue) 就是在Vue的原型上挂载了_init()方法
- stateMixin(Vue) 通过Object.defineProperty(Vue.proptotype, '$data', dataDef) Object.defineProperty(Vue.proptotype, '$props', propsDef)在Vue原型上增加了两个属性

- eventsMixin(Vue) 分别定义了 `$on,$once,$off,$emit`事件,使用发布订阅模式
- lifecycleMixin(Vue) 定义了forceUpdate destory()
- renderMixin

这几个函数的作用都是给Vue原型混入一些成员和属性,给Vue对象增加相应的实例成员
```js
// 注册vm的_init()方法, 初始化vm
initMixin(Vue)
// 注册vm 的$data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法
//$on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 混入 render
// $nextTick/_render
renderMixin(Vue)
```