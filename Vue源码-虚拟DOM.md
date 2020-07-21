### 什么是虚拟DOM
- 虚拟DOM(Virtual DOM) 是使用JavaScript对象描述真的DOM
- Vue.js 中的虚拟DOM借鉴Snabbdom,并添加了Vue.js的特性、
- 例如: 指令和组件机制

**为什么要使用虚拟DOM**
- 避免直接操作DOM,提高开发效率
- 作为一个中间层可以跨平台
- 虚拟DOM不一定可以提高性能
- 首次渲染的时候回增加开销
- 复杂视图情况下提升渲染性能

### 如何创建虚拟DOM
**h 函数**
- vm.$createElement(tag, data, children, normalizeChildren)
- tag
  - 标签名称或者组件对象
- data
  - 描述tag,可以设置DOM的属性或者标签的属性
- children
  - tag中文本内容或者子节点

**Vnode**
Vnode的核心属性
- tag
- data
- children
- text
- elm
- key
```js
const vm = new Vue({
  render (h) {
    h(tag, data, children)
    return h('h1', this.msg)
    return h('h1', { domProps: { innerHTML: this.msg }})
    return h('h1', { attrs: { id: 'title'}}, this.msg)
    const vnode = h('h1', {
      attrs: { id: 'title' }
    },
    this.msg
    )
    console.log(vnode)
    return vnode
  },
  data: {
    msg: 'Hello msg'
  }
})
```

### 整体过程分析
- 见为知笔记图

### createElement
VNode的创建过程

定义在src/core/vdom/create-element.js

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

首先判断了参数的问题,调用_createElement(),在该函数中创建了Vnode的对象,判断Data是否为空, 如果data不为空并且Data有ob属性,则说明data是响应式的数据,如果是响应式的数据会调用createEmptyVNode()

### update
定义在 src/core/instance/lifecycle.js
```js
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  updateComponent = () => {
    ...
  }
} else {
  updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }
}
```

```js
// 首次渲染会调用,数据更新会调用
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const restoreActiveInstance = setActiveInstance(vm)
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  restoreActiveInstance()
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
  // updated hook is called by the scheduler to ensure that children are
  // updated in a parent's updated hook.
}
```
将创建好的VNode对象传递刚给update方法
核心是调用了vm.__patch__方法,在调用之前,判断了prevVnode
prevVnode是从Vue实例获取_vnode,而_vnode是记录之前所处理的vnode对象
如果不存在vnode,则说明是首次渲染,会调用__patch__方法,传入真实DOM vm.$el,第二个参数就是Vnode

在__patch__方法中会把真实DOM转换成虚拟DOM,然后和新的Vnode进行比较,并且会把比较的结果更新到真实的DOM,最后将返回的结果存储到$el

当数据改变后,会继续调用update方法,此时prevVnode有值,就会执行
`vm.$el = vm.__patch__(prevVnode, vnode)` 会将oldVnode和newVnode传递给patch方法,然后通过patch方法进行比较差异,将差异更新到真实DOM,把DOM返回存储到$el

### patch函数初始化

定义在src/platforms/web/runtime/index.js

```js
import { patch } from './patch'
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

和平台相关,设置patch方法之前判断了是否是浏览器环境,如果是返回patch函数,如果不是,返回空函数noop

```js
/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })

```

接下来 patch 函数通过createPatchFunction生成的,需要传入两个参数nodeOps,modules

- nodeOps 里面主要进行DOM操作
- platformModules 和平台相关,导出模块,操作属性和样式,导出了生命周期钩子函数create,update
- baseModules
```js
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}
  // modules 节点的属性/事件/样式的操作
  // nodeOps节点操作
  const { modules, nodeOps } = backend
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        // cbs['update'] = [updateAttrs, updateClass, update]
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  ...
}
```
createPatchFunction类似snabbdom的init,在这个函数最后返回了patch函数,接收一个参数,参数有两个属性,`modules`, `nodeOps`,
cbs 存储钩子函数,遍历所有钩子函数的名称,把名称作为cbs的对象属性,初始化一个数组,接着遍历所有的modules,如果modules定义了相关钩子函数,则取出放到cbs数组中

### patch函数执行过程
```js
return function patch (oldVnode, vnode, hydrating, removeOnly) {
if (isUndef(vnode)) {
  if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
  return
}

let isInitialPatch = false
const insertedVnodeQueue = []
```

