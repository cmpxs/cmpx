import { CmpxLib } from './cmpxLib';
import { HtmlDef, HtmlTagDef, IHtmlAttrDef, ICreateElementAttr } from './htmlDef';
import { Componet } from './componet';
import { CmpxEvent } from './cmpxEvent';
import { CompileSubject, ISubscribeEvent, ISubscribeParam } from './compileSubject';
import { Bind } from './bind';

export interface IVMBindConfig {
    name: string
}

var _getBindDef = function (target:any, name:string): typeof Bind {
        let context = VMManager.getBind(target, name);
        return context ? context.def : null;
    };

/**
 * 注入组件配置信息
 * @param config 
 */
export function VMBind(config: IVMBindConfig) {
    return function (constructor: typeof Bind) {
        let target = constructor.prototype,
            context = {
                name:config.name,
                type:'Bind',
                def:constructor
            };
        VMManager.setConfig(target, config);
        VMManager.include(target, context, null);
    };
}

var _attrEventName = '__attrEventName',
    _getBindEvents = function (bind: Bind) {
        return bind[_attrEventName];
    };
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function VMEvent(name?: string) {
    return function (bind: Bind, propKey: string) {
        name || (name = propKey);
        var events = (bind[_attrEventName] || (bind[_attrEventName] = []));
        events.push({
            name: name,
            fn: bind[propKey]
        });
    }
}

var _vmAttrName = '__attrNames',
    _getVmAttrs = function (target: any): { [name: string]: string } {
        return target[_vmAttrName];
    };

