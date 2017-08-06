
## 概述

Cmpx是全完基于typesctipt语言编写的较底层MV绑定核心框架，并没有完整的架构层，所以目前非常合适轻量的应用场景；但基于它，你可以很容易根据自己场景编写出架构层级的框架，起码绑定方面已经不用考虑，专心实现合适自己场景的架构，这也是编写Cmpx的目的。

## 特点

- 轻量、简单、易用和组件化，只定义一个类和模板即可；
- 运行效率高，将模板直接编译成可执行的JS；
- 与平台无关，底层只负责将模板编译成JS和同步数据机制，各平台可以自行配置并应用，如：IE8等。但自带的[Browser](https://github.com/cmpxs/cmpx/blob/master/src/browser.ts)只是支持只支持IE9及以上，可以参考它来配置；

## 启动例子

### 代码与演示

- 以下所有代码都摘取：[https://github.com/cmpxs/cmpx-demo](https://github.com/cmpxs/cmpx-demo)
- 演示地址：[https://cmpxs.github.io/cmpx-demo/](https://cmpxs.github.io/cmpx-demo/)
- cmpx-demo是一个开始环境，里面基于webpack搭建并提供了cmpx-loader负责编译模板等


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
//引入Componet, VMComponet
import { Componet, VMComponet } from "cmpx";

//使用@VM配置模板和样式等信息
@VMComponet({
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

## 组件

### 修释符@VMComponet

- 修释符@VM主要用于配置组件的模板、样式等；以下是它的配置项说明：

```typescript

import { Componet, VMComponet } from "cmpx";
import FormComponet from './FormComponet';

@VMComponet({
    //标签名称
    name:'app',
    //模板所引用的类库，这里是一个Form组件
    include:[ FormComponet ],
    //模板内容
    tmpl:`<div class="app">
        <div class="app">{{this.name}}</div>
        <fromtest />
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

### 组件方法

- $update：Cmpx不支持自动同步View数据，必须手动调用$update来同步View数据，但可以基于它来实现自动同步，比如加上自己一层基类来扩展这一特性；
- $updateAsync：与$update一样，延后同步数据，如果多个会合并为一个；
- $render：定义一个动态模板，并使用{{inlude}}加载


```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'app',
    tmpl:`<div class="app">
        {{this.text}}
        {{includ render="this.render1" /}}
    </div>`
})
export default class AppComponet extends Componet{

    text = "hello world"

    render1 = this.$render(`<div>{{this.text}}</div>`);

    constructor(){
        super();
        
        setTimeout(()=>{
            //改变this.text
            this.text += new Date().valueOf();
            //使用$update同步数据
            this.$update();
        }, 1000);
    }

}
```

### 组件事件

- onChanged()：每次数据与视图更新（同步）发生改变后触发；
- onInit()：在组件视图初始化后触发，此时视图还没插入到dom， 一次性事件；
- onReady()：组件视图已经处理完成时触发， 一次性事件；
- onUpdate()：每次数据与视图更新（同步）后触发；
- onDispose()：在componet释放前触发；

```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'app',
    tmpl:`<div class="app">
        {{this.text}}
    </div>`
})
export default class AppComponet extends Componet{

    text = "hello world"

    onInit(){
        console.log('onInit');
        setTimeout(()=>{
            this.text += new Date().valueOf();
            //表示处理完成
            super.onInit();
        }, 1000);
    }

    onReady(){
        console.log('onReady');
        super.onReady();
    }

    onUpdate(){
        console.log('onUpdate');
        super.onUpdate();
    }

    onDispose(){
        super.onDispose();
        console.log('onDispose');
    }

}
```

## 模板语法&语句

### 绑定符 {{js表达式}}

- 绑定符方向
1. 只读：{{this.text + new Date().valueOf()}}
2. 打印：{{: this.text}}，这个用于一次打印内容并不是绑定，提高性能，多用于for
3. 只写：{{> this.text}}
4. 读写：{{# this.text}}
5. 事件：{{@ this.click(event,element)}}，可以传入event和element

- 使用this.$update同步数据
- 绑定符只能用于textNode和标签属性内容
- 绑定符里的this都为对应的组件实例
- 请看下面代码的注释说明

```typescript
import { Componet, VMComponet } from "cmpx";
import FormComponet from './FormComponet';

@VMComponet({
    name:'app',
    include:[ FormComponet ],
    tmpl:`<div class="app">

        <!--只绑定，$update后同步数据-->
        你好，{{this.text}}

        <!--打印，$update无效-->
        你好，{{: this.text}}

        <!--只写，input改变内容后，同步到this.text-->
        <input type="text" value="{{> this.text}}" />

        <!--读写，input改变内容后，同步到this.text，同样$update也会显示到input-->
        <input type="text" model="{{# this.text}}" />

        <!--事件-->
        <button click="{{@ this.click(event, element)}}">点我</button>        

        <!--读写，formtest的属性与this.text是双向两步的-->
        <formtest text="{{# this.text}}" />

    </div>`
})
export default class AppComponet extends Componet{

    text = "hello world"

    click(event, element) {
        alert('click');
    }

    constructor(){
        super();
        
        setTimeout(()=>{
            //改变this.text
            this.text += new Date().valueOf();
            //使用$update同步数据
            this.$update();
        }, 1000);
    }

}
```

### 模板{{if}}语句

- {{if}}语句用于控制View的显示分支

```html
<div class="app">
    {{if this.index == 0}}
       <span>index:0</span>
    {{else this.index == 1}}
       <span>index:1</span>
    {{else}}
       <span>index:其它</span>
    {{/if}}
</div>
```

### 模板{{ifx}}语句

- 与{{if}}作用是一样，不同在于不会删除内容，而是暂时与View分离

```html
<div class="app">
    {{ifx this.index == 0}}
       <span>index:0</span>
    {{else this.index == 1}}
       <span>index:1</span>
    {{else}}
       <span>index:其它</span>
    {{/ifx}}
</div>
```

### 模板{{for}}语句

- 常用方式，这方式只要this.list的元素有变动(添加、删除等)，整个{{for}}内容重新构建

#### {{for}} 内部变量

- $index（项名称_index）：当前的index
- $count（项名称_count）：数据的长度
- $last（项名称_last）：是否第一项
- $first（项名称_first）：是否最后项
- $odd（项名称_odd）：是否奇数项
- $even（项名称_even）：是否偶数项

```html
<div class="app">
    {{for item in this.list}}
      index({{: $index}}): {{: item.name}}
      index({{: item_index}}): {{: item.name}}
      {{for user in item.children}}
        <!--使用（项名称_index）来读取上层for的index-->
        list index:{{: item_index}}
        user index:{{: user_index}} | {{: $index}}
      {{/for}}
    {{/for}}
</div>
```

### 模板{{forx}}语句

- 与{{for}}使用一样，这方式只要this.list的元素有变动(添加、删除等)，会同步性更新，现在有的元素节点不会给删除等

```html
<div class="app">
    {{forx item in this.list}}
      index({{: $index}}): {{: item.name}}
    {{/forx}}
</div>
```

- 自定义sync方式，请参考：[ForDemoComponetaaa](https://github.com/cmpxs/cmpx-demo/blob/master/src/expression/ForDemoComponet.ts)

```html
<div class="app">
    {{forx item in this.list sync="this.syncFn"}}
      index({{: $index}}): {{: item.name}}
    {{/forx}}
</div>
```

### 模板{{tmpl}}语句

- {{tmpl}}用于定义一个模板

```html
<div class="app">
    <!--定义id为tmpl1模板，将给include用-->
    {{tmpl id="tmpl1"}}
    <span>index:1</span>
    {{/tmpl}}
</div>
```

### 模板{{include}}语句

- 引用{{tmpl}}模板

```html
<div class="app">
    <!--定义id为tmpl1模板，将给include用-->
    {{tmpl id="tmpl1"}}
    <span>index:1</span>
    {{/tmpl}}

    <div>
        <!--引用tmpl1模板， 注意：如果本组件没有定义tmpl1模板，include会向所有父级组件查找模板-->
        {{include tmpl="tmpl1" /}}
    </div>
</div>
```

- 引用{{tmpl}}模板，并传送参数

```html
<div class="app">
    <!--定义id为tmpl1模板，设置参数index和coude-->
    {{tmpl id="tmpl1" let="index=param.index,count=param.count"}}
     <span>index:{{index}} {{param.index}}</span>
    {{/tmpl}}

    <div>
        {{for item in this.list}}
        <!--引用tmpl1模板， 传送index和count-->
            {{include tmpl="tmpl1" param="{index:$index, count:$count}" /}}
        {{/for}}
    </div>
</div>
```

- 引用render模板（动态引用模板），并传送参数

```html
<div class="app">
    <!--定义id为tmpl1模板，设置参数index和coude-->

    <div>
        {{for item in this.list}}
        <!--引用tmpl1模板， 传送index和count-->
            {{include render="this.render1" param="{index:$index}" /}}
        {{/for}}
    </div>
</div>
```

```typescript
export default class AppComponet extends Componet{

    render1 = this.$render(`<span>index:{{param.index}}</span>`);

}
```

- include默认内容模板

```html
<div class="app">
    <div>
        {{include tmpl="tmpl1"}}
            <!--如果没有定义tmpl1模板，使用这里的内容-->
            <span>include内容</span>
        {{/include}}
    </div>
</div>
```

### 模板变量$var与$array

- 定义模板变量与使用

```html
<div class="app">
    <div>
        <!--定义输入框为input1-->
        <input type="text" $var="input1" />

        <!--使用input1, 注意：必须先定义后使用-->
        {{inpu1.value}}

        <!--定义组件为user1-->
        <user $var="user1" />
        {{user1.text}}
    </div>
    <div>
        {{for item in this.list}}
            <!--定义divList数组-->
            <div $array="divList">{{$index}}</div>
        {{/for}}
        <!--使用divList-->
        {{divList[0].innerText}}
    </div>
</div>
```

- 在类里引用模板变量，注意：要在onReady后才用使用

```typescript
export default class AppComponet extends Componet{
    //引用模板变量input1
    @VMVar()
    input1:HTMLElement;

    //引用模板变量input1
    @VMVar('input1')
    inputEle:HTMLElement;

    //引用组件变量user1, 实现组件间访问
    @VMVar()
    user1:userComponet;

    //引用模板变量divList
    @VMVar()
    divList:HTMLElement[];

    click(){
        alert(this.input1.value);
    }

    onReady(b){
        this.input1.value
        super.onReady();
    }

}
```

## 组件&&组件

### 组件的标签属性绑定(通讯)

- 定义child组件

```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'child',
    tmpl:`<div class="child">
        {{this.name}}
    </div>`
})
export default class ChildComponet extends Componet{

    name = "child name"

}
```

- 在App组件里使用child组件，并使用属性通讯

```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'app',
    tmpl:`<div class="app">
        <!--将child组件的name属性双向绑定app组件的childName-->
        <child name="{{# this.childName}}" />
    </div>`
})
export default class AppComponet extends Componet{

    childName:string;

    onReady(){
        setTimeout(()=>{
            this.childName = "小华";
            super.onReady();
        }, 1000);
    }
}
```

### 组件的标签事件绑定(通讯)

- 定义child组件

```typescript
import { Componet, VMComponet, CmpxEvent } from "cmpx";

@VMComponet({
    name:'child',
    tmpl:`<div class="child">
        {{this.name}}
    </div>`
})
export default class ChildComponet extends Componet{

    name = "child name",
    //定义事件
    changeName:CmpxEvent = new CmpxEvent();

    onReady(){
        setTimeout(()=>{
            this.changeName.trigger([this.name]);
            super.onReady();
        }, 1000);
    }

}
```

- 在App组件里使用child组件，并使用事件通讯

```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'app',
    tmpl:`<div class="app">
        <!--绑定changeName事件-->
        <child changeName="{{@ this.change}}" />
    </div>`
})
export default class AppComponet extends Componet{

    childName:string;

    change(name){
        this.childName = name;
    }
}
```

### 使用$var操控组件

- 定义child组件

```typescript
import { Componet, VMComponet } from "cmpx";

@VMComponet({
    name:'child',
    tmpl:`<div class="child">
        {{this.name}}
    </div>`
})
export default class ChildComponet extends Componet{

    name = "child name",

}
```

- 在App组件里定义child1，并使用对child1操作

```typescript
import { Componet, VMComponet, VMVar } from "cmpx";

@VMComponet({
    name:'app',
    tmpl:`<div class="app">
        <!--定义为child1-->
        <child $var="child1" />
    </div>`
})
export default class AppComponet extends Componet{

    childName:string;

    //引用child1
    @VMVar()
    child1:ChildComponet;

    onReady(){
        //操作this.child1
        this.childName = this.child1.name;
        super.onReady();
    }

}
```

## 多平台

-  在各平台可以自行配置并应用，如：IE8等。但自带的[Browser](https://github.com/cmpxs/cmpx/blob/master/src/browser.ts)只是支持只支持IE9及以上，可以参考它来配置；



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
