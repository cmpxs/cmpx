import { CompileSubject } from './compileSubject';
import { compileItem } from './compileItem';

export class Componet extends compileItem {
    readonly $parent: Componet;
    readonly $children: Array<Componet> = [];
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
            this.onUpdate(function(){}, p);
        }, p);
    }

}
