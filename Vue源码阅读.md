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

### 11.Vue实例-实例成员-init

### 12.Vue实例-实例成员-initState
初始化vm的 _props/methods/_data/computed/watch
```javascript
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

在`instance/state.js`中,首先获取了`Vue`实例中的`$options`,然后判断`options`中是否有`props,methods,data`以及`computed`和`watch`这些属性,如果有的话,通过`initProps`进行初始化

`initProps(vm, opts.props)`接收了两个参数,一个是`Vue`实例,一个是`Props`属性,我们跳转到`initProps`函数中,首先给`Vue`实例定义了一个`_Props`对象, 并且把它存储到了常量里面
```js
const props = vm._props = {}
```
紧接着,开始遍历`PropsOptions`的所有属性,它其实就是`initProps`方法中的第二个参数,遍历每个属性,然后通过`defineReactive`注入到`Props`这个对象上,这个`props`其实就是`vm._props`所有的成员都会通过`defineReacttive`转化为`get`和`set`,最后在`Props`对象上存储,
**注意**
- 在开发模式中,如果我们直接给这个属性赋值的话,会发出一个警告,
- 生产环境中直接通过`defineReactive`把`props`中的属性转化成`get`和`set`
- 最后判断了`props`属性是否在`Vue`实例中存在,不存在通过`Proxy`这个函数把我们的属性注入到`Vue`的实例中

在`Proxy`中,通过调用`Object.defineProperty(target, key,sharePropertyDefinition)`

总结`initProps`的作用就是把我们的`Props`成员转化成响应式数据,并且注入到`Vue`实例里面中

接下来看`initMethods`

在`initMethods(vm, opts.methods)`中,也是接收两个参数,Vue实例和选项中的`methods`,首先获取了选项中的Props,接着遍历methods所有属性,接着判断当前的环境是否是开发或者生产
开发环境会判断methods是否是functicon

接着判断methods方法的名称是否在Props对象中存在,存在就会发送一个警告,警告在属性在Props中已经存在,因为Props和methods最终都要注入到Vue实例上,不能出现同名

下面继续判断key是否在Vue中存在,并且调用了isReserved(key),判断我们的key是否以_开头或$开头
最后把methods注入到Vue实例上来,注入的时候会判断是否是function,如果不是返回noop,是的话把函数返回`bind(methods[key], vm)`

总结 initMethods作用就是把选项的methods注入到vue实例,在注入之前,会先判断我们命名是否在Props中存在,并且判断了命名的规范,不建议_和$开头

> 接下来看initData(vm)
当options中有data选项时,会调用initData(vm)
当没有的时候此时会给vm初始化一个_data属性observe(vm._data = {}, true),然后调用observe函数,observe是响应式中的一个函数

在initData中获取了options的data选项,判断了data选项是否是function,如果是调用getData(data,vm)
接着获取data中的所有属性,同时获取了props,methods中所有的属性
```js
const keys = Object.keys(data)
const props = vm.$options.props
const methods = vm.$options.methods

```
最后做一个响应式处理
```js
observe(data, true)
```

### 13.调试Vue初始化过程

### 14.首次渲染的过程

### 15.首先渲染的总结
//见 为知笔记第三张图片

### 16. 数据响应式原理
通过查看源码解决下面问题
- vm.msg = { count: 0 },重新给属性赋值,是否是响应式
- vm.arr[0] = 4,给数组元素赋值,视图是否会更新
- vm.arr.length = 0,修改数组的length,视图是否会更新
- vm.arr.push(1),视图是否会更新
**响应式处理的入口**
整个响应式处理的过程是比较复杂的,
- src\core\instance\state.js
- initState(vm) vm状态的初始化
- 初始化了_data、_props、methods等
- src\core\instande\state.js
```javascript
//数据的初始化
if (opts.data) {
  initData(vm)
} else {
  observe(vm._data = {}, true)
}
```
### 17.数据响应式原理-Observe


### 18.数据响应式原理-defineReactive 
Observer类被附加到每一个附加对象,派发更新

### 19.数据响应式原理-依赖收集

### 20.依赖收集-调试

### 21.数据响应式原理数组

### 22.数组响应式原理-数组练习

### 23.数据响应式原理-调试上

调试响应式数据执行过程
- 数组响应式处理的核心过程和数组收集依赖的过程
- 当数组的数据改变的时候watcher的执行过程
```js
<div id="app">
{{arr}}
<div>
<script>
const vm = new Vue({
  el: '#app',
  data: {
    arr: [2,3,5]
  }
})
</script>
```

### 24.数据响应式原理-调试下

### 25.数据响应式原理总结
见为知笔记图
### 26.动态增加一个响应式属性

```js
let vm = new Vue({
  el: '#app',
  data: {
    obj: {
      title: 'Hello Vue'
    },
    arr: [1, 2, 3]
  }
})

