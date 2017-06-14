import Platform from './platform';
import { Componet } from './componet';
import { Compile, CompileSubject } from './compile';
import { HtmlDef, HtmlTagDef, ICreateElementAttr, DEFULE_TAG, DEFAULT_ATTR, DEFAULT_ATTR_PROP, DEFAULT_EVENT_DEF, SINGLE_TAG } from './htmlDef';
import CmpxLib from './cmpxLib';

let _getParentElement = function (element: Node): Node {
    return element.parentElement || element.parentNode;
},
    _setAttribute = function (element: HTMLElement, attrs: ICreateElementAttr[]) {
        CmpxLib.each(attrs, function (item: ICreateElementAttr) {
            HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
        });
    },
    _htmlTtype = /script|style/i,
    _createElementRaw = function (name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string): HTMLElement {
        let element: HTMLElement = document.createElement(name);
        element[_htmlTtype.test(name) ? 'innerHTML' : 'innerText'] = content || "";
        _setAttribute(element, attrs);
        return element;
    };

let _rawTag = new HtmlTagDef({
    //不解释内容，在createElement创建器传入content内容
    raw: true,
    //单行tag
    single: false,
    //创建器
    createElement: _createElementRaw
});

/**
 * htmlDef配置
 */
let _htmlConfig = function () {

    //扩展tag, 如果不支持请在这里扩展
    HtmlDef.extendHtmlTagDef({
        //默认不支持svg, 请处理HtmlTagDef的createElement参数
        'svg': DEFULE_TAG,
        //默认不支持math, 请处理HtmlTagDef的createElement参数
        'math': DEFULE_TAG,
        'br': SINGLE_TAG,
        'style': _rawTag,
        'script': _rawTag,
        'title': _rawTag,
        'textarea': _rawTag
    });

    //扩展attr, 如果不支持请在这里扩展
    HtmlDef.extendHtmlAttrDef({
        'name': DEFAULT_ATTR,
        'value': DEFAULT_ATTR_PROP,
        'type': DEFAULT_ATTR_PROP
    });

    //扩展事件处理, 如果不支持请在这里扩展
    HtmlDef.extendHtmlEventDef({
        "click": DEFAULT_EVENT_DEF
    });

    // //更改默认值，参考如下：
    // DEFAULT_EVENT_DEF.addEventListener = (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) {
    //     element.addEventListener(eventName, context, useCapture);
    //     //attachEvent
    // }

    Compile.loadTmplCfg(function (url: string, cb: (tmpl: string | Function) => void) {
        let xhr: XMLHttpRequest = new XMLHttpRequest(),
            headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/plain, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    cb(xhr.responseText);
                } else {
                    cb('');
                }
            }
        };

        xhr.open('GET', url, true);
        xhr.send(null);
    });
};

export class Browser extends Platform {

    constructor() {
        super();
        //htmlDef配置
        _htmlConfig();
        //编译器启动，用于htmlDef配置后
        Compile.startUp();
    }

    boot(componetDef: any): Browser {

        let name = componetDef.prototype.$name,
            bootElement: HTMLElement = document.getElementsByTagName(name)[0];
        if (!bootElement)
            throw new Error(`没有${name}标签`);

        let _doc = document, parentElement = _getParentElement(bootElement);
        let preElement: any = bootElement.previousSibling;
        if (!preElement) {
            preElement = _doc.createComment(name);
            parentElement.insertBefore(preElement, bootElement);
        }
        parentElement.removeChild(bootElement);
        bootElement = preElement;

        ////DOMContentLoaded 时起动
        let _readyName = 'DOMContentLoaded', _ready = function () {
            _doc.removeEventListener(_readyName, _ready, false);
            window.removeEventListener('load', _ready, false);

            //注意tmplElement是Comment, 在IE里只能取到parentNode
            let parentElement = _getParentElement(bootElement);
            Compile.renderComponet(componetDef, bootElement, function (newSubject: CompileSubject, refComponet: Componet) {
                parentElement.removeChild(bootElement);
                //console.log(refComponet);

                let _unload = function () {
                    window.removeEventListener('unload', _unload);
                    newSubject.remove({
                        componet: refComponet
                    });
                };
                window.addEventListener('unload', _unload, false);
            });
        };

        if (/loaded|complete|undefined/i.test(_doc.readyState))
            _ready();
        else {
            _doc.addEventListener(_readyName, _ready, false);
            window.addEventListener("load", _ready, false);

        }

        return this;
    }

}