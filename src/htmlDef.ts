import { CmpxLib } from "./cmpxLib";

export interface IComplieInfo {
  subject:any,
  componet:any
}

/**
 * HtmlTag配置
 */
export interface IHtmlTagDefConfig {
  [key: string]: HtmlTagDef
}

/**
 * 创建element的属性
 */
export interface ICreateElementAttr {
  /**
   * 属性名称
   */
  name: string;
  /**
   * 属性值
   */
  value: string;
  /**
   * 子名称，如：style.color="red", 子名称为color
   */
  subName?: string;
}

/**
 * 默认element创建器
 * @param name tagName, eg:div
 * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
 * @param parent 父element
 * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
 */
export function DEFAULT_CREATEELEMENT(name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string, complieInfo?:IComplieInfo): HTMLElement {
  let element: HTMLElement = document.createElement(name);
  CmpxLib.each(attrs, function (item: ICreateElementAttr) {
    HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
  });
  return element;
}

//注释标签
let _noteTagRegex = /\<\!--(?:.|\n|\r)*?--\>/gim,
    _extend = function(obj: Object, p: Object):void{
      p && CmpxLib.eachProp(p, function(item: string, name: string){ obj[name.toLowerCase()] = item; });
    };

/**
 * HtmlTag定义类
 */
export class HtmlTagDef {

  /**
   * 单行标签
   */
  single: boolean;
  raw: boolean;
  /**
   * element创建器
   */
  createElement: (name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string, complieInfo?:IComplieInfo) => HTMLElement;

  constructor(
    { single = false, raw = false, createElement = null }: {
      single?: boolean;
      raw?: boolean;
      createElement?: (name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string, complieInfo?:IComplieInfo) => HTMLElement;
    } = {}) {
    this.single = single;
    this.raw = raw;
    this.createElement = createElement || DEFAULT_CREATEELEMENT
  }

}

export const SINGLE_TAG = new HtmlTagDef({ single: true }),
  DEFULE_TAG = new HtmlTagDef();

var _htmlTagDefConfig: IHtmlTagDefConfig = {
  'base': SINGLE_TAG,
  'meta': SINGLE_TAG,
  'area': SINGLE_TAG,
  'embed': SINGLE_TAG,
  'link': SINGLE_TAG,
  'img': SINGLE_TAG,
  'input': SINGLE_TAG,
  'param': SINGLE_TAG,
  'hr': SINGLE_TAG,
  'source': SINGLE_TAG,
  'track': SINGLE_TAG,
  'wbr': SINGLE_TAG,
  'p': DEFULE_TAG,
  'thead': DEFULE_TAG,
  'tbody': DEFULE_TAG,
  'tfoot': DEFULE_TAG,
  'tr': DEFULE_TAG,
  'td': DEFULE_TAG,
  'th': DEFULE_TAG,
  'col': SINGLE_TAG,
  'li': DEFULE_TAG,
  'dt': DEFULE_TAG,
  'dd': DEFULE_TAG,
  'rb': DEFULE_TAG,
  'rt': DEFULE_TAG,
  'rtc': DEFULE_TAG,
  'rp': DEFULE_TAG,
  'optgroup': DEFULE_TAG,
  'option': DEFULE_TAG,
  'pre': DEFULE_TAG,
  'listing': DEFULE_TAG
};

let _rawContentRegex: RegExp,
  _escContentRegex: RegExp,
  _removeCmdRegex: RegExp = /\{\{((?:.|\n|\r)*?)\}\}/gmi;

//删除多余空格
function _removeSpace(html: string): string {
  html = html.replace(_removeCmdRegex, function (find: string, content: string) {
    return ['{{', encodeURIComponent(content), '}}'].join('');
  }).replace(_escContentRegex, function (find: string, name: string, attrs: string, content: string, cmdContent: string) {
    return ['<', name, attrs || '', '>', encodeURIComponent(content || ''), '</', name, '>'].join('');
  })
    .replace(/(?:\n|\r)+/gmi, ' ').replace(/\s{2,}/gmi, ' ')
    .replace(_escContentRegex, function (find: string, name: string, attrs: string, content: string, cmdContent: string) {
      return ['<', name, attrs || '', '>', decodeURIComponent(content || ''), '</', name, '>'].join('');
    }).replace(_removeCmdRegex, function (find: string, content: string) {
      return ['{{', decodeURIComponent(content), '}}'].join('');
    });

  return html;
}

/**
 * HtmlAttr定义
 */
export interface IHtmlAttrDef {
  setAttribute: (element: HTMLElement, name: string, value: string, subName?: string, complieInfo?:IComplieInfo) => void;
  getAttribute: (element: HTMLElement, name: string, subName?: string, complieInfo?:IComplieInfo) => any;
  writeEvent?:string[];
}

