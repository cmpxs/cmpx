import CmpxLib from './cmpxLib';
import { HtmlDef, HtmlTagDef, IHtmlAttrDef, ICreateElementAttr } from './htmlDef';
import { Componet } from './componet';
import CmpxEvent from './cmpxEvent';


var _undef: any;

interface IBindInfo {
    type: string;
    content: string;
}

/**
 * 标签信息
 */
interface ITagInfo {
    tagName: string;
    //是否标签，如：<div>
    target: boolean;
    //是否指令，如：{{for}}
    cmd: boolean;
    find: string;
    content: string;
    attrs: Array<IAttrInfo>;
    end: boolean;
    single: boolean;
    index: number;
    //是否为绑定
    bind?: boolean;
    bindInfo?: IBindInfo;
    children?: Array<ITagInfo>;
    parent?: ITagInfo;
    componet?: boolean;
    htmlTagDef?: HtmlTagDef;
}


/**
 * 属性信息
 */
interface IAttrInfo {
    name: string;
    value: string;
    bind: boolean;
    bindInfo?: IBindInfo;
    extend?: any;
}

//新建一个text节点
var _newTextContent = function (tmpl: string, start: number, end: number): ITagInfo {
        var text = tmpl.substring(start, end),
            bind = _cmdDecodeAttrRegex.test(text),
            bindInfo: IBindInfo = bind ? _getBind(text, '"') : null;
        return {
            tagName: '',
            target: false,
            cmd: false,
            find: text,
            content: bind ? "" : text,
            attrs: null,
            end: true,
            single: true,
            index: start,
            bind: bind,
            bindInfo: bindInfo
        };
    },
    _singleCmd = {
        'include': true
    },
    _encodeURIComponentEx = function (s: string): string {
        return encodeURIComponent(s).replace(/'/g, '%27');
    },
    //将{{this.name}}绑定标签转成$($this.name$)$
    _cmdEncodeAttrRegex = /\{\{\{((?:.|\r|\n)*?)\}\}\}|\{\{((?!\/|\s*(?:if|else|for|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm,
    _makeTextTag = function (tmpl: string): string {
        //
        return tmpl.replace(_cmdEncodeAttrRegex, function (find, content, content1) {
            return ['$($', _encodeURIComponentEx(content||content1), '$)$'].join('');
        });
    },
    //把$($this.name$)$还原
    _cmdDecodeAttrRegex = /\$\(\$(.+?)\$\)\$/gm,
    _backTextTag = function (tmpl: string): string {
        //
        return tmpl.replace(_cmdDecodeAttrRegex, function (find, content) {
            return ['{{', decodeURIComponent(content), '}}'].join('');
        });
    },
    //查找分析tag和cmd
    _tagInfoRegex = /\<\s*(\/*)\s*([^<>\s]+)\s*([^<>]*?)(\/*)\s*\>|\{\{\s*(\/*)\s*([^\s\{\}]+)\s*(.*?)(\/*)\}\}/gim,
    _makeTagInfos = function (tmpl: string): Array<ITagInfo> {
        var lastIndex = 0, list: Array<ITagInfo> = [];

        tmpl = _makeTextTag(tmpl);
        tmpl = HtmlDef.handleTagContent(tmpl);
        tmpl.replace(_tagInfoRegex, function (find: string, end1: string, tagName: string,
            tagContent: string, end2: string, txtEnd1: string, txtName: string, txtContent: string, txtEnd2: string, index: number) {

            if (index > lastIndex) {
                list.push(_newTextContent(tmpl, lastIndex, index));
            }

            var cmd = !!txtName,
                htmlTagDef = cmd ? null : HtmlDef.getHtmlTagDef(tagName),
                single = !!end2 || !!txtEnd2 || (cmd ? _singleCmd[txtName] : htmlTagDef.single),
                end = !!end1 || !!txtEnd1 || single;

            if (cmd || !(single && !!end1)) {

                var attrs = !cmd && !!tagContent ? _getAttrInfos(tagContent) : null;
                if (cmd) {
                    if ((single || !end)) {
                        switch (txtName) {
                            case 'for':
                                attrs = _getForAttrInfos(txtContent);
                                break;
                            case 'tmpl':
                            case 'include':
                                attrs = _getAttrInfos(txtContent);
                                break;
                        }
                    }
                } else {
                    attrs = !!tagContent ? _getAttrInfos(tagContent) : null;
                }

                var item: ITagInfo = {
                    tagName: (tagName || txtName).toLowerCase(),
                    target: !cmd,
                    cmd: cmd,
                    find: find,
                    content: tagContent || txtContent,
                    attrs: attrs,
                    end: end,
                    single: single,
                    index: index,
                    htmlTagDef: htmlTagDef,
                    componet: cmd ? false : !!_registerVM[tagName]
                };
                list.push(item);
            }

            lastIndex = index + find.length;

            return find;
        });
        var index = tmpl.length;
        if (index > lastIndex) {
            list.push(_newTextContent(tmpl, lastIndex, index));
        }
        var outList: Array<ITagInfo> = [];
        _makeTagInfoChildren(list, outList, list.length);
        return outList;
    },
    //获取attrInfo
    _attrInfoRegex = /\s*([^= ]+)\s*=\s*(?:(["'])((?:.|\n|\r)*?)\2|([^"' ><]*))|\s*([^= /]+)\s*/gm,
    _getAttrInfos = function (content: string): Array<IAttrInfo> {
        var attrs: Array<IAttrInfo> = [];
        content.replace(_attrInfoRegex, function (find: string, name: string, split: string,
            value: string, value1: string, name1: string, index: number) {
            value1 && (split = "\"", value = value1);
            var bind = _cmdDecodeAttrRegex.test(value),
                bindInfo = bind ? _getBind(value, split) : null;
            attrs.push({
                name: (name || name1).toLowerCase(),
                value: value,
                bind: bind,
                bindInfo: bindInfo
            });
            return find;
        });
        return attrs;
    },
    //获取cmd form attrInfo
    //_forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*(?:\s*tmpl\s*=\s*([\'\"])(.*?)\3)*/i,
    _forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*(?:\s*(sync)(?:\s*=\s*([\'\"])(.*?)\4)*)*/i,
    _getForAttrInfos = function (content: string): Array<IAttrInfo> {
        var extend = _forAttrRegex.exec(content);
        var attrs: Array<IAttrInfo> = [{
            name: '',
            value: '',
            bind: true,
            extend: {
                item: extend[1],
                datas: extend[2],
                sync: !!extend[3],
                syncCT: extend[5]
            }
        }];
        return attrs;
    },
    _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/,
    _removeEmptySplitRegex = /^['"]{2,2}\+|\+['"]{2,2}/g,
    _onlyBindRegex = /^\$\(\$[^$]*\$\)\$$/,
    //获取内容绑定信息，如 name="aaa{{this.name}}"
    _getBind = function (value: string, split: string): IBindInfo {
        value = _escapeBuildString(value);

        let write: string, event: string,
            onceList = [], read: boolean = false, isOnce: boolean = false,
            onlyBing = _onlyBindRegex.test(value),
            readTxt:string;

        let type: string = '', reg: any, readContent: string = [split, value.replace(_cmdDecodeAttrRegex, function (find: string, content: string, index: number) {
            content = decodeURIComponent(content);
            reg = _bindTypeRegex.exec(content);
            let txt: string;
            if (reg) {
                type = reg[1];
                txt = reg[2];
            } else {
                type = '';
                txt = content;
            }
            readTxt = '';
            switch (type) {
                case ':'://一次只读
                    onceList.push(txt);
                    isOnce = true;
                    readTxt = onlyBing ? 'once0' : [split, 'once' + (onceList.length - 1), split].join('+');
                    break;
                case '@'://事件
                    event = txt;
                    break;
                case '>'://只写
                    write = txt;
                    break;
                case '#'://读写
                    write = txt;
                case '<'://只读
                default:
                    read = true;
                    readTxt = onlyBing ? txt : [split, 'CmpxLib.toStr(' + txt + ')', split].join('+');
                    break;
            }
            return readTxt;
        }), split].join('');

        if (onlyBing){
            readContent = isOnce ? 'once0' : readTxt;
        }
        //readContent = readContent.replace(_removeEmptySplitRegex, '');

        var once: string;
        if (write || read || isOnce || onceList.length > 0) {
            if (isOnce) {
                let oList = [];
                CmpxLib.each(onceList, function (item: string, index: number) {
                    oList.push(['once', index, ' = ', onlyBing ? item : ('CmpxLib.toStr('+ item+ ')')].join(''));
                });
                once = 'var ' + oList.join(',') + ';';
            }
            write && (write = 'function(val){ ' + write + ' = val; }');
            event = null;
        } else if (event) {
            event = 'function(event){ ' + event + '; }';
        }

        readContent = `(function(){
  ${once ? once : ''}
  return {
    once:${once ? (read ? 'false' : 'true') : 'false'},
    read:${read || isOnce ? 'function(){ return ' + readContent + '; }' : 'null'},
    write:${write ? write : 'null'},
    event:${event ? event : 'null'}
  };
}).call(componet)`;

        return { type: type, content: readContent };
    },
    _makeTagInfoChildren = function (attrs: Array<ITagInfo>, outList: Array<ITagInfo>,
        len: number, index: number = 0, parent: ITagInfo = null): number {
        var item: ITagInfo;
        while (index < len) {
            item = attrs[index++];
            if (item.cmd || item.target) {
                if (item.single)
                    outList.push(item);
                else if (item.end) {
                    break;
                } else {
                    outList.push(item);
                    item.children = [];
                    index = _makeTagInfoChildren(attrs, item.children, len, index, item);
                    if (item && item.cmd && item.tagName == 'else')
                        break;
                }
            } else {
                outList.push(item);
            }
        }
        return index;
    };


export interface IVMConfig {
    //标签名称
    name: string;
    //模板要引用的类库，如组件
    include?:any[];
    //模板，可以编译后的function, 如果有配置tmplUrl, 优先使用tmplUrl
    tmpl?: string | Function;
    //模板url，可以编译后的function，如果加载失败使用tmpl内容
    tmplUrl?: string | Function;
    //样式文本, 可以和sytleUrl同时使用
    style?: string;
    //样式url, 可以和sytle同时使用
    styleUrl?: string;
}

interface IVM {
    render: CompileRender;
    componetDef: Function;
    vm?:IVMConfig;
}

var _registerVM: { [selector: string]: IVM } = {},
    _vmName = '__vm__',
    _getVmConfig = function (componetDef: any): IVMConfig {
        return componetDef.prototype[_vmName];
    },
    _getVmByComponetDef = function (componetDef: any): { render: CompileRender, componetDef: Function } {
        var config = _getVmConfig(componetDef);
        return config ? _registerVM[config.name] : null;
    },
    _readyRd = false,
    _renderPR = [];

/**
 * 注入组件配置信息
 * @param config 
 */
export function VM(vm: IVMConfig) {
    return function (constructor: Function) {
        _registerVM[vm.name] = {
            render: null,
            vm:vm,
            componetDef: constructor
        };
        var rdF = function () {
            _registerVM[vm.name].render = new CompileRender(vm.tmpl, constructor);
            let head = document.head;
            if (vm.style) {
                head.appendChild(HtmlDef.getHtmlTagDef('style').createElement('style', [{
                    name: 'type', value: 'text/css'
                }], head, vm.style));
            }
            if (vm.styleUrl) {
                head.appendChild(HtmlDef.getHtmlTagDef('link').createElement('link', [{
                    name: 'rel', value: 'stylesheet'
                }, {
                    name: 'href', value: vm.styleUrl
                }], head, vm.style));
            }
            //优先tmplUrl
            let tmplUrl: any = vm.tmplUrl;
            if (CmpxLib.isString(tmplUrl) && _loadTmplFn) {
                _tmplCount++;
                _loadTmplFn(tmplUrl, function (tmpl: string | Function) {
                    _registerVM[vm.name].render = new CompileRender(tmpl || vm.tmpl || '', constructor);
                    _tmplCount--;
                    _tmplChk();
                });
            } else
                _registerVM[vm.name].render = new CompileRender(tmplUrl || vm.tmpl || '', constructor);
        };
        _readyRd ? rdF() : _renderPR.push(rdF);
        constructor.prototype.$name = vm.name;
        constructor.prototype[_vmName] = vm;
    };
}

let _tmplCount = 0, _tmplFnList = [], _tmplLoaded = function (callback) {
    if (_tmplCount == 0)
        callback && callback();
    else
        callback && _tmplFnList.push(callback);
}, _tmplChk = function () {
    (_tmplCount == 0) && CmpxLib.each(_tmplFnList, function (item: any) {
        console.log('aaa');
        item();
    });
};

interface IViewvarDef {
    [name: string]:string;
}
var _viewvarName = '__viewvar__',
    _getViewvarDef = function (componet: Componet): IViewvarDef {
        return componet[_viewvarName];
    };
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function viewvar(name?: string) {
    return function (componet: Componet, propKey: string) {
        name || (name = propKey);
        var vv: IViewvarDef = (componet[_viewvarName] || (componet[_viewvarName] = {}));
        vv[name || propKey] = propKey;
    }
}

export interface ISubscribeEvent {
    componet: Componet;
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
    isRemove?: boolean;
}

export class CompileSubject {

    constructor(subject?: CompileSubject, exclude?: { [type: string]: boolean }) {
        if (subject) {
            if (!(this.isRemove = subject.isRemove)) {
                this.linkParam = subject.subscribe({
                    init: (p: ISubscribeEvent) => (!exclude || !exclude.init) && this.init(p),
                    update: (p: ISubscribeEvent) => (!exclude || !exclude.update) && this.update(p),
                    ready: (p: ISubscribeEvent) => (!exclude || !exclude.ready) && this.ready(p),
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

    subscribe(p: ISubscribeParam): ISubscribeParam {
        if (!this.isRemove) {
            p.update && this.subscribeIn('update', p);
            p.ready && this.subscribeIn('ready', p);
            p.remove && this.subscribeIn('remove', p);
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

    unSubscribe(p: ISubscribeParam): void {
        if (!this.isRemove){
            p.update && this.unSubscribeIn('update', p);
            p.ready && this.unSubscribeIn('ready', p);
            p.remove && this.unSubscribeIn('remove', p);
            p.init && this.unSubscribeIn('init', p);
        }
    }

    private linkParam: ISubscribeParam;
    private subject: CompileSubject;
    unLinkSubject(): CompileSubject {
        this.subject && this.subject.unSubscribe(this.linkParam);
        return this;
    }

    isInit: boolean = false;
    private initList:ISubscribeParam[];
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
    update(p: ISubscribeEvent) {
        if (this.isRemove) return;
        CmpxLib.each(this.updateList, function (fn:any) {
            fn && fn(p);
        });
    }

    isReady:boolean = false;
    private readyList:ISubscribeParam[];
    ready(p: ISubscribeEvent) {
        if (this.isRemove) return;
        var list = this.readyList;
        this.readyList = [];
        list && list.reverse();
        CmpxLib.each(list, function (fn:any) {
            fn && fn(p);
        });
    }

    isRemove: boolean = false;
    private removeList:ISubscribeParam[];
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


let _tmplName = '__tmpl__',
    _getComponetTmpl = function (componet: Componet, id: string): any {
        let tmpls = componet[_tmplName];
        if (!tmpls || !tmpls[id])
            return componet.$parent ? _getComponetTmpl(componet.$parent, id) : null;
        else
            return tmpls[id];
    },
    _insertAfter = function (newElement: Node, refElement: Node, parent: Node) {
        if (!parent)return;
        let nextSibling = refElement.nextSibling;
        if (nextSibling) {
            parent.insertBefore(newElement, nextSibling);
        } else
            parent.appendChild(newElement);
    },
    _createTempNode = function (): Node {
        return document.createTextNode('');
        // let element:Node = document.createElement('script');
        // element['type'] = 'text/html';
        // return element;
    },
    _getRefNode = function (parentNode: Node): Node {
        var tNode: Node = _createTempNode();
        parentNode.appendChild(tNode);
        return tNode;
    },
    _equalArrayIn = function (array1: Array<any>, array2: Array<any>) {
        var ok = true;
        CmpxLib.each(array1, function (item, index) {
            if (item != array2[index]) {
                ok = false; return false;
            }
        });
        return ok;
    },
    _equalArray = function (array1: Array<any>, array2: Array<any>): boolean {
        if ((!array1 || !array2)) return array1 == array2;

        return array1.length == array2.length && _equalArrayIn(array1, array2);
    },
    _getParentElement = HtmlDef.getParentElement,
    _removeChildNodes = function (childNodes: Node[]) {
        if (childNodes && childNodes.length > 0) {
            let pNode: Node;
            CmpxLib.each(childNodes, function (item: Node) {
                (pNode = _getParentElement(item)) && pNode.removeChild(item);
            });
        }
        return null;
    };

export class CompileRender {

    /**
     * 编译的结果，Function
     */
    readonly contextFn: Function;
    private componetDef: any;
    private param: Object;

    /**
     * 
     * @param tmpl html模板文本
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    constructor(context: any, componetDef?: Componet | Function, param?: Object) {
        this.componetDef = componetDef;
        this.param = param;
        let fn: any;
        if (CmpxLib.isString(context)) {
            let tagInfos = _makeTagInfos(CmpxLib.trim(context, true));
            fn = _buildCompileFn(tagInfos);
            //console.log(tagInfos);
        } else
            fn = context;

        // console.log(fn.toString());

        this.contextFn = fn;
    }

    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    complie(refNode: Node, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject) => void, subjectExclude?: { [type: string]: boolean }, param?: any): { newSubject: CompileSubject, refComponet: Componet } {
        var componetDef: any = this.componetDef;

        subject || (subject = (parentComponet ? parentComponet.$subObject : null));
        subjectExclude || (subjectExclude = {});
        //subjectExclude.remove = true;

        let componet: any,
            isNewComponet: boolean = false,
            parentElement: HTMLElement = _getParentElement(refNode),
            newSubject: CompileSubject = new CompileSubject(subject, subjectExclude);
        if (componetDef) {
            isNewComponet = true;
            componet = new componetDef();
            componet.$name = name;
            componet.$subObject = newSubject;
            componet.$parentElement = parentElement;
            componet.$parent = parentComponet;

            parentComponet && parentComponet.$children.push(componet);

        } else {
            //如果没有componetDef，为临时tmpl
            //传入的parentComponet为当前的componet
            componet = parentComponet;
        }

        //如果临时tmpl没有parentComponet报错
        if (!componet) {
            throw new Error('render缺少Componet参数');
        }
        //注意parentElement问题，但现在context只能放{{tmpl}}
        contextFn && contextFn(componet, parentElement, newSubject);

        newSubject.subscribe({
            remove: function (p: ISubscribeEvent) {
                let rmFn = function(){
                    let vv:IViewvarDef = _getViewvarDef(componet);
                    CmpxLib.eachProp(vv, function(item){
                        this[item] = null;
                    }, componet);
                    isNewComponet && (componet.$isDisposed = true, componet.onDispose());
                    if (p.componet == componet)
                        childNodes = _removeChildNodes(childNodes);

                };//end rmFn
                try {
                    rmFn();
                } catch (e) {
                    CmpxLib.trace(e);
                } finally {

                    if (isNewComponet) {
                        if (parentComponet && !parentComponet.$isDisposed) {
                            var childs = parentComponet.$children,
                                idx = childs.indexOf(componet);
                            (idx >= 0) && childs.splice(idx, 1);
                        }

                        componet.$subObject = componet.$children = //componet.$elements =
                            componet.$parent = componet.$parentElement = null;
                    }
                }
            }
        });
        let childNodes: Node[];
        let fragment: DocumentFragment, initFn = () => {
            newSubject.init({
                componet: componet
            });
            fragment = document.createDocumentFragment();
            subject && subject.subscribe({
                remove: function (p: ISubscribeEvent) {
                    fragment = refNode = componet = parentElement = parentComponet = null;
                }
            });
            let pt = CmpxLib.extend({}, this.param)
            this.contextFn.call(componet, CmpxLib, Compile, componet, fragment, newSubject, CmpxLib.extend(pt, param));
            childNodes = CmpxLib.toArray(fragment.childNodes);
            newSubject.update({
                componet: componet
            });
            readyFn();
        },
        readyFn = function () {
            _insertAfter(fragment, refNode, _getParentElement(refNode));
            isNewComponet && componet.onReady(function () { }, null);
            newSubject.ready({
                componet: componet
            });
            //reay后再次补发update
            newSubject.update({
                componet: componet
            });
        };
        if (isNewComponet) {
            componet.onInit(function (err) {
                initFn();
            }, null);
        }
        else
            initFn();

        return { newSubject: newSubject, refComponet: componet };
    }
}

let _loadTmplFn: (url: string, cb: (tmpl: string | Function) => void) => void;

export class Compile {

    /**
     * 编译器启动，用于htmlDef配置后
     */
    public static startUp() {
        if (_readyRd) return;
        _readyRd = true;
        CmpxLib.each(_renderPR, function (item: any) {
            item();
        });
        _renderPR = null;
    }

    public static loadTmplCfg(loadTmplFn: (url: string, cb: (tmpl: string | Function) => void) => void): void {
        _loadTmplFn = loadTmplFn;
    }

    public static createComponet(
        name: string, componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (component: Componet, element: HTMLElement, subject: CompileSubject) => void
    ): void {
        if (subject.isRemove) return;

        let vm: IVM = _registerVM[name],
            componetDef: any = vm.componetDef,
            refNode = _getRefNode(parentElement);

        Compile.renderComponet(componetDef, refNode, function () { }, componet, subject, contextFn);

    }

    public static setViewvar(addFn:()=>void, removeFn:()=>void, componet: Componet, element: HTMLElement, subject: CompileSubject){
        let vInfo = addFn && addFn.call(componet, componet, element),
            vv:IViewvarDef = _getViewvarDef(componet),
            propKey = vv && vv[vInfo.name];

        (vv && propKey) && (componet[propKey] = vInfo.value);

        subject.subscribe({
            remove:function(){
                removeFn && removeFn.call(componet, componet, element);
            }
        });
    }

    public static setAttributeCP(element: HTMLElement, name: string, content: any, componet: Componet, subject: CompileSubject): void {
        let isObj = !CmpxLib.isString(content),
            parent = componet.$parent;
        if (isObj) {
            let isEvent = !!content.event,
                update;
            if (isEvent) {
                let isBind = false,
                    eventDef = componet[name],
                    eventFn: any = function (args) { return content.event.apply(componet, args); };
                eventDef || (eventDef = componet[name] = new CmpxEvent());
                subject.subscribe({
                    update: function (p: ISubscribeEvent) {
                        if (isBind) return;
                        isBind = true;
                        eventDef.on(eventFn);
                    },
                    remove: function (p: ISubscribeEvent) {
                        isBind && eventDef.off();
                        componet[name] = null;
                    }
                });

            } else {
                let value: any, newValue: any,
                    isWrite: boolean = !!content.write,
                    isRead: boolean = !!content.read,
                    writeFn = function (p: ISubscribeEvent) {
                        newValue = componet[name];
                        if (value != newValue) {
                            value = newValue;
                            content.write.call(parent, newValue);
                            parent.$updateAsync();
                        }
                    },
                    readFn = function(p: ISubscribeEvent){
                        if (isRead) {
                            newValue = content.read.call(parent);
                            if (value != newValue) {
                                value = newValue;
                                componet[name] = value;
                                componet.$updateAsync();
                            }
                        }
                    },
                    pSubP:ISubscribeParam = isWrite ? parent.$subObject.subscribe({
                        update:readFn
                    }) : null;
                let attrDef: IHtmlAttrDef = HtmlDef.getHtmlAttrDef(name);
                subject.subscribe({
                    update: function (p: ISubscribeEvent) {
                        if (isRead) {
                            newValue = content.read.call(parent);
                            if (value != newValue) {
                                value = newValue;
                                componet[name] = value;
                                componet.$updateAsync();
                            } else if (isWrite) {
                                writeFn(p);
                            }
                        } else if (isWrite) {
                            writeFn(p);
                        }
                    },
                    remove:function(){
                        pSubP && parent.$subObject && parent.$subObject.unSubscribe(pSubP);
                    }
                });
            }
        } else
            componet[name] = content;
    }

    public static createElement(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => void, content?: string): void {

        if (subject.isRemove) return;

        let element: HTMLElement = HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content);
        parentElement.appendChild(element);
        contextFn && contextFn(componet, element, subject);
    }

    public static createTextNode(content: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject): Text {
        if (subject.isRemove) return;

        let isObj = !CmpxLib.isString(content),
            value: string = '',
            once: boolean = isObj ? content.once : false,
            readFn = isObj ? 　content.read : null,
            textNode = document.createTextNode(isObj ? (once ? readFn.call(componet) : value) : content);
        parentElement.appendChild(textNode);
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                if (!once && readFn) {
                    var newValue = readFn.call(componet);
                    if (value != newValue) {
                        value = newValue;
                        textNode[('textContent' in textNode) ? 'textContent' : 'nodeValue'] = newValue;
                    }
                }
            }
        });
        return textNode;
    }

    public static setAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject): void {
        let isObj = !CmpxLib.isString(content);
        if (isObj) {
            let isEvent = !!content.event,
                update, eventDef;
            if (isEvent) {
                let isBind = false,
                    eventFn = function (e) { return content.event.call(componet, event); };
                eventDef = HtmlDef.getHtmlEventDef(name);
                subject.subscribe({
                    update: function (p: ISubscribeEvent) {
                        if (isBind) return;
                        isBind = true;
                        eventDef.addEventListener(element, name, eventFn, false);
                    },
                    remove: function (p: ISubscribeEvent) {
                        if (isBind) {
                            eventDef.removeEventListener(element, name, eventFn, false);
                        }
                    }
                });

            } else {
                let value: any = '', newValue: any,
                    isWrite: boolean = !!content.write,
                    isRead: boolean = !!content.read,
                    writeFn = function () {
                        newValue = attrDef.getAttribute(element, name);
                        if (value != newValue) {
                            value = newValue;
                            content.write.call(componet, newValue);
                            componet.$updateAsync();
                        }
                    };

                let attrDef: IHtmlAttrDef = HtmlDef.getHtmlAttrDef(name),
                    writeEvent = attrDef.writeEvent || ['change', 'click'];
                if (isWrite) {
                    eventDef = HtmlDef.getHtmlEventDef(name);
                    CmpxLib.each(writeEvent, function(item){
                        eventDef.addEventListener(element, item, writeFn, false);
                    });
                }
                subject.subscribe({
                    update: function (p: ISubscribeEvent) {
                        if (isRead) {
                            newValue = content.read.call(componet);
                            if (value != newValue) {
                                value = newValue;
                                attrDef.setAttribute(element, name, value, subName);
                            }
                        }
                    },
                    remove: function (p: ISubscribeEvent) {
                        if (isWrite) {
                            CmpxLib.each(writeEvent, function(item){
                                eventDef.removeEventListener(element, item, writeFn, false);
                            });
                        }
                    }
                });
            }
        } else
            HtmlDef.getHtmlAttrDef(name).setAttribute(element, name, content);
    }

    public static forRender(
        dataFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        eachFn: (item: any, count: number, index: number, componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject,
        syncFn:(item: any, count: number, index: number, newList:any[])=>number
    ): void {

        if (subject.isRemove || !dataFn || !eachFn) return;

        let refNode = _getRefNode(parentElement);

        let value: any, newSubject: CompileSubject;
        let childNodes: Node[],
            syncDatas:any[],
            removeFn = function () {
                childNodes = _removeChildNodes(childNodes);
            };
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                let datas = dataFn.call(componet, componet, parentElement, subject);
                if (!_equalArray(datas, value)) {

                    let isArray = CmpxLib.isArray(datas);

                    //如果有数据
                    if (datas){
                        //如果不是数组，转为一个数组
                        isArray || (datas = [datas]);

                        let count = datas.length;

                        if (syncFn){
                            //同步模式，同步性生成view
                            let lastNode:Node = refNode;

                            let rmList = [],    //要删除的数据
                                dataList = [];  //合并后的数据
                            (function(oldDatas, newDatas){
                                let hasList = [], nIdx;
                                //计算要删除的数据和保留的数据
                                CmpxLib.each(oldDatas, function(item, index){
                                    //在新数据的位置
                                    nIdx = syncFn.call(componet, item.data, count, index, datas);
                                    if (nIdx >=0 ){
                                        item.data = newDatas[nIdx];
                                        item.newIndex = nIdx;
                                        hasList.push(item);
                                    } else
                                        rmList.push(item);
                                });
                                //新数据与保留数据合并
                                CmpxLib.each(newDatas, function(item, index){
                                    //在保留数据里的位置
                                    nIdx = CmpxLib.inArray(hasList, function(item){ return item.newIndex == index; });
                                    if (nIdx >= 0){
                                        //保留数据，已有数据
                                        dataList.push(hasList[nIdx]);
                                    } else {
                                        //新数据, 没有fn属性
                                        dataList.push({
                                            index:index,
                                            data:item
                                        });
                                    }
                                });
                            })(syncDatas, datas);
                            syncDatas = dataList;
                            //删除多余节点(Node)
                            CmpxLib.each(rmList, function(item){
                                item.nodes = _removeChildNodes(item.nodes);
                                item.subject.remove({
                                    componet: componet
                                });
                                item.subject = item.nodes = null;
                            });
                            let lastIndex = -1;
                            CmpxLib.each(syncDatas, function (item, index) {
                                let fragm:DocumentFragment;

                                if (item.fn){
                                    //根据fn数据来确认保留数据

                                    if (item.index < lastIndex){
                                        //根据原有index，如果大过上一个从中保留数据的原有index,移动原来的node

                                        lastIndex = item.index;
                                        fragm = document.createDocumentFragment();
                                        CmpxLib.each(item.nodes, function (node) {
                                            fragm.appendChild(node);
                                        });
                                        item.fn.call(componet, item.data, count, index);
                                        item.subject.update({
                                            componet: componet
                                        });
                                        _insertAfter(fragm, lastNode, _getParentElement(lastNode));
                                    } else {
                                        //不用移动位置，只刷新数据

                                        lastIndex = item.index;
                                        //重新处理for 变量
                                        item.fn.call(componet, item.data, count, index);
                                        item.subject.update({
                                            componet: componet
                                        });
                                    }
                                    //设置现在的index
                                    item.index = index;

                                } else {
                                //如果不存在，新建

                                    let st = item.subject = new CompileSubject(subject);
                                    fragm = document.createDocumentFragment();
                                    item.fn = eachFn.call(componet, item.data, count, index, componet, fragm, st);
                                    item.nodes = CmpxLib.toArray(fragm.childNodes);
                                    st.update({
                                        componet: componet
                                    });
                                    _insertAfter(fragm, lastNode, _getParentElement(lastNode));
                                }
                                //设置新的loasNode，用于插入位置
                                lastNode = item.nodes[item.nodes.length-1] ||  lastNode;

                            });

                        } else {
                            //普通模式, 一次性全部重新生成view
                            let fragment = document.createDocumentFragment();
                            
                            removeFn();
                            newSubject && newSubject.remove({
                                componet: componet
                            });

                            newSubject = new CompileSubject(subject);

                            CmpxLib.each(datas, function (item, index) {
                                eachFn.call(componet, item, count, index, componet, fragment, newSubject);
                            });
                            childNodes = CmpxLib.toArray(fragment.childNodes);
                            newSubject.update({
                                componet: componet
                            });
                            _insertAfter(fragment, refNode, _getParentElement(refNode));
                            fragment = null;
                        }


                    } else
                        newSubject = null;

                    //如果是数组，复制一份，如果不是直接备份，有用比较
                    value = isArray ? datas.slice() : datas;
                }
            },
            remove: function (p: ISubscribeEvent) {
                removeFn();
                newSubject = childNodes = refNode = null;
            }
        });
    }

    public static ifRender(
        ifFun: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        trueFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        falseFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject
    ): void {

        if (subject.isRemove) return;

        var refNode = _getRefNode(parentElement);

        var value, newSubject: CompileSubject;
        var childNodes: Node[], removeFn = function () {
            childNodes = _removeChildNodes(childNodes);
        };
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                let newValue = !!ifFun.call(componet, componet, parentElement, subject);

                if (newValue != value) {
                    value = newValue;

                    removeFn();
                    newSubject && newSubject.remove({
                        componet: componet
                    });

                    newSubject = new CompileSubject(subject);

                    let fragment = document.createDocumentFragment();
                    if (newValue)
                        trueFn.call(componet, componet, fragment, newSubject);
                    else
                        falseFn.call(componet, componet, fragment, newSubject);
                    childNodes = CmpxLib.toArray(fragment.childNodes);
                    newSubject.update({
                        componet: componet
                    });
                    _insertAfter(fragment, refNode, _getParentElement(refNode));
                    fragment = null;
                }
            },
            remove: function (p: ISubscribeEvent) {
                removeFn();
                newSubject = childNodes = refNode = null;
            }
        });

    }

    public static tmplRender(id, componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) => void): void {

        if (subject.isRemove) return;

        var tmpls = componet[_tmplName];
        tmpls || (tmpls = componet[_tmplName] = {});

        tmpls[id] = function (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) {
            contextFn && contextFn.call(componet, componet, element, subject, param);
        };
    }

    public static includeRender(context: any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, param: any): void {
        if (!context || subject.isRemove) return;

        if (CmpxLib.isString(context)) {
            let tmpl = _getComponetTmpl(componet, context);
            tmpl && tmpl.call(componet, componet, parentElement, subject, param || {});
        } else {
            let render: CompileRender,
                preSubject: CompileSubject, preComponet: Componet,
                refNode = _getRefNode(parentElement);

            subject.subscribe({
                update: function (p: ISubscribeEvent) {
                    let newRender: CompileRender = context.call(componet);

                    if (newRender != render) {
                        render = newRender;

                        preSubject && preSubject.remove({
                            componet: preComponet
                        });

                        let { newSubject, refComponet } = newRender.complie(refNode, componet, subject, null, null, param);
                        preSubject = newSubject;
                        preComponet = refComponet;

                    }
                },
                remove: function (p: ISubscribeEvent) {
                    render = preSubject = preComponet = refNode = null;
                }
            });
        }
    }

    static renderComponet(componetDef: any, refNode: Node,
        complieEnd?: (newSubject: CompileSubject, refComponet: Componet) => void,
        parentComponet?: Componet, subject?: CompileSubject,
        contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject) => void): void {

        _tmplLoaded(function () {
            let vm = _getVmByComponetDef(componetDef),
                render = vm && vm.render;
            if (!vm) throw new Error('not find @VM default!');
            let { newSubject, refComponet } = render.complie(refNode, parentComponet, subject, contextFn, { update: true });
            complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
        });
    }

}

var _buildCompileFn = function (tagInfos: Array<ITagInfo>): Function {
        var outList = [], varNameList = [];

        _buildCompileFnContent(tagInfos, outList, varNameList, true);

        varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
        outList.unshift(`var __tmplRender = Compile.tmplRender,
        __createComponet = Compile.createComponet, __setViewvar = Compile.setViewvar,
        __setAttributeCP = Compile.setAttributeCP, __createElement = Compile.createElement,
        __setAttribute = Compile.setAttribute,__createTextNode = Compile.createTextNode,
        __forRender = Compile.forRender, __ifRender = Compile.ifRender,
        __includeRender = Compile.includeRender;`);

        return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', 'param', outList.join('\n'));
    },
    _buildCpFnRetRmRegex = /\s*\=\s*\[\s*\]\s*$/,
    _escapeStringRegex = /([\"\\])/gm,
    _escapeBuildString = function (s: string): string {
        return s ? s.replace(/([\"\\])/gm, '\\$1').replace(/\n/gm, '\\n').replace(/\r/gm, '\\r') : '';
    },
    _makeSubName = function (name): string[] {
        if (name.indexOf('.') > 0) {
            return name.split('.');
        } else
            return [name, ''];
    },
    _makeElementTag = function (tagName, attrs: Array<IAttrInfo>): { bindAttrs: Array<IAttrInfo>, stAtts: Array<ICreateElementAttr> } {
        var bindAttrs = [], stAtts = [], names: string[];
        CmpxLib.each(attrs, function (item: IAttrInfo) {
            if (item.name == '$var' || item.name == '$array') return;
            if (item.bind)
                bindAttrs.push(item);
            else {
                names = _makeSubName(item.name);
                stAtts.push({ name: names[0], value: _escapeBuildString(item.value), subName: names[1] });
            }
        });
        return { bindAttrs: bindAttrs, stAtts: stAtts };
    },
    _buildAttrContent = function (attrs: Array<IAttrInfo>, outList: Array<string>) {
        if (!attrs) return;
        let names: string[];
        CmpxLib.each(attrs, function (attr: IAttrInfo, index: number) {
            names = _makeSubName(attr.name);
            outList.push('__setAttribute(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject);');
        });
    },
    _buildAttrContentCP = function (attrs: Array<IAttrInfo>, outList: Array<string>) {
        if (!attrs) return;
        CmpxLib.each(attrs, function (attr: IAttrInfo, index: number) {
            if (attr.name == '$var') return;
            if (attr.bind)
                outList.push('__setAttributeCP(element, "' + attr.name + '", ' + attr.bindInfo.content + ', componet, subject);');
            else
                outList.push('__setAttributeCP(element, "' + attr.name + '", "' + _escapeBuildString(attr.value) + '", componet, subject);');
        });
    },
    _getViewvarName = function (attrs: Array<IAttrInfo>): { item: string, list: string } {
        let name = { item: null, list: null }, has = false;
        CmpxLib.each(attrs, function (attr: IAttrInfo, index: number) {
            if (attr.name == '$var') {
                name.item = CmpxLib.trim(attr.value);
                has = true;
                return false;
            } else if (attr.name == '$array') {
                name.list = CmpxLib.trim(attr.value);
                has = true;
                return false;
            }
        });
        return has ? name : null;
    },
    _getInsertTemp = function (preInsert: boolean) {
        return preInsert ? 'true' : 'false';
    },
    _getTagContent = function (tagInfo: ITagInfo): string {
        let content: string;
        CmpxLib.each(tagInfo.children, function (item: ITagInfo) {
            content = CmpxLib.decodeHtml(item.content);
        });
        return content;
    },
    _buildCompileFnForVar = function (itemName: string, outList: string[]) {
        let str = ['var ', itemName, '_index, ', itemName, '_count, $last, ', itemName, '_last, $first, ', itemName, '_first, $odd, ', itemName, '_odd, $even, ', itemName, '_even,\n',
                'setForVar = function (item, count, index) {\n',
                '$index = ', itemName, '_index = index, $count = ', itemName, '_count = count;\n',
                '$last = ', itemName, '_last = (count - index == 1), $first = ', itemName, '_first = (index == 0), $odd = ', itemName, '_odd = (index % 2 == 0), $even = ', itemName, '_even = !$odd;\n',
                '};\n',
                'setForVar.call(componet, item, $count, $index);'
            ].join('');
        outList.push(str);
    },
    _buildCompileFnContent = function (tagInfos: Array<ITagInfo>, outList: Array<string>, varNameList: string[], preInsert: boolean, inclue?: string[]) {
        if (!tagInfos) return;

        CmpxLib.each(tagInfos, function (tag: ITagInfo, index: number) {
            let tagName = tag.tagName;
            //如果指定include, 非tagName或不包涵，不引入
            if (inclue && (!tagName || inclue.indexOf(tagName) < 0)) return;
            if (!tag.cmd) {
                if (tag.target) {
                    let hasChild: boolean = tag.children && tag.children.length > 0,
                        hasAttr: boolean = tag.attrs && tag.attrs.length > 0,
                        varName = hasAttr ? _getViewvarName(tag.attrs) : null;
                    if (varName) {
                        varName.item && varNameList.push(varName.item);
                        varName.list && varNameList.push(varName.list + ' = []');
                    }
                    if (tag.componet) {
                        if (hasChild || hasAttr || varName) {
                            outList.push('__createComponet("' + tagName + '", componet, element, subject, function (componet, element, subject) {');
                            if (varName) {
                                outList.push('__setViewvar(function(componet, element){');
                                varName.item && outList.push(varName.item + ' = this;');
                                varName.list && outList.push(varName.list + '.push(this);');
                                varName.item && outList.push('return {name:"'+varName.item+'", value:'+varName.item+'}');
                                varName.list && outList.push('return {name:"'+varName.list+'", value:'+varName.list+'}');
                                outList.push('}, function(componet, element){');
                                varName.item && outList.push(varName.item + ' = null;');
                                varName.list && outList.push('var idx = ' + varName.list + '.indexOf(this); idx >= 0 && ' + varName.list + '.splice(idx, 1);');
                                outList.push('}, componet, element, subject)');
                            }
                            _buildAttrContentCP(tag.attrs, outList);
                            //createComponet下只能放tmpl
                            _buildCompileFnContent(tag.children, outList, varNameList, preInsert, ['tmpl']);
                            outList.push('});');
                        } else {
                            outList.push('__createComponet("' + tagName + '", componet, element, subject);');
                        }
                        preInsert = true;
                    } else {
                        let htmlTagDef: HtmlTagDef = tag.htmlTagDef,
                            rawTag = htmlTagDef.raw,
                            tagContent = rawTag && _getTagContent(tag);
                        //如果rawTag没有子级
                        hasChild && (hasChild = !rawTag);
                        if (hasAttr || hasChild || varName) {

                            let { bindAttrs, stAtts } = _makeElementTag(tagName, tag.attrs);
                            outList.push('__createElement("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject) {');
                            if (varName) {
                                outList.push('__setViewvar(function(componet, element){');
                                varName.item && outList.push(varName.item + ' = element;');
                                varName.list && outList.push(varName.list + '.push(element);');
                                varName.item && outList.push('return {name:"'+varName.item+'", value:'+varName.item+'}');
                                varName.list && outList.push('return {name:"'+varName.list+'", value:'+varName.list+'}');
                                outList.push('}, function(componet, element){');
                                varName.item && outList.push(varName.item + ' = null;');
                                varName.list && outList.push('var idx = ' + varName.list + '.indexOf(element); idx >= 0 && ' + varName.list + '.splice(idx, 1);');
                                outList.push('}, componet, element, subject)');
                            }
                            _buildAttrContent(bindAttrs, outList);
                            hasChild && _buildCompileFnContent(tag.children, outList, varNameList, preInsert);

                            outList.push('}, "' + _escapeBuildString(tagContent) + '");');
                        } else {
                            outList.push('__createElement("' + tagName + '", [], componet, element, subject, null, "' + _escapeBuildString(tagContent) + '");');
                        }
                        preInsert = false;
                    }
                } else {
                    if (tag.bind) {
                        outList.push('__createTextNode(' + tag.bindInfo.content + ', componet, element, subject);');
                    } else
                        outList.push('__createTextNode("' + _escapeBuildString(tag.content) + '", componet, element, subject);');
                    preInsert = false;
                }
            } else {
                switch (tagName) {
                    case 'for':
                        var extend = tag.attrs[0].extend,
                            itemName = extend.item,
                            fSync = extend.sync
                        outList.push('__forRender(function (componet, element, subject) {');
                        outList.push('return ' + extend.datas + ';');
                        outList.push('}, function (' + itemName + ', $count, $index, componet, element, subject) {');
                        _buildCompileFnForVar(itemName, outList);
                        var forTmpl = extend.tmpl;
                        if (forTmpl)
                            outList.push('__includeRender("' + _escapeBuildString(forTmpl) + '", componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + itemName + ');');
                        else
                            _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('return setForVar;');

                        let fSyFn = 'null';
                        if (extend.sync){arguments
                            let syncCT = extend.syncCT;
                            //function(item, count, index, newList)=>返回index表示已存在的位置，-1表示不存在;
                            fSyFn = syncCT ? 'function(){ var fn = '+syncCT+'; return fn ? fn.apply(this, arguments) : -1; }'
                                : 'function(item, count, index, newList){ return newList ? newList.indexOf(item) : -1; }'
                        }

                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject, '+fSyFn+');');
                        preInsert = true;
                        break;
                    case 'if':
                        let ifFn = function (ifTag) {
                            let ifChild = ifTag.children,
                                hasElse = ifChild ? ifChild[ifChild.length - 1].tagName == 'else' : false,
                                elseTag = hasElse ? ifChild.pop() : null;
                            outList.push('__ifRender(function (componet, element, subject) {');
                            outList.push('return ' + (ifTag.content || 'true'));
                            outList.push('}, function (componet, element, subject) {');
                            _buildCompileFnContent(ifChild, outList, varNameList, preInsert);
                            outList.push('}, function (componet, element, subject) {');
                            if (hasElse) {
                                ifFn(elseTag);
                                //_buildCompileFnContent(elseTag.children, outList, varNameList, preInsert);
                            }
                            outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject);');
                        };
                        ifFn(tag);

                        preInsert = true;
                        break;
                    case 'include':
                        let incAttr = CmpxLib.arrayToObject<IAttrInfo>(tag.attrs, 'name'),
                            incTmpl = incAttr['tmpl'],
                            incParam = incAttr['param'] ? incAttr['param'].value : 'null',
                            incRender: any = incAttr['render'];
                        incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                        let context = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');
                        outList.push('__includeRender(' + context + ', componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + incParam + ');');
                        preInsert = true;
                        break;
                    case 'tmpl':
                        let tmplAttr = CmpxLib.arrayToObject<IAttrInfo>(tag.attrs, 'name'),
                            tmplId = tmplAttr['id'],
                            tmplLet = tmplAttr['let'];
                        outList.push('__tmplRender("' + (tmplId ? _escapeBuildString(tmplId.value) : '') + '", componet, element, subject, function (componet, element, subject, param) {');
                        tmplLet && outList.push('var ' + tmplLet.value + ';');
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('});');
                        break;
                }
            }
        });
    };