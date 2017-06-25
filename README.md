
## 概述

Cmpx是全完基于typesctipt语言编写的较底层MV绑定核心库，并没有完整的架构层，所以目前非常合适轻量的应用场景；但基于它，你可以很容易根据自己场景编写出架构层，起码绑定方面已经不用考虑，专心实现合适自己场景的架构，这也是编写Cmpx的目的。

## 特点

- 轻量、简单、易用和组件化，只定义一个类和模板即可；
- 运行效率高，将模板直接编译成可执行的JS；
- 与平台无关，底层只负责将模板编译成JS和同步数据机制，各平台可以自行配置并应用，如：IE8等。但自带的[Browser](https://github.com/cmpxs/cmpx/blob/master/src/browser.ts)只是支持只支持IE9及以上，可以参考它来配置；

## 使用说明

### 启动

- index.html

```html
<body>
    <app></app>
</body>
```

- app 代码

```typescript
import { Componet, VM } from "cmpx";

@VM({
    name:'app',
    tmpl:`<div class="app">
        <div>{{this.name}}</div>
    </div>`,
    style:`
        .app .head {
            margin: 5px 10px;
            font-size: 18px;
        }
    `
})
export default class AppComponet extends Componet{
    name = "app demo"

    constructor(){
        super();
    }

}
```




## 环境安装

- 安装全局

```
npm install -g typescript tsc typeings rollup
```

- 安装开发环境

```
npm install
```

- 开启

```
npm satrt
```