vm.obj.name = '大白菜' // 非响应式的

vm.$set(vm.obj, 'name', '大白菜')
```
当修改数组的时候 
```js
vm.$set(vm.arr, 0, 100)
```

### Vue Set源码
定义位置
- Vue.set()
- global-apo/index.js

```js
// 静态方法 set/delete/nextTick
Vue.set = set
Vue.delete = delete
Vue.nextTick = nextTick
```
vm.$set()
instance/index.js
```js
// 注册vm的$data/$props/$set/$delete/$watch
// instance/state.js
stateMixin(Vue)
// instane/state.js
Vue.prototype.$set = set
Vue.prototype.$delete = del
```
当时用set给数组设置属性时,会调用splice方法
当时用set给对象增加新的成员时,会调用defineReactive()
最终他们都会调用ob.dep.notify()发送通知

### 27 set调式


### 28. vm.$delete
**功能**
- 删除对象的属性,如果对象是响应式的,确保删除能触发更新视图,这个方法主要用于避开Vue不能检测到属性被删除的限制,但是你应该很少会使用它

> 注意 目标对象不能是一个Vue实例或者Vue实例的根数据对象

- 示例
```js
vm.$delete(vm.obj, 'msg')
```

定义位置
```js
Vue.delete()
global-api.index.js
```
静态方法set/delete/nextTick

### 29.delete源码

定义位置
- Vue.delete()
- global-api/index.js

```js
// 静态方法 set/delete/nextTick
Vue.set = set
Vue.delete = del
Vue.nextTick = nextTick
```
vm.$delete()

instance/index.js

```js
steatMixin(Vue)

// /instance/state.js
Vue.prototype.$set = set
Vue.prototype.$delete = del
```
### 30.watch-回顾
vm.$watch(expOrFn,callback,[options])

**功能**

- 观察Vue实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。

**参数**
- expOrFn:要监视的$data中的属性，可以是表达式或函数
- callback:数据变化后执行的函数
- 函数:回调函数
- 对象:具有handler属性(字符串或者函数)，如果该属性为字符串则methods中相应的定义
- options:可选的选项
- deep:布尔类型，深度监听
- immediate:布尔类型，是否立即执行-次回调函数
**示例**
```js
const vm = new Vue({
  el: '#app',
  data: {
    a: '1',
    b: '2',
    msg: 'Hello Vue',
    user: {
      firstName: '大白菜',
      lastName: '米糕',
      fullName: ''
    }
  }
})

vm.$watch('user',function(newValue,oldValue){
  this.user.fullName = newValue.firstName + '' + newValue.lastName
}, {
  immediate: true,
  deep: true
})
```

### 31.三种类型的Watcher对R

- 没有静态方法，因为$watch方法中要使用Vue的实例

- Watcher分三种:计算属性Watcher、 用户Watcher (侦听器)、渲染Watcher
- 创建顺序:计算属性Watcher、 用户Watcher (侦听器)、 渲染Watcher

vm.$watch()

- src/core/instance/state.js

### 32.更新异步队列-nextTick

- Vue 更新DOM 是异步执行的,批量的
- 在下次DOM更新循环结束之后执行延迟回调,在修改数据之后立即使用这个方法,获取更新后的DOM
- vm.$nextTick(function(){ /*操作DOM*/}) Vue.nextTick(function() {})

vm.$nextTick 代码演示
```js
<div id="app">
  <p ref="p1">{{msg}}</p>
</div>
<script src="../../dist/vue.js"></script>
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'Hello nextTick',
    name: 'Vue.js',
    title: 'Title',
  },
  mounted() {
    this.msg  = 'Hello Word'
    this.name = 'Hello snabbdom'
    this.title = 'Vue.js'

    this.$nextTick(() => {
      console.log(this.$refs.p1.textContent)
    })
  }
})
```

### 31.源码分析nextTick源码
定义位置

- src/core/instance/render.js

```js
Vue.prototype.$nextTick = function(fn: Function) {
  return nextTick(fn, this)
}
```
源码

- 手动调用vm.$nextTick()

- 在Watcher的queueWatcher 中执行nextTick
- src/core/util/next-tick.js