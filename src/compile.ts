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
    _cmdEncodeAttrRegex = /\{\{((?!\/|\s*(?:if|else|for|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm,
    _makeTextTag = function (tmpl: string): string {
        //
        return tmpl.replace(_cmdEncodeAttrRegex, function (find, content) {
            return ['$($', _encodeURIComponentEx(content), '$)$'].join('');
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
    _forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*/i,
    _getForAttrInfos = function (content: string): Array<IAttrInfo> {
        var extend = _forAttrRegex.exec(content);
        var attrs: Array<IAttrInfo> = [{
            name: '',
            value: '',
            bind: true,
            extend: {
                item: extend[1],
                datas: extend[2],
                tmpl: extend[4]
            }
        }];
        return attrs;
    },
    _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/,
    _removeEmptySplitRegex = /^['"]{2,2}\+|\+['"]{2,2}/g,
    //获取内容绑定信息，如 name="aaa{{this.name}}"
    _getBind = function (value: string, split: string): IBindInfo {
        let write: string, event: string,
            onceList = [], read: boolean = false, isOnce: boolean = false;
        let type: string = '', txt: string, reg: any, readContent: string = [split, value.replace(_cmdDecodeAttrRegex, function (find: string, content: string, index: number) {
            content = decodeURIComponent(content);
            reg = _bindTypeRegex.exec(content);
            if (reg) {
                type = reg[1];
                txt = reg[2];
            } else {
                type = '';
                txt = content;
            }
            let readTxt = '';
            switch (type) {
                case ':'://一次只读
                    onceList.push(txt);
                    isOnce = true;
                    readTxt = [split, 'once' + (onceList.length - 1), split].join('+');
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
                    readTxt = [split, 'CmpxLib.toStr(' + txt + ')', split].join('+');
                    break;
            }
            return readTxt;
        }), split].join('');
        readContent = readContent.replace(_removeEmptySplitRegex, '');
        // if (isSingeBind)
        //     readContent = readContent.replace(_removeEmptySplitRegex, '');
        //     //readContent = readContentSg;
        // if (isSingeBind) console.log('isSingeBind', readContent);

        var once: string;
        if (write || read || isOnce || onceList.length > 0) {
            if (isOnce) {
                let oList = [];
                CmpxLib.each(onceList, function (item: string, index: number) {
                    oList.push(['once', index, ' = CmpxLib.toStr(', item, ')'].join(''));
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
    componetDef: Function
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
    name: string;
    propKey: string;
}
var _viewvarName = '__viewvar__',
    _getViewvarDef = function (componet: Componet): IViewvarDef[] {
        return componet[_viewvarName];
    };
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function viewvar(name?: string) {
    return function (componet: Componet, propKey: string) {
        name || (name = propKey);
        var vv: IViewvarDef[] = (componet[_viewvarName] || (componet[_viewvarName] = []));
        vv.push({
            name: name || propKey,
            propKey: propKey
        });
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
    //更新视图之后
    updateAfter?: (p: ISubscribeEvent) => void;
    //节点插入dom之后
    insertDoc?: (p: ISubscribeEvent) => void;
    //视图准备好
    ready?: (p: ISubscribeEvent) => void;
    //节点或视图删除
    remove?: (p: ISubscribeEvent) => void;
    isRemove?: boolean;
}

export class CompileSubject {
    private datas: Array<ISubscribeParam> = [];

    constructor(subject?: CompileSubject, exclude?: { [type: string]: boolean }) {
        if (subject) {
            if (!(this.isRemove = subject.isRemove)) {
                this.linkParam = subject.subscribe({
                    init: (p: ISubscribeEvent) => (!exclude || !exclude.init) && this.init(p),
                    update: (p: ISubscribeEvent) => (!exclude || !exclude.update) && this.update(p),
                    insertDoc: (p: ISubscribeEvent) => (!exclude || !exclude.insertDoc) && this.insertDoc(p),
                    ready: (p: ISubscribeEvent) => (!exclude || !exclude.ready) && this.ready(p),
                    remove: (p: ISubscribeEvent) => (!exclude || !exclude.remove) && this.remove(p)
                });
                this.subject = subject;
                this.isInit = subject.isInit;
                this.lastInitP = subject.lastInitP;
            }
        }
    }

    subscribe(p: ISubscribeParam): ISubscribeParam {
        if (!this.isRemove) {
            this.datas.push(p);
            if (this.isInit)
                p.init && (p.init(this.lastInitP), p.init = null);
        }
        return p;
    }

    unSubscribe(p: ISubscribeParam): void {
        let index = this.datas.indexOf(p);
        if (index >= 0)
            this.datas.splice(index, 1);
    }

    private linkParam: ISubscribeParam;
    private subject: CompileSubject;
    unLinkSubject(): CompileSubject {
        this.subject && this.subject.unSubscribe(this.linkParam);
        return this;
    }

    isInit: boolean = false;
    lastInitP: any;
    init(p: ISubscribeEvent) {
        if (this.isRemove) return;
        this.isInit = true;
        this.lastInitP = p;
        CmpxLib.each(this.datas, function (item: ISubscribeParam) {
            if (item.init) {
                item.init(p);
                item.init = null;
            }
        });
    }

    update(p: ISubscribeEvent) {
        if (this.isRemove) return;
        CmpxLib.each(this.datas, function (item: ISubscribeParam) {
            if (item.update) {
                item.update && item.update(p);
            }
        });
        this.updateAfter(p);
    }

    private updateAfter(p: ISubscribeEvent) {
        if (this.isRemove) return;
        CmpxLib.each(this.datas, function (item: ISubscribeParam) {
            if (item.updateAfter) {
                item.updateAfter && item.updateAfter(p);
            }
        });
    }

    insertDoc(p: ISubscribeEvent) {
        if (this.isRemove) return;
        CmpxLib.each(this.datas, function (item: ISubscribeParam) {
            if (item.insertDoc) {
                item.insertDoc(p);
                item.insertDoc = null;
            }
        });
    }

    ready(p: ISubscribeEvent) {
        if (this.isRemove) return;
        CmpxLib.each(this.datas, function (item: ISubscribeParam) {
            if (item.ready) {
                item.ready(p);
                item.ready = null;
            }
        });
    }

    isRemove: boolean = false;
    remove(p: ISubscribeEvent) {
        if (this.isRemove) return;
        this.isRemove = true;
        this.unLinkSubject();
        var datas = this.datas;
        this.datas = [];
        CmpxLib.each(datas, function (item: ISubscribeParam) {
            if (item.remove) {
                item.remove(p);
                item.remove = null;
            }
        });
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
    _getRefNode = function (parentNode: Node, insertTemp: boolean): { refNode: Node, isInsertTemp: boolean } {
        var tNode: Node;
        if (insertTemp) {
            tNode = _createTempNode();
            parentNode.appendChild(tNode);
        } else {
            tNode = parentNode.lastChild;
            if (!tNode) {
                insertTemp = true;
                tNode = _createTempNode();
                parentNode.appendChild(tNode);
            }
        }
        //注意tmplElement是Comment, 在IE里只能取到parentNode
        return { refNode: tNode, isInsertTemp: insertTemp };
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
    _getParentElement = function (node: Node): HTMLElement {
        return node.parentElement || (node.parentNode as HTMLElement);
    },
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
            fn = _buildCompileFn(tagInfos, param);
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
    complie(refNode: Node, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject) => void, subjectExclude?: { [type: string]: boolean }): { newSubject: CompileSubject, refComponet: Componet } {
        var componetDef: any = this.componetDef;

        subject || (subject = (parentComponet ? parentComponet.$subObject : null));
        subjectExclude || (subjectExclude = {});
        //subjectExclude.remove = true;
        subjectExclude.insertDoc = true;

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
                try {
                    isNewComponet && (componet.$isDisposed = true, componet.onDispose());
                    if (p.componet == componet)
                        childNodes = _removeChildNodes(childNodes);
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
            },
            updateAfter: function (p: ISubscribeEvent) {
                isNewComponet && retFn && retFn.call(componet);

            }
        });
        let childNodes: Node[], retFn;
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
            retFn = this.contextFn.call(componet, CmpxLib, Compile, componet, fragment, newSubject, this.param, function (vvList: any[]) {
                if (!vvList || vvList.length == 0) return;
                let vvDef: IViewvarDef[] = _getViewvarDef(this);
                if (!vvDef) return;
                CmpxLib.each(vvDef, function (def: IViewvarDef) {
                    let propKey = def.propKey, name = def.name;
                    CmpxLib.each(vvList, function (item: { name: string, p: any, isL: boolean }) {
                        if (item.name == name) {
                            if (item.isL) {
                                if (!this[propKey] || item.p.length > 0)
                                    this[propKey] = item.p.splice(0);
                            } else
                                this[propKey] = item.p;
                            return false;
                        }
                    }, this);
                }, this);
            });
            newSubject.update({
                componet: componet
            });
            if (isNewComponet) {
                componet.onInitViewvar(readyFn, null);
            }
            else
                readyFn();
        },
            readyFn = function () {
                childNodes = CmpxLib.toArray(fragment.childNodes);
                _insertAfter(fragment, refNode, parentElement);
                newSubject.insertDoc({
                    componet: componet
                });
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
            { refNode, isInsertTemp } = _getRefNode(parentElement, false);

        Compile.renderComponet(componetDef, refNode, function () { }, componet, subject, contextFn);

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
                    };
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

                let attrDef: IHtmlAttrDef = HtmlDef.getHtmlAttrDef(name);
                if (isWrite) {
                    eventDef = HtmlDef.getHtmlEventDef(name);
                    eventDef.addEventListener(element, 'change', writeFn, false);
                    eventDef.addEventListener(element, 'click', writeFn, false);
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
                            eventDef.removeEventListener(element, 'change', writeFn, false);
                            eventDef.removeEventListener(element, 'click', writeFn, false);
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
        componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject
    ): void {

        if (subject.isRemove || !dataFn || !eachFn) return;

        let { refNode, isInsertTemp } = _getRefNode(parentElement, insertTemp);

        let value: any, newSubject: CompileSubject;
        let fragment: DocumentFragment, childNodes: Node[], removeFn = function () {
            childNodes = _removeChildNodes(childNodes);
        };
        subject.subscribe({
            update: function (p: ISubscribeEvent) {
                let datas = dataFn.call(componet, componet, parentElement, subject);
                if (!_equalArray(datas, value)) {
                    value = datas;

                    removeFn();
                    newSubject && newSubject.remove({
                        componet: componet
                    });

                    newSubject = new CompileSubject(subject, { insertDoc: true });

                    fragment = document.createDocumentFragment();
                    let count = datas ? datas.length : 0;
                    CmpxLib.each(datas, function (item, index) {
                        eachFn.call(componet, item, count, index, componet, fragment, newSubject);
                    });
                    newSubject.update({
                        componet: componet
                    });
                    childNodes = CmpxLib.toArray(fragment.childNodes);
                    _insertAfter(fragment, refNode, parentElement);
                    newSubject.insertDoc({
                        componet: componet
                    });
                }
            },
            remove: function (p: ISubscribeEvent) {
                removeFn();
                newSubject = fragment = childNodes = refNode = null;
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

        var { refNode, isInsertTemp } = _getRefNode(parentElement, insertTemp);

        var value, newSubject: CompileSubject;
        var fragment: DocumentFragment, childNodes: Node[], removeFn = function () {
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

                    newSubject = new CompileSubject(subject, { insertDoc: true });

                    fragment = document.createDocumentFragment();
                    if (newValue)
                        trueFn.call(componet, componet, fragment, newSubject);
                    else
                        falseFn.call(componet, componet, fragment, newSubject);
                    newSubject.update({
                        componet: componet
                    });
                    childNodes = CmpxLib.toArray(fragment.childNodes);
                    _insertAfter(fragment, refNode, _getParentElement(refNode));
                    newSubject.insertDoc({
                        componet: componet
                    });
                }
            },
            remove: function (p: ISubscribeEvent) {
                removeFn();
                newSubject = fragment = childNodes = refNode = null;
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
                { refNode, isInsertTemp } = _getRefNode(parentElement, insertTemp);

            subject.subscribe({
                update: function (p: ISubscribeEvent) {
                    let newRender: CompileRender = context.call(componet);

                    if (newRender != render) {
                        render = newRender;

                        preSubject && preSubject.remove({
                            componet: preComponet
                        });

                        let { newSubject, refComponet } = newRender.complie(refNode, componet, subject);
                        preSubject = newSubject;
                        preComponet = refComponet;

                    }
                },
                remove: function (p: ISubscribeEvent) {
                    render = null;
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

var _buildCompileFn = function (tagInfos: Array<ITagInfo>, param?: Object): Function {
    var outList = [], varNameList = [];

    _buildCompileFnContent(tagInfos, outList, varNameList, true);

    varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
    param && outList.unshift(_getCompileFnParam(param));
    outList.unshift(`var __tmplRender = Compile.tmplRender,
    __createComponet = Compile.createComponet,
    __setAttributeCP = Compile.setAttributeCP,
    __createElement = Compile.createElement,
    __setAttribute = Compile.setAttribute,
    __createTextNode = Compile.createTextNode,
    __forRender = Compile.forRender,
    __ifRender = Compile.ifRender,
    __includeRender = Compile.includeRender;`);

    outList.push(_buildCompileFnReturn(varNameList));

    return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', '__p__', 'initViewvar', outList.join('\n'));
},
    _getCompileFnParam = function (param: Object): string {
        var pList = [];
        CmpxLib.eachProp(param, function (item, name) {
            pList.push([name, ' = ', '__p__.', name].join(''));
        });
        return 'var ' + pList.join(', ') + ';';
    },
    _buildCpFnRetRmRegex = /\s*\=\s*\[\s*\]\s*$/,
    _buildCompileFnReturn = function (varNameList: string[]): string {

        if (varNameList.length > 0) {
            let vvList = [], isL: boolean;
            CmpxLib.each(varNameList, function (item) {
                isL = _buildCpFnRetRmRegex.test(item);
                isL && (item = item.replace(_buildCpFnRetRmRegex, ''));
                vvList.push(['{name:"', item, '", p:', item, ', isL:', (isL ? 'true' : 'false'), '}'].join(''));
            });
            return 'return function(){initViewvar.call(this, [' + vvList.join(',') + ']);};';
        } else {
            return 'return function(){initViewvar.call(this);};'
        }
    },
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

        var str = ['var $last = ($count - $index == 1), ', itemName, '_last = $last, ',
            '$first = ($index ==  0), ', itemName, '_first = $first, ',
            '$odd = ($index % 2 ==  0), ', itemName, '_odd = $odd, ',
            '$even = !$odd, ', itemName, '_even = $even;'].join('');
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
                                varName.item && outList.push(varName.item + ' = componet;');
                                varName.list && outList.push(varName.list + '.push(componet);');
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
                                varName.item && outList.push(varName.item + ' = element;');
                                varName.list && outList.push(varName.list + '.push(element);');
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
                            itemName = extend.item
                        outList.push('__forRender(function (componet, element, subject) {');
                        outList.push('return ' + extend.datas);
                        outList.push('}, function (' + itemName + ', $count, $index, componet, element, subject) {');
                        _buildCompileFnForVar(itemName, outList);
                        var forTmpl = extend.tmpl;
                        if (forTmpl)
                            outList.push('__includeRender("' + _escapeBuildString(forTmpl) + '", componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + itemName + ');');
                        else
                            _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject);');
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