import { CmpxLib } from './cmpxLib';

export class CmpxEvent {
    private events: any[] = [];

    /**
     * 绑定事件
     * @param fn 绑定事件方法
     */
    on(fn: () => any) {
        this.events.push(fn);
    }

    /**
     * 解绑事件，如果没有指定方法，解绑所有事件
     * @param fn 解绑事件方法
     */
    off(fn?: () => any) {
        if (fn) {
            let index = CmpxLib.inArray(this.events, fn);
            index >= 0 && this.events.splice(index, 1);
        } else
            this.events = [];
    }

    /**
     * 触发事件, 返回最后一个事件值, 如果返回false中断事件
     * @param args 触发传入参数
     * @param thisArg this对象
     */
    trigger(args: any[], thisArg?: any): any {
        let ret: any;
        CmpxLib.each(this.events, function (item: any) {
            ret = item && item.apply(thisArg, args);
            return ret;
        });
        return ret;
    }
}