### 模版编译介绍

- 模版编译的主要目的是将模版(template) 转换为渲染函数(render)
```html
<div>
  <h1 @click="handler">title</h1>
  <p>some content</p>
</div>
```
**渲染函数**
```js
render (h) {
  return h('div', [
    h('h1', { on: { click: this.handler }}, 'title'),
    h('p', 'some content')
  ])
}
```
h函数最终回调cleateElement生成Vnode
对比这两段代码,写模版比写render函数代码量要少,简单,并且直观

**模版编译的作用**

- Vue.2.x 使用VNode描述试图以及各种交互,用户自己编写VNode比较fuza
- 用户只需要编写类似HTML的代码 - Vue.js模版,通过编译器将模版转换为返回VNode的render函数
- .vue文件会被webpack在构建的过程中转换为render 函数

### 体验模版编译的结果上
```html
<div id="app">
  <h1>vue <span>模版编译过程</span></h1>
  <p>{{msg}}</p>
  <comp @myclick="handler"></comp>
</div>
```
```js
Vue.component('comp', {
  template: '<div>I am a comp</div>'
})
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'Hello compiler'
  },
  methods: {
    handler () {
      console.log('test')
    }
  }
})
console.log(vm.$options.render)
```
定位入口文件
`src/platforms/web/entry-runtime-with-compiler.js`

**模版编译后的结果**
```js
(function anonymous() {
  with (this) {
    return _c(
      "div",
      { attrs: { id: "app"} },
      [
        _m(0),
        _v(" "),
        _c("p", [_v(_s(msg))]),
        _v(" "),
        _c("comp", { on: { myclick: handler }}),
      ],
      1
    );
  }
});
```

with的作用是将来在代码块使用this对象成员的时候可以省略this,比如_m,_v,_c等都是属于this的。也就是vue实例的方法

- _c() 在 src/core/instance/render.js
- _m() _v() _s()在src/core/instance/render-helpes/index.js

### 模版编译的结果下
- render 函数的核心就是调用_c()方法,也就是createElement()函数,生成VNode,最后返回
- _c(tag, data, children, normalizationType)有4个参数

### 工具 Vue template Explorer

[template Explorer](https://template-explorer.vuejs.org/)

### 编译的入口函数

- 定义在src/platforms/web/entry-runtime-with-compiler.js
- 把template转换成render 函数 调用compilerToFunctions(),还有staticRenderFns, 然后把生成的render 和 staticRenderFns记录到对应的options属性中
```js
const { render, staticRenderFns } = compileToFunctions(template, {
  outputSourceRange: process.env.NODE_ENV !== 'production',
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
  delimiters: options.delimiters,
  comments: options.comments
}, this)
options.render = render
options.staticRenderFns = staticRenderFns
```
- compileToFunctions 由 createComplie 由函数生成,定义在src/web/compiler/index.js
- createComplie 由createCompilerCreator生成,主要做了三件事, 把模版装换成AST 抽象语法树
- 抽象语法树,用来以树形的方式描述代码的结构
- 二是优化抽象语法树
- 三 把抽象语法书生成字符串形式的js代码

- 见图 模版编译xmind

### 模版编译的过程 compileToFunctions
- 定义的位置 src/compiler/create-compiler.js

- 在这个函数最后返回了compilerT9oFunctions
- 在createCompileToFunctionFn定义了一个cache对象,通过Object.create(null)创建

- 1.读取缓存中的CompiledFunctionResult对象,如果有直接返回
- 2.把模版编译为编译对象(render, staticRenderFns),字符串形式代码
- 3.把字符串形式的js 代码装换成js方法
- 4.缓存并返回res对象(render, staticRenderFns方法)

### 编译过程-compile
- 接收两个参数
```js
function compile (
  template: string,
  options?: CompilerOptions
)
```
- 合并选项,调用baseCompiler()进行编译,记录错误,返回编译好的对象

### 模版编译过程-baseCompiler-AST
- 定义在src/compiler/index.js中
- 调用parse函数将模版转换成AST抽象语法书,优化抽象语法树,最后返回一个VNode

**抽象语法树**
- 抽象语法书简称AST(Abstract Syntax Tree)
- 使用对象的形式描述树形的代码结构
- 此处的抽象语法树是用来描述树形结构的HTML字符串

**为什么要使用抽象语法树**
- 模版字符串装换成AST后,可以通过AST对模版做优化处理
- 标记模版中的静态内容,在patch的时候直接跳过静态内容
- 在patch的过程中静态内容不需要对比和重新渲染
- astexplorer.net AST工具

### 模版编译过程-baseCompile-parse

- parse 首先去解析options成员,然后定义了一些变量和成员
- 对模版解析
- 返回root

- patch 会依次遍历html模版字符串,转换成ast对象,html中和指令和属性都会记录到相应属性上