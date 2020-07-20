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