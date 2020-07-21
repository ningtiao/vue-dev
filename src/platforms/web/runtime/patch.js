/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)
// core中方法和平台无关,传入两个参数后,可以在上面的函数中使用这个参数
export const patch: Function = createPatchFunction({ nodeOps, modules })
