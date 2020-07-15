/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'
// dep 是个可观察对象, 可以有多个指令订阅它
let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // 静态属性,watcher 对象
  static target: ?Watcher;
  // dep实例id
  id: number;
  subs: Array<Watcher>;
  // dep 实例对应的watcher对象/订阅者数组
  constructor() {
    this.id = uid++
    this.subs = []
  }
  // 添加新的订阅者 watcher 对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  // 移除订阅者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 将观察者对象和watcher 建立依赖
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 调用每个订阅者的update方法实现更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// Dep.target 用来存放目前正在使用的watcher
// 全局唯一,并且一次也只能有一个watcher被使用
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []
// 入栈并将当前watcher赋值给Dep.target
// 父子组件嵌套的时候先把父组件对应的wacher入栈
// 再去处理子组件的watcher,子组件的处理完毕后,再把父组件对应的watcher出栈,继续操作
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  // 出栈操作
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
