import { CompileSubject, CompileRender, VM } from './compile';

export class Componet {
    readonly $name: string;
    readonly $parent: Componet;
    readonly $children: Array<Componet> = [];
    readonly $subject: CompileSubject;
    //readonly $elements: Array<HTMLElement | Text> = [];
    readonly $parentElement: HTMLElement;

    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    $update(p?: any) {
        if (this.$isDisposed) return;
        this.onUpdateBefore(() => {
            if (this.$isDisposed) return;
            this.$subject.update({
                componet: this,
                param: p
            });
        }, p);
        this.onUpdate(function(){}, p);
    }

    private updateId:any;
    /**
     * 步异步更新View，View与Componet数据同步
     * @param p 传入参数
     */
   $updateAsync(callback?:()=>void, p?:any){
       this.updateId && clearTimeout(this.updateId);
        this.updateId = setTimeout(() => {
            this.updateId = null;
            this.$update(p);
            callback && callback.apply(this);
        }, 5);
    }

    /**
     * 将模板生成CompileRender, 用于include标签动态绑定用
     * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
     * @param tmpl 模板文本
     * @param p 传入模板参数
     */
    $render(tmpl: string | Function): CompileRender {
        var rd = new CompileRender(tmpl);
        return rd;
    }

    /**
     * 在解释View之前触发，一般准备数据用
     * @param cb 处理完成后，通知继续处理
     * @param p 传入的参数
     */
    onInit(cb: (err?: any) => void, p?: any): void {
        cb && cb();
    }

    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    onReady(cb: (err?: any) => void, p?: any): void {
        cb && cb();
    }

    /**
     * $update前时触发
     * @param cb 处理完成后，通知继续处理
     */
    onUpdateBefore(cb: (err?: any) => void, p?: any): void {
        cb && cb();
    }

    /**
     * $update后时触发
     * @param cb 处理完成后，通知继续处理
     */
    onUpdate(cb: (err?: any) => void, p?: any): void {
        cb && cb();
    }

    /**
     * 是否已经释放
     */
    $isDisposed: Boolean = false;
    /**
     * 在componet释放前触发
     */
    onDispose() {
    }

    constructor() {
    }
}
