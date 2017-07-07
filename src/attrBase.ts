
import { CompileSubject } from './compileSubject';
import { compileItem } from './compileItem';
import { Componet } from './componet';
import { HtmlDef } from './htmlDef';

export class AttrBase extends compileItem {
    readonly $componet: Componet;
    public element: HTMLElement;

    constructor(element:HTMLElement){
        super();
        this.element = element;
    }

    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    $update(p?: any) {
        if (this.$isDisposed) return;
        this.onUpdateBefore(() => {
            if (this.$isDisposed) return;
            this.$componet.$update();
            this.onUpdate(function(){}, p);
        }, p);
    }

    private _content:any;
    $content(p?:any){
        if (arguments.length == 0)
            return this._content;
        else
            this._content = p;
    }

    setAttribute(name:string, value:any){
        HtmlDef.getHtmlAttrDef(name).setAttribute(this.element, name, value);
    }

    getAttribute(name:string){
        return HtmlDef.getHtmlAttrDef(name).getAttribute(this.element, name);
    }
}
