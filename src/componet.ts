import { CompileSubject } from './compileSubject';

export class Componet {
    readonly $name: string;
    readonly $subject: CompileSubject;
    readonly $parent: Componet;
    readonly $children: Array<Componet> = [];
    readonly $parentElement: HTMLElement;

    /**
     * 更新(同步)视图，视图与数据同步
     * @param p 传入参数
     */
    $update(p?: any) {
        if (this.$isDisposed) return;
        this.clearUpdateTime();
        this.$subject.update({
            componet: this,
            param: p
        });
    }

    private updateId: any;
    private clearUpdateTime(){
        if(this.updateId){
            clearTimeout(this.updateId);
            this.updateId = null;
        }
    }
    /**
     * 步异步更新(同步)视图，视图与数据同步
     * @param p 传入参数
     */
    $updateAsync(callback?: () => void, p?: any) {
        this.clearUpdateTime();
        this.updateId = setTimeout(() => {
            this.updateId = null;
            this.$update(p);
            callback && callback.apply(this);
        }, 5);
    }

    /**
     * 将模板生成CompileRender, 用于include标签动态绑定用
     * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
     * @param context 模板文本
     */
    $render(context: string | Function | Componet): any {
        //var rd = new CompileRender(context);
        return context;
    }

    /**
     * 在组件视图初始化后触发，此时视图还没插入到dom， 一次性事件
     */
    onInit(): void {
    }

    /**
     * 组件视图已经处理完成时触发， 一次性事件
     */
    onReady(): void {
        this.$update();
    }

    /**
     * 每次数据与视图更新（同步）后触发
     */
    onUpdate(): void {
    }

    /**
     * 每次数据与视图更新（同步）发生改变后触发
     */
    onChanged():void{
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
