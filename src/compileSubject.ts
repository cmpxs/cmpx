import { CmpxLib } from './cmpxLib';

export interface ISubscribeEvent {
    componet: any;
    param?: any;
}

export interface ISubscribeParam {
    //视图初始化
    init?: (p: ISubscribeEvent) => void;
    //更新视图
    update?: (p: ISubscribeEvent) => void;
    //视图准备好
    ready?: (p: ISubscribeEvent) => void;
    //节点或视图删除
    remove?: (p: ISubscribeEvent) => void;
    //分离节点
    detach?: (p: ISubscribeEvent) => void;
}

export class CompileSubject {

    constructor(subject?: CompileSubject, exclude?: { [type: string]: boolean }) {
        if (subject) {
            if (!(this.isRemove = subject.isRemove)) {
                this.linkParam = subject.subscribe({
                    init: (p: ISubscribeEvent) => (!exclude || !exclude.init) && this.init(p),
                    update: (p: ISubscribeEvent) => (!exclude || !exclude.update) && this.update(p),
                    ready: (p: ISubscribeEvent) => (!exclude || !exclude.ready) && this.ready(p),
                    detach: (p: ISubscribeEvent) => (!exclude || !exclude.detach) && this.detach(p),
                    remove: (p: ISubscribeEvent) => (!exclude || !exclude.remove) && this.remove(p)
                });
                this.subject = subject;
                this.isInit = subject.isInit;
                this.isReady = subject.isReady;
            }
        }
    }

    private subscribeIn(name:string, p: ISubscribeParam): void{
        let listName = name+'List',
            list = this[listName] || (this[listName] =  []);
        list.push(p[name]);
    }

    /**
     * 观察
     * @param p 观察内容
     */
    subscribe(p: ISubscribeParam): ISubscribeParam {
        if (!this.isRemove) {
            p.update && this.subscribeIn('update', p);
            p.remove && this.subscribeIn('remove', p);
            p.detach && this.subscribeIn('detach', p);
            if (this.ready)
                p.ready && p.ready(null);
            else
                p.ready && this.subscribeIn('ready', p);
            if (this.isInit)
                p.init && p.init(null);
            else
                p.init && this.subscribeIn('init', p);
        }
        return p;
    }

    private unSubscribeIn(name:string, p: ISubscribeParam): void{
        let list = this[name+'List'];
        if (list){
            let index = list.indexOf(p[name]);
            (index >= 0) && list.splice(index, 1);
        }
    }

    /**
     * 解除观察
     * @param p 观察内容
     */
    unSubscribe(p: ISubscribeParam): void {
        if (!this.isRemove){
            p.update && this.unSubscribeIn('update', p);
            p.ready && this.unSubscribeIn('ready', p);
            p.detach && this.unSubscribeIn('detach', p);
            p.remove && this.unSubscribeIn('remove', p);
            p.init && this.unSubscribeIn('init', p);
        }
    }

    private linkParam: ISubscribeParam;
    private subject: CompileSubject;
    /**
     * 解除观察Subject
     */
    unLinkSubject(): CompileSubject {
        this.subject && this.subject.unSubscribe(this.linkParam);
        return this;
    }

    /**
     * 是否已经初始化
     */
    isInit: boolean = false;
    private initList:ISubscribeParam[];
    /**
     * 发送初始化通知
     * @param p 发送事件参数
     */
    init(p: ISubscribeEvent) {
        if (this.isRemove) return;
        this.isInit = true;
        var list = this.initList;
        this.initList = [];
        CmpxLib.each(list, function (fn:any) {
            fn && fn(p);
        });
    }

    private updateList:ISubscribeParam[];
    /**
     * 发送更新通知
     * @param p 发送事件参数
     */
    update(p: ISubscribeEvent) {
        if (this.isRemove || this.isDetach) return;
        CmpxLib.each(this.updateList, function (fn:any) {
            fn && fn(p);
        });
    }

    /**
     * 是否已分离
     */
    isDetach: boolean = false;
    private detachList:ISubscribeParam[];
    /**
     * 发送分离通知，不删除
     * @param p 发送事件参数
     */
    detach(p: ISubscribeEvent) {
        if (this.isRemove) return;
        this.isDetach = !this.isDetach;
        CmpxLib.each(this.detachList, function (fn:any) {
            fn && fn(p);
        });
    }

    /**
     * 是否已经准备
     */
    isReady:boolean = false;
    private readyList:ISubscribeParam[];
    /**
     * 发送准备通知
     * @param p 发送事件参数
     */
    ready(p: ISubscribeEvent) {
        if (this.isRemove) return;
        var list = this.readyList;
        this.readyList = [];
        CmpxLib.each(list, function (fn:any) {
            fn && fn(p);
        });
    }

    /**
     * 是否已经删除
     */
    isRemove: boolean = false;
    private removeList:ISubscribeParam[];
    /**
     * 发送删除通知
     * @param p 发送事件参数
     */
    remove(p: ISubscribeEvent) {
        if (this.isRemove) return;
        this.isRemove = true;
        this.unLinkSubject();
        var removeList = this.removeList;
        this.clear();
        CmpxLib.each(removeList, function (fn:any) {
            fn && fn(p);
        });
    }

    private clear(){
        this.initList = this.readyList
            = this.updateList = this.removeList = null;
    }

}
