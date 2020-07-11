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