/**
 * 默认HtmlAttr定义
 */
export const DEFAULT_ATTR: IHtmlAttrDef = {
  setAttribute(element: HTMLElement, name: string, value: string, subName?: string, complieInfo?:IComplieInfo) {
    if (subName)
      element[name][subName] = value;
    else
      element.setAttribute(name, CmpxLib.toStr(value));
  },
  getAttribute(element: HTMLElement, name: string, subName?: string, complieInfo?:IComplieInfo):any {
    if (subName)
      return element[name][subName];
    else
      return element.getAttribute(name);
  }
};

/**
 * 默认HtmlAttr prop定义
 */
export const DEFAULT_ATTR_PROP: IHtmlAttrDef = {
  setAttribute(element: HTMLElement, name: string, value: string, subName?: string, complieInfo?:IComplieInfo) {
    if (subName)
      element[name][subName] = name == 'value' ? CmpxLib.toStr(value) : value;
    else
      element[name] = name == 'value' ? CmpxLib.toStr(value) : value;
  },
  getAttribute(element: HTMLElement, name: string, subName?: string, complieInfo?:IComplieInfo):any {
    if (subName)
      return element[name][subName];
    else
      return element[name];
  }
};

/**
 * HtmlAttr配置
 */
export interface IHtmlAttrDefConfig {
  [name: string]: IHtmlAttrDef;
}

var _htmlAttrDefConfig: IHtmlAttrDefConfig = {
  'src': DEFAULT_ATTR_PROP,
  'rel': DEFAULT_ATTR_PROP,
  'style': DEFAULT_ATTR_PROP,
  'selected': DEFAULT_ATTR_PROP,
  'disabled': DEFAULT_ATTR_PROP,
  'checked': DEFAULT_ATTR_PROP
};

export interface IHtmlEventDef {
  addEventListener: (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean, complieInfo?:IComplieInfo) => void;
  removeEventListener: (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean, complieInfo?:IComplieInfo) => void;
}

/**
 * 默认事件定义
 */
export const DEFAULT_EVENT_DEF: IHtmlEventDef = {
  addEventListener(element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean, complieInfo?:IComplieInfo) {
    element.addEventListener(eventName, context, useCapture);
    //attachEvent
  },
  removeEventListener(element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean, complieInfo?:IComplieInfo) {
    element.removeEventListener(eventName, context, useCapture);
    //detachEvent
  }
};

/**
 * 事件配置
 */
export interface IHtmlEventDefConfig {
  [name: string]: IHtmlEventDef;
}


var _htmlEventDefConfig: IHtmlEventDefConfig = {};


export class HtmlDef {

    //获取父元素
    static getParentElement(node: Node): HTMLElement {
        return node.parentElement || (node.parentNode as HTMLElement);
    }

  /**
   * 获取标签定义
   * @param tagName 标签名称
   */
  static getHtmlTagDef(tagName: string): HtmlTagDef {
    return _htmlTagDefConfig[tagName.toLowerCase()] || DEFULE_TAG;
  }

  /**
   * 扩展标签定义
   * @param p 标签配置
   */
  static extendHtmlTagDef(p: IHtmlTagDefConfig): void {
    _extend(_htmlTagDefConfig, p);
    _makeSpecTags();
  }

  /**
   * 获取属性定义
   * @param name 
   */
  static getHtmlAttrDef(name: string): IHtmlAttrDef {
    return _htmlAttrDefConfig[name.toLowerCase()] || DEFAULT_ATTR;
  }

  /**
   * 扩展属性定义
   * @param p 
   */
  static extendHtmlAttrDef(p: IHtmlAttrDefConfig): void {
    _extend(_htmlAttrDefConfig, p);
  }

  static getHtmlEventDef(name: string): IHtmlEventDef {
    return _htmlEventDefConfig[name.toLowerCase()] || DEFAULT_EVENT_DEF;
  }

  /**
   * 扩展事件定义
   * @param p 
   */
  static extendHtmlEventDef(p: IHtmlEventDefConfig): void {
    _extend(_htmlEventDefConfig, p);
  }

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
  static handleTagContent(html: string): string {
    return _removeSpace(html.replace(_noteTagRegex, ''))
      .replace(_rawContentRegex, function (find: string, name: string, attrs: string, content: string) {
        return ['<', name, attrs || '', '>', CmpxLib.encodeHtml(content || ''), '</', name, '>'].join('');
      });
  }

}


function _makeSpecTags() {
  let rawTags = [];
  CmpxLib.eachProp(_htmlTagDefConfig, (item: HtmlTagDef, name: string) => {
    item.raw && rawTags.push(name);
  });

  let rawNames = rawTags.join('|');
  _rawContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
  rawNames = [rawNames, 'pre'].join('|');
  _escContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
}

_makeSpecTags();
