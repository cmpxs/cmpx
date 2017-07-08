
import { CompileSubject } from './compileSubject';
import { Componet } from './componet';
import { HtmlDef } from './htmlDef';

export class AttrBase {
    readonly $name: string;
    readonly $subject: CompileSubject;
    readonly $componet: Componet;
    readonly element: HTMLElement;

    constructor(element:HTMLElement){
        this.element = element;
    }

    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    $update(p?: any) {
        if (this.$isDisposed) return;
        this.$componet.$update(p);
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

    private _content:any;
    /**
     * 设置或获取属性内容
     * @param p 属性内容
     */
    content(p?:any){
        if (arguments.length == 0)
            return this._content;
        else
            this._content = p;
    }

    private compileInfo;
    private getCompileInfo(){
        return this.compileInfo || (this.compileInfo = {subject:this.$subject, componet:this.$componet});
    }

    css(name:string, value?:any){
        return this.attr('style', value, name);
    }

    attr(name:string, value?:any, subName?:string){
        let attrDef = HtmlDef.getHtmlAttrDef(name);
        if (arguments.length == 0){
            return attrDef.getAttribute(this.element, name, subName, this.getCompileInfo());
        } else
            attrDef.setAttribute(this.element, name, value, subName, this.getCompileInfo());
    }

    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    onReady(): void {
    }

    onRead(): void {

    }

    onWrite(): void{

    }

    /**
     * $update后时触发
     * @param cb 处理完成后，通知继续处理
     */
    onUpdate(): void {
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

}