/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function VMAttr(name?: string) {
    return function (target: any, propKey: string) {
        name || (name = propKey);
        var names = (target[_vmAttrName] || (target[_vmAttrName] = {}));
        names[name] = propKey;
    }
}

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
    _cmdEncodeAttrRegex = /\{\{\{((?:.|\r|\n)*?)\}\}\}|\{\{((?!\/|\s*(?:if|ifx|else|for|forx|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm,
    _makeTextTag = function (tmpl: string): string {
        //
        return tmpl.replace(_cmdEncodeAttrRegex, function (find, content, content1) {
            return ['$($', _encodeURIComponentEx(content || content1), '$)$'].join('');
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
                single = !!end2 || !!txtEnd2 || (cmd ? (_singleCmd[txtName] && !!txtEnd2) : htmlTagDef.single),
                end = !!end1 || !!txtEnd1 || single;

            if (!(single && (!!end1 || !!txtEnd1))) {

                var attrs = !cmd && !!tagContent ? _getAttrInfos(tagContent) : null;
                if (cmd) {
                    if ((single || !end)) {
                        switch (txtName) {
                            case 'for':
                            case 'forx':
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
                    tagName: (tagName || txtName),
                    target: !cmd,
                    cmd: cmd,
                    find: find,
                    content: tagContent || txtContent,
                    attrs: attrs,
                    end: end,
                    single: single,
                    index: index,
                    htmlTagDef: htmlTagDef
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
                name: (name || name1),
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
            readTxt: string;

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

        if (onlyBing) {
            readContent = isOnce ? 'once0' : readTxt;
        }
        //readContent = readContent.replace(_removeEmptySplitRegex, '');

        var once: string;
        if (write || read || isOnce || onceList.length > 0) {
            if (isOnce) {
                let oList = [];
                CmpxLib.each(onceList, function (item: string, index: number) {
                    oList.push(['once', index, ' = ', onlyBing ? item : ('CmpxLib.toStr(' + item + ')')].join(''));
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

export interface IVMContext {
    name:string;
    type:string;
    [prop:string]:any;
}

let _vmName = "__vm__", _vmConfigName = 'config',
    _vmContextName = 'context', _vmOtherName = 'other';
export class VMManager {

    static parent:(target:any, context:IVMContext)=>any;

    /**
     * VM 内容
     * @param target 
     * @param name 
     * @param context 
     */
    static setVM(target:any, name:string, context:any): any {
        let vm = target[_vmName] || (target[_vmName] = {});
        return vm[name] = context;
    }

    static getVM(target:any, name:string): any {
        let vm = target[_vmName];
        return vm && vm[name];
    }

    static include(target:any, context:IVMContext, include:any[], parent?:any):any{
        let obj = {
            parent:null,
            context:context,
            componets:{},
            binds:{}
        }, temp:IVMContext;

        var a:Function;

        CmpxLib.each(include, function(item){
            temp = this.getContext(item.prototype);
            if (temp){
                switch(temp.type){
                    case 'Componet':
                        obj.componets[temp.name] = temp;
                        break;
                    case 'Bind':
                        obj.binds[temp.name] = temp;
                        break;
                }
            }
        }, this);
        return this.setVM(target, _vmContextName, obj);
    }

    private static getContext(target:any): IVMContext {
        let obj = this.getVM(target, _vmContextName);
        return obj && obj.context;
    }

    private static getContextEx(target:any, type:string, name:string): IVMContext {
        let obj = this.getVM(target, _vmContextName);
        let items = obj && obj[type],
            cp = items && items[name],
            parent;
        if (!cp && this.parent && obj.context){
            parent = this.parent(target, obj.context);
        }
        return cp || (parent && this.getContextEx(parent, type, name));
    }

    static getComponet(target:any, name?:string):IVMContext{
        return name ? this.getContextEx(target, 'componets', name)
            : this.getContext(target);
    }

    static getBind(target:any, name?:string):IVMContext{
        return name ? this.getContextEx(target, 'binds', name)
            : this.getContext(target);
    }

    /**
     * 配置
     * @param target 
     * @param config 
     */
    static setConfig(target:any, config:any): any{
        return this.setVM(target, _vmConfigName, config);
    }

    static getConfig(target:any): any{
        return this.getVM(target, _vmConfigName);
    }

    // private static getContext(target:any): any{
    //     return this.getVM(target, _vmContextName);
    // }

    // /**
    //  * 其它
    //  * @param target 
    //  * @param name 
    //  * @param context 
    //  */
    // static setOther(target:any, name:string, context:any){
    //     return this.setVM(target, _vmOtherName, context);
    // }

    // static getOter(target:any, name:string): any{
    //     return this.getVM(target, _vmOtherName);
    // }

    static getTarget(p:any, t:any):any{
        return (p instanceof t ? p : p.prototype);
    }

}

export interface IVMConfig {
    //标签名称
    name: string;
    //模板要引用的类库，如组件
    include?: any[];
    //模板，可以编译后的function, 如果有配置tmplUrl, 优先使用tmplUrl
    tmpl?: string | Function;
    //模板url，可以编译后的function，如果加载失败使用tmpl内容
    tmplUrl?: string | Function;
    //样式文本, 可以和sytleUrl同时使用
    style?: string | Function;
    //样式url, 可以和sytle同时使用
    styleUrl?: string | Function;
}

interface IVM extends IVMContext {
    render: CompileRender;
    componetDef: typeof Componet;
    vm?: IVMConfig;
}

var _readyRd = false,
    _renderPR = [];

/**
 * 注入组件配置信息
 * @param config 
 */
export function VMComponet(config: IVMConfig) {
    return function (constructor: Function) {
        let name = config.name,
            target = constructor.prototype,
            context = {
                name:name,
                type:'Componet',
                render: null,
                vm: config,
                componetDef: constructor
            };
        target.$name = config.name;
        VMManager.setConfig(target, config);
        //target[_vmName] = config;
        //VMManager.setContext(target, context);
        VMManager.include(target, context, config.include);
        var rdF = function () {
            let head = document.head;

            if (config.styleUrl && !CmpxLib.isString(config.styleUrl)) {
                config.style = (config.styleUrl as Function)();
                config.styleUrl = null;
            }
            if (config.style) {
                if (!CmpxLib.isString(config.style))
                    config.style = (config.style as Function)();
                head.appendChild(HtmlDef.getHtmlTagDef('style').createElement('style', [{
                    name: 'type', value: 'text/css'
                }], head, config.style as string));
            }
            if (config.styleUrl) {
                head.appendChild(HtmlDef.getHtmlTagDef('link').createElement('link', [{
                    name: 'rel', value: 'stylesheet'
                }, {
                    name: 'href', value: config.styleUrl as string
                }], head));
            }
            //优先tmplUrl
            let tmplUrl: any = config.tmplUrl;
            if (CmpxLib.isString(tmplUrl) && _loadTmplFn) {
                _tmplCount++;
                _loadTmplFn(tmplUrl, function (tmpl: string | Function) {
                    context.render = new CompileRender(tmpl || config.tmpl || '', constructor);
                    _tmplCount--;
                    _tmplChk();
                });
            } else
                context.render = new CompileRender(tmplUrl || config.tmpl || '', constructor);
        };
        _readyRd ? rdF() : _renderPR.push(rdF);
    };
}

let _tmplCount = 0, _tmplFnList = [], _tmplLoaded = function (callback) {
    if (_tmplCount == 0)
        callback && callback();
    else
        callback && _tmplFnList.push(callback);
}, _tmplChk = function () {
    (_tmplCount == 0) && CmpxLib.each(_tmplFnList, function (item: any) {
        item();
    });
};

interface IViewvarDef {
    [name: string]: string;
}
var _viewvarName = '__viewvar__',
    _getViewvarDef = function (componet: Componet): IViewvarDef {
        return componet && componet[_viewvarName];
    };
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function VMVar(name?: string) {
    return function (componet: Componet, propKey: string) {
        name || (name = propKey);
        var vv: IViewvarDef = (componet[_viewvarName] || (componet[_viewvarName] = {}));
        vv[name || propKey] = propKey;
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
        if (!parent) return;
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
    _equalObject = function (obj1, obj2) {
        if (obj1 == obj2) return true;
        if (!CmpxLib.isObject(obj2)) return false;

        var count = 0, ok = true;
        CmpxLib.eachProp(obj1, function (item, n) {
            count++;
            if (obj2[n] !== item) { ok = false; return false; }
        });
        ok && CmpxLib.eachProp(obj2, function () {
            count--;
        });
        return ok && (count === 0);
    },
    _equals = function(p, p1){
        if (CmpxLib.isArray(p))
            return _equalArray(p, p1);
        else if (CmpxLib.isObject(p))
            return _equalObject(p, p1);
        else
            return p == p1;
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
    },
    _detachElement = function (nodes: Node[]) {
        if (nodes && nodes.length > 0) {
            let //pNode:Node = _getParentElement(nodes[0]),
                fragment = document.createDocumentFragment();
            CmpxLib.each(nodes, function (item) {
                fragment.appendChild(item);
            });
            return fragment;
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
     * @param context (string | Function | Componet) html模板文本、编译后的function或Componet
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    constructor(context: any, componetDef?: Componet | Function, param?: Object) {
        if (context instanceof Componet) {
            this.componetDef = context;
            let vm = VMManager.getComponet(context) as IVM,
                render = vm && vm.render;
            this.contextFn = render.contextFn;
        } else {
            this.componetDef = componetDef;
            this.param = param;
            let fn: any;
            if (CmpxLib.isString(context)) {
                let tagInfos = _makeTagInfos(CmpxLib.trim(context, true));
                fn = _buildCompileFn(tagInfos);
            } else
                fn = context;

            this.contextFn = fn;
        }
    }

    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    complie(refNode: Node, attrs: ICreateElementAttr[], parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void, subjectExclude?: { [type: string]: boolean }, param?: Function): { newSubject: CompileSubject, refComponet: Componet } {
        var componetDef: any = this.componetDef;

        subject || (subject = (parentComponet ? parentComponet.$subject : null));
        subjectExclude || (subjectExclude = {});
        subjectExclude.ready = true;

        let componet: any,
            isNewComponet: boolean = false,
            parentElement: HTMLElement = _getParentElement(refNode),
            newSubject: CompileSubject = new CompileSubject(subject, subjectExclude);
        if (componetDef) {
            isNewComponet = true;
            componet = componetDef instanceof Componet ? componetDef : new componetDef();
            componet.$name = name;
            componet.$subject = newSubject;
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
        let vmAttrs = _getVmAttrs(componet);
        CmpxLib.each(attrs, function (item: ICreateElementAttr) {
            componet[(vmAttrs && vmAttrs[item.name]) || item.name] = item.value;
        });
        //注意parentElement问题，但现在context只能放{{tmpl}}
        contextFn && contextFn(componet, parentElement, newSubject, true);

        newSubject.subscribe({
            remove: function (p: ISubscribeEvent) {
                let rmFn = function () {
                    let vv: IViewvarDef = _getViewvarDef(componet);
                    CmpxLib.eachProp(vv, function (item) {
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

                        componet.$subject = componet.$children = //componet.$elements =
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
            let detachFr: DocumentFragment;
            subject && subject.subscribe({
                detach: function () {
                    if (componet.$isDisposed) return;
                    if (subject.isDetach)
                        detachFr = _detachElement(childNodes);
                    else {
                        if (isNewComponet)
                            newSubject.update({ componet: componet });
                        _insertAfter(detachFr, refNode, _getParentElement(refNode));
                        detachFr = null;
                    }
                },
                remove: function (p: ISubscribeEvent) {
                    fragment = refNode = componet = parentElement = parentComponet = null;
                }
            });
            let pt = CmpxLib.extend({}, this.param)
            this.contextFn.call(componet, CmpxLib, Compile, componet, fragment, newSubject, CmpxLib.extend(pt, param && param.call(componet)));
            childNodes = CmpxLib.toArray(fragment.childNodes);
            newSubject.update({
                componet: componet
            });
            readyFn();
        },
            readyFn = function () {
                _insertAfter(fragment, refNode, _getParentElement(refNode));
                let readyEnd = function () {
                    newSubject.ready({
                        componet: componet
                    });
                    //reay后再次补发update
                    newSubject.update({
                        componet: componet
                    });
                };
                if (isNewComponet)
                    componet.onReady(function () {
                        readyEnd();
                    }, null);
                else
                    readyEnd();
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

    public static createElementEx(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => void, content?: string, bindAttrs?:string): void {

        if (subject.isRemove) return;

        if (VMManager.getComponet(componet, name)) {
            Compile.createComponet.apply(this, arguments);
        } else {
            Compile.createElement.apply(this, arguments);
        }

    }


    public static createElement(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean, binds: any) => void, content?: string, bindAttrs?:string): void {

        if (subject.isRemove) return;

        let element: HTMLElement = HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content, { subject: subject, componet: componet });

        let attrList = [], bindList = [], binds = {}, vmAttrs, bindDef, bind, attrName,
            values = {};
        let makeAttrs = function (binds, bind, attrs) {
            CmpxLib.eachProp(attrs, function (item, n) {
                binds[n] = { bind: bind, attr: item, done: false };
            });
        };
        CmpxLib.each(attrs, function (item: ICreateElementAttr) {
            attrName = item.name;
            bindDef = _getBindDef(componet, attrName);
            if (bindDef) {
                bind = new bindDef(element);
                bindList.push(bind);
                vmAttrs = _getVmAttrs(bind);
                bind['$name'] = attrName;
                bind['$subject'] = subject;
                bind['$componet'] = componet;
                makeAttrs(binds, bind, vmAttrs);
            }
            values[attrName] = item.value;
            attrList.push(item);
        });
        bindAttrs &&　CmpxLib.each(bindAttrs.split(','), function(item){
            bindDef = _getBindDef(componet, item);
            if (bindDef) {
                bind = new bindDef(element);
                bindList.push(bind);
                vmAttrs = _getVmAttrs(bind);
                bind['$name'] = item;
                bind['$subject'] = subject;
                bind['$componet'] = componet;
                makeAttrs(binds, bind, vmAttrs);
            }
        });

        parentElement.appendChild(element);
        contextFn && contextFn(componet, element, subject, false, bind && binds);
        bind && CmpxLib.eachProp(binds, function (item, n) {
            Compile.setBindAttribute(element, n, '', values[n], componet, subject, false, binds);
        });
        bindList.length > 0 && CmpxLib.each(bindList, function (item) {
            Compile.setBind(element, componet, subject, item);
        });
    }

    public static createComponet(
        name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void
    ): void {
        if (subject.isRemove) return;

        let vm: IVM = VMManager.getComponet(componet, name) as IVM,
            componetDef = vm.componetDef,
            refNode = _getRefNode(parentElement);

            Compile.renderComponet(componetDef, refNode, attrs, function (subject, componet: Componet) {
        }, componet, subject, contextFn);

    }

    public static setViewvar(addFn: () => void, removeFn: () => void, componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) {
        let vInfo = addFn && addFn.call(isComponet ? componet : element),
            owner = isComponet ? componet.$parent : componet,
            vv: IViewvarDef = _getViewvarDef(owner),
            propKey = vv && vv[vInfo.name],
            hasDef = !!(vv && propKey);

        hasDef && (owner[propKey] = vInfo.value);

        subject.subscribe({
            remove: function () {
                hasDef && (owner[propKey] = null);
                removeFn && removeFn.call(isComponet ? componet : element);
            }
        });
    }
    public static setAttributeEx(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean, binds: any): void {
        if (isComponet) {
            Compile.setAttributeCP.apply(this, arguments);
        } else if (binds && binds[name]) {
            Compile.setBindAttribute.apply(this, arguments);
        } else {
            Compile.setAttribute.apply(this, arguments);
        }
    }
    public static setAttributeCP(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean): void {
        let isObj = !CmpxLib.isString(content),
            parent = componet.$parent,
            vmAttrs = _getVmAttrs(componet);
        vmAttrs && 　(name = vmAttrs[name] || name);
        if (isObj) {
            let isEvent = !!content.event,
                update;
            if (isEvent) {
                let isBind = false,
                    eventDef = componet[name],
                    eventFn: any = function () {
                        return content.event.apply(parent, arguments);
                    };
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
                    updateFn = function (p: ISubscribeEvent) {
                        if (isRead) {
                            newValue = content.read.call(parent);
                            if (!_equals(value, newValue)) {
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
                    pSubP: ISubscribeParam = isWrite || isRead ? parent.$subject.subscribe({
                        update: updateFn
                    }) : null;
                subject.subscribe({
                    update: updateFn,
                    remove: function () {
                        pSubP && parent.$subject && parent.$subject.unSubscribe(pSubP);
                    }
                });
            }
        } else
            componet[name] = content;
    }

    public static createTextNode(content: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject): Text {
        if (subject.isRemove) return;

        let isObj = !CmpxLib.isString(content),
            value: string = '',
            once: boolean = isObj ? content.once : false,
            readFn = isObj ? content.read : null,
            textNode = document.createTextNode(isObj ? (once ? readFn.call(componet) : value) : content);
        parentElement.appendChild(textNode);
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                if (!once && readFn) {
                    var newValue = readFn.call(componet);
                    if (!_equals(value, newValue)) {
                        value = newValue;
                        textNode[('textContent' in textNode) ? 'textContent' : 'nodeValue'] = newValue;
                    }
                }
            }
        });
        return textNode;
    }

    public static setAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean): void {
        let isObj = !CmpxLib.isString(content),
            compileInfo = { subject: subject, componet: componet };
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
                        eventDef.addEventListener(element, name, eventFn, false, compileInfo);
                    },
                    remove: function (p: ISubscribeEvent) {
                        if (isBind) {
                            eventDef.removeEventListener(element, name, eventFn, false, compileInfo);
                        }
                    }
                });

            } else {
                let value: any = '', newValue: any,
                    isWrite: boolean = !!content.write,
                    isRead: boolean = !!content.read,
                    writeFn = function () {
                        newValue = attrDef.getAttribute(element, name, '', compileInfo);
                        if (!_equals(value, newValue)) {
                            value = newValue;
                            content.write.call(componet, newValue);
                            componet.$updateAsync();
                        }
                    };

                let attrDef: IHtmlAttrDef = HtmlDef.getHtmlAttrDef(name),
                    writeEvent = attrDef.writeEvent || ['change', 'click'];
                if (isWrite) {
                    eventDef = HtmlDef.getHtmlEventDef(name);
                    CmpxLib.each(writeEvent, function (item) {
                        eventDef.addEventListener(element, item, writeFn, false);
                    });
                }
                attrDef.initAttribute && attrDef.initAttribute(element, name, isRead ? content.read.call(componet) : '', subName, compileInfo);
                subject.subscribe({
                    update: function (p: ISubscribeEvent) {
                        if (isRead) {
                            newValue = content.read.call(componet);
                            if (!_equals(value, newValue)) {
                                value = newValue;
                                attrDef.setAttribute(element, name, value, subName, compileInfo);
                            }
                        }
                    },
                    remove: function (p: ISubscribeEvent) {
                        if (isWrite) {
                            CmpxLib.each(writeEvent, function (item) {
                                eventDef.removeEventListener(element, item, writeFn, false, compileInfo);
                            });
                        }
                    }
                });
            }
        } else {
            let attrDef: IHtmlAttrDef = HtmlDef.getHtmlAttrDef(name);
            attrDef.initAttribute && attrDef.initAttribute(element, name, content, subName, compileInfo);
            attrDef.setAttribute(element, name, content, subName, compileInfo);
        }
    }

    public static setBindAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean, binds: any): void {
        let bindInfo = binds[name];
        if (bindInfo.done) return;
        bindInfo.done = true;

        let bind: any = bindInfo.bind,
            bindAttrName = '__bindAttr__',
            bindAttrs = bind[bindAttrName] || (bind[bindAttrName] = []),
            isObj = content && !CmpxLib.isString(content),
            names = _makeSubName(name);
        bindAttrs.push({
            isObj: isObj,
            attrName: bindInfo.attr,
            attrDef: HtmlDef.getHtmlAttrDef(name),
            content: content,
            isWrite: isObj ? !!content.write : false,
            isRead: isObj ? !!content.read : true,
            name:names[0],
            subName:names[1]
        });
        if (!isObj) bind[bindInfo.attr] = content;
    }

    private static setBind(element: HTMLElement, componet: Componet, subject: CompileSubject, bind: any): void {
        let bindEvents = _getBindEvents(bind),
            events = [];

        if (bindEvents) {
            CmpxLib.each(bindEvents, function (item) {
                let name = item.name,
                    fn = function () { return item.fn.apply(bind, arguments); };
                events.push({ name: name, fn: fn });
                HtmlDef.getHtmlEventDef(name).addEventListener(element, name, fn, false);
            });
        }

        let bindAttrName = '__bindAttr__',
            bindAttrs = bind[bindAttrName],
            compileInfo = { subject: subject, componet: componet },
            isW, isR,
            writeFn = function (item) {
                item.newValue = bind[item.attrName];
                if (item.value != item.newValue) {
                    isW || bind.onWrite();
                    isW = true;
                    item.value = item.newValue;
                    item.content.write.call(componet, item.newValue);
                }
            },
            update = function () {
                CmpxLib.each(bindAttrs, function (item) {
                    if (item.isRead) {
                        item.newValue = item.isObj ? item.content.read.call(componet)
                            : bind[item.attrName];
                        if (!_equals(item.value, item.newValue)) {
                            isR = true;
                            item.value = item.newValue;
                            bind[item.attrName] = item.value;
                            item.attrDef.setAttribute(element, item.name, item.value, item.subName, compileInfo);
                        } else
                            writeFn(item);
                    } else if (item.isWrite)
                        writeFn(item);

                });
            },
            doUpdate = function(){
                isR = isW = false;
                update();
                isR && bind.onRead();
                if (isR || isW){
                    doUpdate();
                }
            };

        bind[bindAttrName] = _undef;
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                doUpdate();
                bind.onUpdate();
            },
            ready: function () {
                bind.onReady();
            },
            remove: function (p: ISubscribeEvent) {
                bind.$isDisposed = true;
                bind.onDispose();
                if (bindEvents) {
                    CmpxLib.each(events, function (item) {
                        HtmlDef.getHtmlEventDef(item.name).removeEventListener(element, item.name, item.fn, false);
                    });
                }
            }
        });
    }

    public static forRender(
        dataFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        eachFn: (item: any, count: number, index: number, componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject,
        syncFn: (item: any, count: number, index: number, newList: any[]) => number
    ): void {

        if (subject.isRemove || !dataFn || !eachFn) return;

        let refNode = _getRefNode(parentElement);

        let value: any, newSubject: CompileSubject;
        let childNodes: Node[],
            syncDatas: any[],
            removeFn = function () {
                childNodes = _removeChildNodes(childNodes);
            },
            detachFr: DocumentFragment;
        subject.subscribe({
            detach: function () {
                if (syncFn) {
                    if (subject.isDetach) {
                        let nodes = [];
                        CmpxLib.each(syncDatas, function (item) {
                            nodes = nodes.concat(item.nodes);
                        });
                        detachFr = _detachElement(nodes);
                        nodes = null;
                    } else {
                        detachFr && _insertAfter(detachFr, refNode, _getParentElement(refNode));
                    }
                } else {
                    if (subject.isDetach) {
                        detachFr = _detachElement(childNodes);
                    } else {
                        detachFr && _insertAfter(detachFr, refNode, _getParentElement(refNode));
                        detachFr = null;
                    }
                }
            },
            update: function (p: ISubscribeEvent) {
                let datas = dataFn.call(componet, componet, parentElement, subject);
                if (!_equalArray(datas, value)) {

                    let isArray = CmpxLib.isArray(datas);

                    //如果有数据
                    if (datas) {
                        //如果不是数组，转为一个数组
                        isArray || (datas = [datas]);

                        let count = datas.length;

                        if (syncFn) {
                            //同步模式，同步性生成view
                            let lastNode: Node = refNode;

                            let rmList = [],    //要删除的数据
                                dataList = [];  //合并后的数据
                            (function (oldDatas, newDatas) {
                                let hasList = [], nIdx;
                                //计算要删除的数据和保留的数据
                                CmpxLib.each(oldDatas, function (item, index) {
                                    //在新数据的位置
                                    nIdx = syncFn.call(componet, item.data, count, index, datas);
                                    if (nIdx >= 0) {
                                        item.data = newDatas[nIdx];
                                        item.newIndex = nIdx;
                                        hasList.push(item);
                                    } else
                                        rmList.push(item);
                                });
                                //新数据与保留数据合并
                                CmpxLib.each(newDatas, function (item, index) {
                                    //在保留数据里的位置
                                    nIdx = CmpxLib.inArray(hasList, function (item) { return item.newIndex == index; });
                                    if (nIdx >= 0) {
                                        //保留数据，已有数据
                                        dataList.push(hasList[nIdx]);
                                    } else {
                                        //新数据, 没有fn属性
                                        dataList.push({
                                            index: index,
                                            data: item
                                        });
                                    }
                                });
                            })(syncDatas, datas);
                            syncDatas = dataList;
                            //删除多余节点(Node)
                            CmpxLib.each(rmList, function (item) {
                                item.nodes = _removeChildNodes(item.nodes);
                                item.subject.remove({
                                    componet: componet
                                });
                                item.subject = item.nodes = null;
                            });
                            let lastIndex = -1;
                            CmpxLib.each(syncDatas, function (item, index) {
                                let fragm: DocumentFragment;

                                if (item.fn) {
                                    //根据fn数据来确认保留数据

                                    if (item.index < lastIndex) {
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
                                lastNode = item.nodes[item.nodes.length - 1] || lastNode;

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
                newSubject = childNodes = refNode = detachFr = null;
            }
        });
    }

    public static updateRender(fn: Function, componet: Componet, element: HTMLElement, subject: CompileSubject): void {
        subject.subscribe({
            update: function () {
                fn.call(componet);
            }
        });
    };

    public static ifRender(
        ifFun: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        trueFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        falseFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any,
        componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, isX: boolean
    ): void {

        if (subject.isRemove) return;

        let refNode = _getRefNode(parentElement),
            value, newSubject: CompileSubject,
            childNodes: Node[], removeFn = function () {
                isX || (childNodes = _removeChildNodes(childNodes));
            };
        let fragment: DocumentFragment;

        let trueFragment: DocumentFragment, trueSubject: CompileSubject, trueNodes: Node[],
            falseFragment: DocumentFragment, falseSubject: CompileSubject, falseNodes: Node[]
        subject.subscribe({
            detach: function () {
                if (isX) {
                    if (subject.isDetach) {
                        fragment = _detachElement(value ? trueNodes : falseNodes);
                    } else {
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                } else {
                    if (subject.isDetach) {
                        fragment = _detachElement(childNodes);
                    } else {
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                }
            },
            update: function (p: ISubscribeEvent) {
                let newValue = !!ifFun.call(componet, componet, parentElement, subject);

                if (newValue != value) {
                    value = newValue;

                    if (isX) {
                        if (newValue) {
                            falseNodes && (falseFragment = _detachElement(falseNodes));
                            falseSubject && falseSubject.detach({
                                componet: componet
                            });
                            if (trueFragment) {
                                fragment = trueFragment;
                                trueSubject.detach({
                                    componet: componet
                                });
                            }
                            else {
                                trueSubject = new CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                trueFn.call(componet, componet, fragment, trueSubject);
                                trueNodes = CmpxLib.toArray(fragment.childNodes);
                            }
                            newSubject = trueSubject;
                        }
                        else {
                            trueNodes && (trueFragment = _detachElement(trueNodes));
                            trueSubject && trueSubject.detach({
                                componet: componet
                            });
                            if (falseFragment) {
                                fragment = falseFragment;
                                falseSubject.detach({
                                    componet: componet
                                });
                            }
                            else {
                                falseSubject = new CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                falseFn.call(componet, componet, fragment, falseSubject);
                                falseNodes = CmpxLib.toArray(fragment.childNodes);
                            }
                            newSubject = falseSubject;
                        }
                        newSubject.update({
                            componet: componet
                        });
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    } else {

                        removeFn();
                        newSubject && newSubject.remove({
                            componet: componet
                        });

                        newSubject = new CompileSubject(subject);

                        fragment = document.createDocumentFragment();
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
                }
            },
            remove: function (p: ISubscribeEvent) {
                removeFn();
                newSubject = childNodes = refNode
                    = falseNodes = trueNodes = falseSubject = trueSubject = null;
            }
        });

    }

    public static tmplRender(id, componet: Componet, parentElement: HTMLElement, subject: CompileSubject,
        contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) => void): void {

        if (subject.isRemove) return;

        let tmpls = componet[_tmplName],
            $componet = componet;
        tmpls || (tmpls = componet[_tmplName] = {});

        tmpls[id] = function (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) {
            if ($componet != componet) {
                //如果tmpl在不同的component, 将this为当前域，夸域处理
                subject = new CompileSubject(subject);
                let pSubject = $componet.$subject,
                    subsP: ISubscribeParam = pSubject.subscribe({
                        update: function (p: ISubscribeEvent) {
                            subject.update(p);
                        }
                    });
                subject.subscribe({
                    remove: function () {
                        subsP && pSubject.unSubscribe(subsP);
                    }
                });
            }
            contextFn && contextFn.call($componet, $componet, element, subject, param);
        };
    }

    public static includeRender(context: any, contextFn: Function, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, param: Function): void {
        if (!context || subject.isRemove) return;

        if (CmpxLib.isString(context)) {
            let tmpl = _getComponetTmpl(componet, context);
            if (tmpl) {
                let pTmep = (param && param.call(componet)) || {};
                param && subject.subscribe({
                    update: function () {
                        CmpxLib.extend(pTmep, param.call(componet));
                    }
                });
                if (tmpl)
                    tmpl(componet, parentElement, subject, pTmep);
                else if (contextFn) {
                    contextFn.call(componet, componet, parentElement, subject, pTmep);
                }
            }
        } else {
            let value: any,
                preSubject: CompileSubject, preComponet: Componet,
                refNode = _getRefNode(parentElement);

            subject.subscribe({
                update: function (p: ISubscribeEvent) {
                    let newValue: any = context.call(componet);

                    if (newValue != value) {
                        value = newValue;
                        let render = new CompileRender(newValue);

                        preSubject && preSubject.remove({
                            componet: preComponet
                        });

                        let { newSubject, refComponet } = render.complie(refNode, [], componet, subject, null, null, param);
                        preSubject = newSubject;
                        preComponet = refComponet;

                    } else
                        preSubject.update({
                            componet: preComponet
                        });
                },
                remove: function (p: ISubscribeEvent) {
                    value = preSubject = preComponet = refNode = null;
                }
            });
        }
    }

    static renderComponet(componetDef: typeof Componet, refNode: Node, attrs: ICreateElementAttr[],
        complieEnd?: (newSubject: CompileSubject, refComponet: Componet) => void,
        parentComponet?: Componet, subject?: CompileSubject,
        contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void): void {

        _tmplLoaded(function () {
            let vm = VMManager.getComponet(componetDef.prototype),
                render = vm && vm.render;
            if (!vm) throw new Error('not find @VM default!');
            let { newSubject, refComponet } = render.complie(refNode, attrs, parentComponet, subject, contextFn, { update: true });
            complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
        });
    }

}

var _buildCompileFn = function (tagInfos: Array<ITagInfo>): Function {
    var outList = [], varNameList = [];

    _buildCompileFnContent(tagInfos, outList, varNameList, true);

    varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
    outList.unshift(`var __tmplRender = Compile.tmplRender,
        __setAttributeEx = Compile.setAttributeEx, __createElementEx = Compile.createElementEx,
        __createTextNode = Compile.createTextNode, __setViewvar = Compile.setViewvar,
        __forRender = Compile.forRender, __ifRender = Compile.ifRender,
        __includeRender = Compile.includeRender, __updateRender = Compile.updateRender,
        __componet = componet;`);

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
    _makeElementTag = function (tagName, attrs: Array<IAttrInfo>): { bindAttrs: Array<IAttrInfo>, stAtts: Array<ICreateElementAttr>, bindNames:string[], } {
        var bindAttrs = [], stAtts = [], names: string[],bindNames=[], name;
        CmpxLib.each(attrs, function (item: IAttrInfo) {
            name = item.name;
            if (name == '$var' || name == '$array') return;
            if (item.bind)
                bindAttrs.push(item), bindNames.push(name);
            else {
                names = _makeSubName(name);
                stAtts.push({ name: names[0], value: _escapeBuildString(item.value), subName: names[1] });
            }
        });
        return { bindAttrs: bindAttrs, stAtts: stAtts, bindNames:bindNames };
    },
    _buildAttrContent = function (attrs: Array<IAttrInfo>, outList: Array<string>) {
        if (!attrs) return;
        let names: string[];
        CmpxLib.each(attrs, function (attr: IAttrInfo, index: number) {
            names = _makeSubName(attr.name);
            outList.push('__setAttributeEx(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject, isComponet, binds);');
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
                    let htmlTagDef: HtmlTagDef = tag.htmlTagDef,
                        rawTag = htmlTagDef.raw,
                        tagContent = rawTag && _getTagContent(tag);
                    //如果rawTag没有子级
                    hasChild && (hasChild = !rawTag);
                    if (hasAttr || hasChild || varName) {

                        let { bindAttrs, stAtts, bindNames } = _makeElementTag(tagName, tag.attrs);
                        outList.push('__createElementEx("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject, isComponet, binds) {');
                        if (varName) {
                            outList.push('__setViewvar(function(){');
                            varName.item && outList.push(varName.item + ' = this;');
                            varName.list && outList.push(varName.list + '.push(this);');
                            varName.item && outList.push('return {name:"' + varName.item + '", value:' + varName.item + '}');
                            varName.list && outList.push('return {name:"' + varName.list + '", value:' + varName.list + '}');
                            outList.push('}, function(){');
                            varName.item && outList.push(varName.item + ' = null;');
                            varName.list && outList.push('var idx = ' + varName.list + '.indexOf(this); idx >= 0 && ' + varName.list + '.splice(idx, 1);');
                            outList.push('}, componet, element, subject, isComponet);');
                        }
                        _buildAttrContent(bindAttrs, outList);
                        hasChild && _buildCompileFnContent(tag.children, outList, varNameList, preInsert);

                        outList.push('}, "' + _escapeBuildString(tagContent) + '", "'+bindNames.join(',')+'");');
                    } else {
                        outList.push('__createElementEx("' + tagName + '", [], componet, element, subject, null, "' + _escapeBuildString(tagContent) + '");');
                    }
                    preInsert = false;
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
                    case 'forx':
                        let isForX = (tagName == 'forx'),
                            extend = tag.attrs[0].extend,
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
                        if (isForX || extend.sync) {
                            let syncCT = extend.syncCT;
                            //function(item, count, index, newList)=>返回index表示已存在的位置，-1表示不存在;
                            fSyFn = syncCT ? 'function(){ var fn = ' + syncCT + '; return fn ? fn.apply(this, arguments) : -1; }'
                                : 'function(item, count, index, newList){ return newList ? newList.indexOf(item) : -1; }'
                        }

                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + fSyFn + ');');
                        preInsert = true;
                        break;
                    case 'if':
                    case 'ifx':
                        let isX = (tagName == 'ifx'), ifFn = function (ifTag) {
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
                            outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + (isX ? 'true' : 'false') + ');');
                        };
                        ifFn(tag);

                        preInsert = true;
                        break;
                    case 'include':
                        let incAttr = CmpxLib.arrayToObject<IAttrInfo>(tag.attrs, 'name'),
                            incTmpl = incAttr['tmpl'],
                            incParam = incAttr['param'] ? incAttr['param'].value : 'null',
                            incRender: any = incAttr['render'],
                            hasIncChild: boolean = tag.children && tag.children.length > 0;
                        incParam = incParam == 'null' ? incParam : ('function(){ return ' + incParam + ';}');
                        incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                        let context = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');

                        if (hasIncChild) {
                            outList.push('__includeRender(' + context + ', function (componet, element, subject) {');
                            _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                            outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                        } else
                            outList.push('__includeRender(' + context + ', null, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                        preInsert = true;

                        break;
                    case 'tmpl':
                        let tmplAttr = CmpxLib.arrayToObject<IAttrInfo>(tag.attrs, 'name'),
                            tmplId = tmplAttr['id'],
                            tmplLet = tmplAttr['let'];
                        outList.push('__tmplRender("' + (tmplId ? _escapeBuildString(tmplId.value) : '') + '", __componet, element, subject, function (componet, element, subject, param) {');
                        tmplLet && outList.push('var ' + tmplLet.value + ';');
                        tmplLet && outList.push('__updateRender(function(){' + tmplLet.value + '}, componet, element, subject);');
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('});');
                        break;
                }
            }
        });
    };