
import { CompileSubject } from './compileSubject';
import { Componet } from './componet';
import { HtmlDef } from './htmlDef';

export class Bind {
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
        this.$componet.$updateAsync(p);
    }

    onChanged(): void{

    }

    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    onReady(): void {
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
