var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("cmpxLib", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var stringEmpty = "", toString = Object.prototype.toString, core_hasOwn = Object.prototype.hasOwnProperty, noop = function () { }, slice = Array.prototype.slice;
    function testObject(obj) {
        if (obj.constructor &&
            !core_hasOwn.call(obj, "constructor") &&
            !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    }
    var CmpxLib = (function () {
        function CmpxLib() {
        }
        CmpxLib.hasOwnProp = function (obj, prop) {
            return core_hasOwn.call(obj, prop);
        };
        CmpxLib.trace = function (e) {
            console.error && console.error(e.stack || e.message || e + '');
        };
        CmpxLib.isType = function (typename, value) {
            //typename:String, Array, Boolean, Object, RegExp, Date, Function,Number //兼容
            //typename:Null, Undefined,Arguments    //IE不兼容
            return toString.apply(value) === '[object ' + typename + ']';
        };
        CmpxLib.toStr = function (p) {
            return CmpxLib.isNull(p) ? '' : p.toString();
        };
        CmpxLib.isUndefined = function (obj) {
            ///<summary>是否定义</summary>
            return (typeof (obj) === "undefined" || obj === undefined);
        };
        CmpxLib.isNull = function (obj) {
            ///<summary>是否Null</summary>
            return (obj === null || CmpxLib.isUndefined(obj));
        };
        CmpxLib.isBoolean = function (obj) {
            return CmpxLib.isType("Boolean", obj);
        };
        CmpxLib.isNullEmpty = function (s) {
            return (CmpxLib.isNull(s) || s === stringEmpty);
        };
        CmpxLib.isFunction = function (fun) {
            return CmpxLib.isType("Function", fun);
        };
        CmpxLib.isNumeric = function (n) {
            //return cmpx.isType("Number", n) && !isNaN(n) && isFinite(n);;
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        CmpxLib.isString = function (obj) {
            return CmpxLib.isType("String", obj);
        };
        CmpxLib.isObject = function (obj) {
            return obj && CmpxLib.isType("Object", obj)
                && !CmpxLib.isElement(obj) && !CmpxLib.isWindow(obj); //IE8以下isElement, isWindow认为Object
        };
        CmpxLib.tryCatch = function (tryFn, catchFn, args, thisArg) {
            if (args === void 0) { args = []; }
            if (thisArg === void 0) { thisArg = null; }
            try {
                return tryFn.apply(thisArg, args);
            }
            catch (e) {
                return catchFn.call(thisArg, e);
            }
        };
        CmpxLib.isPlainObject = function (obj) {
            if (!CmpxLib.isObject(obj))
                return false;
            try {
                if (testObject(obj) === false)
                    return false;
            }
            catch (e) {
                return false;
            }
            var key;
            for (key in obj) { }
            return key === undefined || core_hasOwn.call(obj, key);
        };
        CmpxLib.encodeHtml = function (html) {
            return !html ? '' : html.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
                .replace(/\"/g, '&quot;').replace(/ /g, "&nbsp;").replace(/\'/g, "&#39;");
        };
        CmpxLib.decodeHtml = function (html) {
            return !html ? '' : html.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        };
        CmpxLib.isArray = function (value) {
            return Array.isArray ? Array.isArray(value) : CmpxLib.isType("Array", value);
        };
        CmpxLib.isWindow = function (obj) { return !!(obj && obj == obj.window); };
        CmpxLib.isElement = function (obj) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; };
        CmpxLib.trim = function (str, newline) {
            return str ? (newline ? str.replace(/^(?:\s|\u3000|\ue4c6|\n|\r)*|(?:\s|\u3000|\ue4c6|\n|\r)*$/g, '') :
                str.replace(/^(?:\s|\u3000|\ue4c6)*|(?:\s|\u3000|\ue4c6)*$/g, '')) : '';
        };
        CmpxLib.replaceAll = function (s, str, repl, flags) {
            if (flags === void 0) { flags = "g"; }
            if (CmpxLib.isNullEmpty(s) || CmpxLib.isNullEmpty(str))
                return s;
            str = str.replace(/([^A-Za-z0-9 ])/g, "\\$1");
            s = s.replace(new RegExp(str, flags), repl);
            return s;
        };
        CmpxLib.inArray = function (list, p, thisArg) {
            if (thisArg === void 0) { thisArg = null; }
            var isF = CmpxLib.isFunction(p), index = -1;
            CmpxLib.each(list, function (item, idx) {
                var ok = isF ? p.call(thisArg, item, idx) : (item == p);
                if (ok) {
                    index = idx;
                    return false;
                }
            }, thisArg);
            return index;
        };
        CmpxLib.toArray = function (p, start, count) {
            if (start === void 0) { start = 0; }
            if (count === void 0) { count = Number.MAX_VALUE; }
            return p ? slice.apply(p, [start, count]) : p;
        };
        CmpxLib.arrayToObject = function (array, fieldName) {
            var obj = {};
            CmpxLib.each(array, function (item, index) {
                obj[item[fieldName]] = item;
            });
            return obj;
        };
        CmpxLib.each = function (list, fn, thisArg) {
            if (thisArg === void 0) { thisArg = null; }
            if (!list)
                return;
            var len = list.length;
            for (var i = 0, len_1 = list.length; i < len_1; i++) {
                if (fn.call(thisArg, list[i], i) === false)
                    break;
            }
        };
        CmpxLib.eachProp = function (obj, callback, thisArg) {
            if (thisArg === void 0) { thisArg = null; }
            if (!obj)
                return;
            var item;
            for (var n in obj) {
                if (CmpxLib.hasOwnProp(obj, n)) {
                    item = obj[n];
                    if (callback.call(thisArg, item, n) === false)
                        break;
                }
            }
        };
        CmpxLib.extend = function (obj, p) {
            if (obj && p) {
                CmpxLib.eachProp(p, function (item, name) { return obj[name] = item; });
            }
            return obj;
        };
        return CmpxLib;
    }());
    CmpxLib.stringEmpty = stringEmpty;
    CmpxLib.noop = noop;
    exports["default"] = CmpxLib;
});
define("htmlDef", ["require", "exports", "cmpxLib"], function (require, exports, cmpxLib_1) {
    "use strict";
    exports.__esModule = true;
    /**
     * 默认element创建器
     * @param name tagName, eg:div
     * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
     * @param parent 父element
     * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
     */
    function DEFAULT_CREATEELEMENT(name, attrs, parent, content) {
        var element = document.createElement(name);
        cmpxLib_1["default"].each(attrs, function (item) {
            HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
        });
        return element;
    }
    exports.DEFAULT_CREATEELEMENT = DEFAULT_CREATEELEMENT;
    //注释标签
    var _noteTagRegex = /\<\!--(?:.|\n|\r)*?--\>/gim;
    /**
     * HtmlTag定义类
     */
    var HtmlTagDef = (function () {
        function HtmlTagDef(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.single, single = _c === void 0 ? false : _c, _d = _b.raw, raw = _d === void 0 ? false : _d, _e = _b.createElement, createElement = _e === void 0 ? null : _e;
            this.single = single;
            this.raw = raw;
            this.createElement = createElement || DEFAULT_CREATEELEMENT;
        }
        return HtmlTagDef;
    }());
    exports.HtmlTagDef = HtmlTagDef;
    exports.SINGLE_TAG = new HtmlTagDef({ single: true }), exports.DEFULE_TAG = new HtmlTagDef();
    var _htmlTagDefConfig = {
        'base': exports.SINGLE_TAG,
        'meta': exports.SINGLE_TAG,
        'area': exports.SINGLE_TAG,
        'embed': exports.SINGLE_TAG,
        'link': exports.SINGLE_TAG,
        'img': exports.SINGLE_TAG,
        'input': exports.SINGLE_TAG,
        'param': exports.SINGLE_TAG,
        'hr': exports.SINGLE_TAG,
        'source': exports.SINGLE_TAG,
        'track': exports.SINGLE_TAG,
        'wbr': exports.SINGLE_TAG,
        'p': exports.DEFULE_TAG,
        'thead': exports.DEFULE_TAG,
        'tbody': exports.DEFULE_TAG,
        'tfoot': exports.DEFULE_TAG,
        'tr': exports.DEFULE_TAG,
        'td': exports.DEFULE_TAG,
        'th': exports.DEFULE_TAG,
        'col': exports.SINGLE_TAG,
        'li': exports.DEFULE_TAG,
        'dt': exports.DEFULE_TAG,
        'dd': exports.DEFULE_TAG,
        'rb': exports.DEFULE_TAG,
        'rt': exports.DEFULE_TAG,
        'rtc': exports.DEFULE_TAG,
        'rp': exports.DEFULE_TAG,
        'optgroup': exports.DEFULE_TAG,
        'option': exports.DEFULE_TAG,
        'pre': exports.DEFULE_TAG,
        'listing': exports.DEFULE_TAG
    };
    var _rawContentRegex, _escContentRegex, _removeCmdRegex = /\{\{((?:.|\n|\r)*?)\}\}/gmi;
    //删除多余空格
    function _removeSpace(html) {
        html = html.replace(_removeCmdRegex, function (find, content) {
            return ['{{', encodeURIComponent(content), '}}'].join('');
        }).replace(_escContentRegex, function (find, name, attrs, content, cmdContent) {
            return ['<', name, attrs || '', '>', encodeURIComponent(content || ''), '</', name, '>'].join('');
        })
            .replace(/(?:\n|\r)+/gmi, ' ').replace(/\s{2,}/gmi, ' ')
            .replace(_escContentRegex, function (find, name, attrs, content, cmdContent) {
            return ['<', name, attrs || '', '>', decodeURIComponent(content || ''), '</', name, '>'].join('');
        }).replace(_removeCmdRegex, function (find, content) {
            return ['{{', decodeURIComponent(content), '}}'].join('');
        });
        return html;
    }
    /**
     * 默认HtmlAttr定义
     */
    exports.DEFAULT_ATTR = {
        setAttribute: function (element, name, value, subName) {
            if (subName)
                element[name][subName] = value;
            else
                element.setAttribute(name, value);
        },
        getAttribute: function (element, name, subName) {
            if (subName)
                return element[name][subName];
            else
                return element.getAttribute(name);
        },
        writeable: false
    };
    /**
     * 默认HtmlAttr prop定义
     */
    exports.DEFAULT_ATTR_PROP = {
        setAttribute: function (element, name, value, subName) {
            if (subName)
                element[name][subName] = value;
            else
                element[name] = value;
        },
        getAttribute: function (element, name, subName) {
            if (subName)
                return element[name][subName];
            else
                return element[name];
        },
        writeable: true
    };
    var _htmlAttrDefConfig = {
        'src': exports.DEFAULT_ATTR_PROP,
        'rel': exports.DEFAULT_ATTR_PROP,
        'style': exports.DEFAULT_ATTR_PROP,
        'selected': exports.DEFAULT_ATTR_PROP,
        'disabled': exports.DEFAULT_ATTR_PROP,
        'checked': exports.DEFAULT_ATTR_PROP
    };
    /**
     * 默认事件定义
     */
    exports.DEFAULT_EVENT_DEF = {
        addEventListener: function (element, eventName, context, useCapture) {
            element.addEventListener(eventName, context, useCapture);
            //attachEvent
        },
        removeEventListener: function (element, eventName, context, useCapture) {
            element.addEventListener(eventName, context, useCapture);
            //detachEvent
        }
    };
    var _htmlEventDefConfig = {};
    var HtmlDef = (function () {
        function HtmlDef() {
        }
        /**
         * 获取标签定义
         * @param tagName 标签名称
         */
        HtmlDef.getHtmlTagDef = function (tagName) {
            return _htmlTagDefConfig[tagName.toLowerCase()] || exports.DEFULE_TAG;
        };
        /**
         * 扩展标签定义
         * @param p 标签配置
         */
        HtmlDef.extendHtmlTagDef = function (p) {
            cmpxLib_1["default"].extend(_htmlTagDefConfig, p);
            _makeSpecTags();
        };
        /**
         * 获取属性定义
         * @param name
         */
        HtmlDef.getHtmlAttrDef = function (name) {
            return _htmlAttrDefConfig[name] || exports.DEFAULT_ATTR;
        };
        /**
         * 扩展属性定义
         * @param p
         */
        HtmlDef.extendHtmlAttrDef = function (p) {
            cmpxLib_1["default"].extend(_htmlAttrDefConfig, p);
        };
        HtmlDef.getHtmlEventDef = function (name) {
            return _htmlEventDefConfig[name] || exports.DEFAULT_EVENT_DEF;
        };
        /**
         * 扩展事件定义
         * @param p
         */
        HtmlDef.extendHtmlEventDef = function (p) {
            cmpxLib_1["default"].extend(_htmlEventDefConfig, p);
        };
        // /**
        //  * 单行标签
        //  */
        // static singleTags: { [name: string]: boolean };
        // /**
        //  * 内容标签，不解释内容
        //  */
        // static rawTags: { [name: string]: boolean };
        /**
         * 处理tag内容，删除多余空格，删除注释，编码某些类型内容
         * @param html
         */
        HtmlDef.handleTagContent = function (html) {
            return _removeSpace(html.replace(_noteTagRegex, ''))
                .replace(_rawContentRegex, function (find, name, attrs, content) {
                return ['<', name, attrs || '', '>', cmpxLib_1["default"].encodeHtml(content || ''), '</', name, '>'].join('');
            });
        };
        return HtmlDef;
    }());
    exports.HtmlDef = HtmlDef;
    function _makeSpecTags() {
        var rawTags = [];
        cmpxLib_1["default"].eachProp(_htmlTagDefConfig, function (item, name) {
            item.raw && rawTags.push(name);
        });
        // let o = HtmlDef.singleTags = {};
        // CmpxLib.each(singleTags, (name: string) => o[name] = true);
        // o = HtmlDef.rawTags = {};
        // CmpxLib.each(rawTags, (name: string) => o[name] = true);
        // o = HtmlDef.escapeRawTags = {};
        // CmpxLib.each(escapeRawTags, (name: string) => o[name] = true);
        var rawNames = rawTags.join('|');
        _rawContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
        rawNames = [rawNames, 'pre'].join('|');
        _escContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
    }
    _makeSpecTags();
});
define("cmpxEvent", ["require", "exports", "cmpxLib"], function (require, exports, cmpxLib_2) {
    "use strict";
    exports.__esModule = true;
    var CmpxEvent = (function () {
        function CmpxEvent() {
            this.events = [];
        }
        /**
         * 绑定事件
         * @param fn 绑定事件方法
         */
        CmpxEvent.prototype.on = function (fn) {
            this.events.push(fn);
        };
        /**
         * 解绑事件，如果没有指定方法，解绑所有事件
         * @param fn 解绑事件方法
         */
        CmpxEvent.prototype.off = function (fn) {
            if (fn) {
                var index = cmpxLib_2["default"].inArray(this.events, fn);
                index >= 0 && this.events.splice(index, 1);
            }
            else
                this.events = [];
        };
        /**
         * 触发事件, 返回最后一个事件值, 如果返回false中断事件
         * @param args 触发传入参数
         * @param thisArg this对象
         */
        CmpxEvent.prototype.trigger = function (args, thisArg) {
            var ret;
            cmpxLib_2["default"].each(this.events, function (item) {
                ret = item && this.apply(thisArg, args);
                return ret;
            });
            return ret;
        };
        return CmpxEvent;
    }());
    exports["default"] = CmpxEvent;
});
define("compile", ["require", "exports", "cmpxLib", "htmlDef", "cmpxEvent"], function (require, exports, cmpxLib_3, htmlDef_1, cmpxEvent_1) {
    "use strict";
    exports.__esModule = true;
    var _undef;
    //新建一个text节点
    var _newTextContent = function (tmpl, start, end) {
        var text = tmpl.substring(start, end), bind = _cmdDecodeAttrRegex.test(text), bindInfo = bind ? _getBind(text, '"') : null;
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
    }, _singleCmd = {
        'include': true
    }, _encodeURIComponentEx = function (s) {
        return encodeURIComponent(s).replace(/'/g, '%27');
    }, 
    //将{{this.name}}绑定标签转成$($this.name$)$
    _cmdEncodeAttrRegex = /\{\{((?!\/|\s*(?:if|else|for|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm, _makeTextTag = function (tmpl) {
        //
        return tmpl.replace(_cmdEncodeAttrRegex, function (find, content) {
            return ['$($', _encodeURIComponentEx(content), '$)$'].join('');
        });
    }, 
    //把$($this.name$)$还原
    _cmdDecodeAttrRegex = /\$\(\$(.+?)\$\)\$/gm, _backTextTag = function (tmpl) {
        //
        return tmpl.replace(_cmdDecodeAttrRegex, function (find, content) {
            return ['{{', decodeURIComponent(content), '}}'].join('');
        });
    }, 
    //查找分析tag和cmd
    _tagInfoRegex = /\<\s*(\/*)\s*([^<>\s]+)\s*([^<>]*?)(\/*)\s*\>|\{\{\s*(\/*)\s*([^\s\{\}]+)\s*(.*?)(\/*)\}\}/gim, _makeTagInfos = function (tmpl) {
        var lastIndex = 0, list = [];
        tmpl = _makeTextTag(tmpl);
        tmpl = htmlDef_1.HtmlDef.handleTagContent(tmpl);
        tmpl.replace(_tagInfoRegex, function (find, end1, tagName, tagContent, end2, txtEnd1, txtName, txtContent, txtEnd2, index) {
            if (index > lastIndex) {
                list.push(_newTextContent(tmpl, lastIndex, index));
            }
            var cmd = !!txtName, htmlTagDef = cmd ? null : htmlDef_1.HtmlDef.getHtmlTagDef(tagName), single = !!end2 || !!txtEnd2 || (cmd ? _singleCmd[txtName] : htmlTagDef.single), end = !!end1 || !!txtEnd1 || single;
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
                }
                else {
                    attrs = !!tagContent ? _getAttrInfos(tagContent) : null;
                }
                var item = {
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
        var outList = [];
        _makeTagInfoChildren(list, outList, list.length);
        return outList;
    }, 
    //获取attrInfo
    _attrInfoRegex = /\s*([^= ]+)\s*=\s*(?:(["'])((?:.|\n|\r)*?)\2|([^"' ><]*))|\s*([^= /]+)\s*/gm, _getAttrInfos = function (content) {
        var attrs = [];
        content.replace(_attrInfoRegex, function (find, name, split, value, value1, name1, index) {
            value1 && (split = "\"", value = value1);
            var bind = _cmdDecodeAttrRegex.test(value), bindInfo = bind ? _getBind(value, split) : null;
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
    _forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*/i, _getForAttrInfos = function (content) {
        var extend = _forAttrRegex.exec(content);
        var attrs = [{
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
    }, _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/, _removeEmptySplitRegex = /^['"]{2,2}\+|\+['"]{2,2}/g, 
    //获取内容绑定信息，如 name="aaa{{this.name}}"
    _getBind = function (value, split) {
        var write, event, onceList = [], read = false, isOnce = false;
        var type = '', txt, reg, readContent = [split, value.replace(_cmdDecodeAttrRegex, function (find, content, index) {
                content = decodeURIComponent(content);
                reg = _bindTypeRegex.exec(content);
                if (reg) {
                    type = reg[1];
                    txt = reg[2];
                }
                else {
                    type = '';
                    txt = content;
                }
                var readTxt = '';
                switch (type) {
                    case ':':
                        onceList.push(txt);
                        isOnce = true;
                        readTxt = [split, 'once' + (onceList.length - 1), split].join('+');
                        break;
                    case '@':
                        event = txt;
                        break;
                    case '>':
                        write = txt;
                        break;
                    case '#':
                        write = txt;
                    case '<': //只读
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
        var once;
        if (write || read || isOnce || onceList.length > 0) {
            if (isOnce) {
                var oList_1 = [];
                cmpxLib_3["default"].each(onceList, function (item, index) {
                    oList_1.push(['once', index, ' = CmpxLib.toStr(', item, ')'].join(''));
                });
                once = 'var ' + oList_1.join(',') + ';';
            }
            write && (write = 'function(val){ ' + write + ' = val; }');
            event = null;
        }
        else if (event) {
            event = 'function(event){ ' + event + '; }';
        }
        readContent = "(function(){\n  " + (once ? once : '') + "\n  return {\n    once:" + (once ? (read ? 'false' : 'true') : 'false') + ",\n    read:" + (read || isOnce ? 'function(){ return ' + readContent + '; }' : 'null') + ",\n    write:" + (write ? write : 'null') + ",\n    event:" + (event ? event : 'null') + "\n  };\n}).call(componet)";
        return { type: type, content: readContent };
    }, _makeTagInfoChildren = function (attrs, outList, len, index, parent) {
        if (index === void 0) { index = 0; }
        if (parent === void 0) { parent = null; }
        var item;
        while (index < len) {
            item = attrs[index++];
            if (item.cmd || item.target) {
                if (item.single)
                    outList.push(item);
                else if (item.end) {
                    break;
                }
                else {
                    outList.push(item);
                    item.children = [];
                    index = _makeTagInfoChildren(attrs, item.children, len, index, item);
                    if (item && item.cmd && item.tagName == 'else')
                        break;
                }
            }
            else {
                outList.push(item);
            }
        }
        return index;
    };
    var _registerVM = {}, _vmName = '__vm__', _getVmConfig = function (componetDef) {
        return componetDef.prototype[_vmName];
    }, _getVmByComponetDef = function (componetDef) {
        var config = _getVmConfig(componetDef);
        return config ? _registerVM[config.name] : null;
    }, _readyRd = false, _renderPR = [];
    /**
     * 注入组件配置信息
     * @param config
     */
    function VM(vm) {
        return function (constructor) {
            _registerVM[vm.name] = {
                render: null,
                componetDef: constructor
            };
            var rdF = function () {
                _registerVM[vm.name].render = new CompileRender(vm.tmpl, constructor);
                var head = document.head;
                if (vm.style) {
                    head.appendChild(htmlDef_1.HtmlDef.getHtmlTagDef('style').createElement('style', [{
                            name: 'type', value: 'text/css'
                        }], head, vm.style));
                }
                if (vm.styleUrl) {
                    head.appendChild(htmlDef_1.HtmlDef.getHtmlTagDef('link').createElement('link', [{
                            name: 'rel', value: 'stylesheet'
                        }, {
                            name: 'href', value: vm.styleUrl
                        }], head, vm.style));
                }
                //优先tmplUrl
                var tmplUrl = vm.tmplUrl;
                if (cmpxLib_3["default"].isString(tmplUrl) && _loadTmplFn) {
                    _tmplCount++;
                    _loadTmplFn(tmplUrl, function (tmpl) {
                        _registerVM[vm.name].render = new CompileRender(tmpl || vm.tmpl || '', constructor);
                        _tmplCount--;
                        _tmplChk();
                    });
                }
                else
                    _registerVM[vm.name].render = new CompileRender(tmplUrl || vm.tmpl || '', constructor);
            };
            _readyRd ? rdF() : _renderPR.push(rdF);
            constructor.prototype.$name = vm.name;
            constructor.prototype[_vmName] = vm;
        };
    }
    exports.VM = VM;
    var _tmplCount = 0, _tmplFnList = [], _tmplLoaded = function (callback) {
        if (_tmplCount == 0)
            callback && callback();
        else
            callback && _tmplFnList.push(callback);
    }, _tmplChk = function () {
        (_tmplCount == 0) && cmpxLib_3["default"].each(_tmplFnList, function (item) {
            console.log('aaa');
            item();
        });
    };
    var _viewvarName = '__viewvar__', _getViewvarDef = function (componet) {
        return componet[_viewvarName];
    };
    /**
     * 引用模板变量$var
     * @param name 变量名称，未指定为属性名称
     */
    function viewvar(name) {
        return function (componet, propKey) {
            name || (name = propKey);
            var vv = (componet[_viewvarName] || (componet[_viewvarName] = []));
            vv.push({
                name: name || propKey,
                propKey: propKey
            });
        };
    }
    exports.viewvar = viewvar;
    var CompileSubject = (function () {
        function CompileSubject(subject, exclude) {
            var _this = this;
            this.datas = [];
            this.isInit = false;
            this.isRemove = false;
            if (subject) {
                if (!(this.isRemove = subject.isRemove)) {
                    this.linkParam = subject.subscribe({
                        init: function (p) { return (!exclude || !exclude.init) && _this.init(p); },
                        update: function (p) { return (!exclude || !exclude.update) && _this.update(p); },
                        insertDoc: function (p) { return (!exclude || !exclude.insertDoc) && _this.insertDoc(p); },
                        ready: function (p) { return (!exclude || !exclude.ready) && _this.ready(p); },
                        remove: function (p) { return (!exclude || !exclude.remove) && _this.remove(p); }
                    });
                    this.subject = subject;
                    this.isInit = subject.isInit;
                    this.lastInitP = subject.lastInitP;
                }
            }
        }
        CompileSubject.prototype.subscribe = function (p) {
            if (!this.isRemove) {
                this.datas.push(p);
                if (this.isInit)
                    p.init && (p.init(this.lastInitP), p.init = null);
            }
            return p;
        };
        CompileSubject.prototype.unSubscribe = function (p) {
            var index = this.datas.indexOf(p);
            if (index >= 0)
                this.datas.splice(index, 1);
        };
        CompileSubject.prototype.unLinkSubject = function () {
            this.subject && this.subject.unSubscribe(this.linkParam);
            return this;
        };
        CompileSubject.prototype.init = function (p) {
            if (this.isRemove)
                return;
            this.isInit = true;
            this.lastInitP = p;
            cmpxLib_3["default"].each(this.datas, function (item) {
                if (item.init) {
                    item.init(p);
                    item.init = null;
                }
            });
        };
        CompileSubject.prototype.update = function (p) {
            if (this.isRemove)
                return;
            cmpxLib_3["default"].each(this.datas, function (item) {
                if (item.update) {
                    item.update && item.update(p);
                }
            });
            this.updateAfter(p);
        };
        CompileSubject.prototype.updateAfter = function (p) {
            if (this.isRemove)
                return;
            cmpxLib_3["default"].each(this.datas, function (item) {
                if (item.updateAfter) {
                    item.updateAfter && item.updateAfter(p);
                }
            });
        };
        CompileSubject.prototype.insertDoc = function (p) {
            if (this.isRemove)
                return;
            cmpxLib_3["default"].each(this.datas, function (item) {
                if (item.insertDoc) {
                    item.insertDoc(p);
                    item.insertDoc = null;
                }
            });
        };
        CompileSubject.prototype.ready = function (p) {
            if (this.isRemove)
                return;
            cmpxLib_3["default"].each(this.datas, function (item) {
                if (item.ready) {
                    item.ready(p);
                    item.ready = null;
                }
            });
        };
        CompileSubject.prototype.remove = function (p) {
            if (this.isRemove)
                return;
            this.isRemove = true;
            this.unLinkSubject();
            var datas = this.datas;
            this.datas = [];
            cmpxLib_3["default"].each(datas, function (item) {
                if (item.remove) {
                    item.remove(p);
                    item.remove = null;
                }
            });
        };
        return CompileSubject;
    }());
    exports.CompileSubject = CompileSubject;
    var _tmplName = '__tmpl__', _getComponetTmpl = function (componet, id) {
        var tmpls = componet[_tmplName];
        if (!tmpls || !tmpls[id])
            return componet.$parent ? _getComponetTmpl(componet.$parent, id) : null;
        else
            return tmpls[id];
    }, _insertAfter = function (newElement, refElement, parent) {
        var nextSibling = refElement.nextSibling;
        if (nextSibling) {
            parent.insertBefore(newElement, nextSibling);
        }
        else
            parent.appendChild(newElement);
    }, _createTempNode = function () {
        return document.createTextNode('');
        // let element:Node = document.createElement('script');
        // element['type'] = 'text/html';
        // return element;
    }, _getRefNode = function (parentNode, insertTemp) {
        var tNode;
        if (insertTemp) {
            tNode = _createTempNode();
            parentNode.appendChild(tNode);
        }
        else {
            tNode = parentNode.lastChild;
            if (!tNode) {
                insertTemp = true;
                tNode = _createTempNode();
                parentNode.appendChild(tNode);
            }
        }
        //注意tmplElement是Comment, 在IE里只能取到parentNode
        return { refNode: tNode, isInsertTemp: insertTemp };
    }, _equalArrayIn = function (array1, array2) {
        var ok = true;
        cmpxLib_3["default"].each(array1, function (item, index) {
            if (item != array2[index]) {
                ok = false;
                return false;
            }
        });
        return ok;
    }, _equalArray = function (array1, array2) {
        if ((!array1 || !array2))
            return array1 == array2;
        return array1.length == array2.length && _equalArrayIn(array1, array2);
    }, _getParentElement = function (node) {
        return node.parentElement || node.parentNode;
    }, _removeChildNodes = function (childNodes) {
        if (childNodes && childNodes.length > 0) {
            var pNode_1;
            cmpxLib_3["default"].each(childNodes, function (item) {
                (pNode_1 = _getParentElement(item)) && pNode_1.removeChild(item);
            });
        }
        return null;
    };
    var CompileRender = (function () {
        /**
         *
         * @param tmpl html模板文本
         * @param componetDef 组件定义类，如果没有传为临时模板
         */
        function CompileRender(context, componetDef, param) {
            this.componetDef = componetDef;
            this.param = param;
            var fn;
            if (cmpxLib_3["default"].isString(context)) {
                var tagInfos = _makeTagInfos(cmpxLib_3["default"].trim(context, true));
                fn = _buildCompileFn(tagInfos, param);
                //console.log(tagInfos);
            }
            else
                fn = context;
            // console.log(fn.toString());
            this.contextFn = fn;
        }
        /**
         * 编译并插入到document
         * @param refElement 在element之后插入内容
         * @param parentComponet 父组件
         */
        CompileRender.prototype.complie = function (refNode, parentComponet, subject, contextFn, subjectExclude) {
            var _this = this;
            var componetDef = this.componetDef;
            subject || (subject = (parentComponet ? parentComponet.$subObject : null));
            subjectExclude || (subjectExclude = {});
            //subjectExclude.remove = true;
            subjectExclude.insertDoc = true;
            var componet, isNewComponet = false, parentElement = _getParentElement(refNode), newSubject = new CompileSubject(subject, subjectExclude);
            if (componetDef) {
                isNewComponet = true;
                componet = new componetDef();
                componet.$name = name;
                componet.$subObject = newSubject;
                componet.$parentElement = parentElement;
                componet.$parent = parentComponet;
                parentComponet && parentComponet.$children.push(componet);
            }
            else {
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
                remove: function (p) {
                    try {
                        isNewComponet && (componet.$isDisposed = true, componet.onDispose());
                        if (p.componet == componet)
                            childNodes = _removeChildNodes(childNodes);
                    }
                    catch (e) {
                        cmpxLib_3["default"].trace(e);
                    }
                    finally {
                        if (isNewComponet) {
                            if (parentComponet && !parentComponet.$isDisposed) {
                                var childs = parentComponet.$children, idx = childs.indexOf(componet);
                                (idx >= 0) && childs.splice(idx, 1);
                            }
                            componet.$subObject = componet.$children =
                                componet.$parent = componet.$parentElement = null;
                        }
                    }
                },
                updateAfter: function (p) {
                    isNewComponet && retFn && retFn.call(componet);
                }
            });
            var childNodes, retFn;
            var fragment, initFn = function () {
                newSubject.init({
                    componet: componet
                });
                fragment = document.createDocumentFragment();
                subject && subject.subscribe({
                    remove: function (p) {
                        fragment = refNode = componet = parentElement = parentComponet = null;
                    }
                });
                retFn = _this.contextFn.call(componet, cmpxLib_3["default"], Compile, componet, fragment, newSubject, _this.param, function (vvList) {
                    if (!vvList || vvList.length == 0)
                        return;
                    var vvDef = _getViewvarDef(this);
                    if (!vvDef)
                        return;
                    cmpxLib_3["default"].each(vvDef, function (def) {
                        var propKey = def.propKey, name = def.name;
                        cmpxLib_3["default"].each(vvList, function (item) {
                            if (item.name == name) {
                                if (item.isL) {
                                    if (!this[propKey] || item.p.length > 0)
                                        this[propKey] = item.p.splice(0);
                                }
                                else
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
            }, readyFn = function () {
                childNodes = cmpxLib_3["default"].toArray(fragment.childNodes);
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
        };
        return CompileRender;
    }());
    exports.CompileRender = CompileRender;
    var _loadTmplFn;
    var Compile = (function () {
        function Compile() {
        }
        /**
         * 编译器启动，用于htmlDef配置后
         */
        Compile.startUp = function () {
            if (_readyRd)
                return;
            _readyRd = true;
            cmpxLib_3["default"].each(_renderPR, function (item) {
                item();
            });
            _renderPR = null;
        };
        Compile.loadTmplCfg = function (loadTmplFn) {
            _loadTmplFn = loadTmplFn;
        };
        Compile.createComponet = function (name, componet, parentElement, subject, contextFn) {
            if (subject.isRemove)
                return;
            var vm = _registerVM[name], componetDef = vm.componetDef, _a = _getRefNode(parentElement, false), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
            Compile.renderComponet(componetDef, refNode, function () { }, componet, subject, contextFn);
        };
        Compile.setAttributeCP = function (element, name, content, componet, subject) {
            var isObj = !cmpxLib_3["default"].isString(content), parent = componet.$parent;
            if (isObj) {
                var isEvent = !!content.event, update = void 0;
                if (isEvent) {
                    var isBind_1 = false, eventDef_1 = componet[name], eventFn_1 = function (args) { return content.event.apply(componet, args); };
                    eventDef_1 || (eventDef_1 = componet[name] = new cmpxEvent_1["default"]());
                    subject.subscribe({
                        update: function (p) {
                            if (isBind_1)
                                return;
                            isBind_1 = true;
                            eventDef_1.on(eventFn_1);
                        },
                        remove: function (p) {
                            isBind_1 && eventDef_1.off();
                            componet[name] = null;
                        }
                    });
                }
                else {
                    var value_1, newValue_1, isWrite_1 = !!content.write, isRead_1 = !!content.read, writeFn_1 = function (p) {
                        newValue_1 = componet[name];
                        if (value_1 != newValue_1) {
                            value_1 = newValue_1;
                            content.write.call(parent, newValue_1);
                            parent.$updateAsync();
                        }
                    };
                    var attrDef = htmlDef_1.HtmlDef.getHtmlAttrDef(name);
                    subject.subscribe({
                        update: function (p) {
                            if (isRead_1) {
                                newValue_1 = content.read.call(parent);
                                if (value_1 != newValue_1) {
                                    value_1 = newValue_1;
                                    componet[name] = value_1;
                                    componet.$updateAsync();
                                }
                                else if (isWrite_1) {
                                    writeFn_1(p);
                                }
                            }
                            else if (isWrite_1) {
                                writeFn_1(p);
                            }
                        }
                    });
                }
            }
            else
                componet[name] = content;
        };
        Compile.createElement = function (name, attrs, componet, parentElement, subject, contextFn, content) {
            if (subject.isRemove)
                return;
            var element = htmlDef_1.HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content);
            parentElement.appendChild(element);
            contextFn && contextFn(componet, element, subject);
        };
        Compile.createTextNode = function (content, componet, parentElement, subject) {
            if (subject.isRemove)
                return;
            var isObj = !cmpxLib_3["default"].isString(content), value = '', once = isObj ? content.once : false, readFn = isObj ? content.read : null, textNode = document.createTextNode(isObj ? (once ? readFn.call(componet) : value) : content);
            parentElement.appendChild(textNode);
            subject.subscribe({
                update: function (p) {
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
        };
        Compile.setAttribute = function (element, name, subName, content, componet, subject) {
            var isObj = !cmpxLib_3["default"].isString(content);
            if (isObj) {
                var isEvent = !!content.event, update = void 0, eventDef_2;
                if (isEvent) {
                    var isBind_2 = false, eventFn_2 = function (e) { return content.event.call(componet, event); };
                    eventDef_2 = htmlDef_1.HtmlDef.getHtmlEventDef(name);
                    subject.subscribe({
                        update: function (p) {
                            if (isBind_2)
                                return;
                            isBind_2 = true;
                            eventDef_2.addEventListener(element, name, eventFn_2, false);
                        },
                        remove: function (p) {
                            if (isBind_2) {
                                eventDef_2.removeEventListener(element, name, eventFn_2, false);
                            }
                        }
                    });
                }
                else {
                    var value_2 = '', newValue_2, isWrite_2 = !!content.write, isRead_2 = !!content.read, writeFn_2 = function () {
                        newValue_2 = attrDef_1.getAttribute(element, name);
                        if (value_2 != newValue_2) {
                            value_2 = newValue_2;
                            content.write.call(componet, newValue_2);
                            componet.$updateAsync();
                        }
                    };
                    var attrDef_1 = htmlDef_1.HtmlDef.getHtmlAttrDef(name);
                    if (isWrite_2) {
                        eventDef_2 = htmlDef_1.HtmlDef.getHtmlEventDef(name);
                        eventDef_2.addEventListener(element, 'change', writeFn_2, false);
                        eventDef_2.addEventListener(element, 'click', writeFn_2, false);
                    }
                    subject.subscribe({
                        update: function (p) {
                            if (isRead_2) {
                                newValue_2 = content.read.call(componet);
                                if (value_2 != newValue_2) {
                                    value_2 = newValue_2;
                                    attrDef_1.setAttribute(element, name, value_2, subName);
                                }
                            }
                        },
                        remove: function (p) {
                            if (isWrite_2) {
                                eventDef_2.removeEventListener(element, 'change', writeFn_2, false);
                                eventDef_2.removeEventListener(element, 'click', writeFn_2, false);
                            }
                        }
                    });
                }
            }
            else
                htmlDef_1.HtmlDef.getHtmlAttrDef(name).setAttribute(element, name, content);
        };
        Compile.forRender = function (dataFn, eachFn, componet, parentElement, insertTemp, subject) {
            if (subject.isRemove || !dataFn || !eachFn)
                return;
            var _a = _getRefNode(parentElement, insertTemp), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
            var value, newSubject;
            var fragment, childNodes, removeFn = function () {
                childNodes = _removeChildNodes(childNodes);
            };
            subject.subscribe({
                update: function (p) {
                    var datas = dataFn.call(componet, componet, parentElement, subject);
                    if (!_equalArray(datas, value)) {
                        value = datas;
                        removeFn();
                        newSubject && newSubject.remove({
                            componet: componet
                        });
                        newSubject = new CompileSubject(subject, { insertDoc: true });
                        fragment = document.createDocumentFragment();
                        var count_1 = datas ? datas.length : 0;
                        cmpxLib_3["default"].each(datas, function (item, index) {
                            eachFn.call(componet, item, count_1, index, componet, fragment, newSubject);
                        });
                        newSubject.update({
                            componet: componet
                        });
                        childNodes = cmpxLib_3["default"].toArray(fragment.childNodes);
                        _insertAfter(fragment, refNode, parentElement);
                        newSubject.insertDoc({
                            componet: componet
                        });
                    }
                },
                remove: function (p) {
                    removeFn();
                    newSubject = fragment = childNodes = refNode = null;
                }
            });
        };
        Compile.ifRender = function (ifFun, trueFn, falseFn, componet, parentElement, insertTemp, subject) {
            if (subject.isRemove)
                return;
            var _a = _getRefNode(parentElement, insertTemp), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
            var value, newSubject;
            var fragment, childNodes, removeFn = function () {
                childNodes = _removeChildNodes(childNodes);
            };
            subject.subscribe({
                update: function (p) {
                    var newValue = !!ifFun.call(componet, componet, parentElement, subject);
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
                        childNodes = cmpxLib_3["default"].toArray(fragment.childNodes);
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        newSubject.insertDoc({
                            componet: componet
                        });
                    }
                },
                remove: function (p) {
                    removeFn();
                    newSubject = fragment = childNodes = refNode = null;
                }
            });
        };
        Compile.tmplRender = function (id, componet, parentElement, subject, contextFn) {
            if (subject.isRemove)
                return;
            var tmpls = componet[_tmplName];
            tmpls || (tmpls = componet[_tmplName] = {});
            tmpls[id] = function (componet, element, subject, param) {
                contextFn && contextFn.call(componet, componet, element, subject, param);
            };
        };
        Compile.includeRender = function (context, componet, parentElement, insertTemp, subject, param) {
            if (!context || subject.isRemove)
                return;
            if (cmpxLib_3["default"].isString(context)) {
                var tmpl = _getComponetTmpl(componet, context);
                tmpl && tmpl.call(componet, componet, parentElement, subject, param || {});
            }
            else {
                var render_1, preSubject_1, preComponet_1, _a = _getRefNode(parentElement, insertTemp), refNode_1 = _a.refNode, isInsertTemp = _a.isInsertTemp;
                subject.subscribe({
                    update: function (p) {
                        var newRender = context.call(componet);
                        if (newRender != render_1) {
                            render_1 = newRender;
                            preSubject_1 && preSubject_1.remove({
                                componet: preComponet_1
                            });
                            var _a = newRender.complie(refNode_1, componet, subject), newSubject = _a.newSubject, refComponet = _a.refComponet;
                            preSubject_1 = newSubject;
                            preComponet_1 = refComponet;
                        }
                    },
                    remove: function (p) {
                        render_1 = null;
                    }
                });
            }
        };
        Compile.renderComponet = function (componetDef, refNode, complieEnd, parentComponet, subject, contextFn) {
            _tmplLoaded(function () {
                var vm = _getVmByComponetDef(componetDef), render = vm && vm.render;
                if (!vm)
                    throw new Error('not find @VM default!');
                var _a = render.complie(refNode, parentComponet, subject, contextFn, { update: true }), newSubject = _a.newSubject, refComponet = _a.refComponet;
                complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
            });
        };
        return Compile;
    }());
    exports.Compile = Compile;
    var _buildCompileFn = function (tagInfos, param) {
        var outList = [], varNameList = [];
        _buildCompileFnContent(tagInfos, outList, varNameList, true);
        varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
        param && outList.unshift(_getCompileFnParam(param));
        outList.unshift("var __tmplRender = Compile.tmplRender,\n    __createComponet = Compile.createComponet,\n    __setAttributeCP = Compile.setAttributeCP,\n    __createElement = Compile.createElement,\n    __setAttribute = Compile.setAttribute,\n    __createTextNode = Compile.createTextNode,\n    __forRender = Compile.forRender,\n    __ifRender = Compile.ifRender,\n    __includeRender = Compile.includeRender;");
        outList.push(_buildCompileFnReturn(varNameList));
        return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', '__p__', 'initViewvar', outList.join('\n'));
    }, _getCompileFnParam = function (param) {
        var pList = [];
        cmpxLib_3["default"].eachProp(param, function (item, name) {
            pList.push([name, ' = ', '__p__.', name].join(''));
        });
        return 'var ' + pList.join(', ') + ';';
    }, _buildCpFnRetRmRegex = /\s*\=\s*\[\s*\]\s*$/, _buildCompileFnReturn = function (varNameList) {
        if (varNameList.length > 0) {
            var vvList_1 = [], isL_1;
            cmpxLib_3["default"].each(varNameList, function (item) {
                isL_1 = _buildCpFnRetRmRegex.test(item);
                isL_1 && (item = item.replace(_buildCpFnRetRmRegex, ''));
                vvList_1.push(['{name:"', item, '", p:', item, ', isL:', (isL_1 ? 'true' : 'false'), '}'].join(''));
            });
            return 'return function(){initViewvar.call(this, [' + vvList_1.join(',') + ']);};';
        }
        else {
            return 'return function(){initViewvar.call(this);};';
        }
    }, _escapeStringRegex = /([\"\\])/gm, _escapeBuildString = function (s) {
        return s ? s.replace(/([\"\\])/gm, '\\$1').replace(/\n/gm, '\\n').replace(/\r/gm, '\\r') : '';
    }, _makeSubName = function (name) {
        if (name.indexOf('.') > 0) {
            return name.split('.');
        }
        else
            return [name, ''];
    }, _makeElementTag = function (tagName, attrs) {
        var bindAttrs = [], stAtts = [], names;
        cmpxLib_3["default"].each(attrs, function (item) {
            if (item.name == '$var' || item.name == '$array')
                return;
            if (item.bind)
                bindAttrs.push(item);
            else {
                names = _makeSubName(item.name);
                stAtts.push({ name: names[0], value: _escapeBuildString(item.value), subName: names[1] });
            }
        });
        return { bindAttrs: bindAttrs, stAtts: stAtts };
    }, _buildAttrContent = function (attrs, outList) {
        if (!attrs)
            return;
        var names;
        cmpxLib_3["default"].each(attrs, function (attr, index) {
            names = _makeSubName(attr.name);
            outList.push('__setAttribute(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject);');
        });
    }, _buildAttrContentCP = function (attrs, outList) {
        if (!attrs)
            return;
        cmpxLib_3["default"].each(attrs, function (attr, index) {
            if (attr.name == '$var')
                return;
            if (attr.bind)
                outList.push('__setAttributeCP(element, "' + attr.name + '", ' + attr.bindInfo.content + ', componet, subject);');
            else
                outList.push('__setAttributeCP(element, "' + attr.name + '", "' + _escapeBuildString(attr.value) + '", componet, subject);');
        });
    }, _getViewvarName = function (attrs) {
        var name = { item: null, list: null }, has = false;
        cmpxLib_3["default"].each(attrs, function (attr, index) {
            if (attr.name == '$var') {
                name.item = cmpxLib_3["default"].trim(attr.value);
                has = true;
                return false;
            }
            else if (attr.name == '$array') {
                name.list = cmpxLib_3["default"].trim(attr.value);
                has = true;
                return false;
            }
        });
        return has ? name : null;
    }, _getInsertTemp = function (preInsert) {
        return preInsert ? 'true' : 'false';
    }, _getTagContent = function (tagInfo) {
        var content;
        cmpxLib_3["default"].each(tagInfo.children, function (item) {
            content = cmpxLib_3["default"].decodeHtml(item.content);
        });
        return content;
    }, _buildCompileFnForVar = function (itemName, outList) {
        var str = ['var $last = ($count - $index == 1), ', itemName, '_last = $last, ',
            '$first = ($index ==  0), ', itemName, '_first = $first, ',
            '$odd = ($index % 2 ==  0), ', itemName, '_odd = $odd, ',
            '$even = !$odd, ', itemName, '_even = $even;'].join('');
        outList.push(str);
    }, _buildCompileFnContent = function (tagInfos, outList, varNameList, preInsert, inclue) {
        if (!tagInfos)
            return;
        cmpxLib_3["default"].each(tagInfos, function (tag, index) {
            var tagName = tag.tagName;
            //如果指定include, 非tagName或不包涵，不引入
            if (inclue && (!tagName || inclue.indexOf(tagName) < 0))
                return;
            if (!tag.cmd) {
                if (tag.target) {
                    var hasChild = tag.children && tag.children.length > 0, hasAttr = tag.attrs && tag.attrs.length > 0, varName = hasAttr ? _getViewvarName(tag.attrs) : null;
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
                        }
                        else {
                            outList.push('__createComponet("' + tagName + '", componet, element, subject);');
                        }
                        preInsert = true;
                    }
                    else {
                        var htmlTagDef = tag.htmlTagDef, rawTag = htmlTagDef.raw, tagContent = rawTag && _getTagContent(tag);
                        //如果rawTag没有子级
                        hasChild && (hasChild = !rawTag);
                        if (hasAttr || hasChild || varName) {
                            var _a = _makeElementTag(tagName, tag.attrs), bindAttrs = _a.bindAttrs, stAtts = _a.stAtts;
                            outList.push('__createElement("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject) {');
                            if (varName) {
                                varName.item && outList.push(varName.item + ' = element;');
                                varName.list && outList.push(varName.list + '.push(element);');
                            }
                            _buildAttrContent(bindAttrs, outList);
                            hasChild && _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                            outList.push('}, "' + _escapeBuildString(tagContent) + '");');
                        }
                        else {
                            outList.push('__createElement("' + tagName + '", [], componet, element, subject, null, "' + _escapeBuildString(tagContent) + '");');
                        }
                        preInsert = false;
                    }
                }
                else {
                    if (tag.bind) {
                        outList.push('__createTextNode(' + tag.bindInfo.content + ', componet, element, subject);');
                    }
                    else
                        outList.push('__createTextNode("' + _escapeBuildString(tag.content) + '", componet, element, subject);');
                    preInsert = false;
                }
            }
            else {
                switch (tagName) {
                    case 'for':
                        var extend = tag.attrs[0].extend, itemName = extend.item;
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
                        var ifFn_1 = function (ifTag) {
                            var ifChild = ifTag.children, hasElse = ifChild ? ifChild[ifChild.length - 1].tagName == 'else' : false, elseTag = hasElse ? ifChild.pop() : null;
                            outList.push('__ifRender(function (componet, element, subject) {');
                            outList.push('return ' + (ifTag.content || 'true'));
                            outList.push('}, function (componet, element, subject) {');
                            _buildCompileFnContent(ifChild, outList, varNameList, preInsert);
                            outList.push('}, function (componet, element, subject) {');
                            if (hasElse) {
                                ifFn_1(elseTag);
                                //_buildCompileFnContent(elseTag.children, outList, varNameList, preInsert);
                            }
                            outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject);');
                        };
                        ifFn_1(tag);
                        preInsert = true;
                        break;
                    case 'include':
                        var incAttr = cmpxLib_3["default"].arrayToObject(tag.attrs, 'name'), incTmpl = incAttr['tmpl'], incParam = incAttr['param'] ? incAttr['param'].value : 'null', incRender = incAttr['render'];
                        incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                        var context_1 = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');
                        outList.push('__includeRender(' + context_1 + ', componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + incParam + ');');
                        preInsert = true;
                        break;
                    case 'tmpl':
                        var tmplAttr = cmpxLib_3["default"].arrayToObject(tag.attrs, 'name'), tmplId = tmplAttr['id'], tmplLet = tmplAttr['let'];
                        outList.push('__tmplRender("' + (tmplId ? _escapeBuildString(tmplId.value) : '') + '", componet, element, subject, function (componet, element, subject, param) {');
                        tmplLet && outList.push('var ' + tmplLet.value + ';');
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('});');
                        break;
                }
            }
        });
    };
});
define("componet", ["require", "exports", "compile"], function (require, exports, compile_1) {
    "use strict";
    exports.__esModule = true;
    var Componet = (function () {
        function Componet() {
            this.$children = [];
            /**
             * 是否已经释放
             */
            this.$isDisposed = false;
        }
        /**
         * 更新View，View与Componet数据同步
         * @param p 传入参数
         */
        Componet.prototype.$update = function (p) {
            var _this = this;
            if (this.$isDisposed)
                return;
            this.onUpdateBefore(function () {
                if (_this.$isDisposed)
                    return;
                _this.$subObject.update({
                    componet: _this,
                    param: p
                });
            }, p);
            this.onUpdate(function () { }, p);
        };
        /**
         * 步异步更新View，View与Componet数据同步
         * @param p 传入参数
         */
        Componet.prototype.$updateAsync = function (callback, p) {
            var _this = this;
            this.updateId && clearTimeout(this.updateId);
            this.updateId = setTimeout(function () {
                _this.updateId = null;
                _this.$update(p);
                callback && callback.apply(_this);
            }, 5);
        };
        /**
         * 将模板生成CompileRender, 用于include标签动态绑定用
         * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
         * @param tmpl 模板文本
         * @param p 传入模板参数
         */
        Componet.prototype.$render = function (tmpl, p) {
            var rd = new compile_1.CompileRender(tmpl, null, p);
            return rd;
        };
        /**
         * 在解释View之前触发，一般准备数据用
         * @param cb 处理完成后，通知继续处理
         * @param p 传入的参数
         */
        Componet.prototype.onInit = function (cb, p) {
            cb && cb();
        };
        /**
         * 准备好Viewvar后, 在onInit之后、onReady之前触发
         * @param cb 处理完成后，通知继续处理
         * @param p 传入的参数
         */
        Componet.prototype.onInitViewvar = function (cb, p) {
            cb && cb();
        };
        /**
         * View所有东西已经处理完成时触发
         * @param cb 处理完成后，通知继续处理
         * @param p 传入参数
         */
        Componet.prototype.onReady = function (cb, p) {
            cb && cb();
        };
        /**
         * $update前时触发
         * @param cb 处理完成后，通知继续处理
         */
        Componet.prototype.onUpdateBefore = function (cb, p) {
            cb && cb();
        };
        /**
         * $update后时触发
         * @param cb 处理完成后，通知继续处理
         */
        Componet.prototype.onUpdate = function (cb, p) {
            cb && cb();
        };
        /**
         * 在componet释放前触发
         */
        Componet.prototype.onDispose = function () {
        };
        return Componet;
    }());
    exports.Componet = Componet;
});
define("platform", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Platform = (function () {
        function Platform() {
        }
        return Platform;
    }());
    exports["default"] = Platform;
});
define("browser", ["require", "exports", "platform", "compile", "htmlDef", "cmpxLib"], function (require, exports, platform_1, compile_2, htmlDef_2, cmpxLib_4) {
    "use strict";
    exports.__esModule = true;
    var _getParentElement = function (element) {
        return element.parentElement || element.parentNode;
    }, _setAttribute = function (element, attrs) {
        cmpxLib_4["default"].each(attrs, function (item) {
            htmlDef_2.HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
        });
    }, _htmlTtype = /script|style/i, _createElementRaw = function (name, attrs, parent, content) {
        var element = document.createElement(name);
        element[_htmlTtype.test(name) ? 'innerHTML' : 'innerText'] = content || "";
        _setAttribute(element, attrs);
        return element;
    };
    var _rawTag = new htmlDef_2.HtmlTagDef({
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
    var _htmlConfig = function () {
        //扩展tag, 如果不支持请在这里扩展
        htmlDef_2.HtmlDef.extendHtmlTagDef({
            //默认不支持svg, 请处理HtmlTagDef的createElement参数
            'svg': htmlDef_2.DEFULE_TAG,
            //默认不支持math, 请处理HtmlTagDef的createElement参数
            'math': htmlDef_2.DEFULE_TAG,
            'br': htmlDef_2.SINGLE_TAG,
            'style': _rawTag,
            'script': _rawTag,
            'title': _rawTag,
            'textarea': _rawTag
        });
        //扩展attr, 如果不支持请在这里扩展
        htmlDef_2.HtmlDef.extendHtmlAttrDef({
            'name': htmlDef_2.DEFAULT_ATTR,
            'value': htmlDef_2.DEFAULT_ATTR_PROP,
            'type': htmlDef_2.DEFAULT_ATTR_PROP
        });
        //扩展事件处理, 如果不支持请在这里扩展
        htmlDef_2.HtmlDef.extendHtmlEventDef({
            "click": htmlDef_2.DEFAULT_EVENT_DEF
        });
        // //更改默认值，参考如下：
        // DEFAULT_EVENT_DEF.addEventListener = (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) {
        //     element.addEventListener(eventName, context, useCapture);
        //     //attachEvent
        // }
        compile_2.Compile.loadTmplCfg(function (url, cb) {
            var xhr = new XMLHttpRequest(), headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/plain, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }, protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                        cb(xhr.responseText);
                    }
                    else {
                        cb('');
                    }
                }
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        });
    };
    var Browser = (function (_super) {
        __extends(Browser, _super);
        function Browser() {
            var _this = _super.call(this) || this;
            //htmlDef配置
            _htmlConfig();
            //编译器启动，用于htmlDef配置后
            compile_2.Compile.startUp();
            return _this;
        }
        Browser.prototype.boot = function (componetDef) {
            var name = componetDef.prototype.$name, bootElement = document.getElementsByTagName(name)[0];
            if (!bootElement)
                throw new Error("\u6CA1\u6709" + name + "\u6807\u7B7E");
            var _doc = document, parentElement = _getParentElement(bootElement);
            var preElement = bootElement.previousSibling;
            if (!preElement) {
                preElement = _doc.createComment(name);
                parentElement.insertBefore(preElement, bootElement);
            }
            parentElement.removeChild(bootElement);
            bootElement = preElement;
            ////DOMContentLoaded 时起动
            var _readyName = 'DOMContentLoaded', _ready = function () {
                _doc.removeEventListener(_readyName, _ready, false);
                window.removeEventListener('load', _ready, false);
                //注意tmplElement是Comment, 在IE里只能取到parentNode
                var parentElement = _getParentElement(bootElement);
                compile_2.Compile.renderComponet(componetDef, bootElement, function (newSubject, refComponet) {
                    parentElement.removeChild(bootElement);
                    //console.log(refComponet);
                    var _unload = function () {
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
        };
        return Browser;
    }(platform_1["default"]));
    exports.Browser = Browser;
});
define("index", ["require", "exports", "cmpxLib", "cmpxEvent", "htmlDef", "compile", "componet", "platform", "browser"], function (require, exports, cmpxLib_5, cmpxEvent_2, htmlDef_3, compile_3, componet_1, platform_2, browser_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.__esModule = true;
    __export(cmpxLib_5);
    __export(cmpxEvent_2);
    __export(htmlDef_3);
    __export(compile_3);
    __export(componet_1);
    __export(platform_2);
    __export(browser_1);
});
define("testing/test", ["require", "exports", "index"], function (require, exports, index_1) {
    "use strict";
    exports.__esModule = true;
    var ComponetItem = (function (_super) {
        __extends(ComponetItem, _super);
        function ComponetItem() {
            var _this = _super.call(this) || this;
            _this.name = "test item";
            setTimeout(function () {
                _this.num += "" + new Date().valueOf();
                _this.$update();
            }, 1000);
            return _this;
        }
        ComponetItem.prototype.onInit = function (cb, p) {
            _super.prototype.onInit.call(this, cb, p);
            // super.onInit(function(){
            //   cb();
            // }, p);
        };
        ComponetItem.prototype.onDispose = function () {
            _super.prototype.onDispose.call(this);
            //console.log('ComponetItem onDispose');
        };
        return ComponetItem;
    }(index_1.Componet));
    ComponetItem = __decorate([
        index_1.VM({
            name: 'item',
            tmpl: "<span>\n    {{this.name}}:{{this.param}}[{{this.num}}]\n  </span>"
        })
    ], ComponetItem);
    var MyComponet = (function (_super) {
        __extends(MyComponet, _super);
        function MyComponet() {
            var _this = _super.call(this) || this;
            _this.ok = true;
            _this.ok1 = true;
            _this.ok2 = true;
            _this.text = "text";
            _this.users = [{ id: 'id 0' }];
            _this.num = 20;
            _this.numPrint = '';
            _this.testRender = _this.$render(' [<item param="asdfafd" num="{{this.numPrint}}"></item> {{dddd}}]', { dddd: 111 });
            return _this;
            //this.makeItem(1000);
        }
        MyComponet.prototype.clickRender = function () {
            this.testRender = this.$render(' [<item param="asdfafd" num="{{this.numPrint}}"></item>]' + new Date().valueOf());
            this.$update();
        };
        MyComponet.prototype.onInit = function (cb, p) {
            //console.log('onInit');
            _super.prototype.onInit.call(this, cb, p);
            // setTimeout(()=>{
            //   super.onInit(cb, p);
            // }, 1000);
        };
        MyComponet.prototype.onUpdateBefore = function (cb, p) {
            //console.log('onUpdateBefore');
            _super.prototype.onUpdateBefore.call(this, cb, p);
        };
        MyComponet.prototype.onUpdate = function (cb, p) {
            console.log('onUpdate');
            _super.prototype.onUpdate.call(this, cb, p);
        };
        MyComponet.prototype.onInitViewvar = function (cb, p) {
            //console.log('onInitViewvar', this.testCp);
            _super.prototype.onInitViewvar.call(this, cb, p);
        };
        MyComponet.prototype.onReady = function (cb, p) {
            console.log('onReady');
            _super.prototype.onReady.call(this, cb, p);
        };
        MyComponet.prototype.makeItem = function (num) {
            var list = [];
            for (var i = 0; i < num; i++)
                list.push({ id: 'id ' + i });
            this.users = list;
        };
        MyComponet.prototype.click = function () {
            var n = 1 + Math.round(Math.random() * (~~this.num));
            this.makeItem(n);
            var t = new Date().valueOf();
            // console.log('cpList b', this.cpList);
            console.time('update ' + n);
            this.$update();
            console.timeEnd('update ' + n);
            this.numPrint = n + ' ' + (new Date().valueOf() - t) + 'ms ';
            this.$update();
            // console.log('cpList e', this.cpList);
        };
        MyComponet.prototype.clickItem = function () {
            this.users[0].id = new Date().toString();
            console.time('updateItem');
            this.$update();
            console.timeEnd('updateItem');
        };
        return MyComponet;
    }(index_1.Componet));
    __decorate([
        index_1.viewvar('input1')
    ], MyComponet.prototype, "inputTest");
    __decorate([
        index_1.viewvar()
    ], MyComponet.prototype, "input1");
    __decorate([
        index_1.viewvar()
    ], MyComponet.prototype, "cpList");
    MyComponet = __decorate([
        index_1.VM({
            name: 'app',
            tmpl: "<div class=\"app\">\n<div><input $var=\"input1\" type=\"text\" value=\"{{#this.num}}\" />{{this.num}}<input type=\"text\" value={{this.numPrint\n       + '#4@#&'}} click=\"{{@console.log(input1.value)}}\" />\n  divText ({{this.text}}){{: this.text}}\n  <span id=\"span1\" style.color=\"{{'red'}}\" click=\"{{@console.log(element.innerText);}}\"> spanText {{:new Date().toString()}} | {{:new Date().getDay()}}  </Span>\n  <div>\n    <button click=\"{{@this.ok = !this.ok;this.$update()}}\">ok</button>\n    <button click=\"{{@this.ok1 = !this.ok1;this.$update()}}\">ok1</button>\n    <button click=\"{{@this.ok2 = !this.ok2;this.$update()}}\">ok2</button>\n    {{if this.ok}}\n      ok1:true\n    {{else this.ok1}}\n      ok:false, ok1:true\n    {{else this.ok2}}\n      ok:false, ok1:false, ok2:true\n    {{else}}\n      ok:false, ok1:false, ok2:false\n    {{/if}}      \n  </div>\n  <div>\n    <button click=\"{{@this.click(1)}}\">\u6D4B\u8BD5, \u6570\u91CF:{{this.numPrint}}</button>\n    <button click=\"{{@this.clickItem()}}\">\u6D4B\u8BD5item.id</button>\n    <button click=\"{{@this.clickRender()}}\" class=\"blue\">\u6D4B\u8BD5render</button>\n    ({{this.aaaa}})\n  </div>\n  {{tmpl id=\"tmpl1\" let=\"index=param.index\"}}\n    <span>tmpl text</span> {{index}}\n    (<item param=\"asdfafd\" $array=\"cpList\" num=\"{{this.numPrint}}\"></item>)\n  {{/tmpl}}{{for userItem in this.users}}\n    <div> {{:$index}}({{$odd}},{{userItem_odd}}) ({{userItem.id}}) for div text\n           inc:{{include tmpl=\"tmpl1\" param=\"{index:$index}\" }}\n           inc1:{{include render=\"this.testRender\" }}\n    </div>\n  {{/for}}\n    <textarea class=\"red\">\n    <span>aaa\n    </span>\n    </textarea>\n  <pre><span style.color=\"{{'red'}}\">sd   fsfsf</span></pre>\n  <script type=\"text/html\">alert('aaa');</script>\n  <select>{{for item in this.users}}\n  <option>{{item.id}}</option>\n  {{/for}}\n  </select>\n</div>",
            //tmplUrl:'app.html',
            style: ".red {color:red}",
            styleUrl: 'app.css'
        })
    ], MyComponet);
    console.time('start');
    new index_1.Browser().boot(MyComponet);
    console.timeEnd('start');
});
//new IE8Browser().boot(MyComponet); 

//# sourceMappingURL=index.js.map
