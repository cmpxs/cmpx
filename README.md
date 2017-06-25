
## 概述

Cmpx是全完基于typesctipt语言编写的较底层MV绑定核心库，并没有完整的架构层，所以目前非常合适轻量的应用场景；但基于它，你可以很容易根据自己场景编写出架构层，起码绑定方面已经不用考虑，专心实现合适自己场景的架构，这也是编写Cmpx的目的。

## 特点

- 轻量、简单、易用和组件化，只定义一个类和模板即可；
- 运行效率高，将模板直接编译成可执行的JS；
- 与平台无关，底层只负责将模板编译成JS和同步数据机制，各平台可以自行配置并应用，如：IE8等。但自带的[Browser](https://github.com/cmpxs/cmpx/blob/master/src/browser.ts)只是支持只支持IE9及以上，可以参考它来配置；

## 使用说明

### 代码与演示

- 以下所有代码都摘取：[https://github.com/cmpxs/cmpx-demo](https://github.com/cmpxs/cmpx-demo)
- 演示地址：[https://cmpxs.github.io/cmpx-demo/](https://cmpxs.github.io/cmpx-demo/)
- 以上cmpx-demo里是一个很好开发环境，里面基于webpack搭建并提供了cmpx-loader负责编译模板等


### 启动

- 在index.html里放置一个\<app\>

```html
<body>
    <!--定义app-->
    <app></app>
</body>
```

- AppComponet.ts 里定义APP组件，并使用修释符VM定义name为app和tmpl等内容

```typescript
//引入Componet, VM
import { Componet, VM } from "cmpx";

//使用@VM配置模板和样式等信息
@VM({
    //定义标签名称，对应该为app
    name:'app',
    //模板内容
    tmpl:`<div class="app">
        <div class="head">{{this.name}}</div>
    </div>`,
    //样式
    style:`
        .app .head {
            margin: 5px 10px;
            font-size: 18px;
        }
    `
})
//继承Componet类获取相关方法，你可以根据自己需要写基类
export default class AppComponet extends Componet {
    name = "app demo"

    constructor(){
        super();
    }

}
```

- 在Index.ts里引用App组件并启动

```typescript

import { Browser } from "cmpx";
import AppComponet from './AppComponet';

//使用Browser启用App组件
new Browser().boot(AppComponet);

```

### 修释符VM参数

```typescript

import { Componet, VM } from "cmpx";
import FormComponet from './FormComponet';

@VM({
    //标签名称
    name:'app',
    //模板所引用的类库，这里是一个Form组件
    include:[ FormComponet ],
    //模板内容
    tmpl:`<div class="app">
        <div class="app">{{this.name}}</div>
        <fromtext />
    </div>`,
    //模板Url,引用外部模板,相对于本ts文件路径，cmpx-loader编译用到
    tmplUrl:'tmpl1.thml',
    //样式内容
    style:`
        .app .head {
            margin: 5px 10px;
            font-size: 18px;
        }
    `,
    //样式Url,引用外部style,相对于本ts文件路径，cmpx-loader编译用到
    styleUrl:'css1.css'
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
