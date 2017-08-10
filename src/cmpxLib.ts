
let stringEmpty = "",
    toString = Object.prototype.toString,
    core_hasOwn = Object.prototype.hasOwnProperty,
    noop = function () { },
    slice = Array.prototype.slice;

function testObject(obj: any) {
    if (obj.constructor &&
        !core_hasOwn.call(obj, "constructor") &&
        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
    }
}
let HTML_ENTITIES = {
    '&nbsp;': '\u00A0',
    '&iexcl;': '\u00A1',
    '&cent;': '\u00A2',
    '&pound;': '\u00A3',
    '&curren;': '\u00A4',
    '&yen;': '\u00A5',
    '&brvbar;': '\u00A6',
    '&sect;': '\u00A7',
    '&uml;': '\u00A8',
    '&copy;': '\u00A9',
    '&ordf;': '\u00AA',
    '&laquo;': '\u00AB',
    '&not;': '\u00AC',
    '&shy;': '\u00AD',
    '&reg;': '\u00AE',
    '&macr;': '\u00AF',
    '&deg;': '\u00B0',
    '&plusmn;': '\u00B1',
    '&sup2;': '\u00B2',
    '&sup3;': '\u00B3',
    '&acute;': '\u00B4',
    '&micro;': '\u00B5',
    '&para;': '\u00B6',
    '&middot;': '\u00B7',
    '&cedil;': '\u00B8',
    '&sup1;': '\u00B9',
    '&ordm;': '\u00BA',
    '&raquo;': '\u00BB',
    '&frac14;': '\u00BC',
    '&frac12;': '\u00BD',
    '&frac34;': '\u00BE',
    '&iquest;': '\u00BF',
    '&Agrave;': '\u00C0',
    '&Aacute;': '\u00C1',
    '&Acirc;': '\u00C2',
    '&Atilde;': '\u00C3',
    '&Auml;': '\u00C4',
    '&Aring;': '\u00C5',
    '&AElig;': '\u00C6',
    '&Ccedil;': '\u00C7',
    '&Egrave;': '\u00C8',
    '&Eacute;': '\u00C9',
    '&Ecirc;': '\u00CA',
    '&Euml;': '\u00CB',
    '&Igrave;': '\u00CC',
    '&Iacute;': '\u00CD',
    '&Icirc;': '\u00CE',
    '&Iuml;': '\u00CF',
    '&ETH;': '\u00D0',
    '&Ntilde;': '\u00D1',
    '&Ograve;': '\u00D2',
    '&Oacute;': '\u00D3',
    '&Ocirc;': '\u00D4',
    '&Otilde;': '\u00D5',
    '&Ouml;': '\u00D6',
    '&times;': '\u00D7',
    '&Oslash;': '\u00D8',
    '&Ugrave;': '\u00D9',
    '&Uacute;': '\u00DA',
    '&Ucirc;': '\u00DB',
    '&Uuml;': '\u00DC',
    '&Yacute;': '\u00DD',
    '&THORN;': '\u00DE',
    '&szlig;': '\u00DF',
    '&agrave;': '\u00E0',
    '&aacute;': '\u00E1',
    '&acirc;': '\u00E2',
    '&atilde;': '\u00E3',
    '&auml;': '\u00E4',
    '&aring;': '\u00E5',
    '&aelig;': '\u00E6',
    '&ccedil;': '\u00E7',
    '&egrave;': '\u00E8',
    '&eacute;': '\u00E9',
    '&ecirc;': '\u00EA',
    '&euml;': '\u00EB',
    '&igrave;': '\u00EC',
    '&iacute;': '\u00ED',
    '&icirc;': '\u00EE',
    '&iuml;': '\u00EF',
    '&eth;': '\u00F0',
    '&ntilde;': '\u00F1',
    '&ograve;': '\u00F2',
    '&oacute;': '\u00F3',
    '&ocirc;': '\u00F4',
    '&otilde;': '\u00F5',
    '&ouml;': '\u00F6',
    '&divide;': '\u00F7',
    '&oslash;': '\u00F8',
    '&ugrave;': '\u00F9',
    '&uacute;': '\u00FA',
    '&ucirc;': '\u00FB',
    '&uuml;': '\u00FC',
    '&yacute;': '\u00FD',
    '&thorn;': '\u00FE',
    '&yuml;': '\u00FF',
    '&quot;': '\u0022',
    '&amp;': '\u0026',
    '&lt;': '\u003C',
    '&gt;': '\u003E',
    '&apos;': '\u0027',
    '&OElig;': '\u0152',
    '&oelig;': '\u0153',
    '&Scaron;': '\u0160',
    '&scaron;': '\u0161',
    '&Yuml;': '\u0178',
    '&circ;': '\u02C6',
    '&tilde;': '\u02DC',
    '&ensp;': '\u2002',
    '&emsp;': '\u2003',
    '&thinsp;': '\u2009',
    '&zwnj;': '\u200C',
    '&zwj;': '\u200D',
    '&lrm;': '\u200E',
    '&rlm;': '\u200F',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&sbquo;': '\u201A',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&bdquo;': '\u201E',
    '&dagger;': '\u2020',
    '&Dagger;': '\u2021',
    '&permil;': '\u2030',
    '&lsaquo;': '\u2039',
    '&rsaquo;': '\u203A',
    '&euro;': '\u20AC',
    '&fnof;': '\u0192',
    '&Alpha;': '\u0391',
    '&Beta;': '\u0392',
    '&Gamma;': '\u0393',
    '&Delta;': '\u0394',
    '&Epsilon;': '\u0395',
    '&Zeta;': '\u0396',
    '&Eta;': '\u0397',
    '&Theta;': '\u0398',
    '&Iota;': '\u0399',
    '&Kappa;': '\u039A',
    '&Lambda;': '\u039B',
    '&Mu;': '\u039C',
    '&Nu;': '\u039D',
    '&Xi;': '\u039E',
    '&Omicron;': '\u039F',
    '&Pi;': '\u03A0',
    '&Rho;': '\u03A1',
    '&Sigma;': '\u03A3',
    '&Tau;': '\u03A4',
    '&Upsilon;': '\u03A5',
    '&Phi;': '\u03A6',
    '&Chi;': '\u03A7',
    '&Psi;': '\u03A8',
    '&Omega;': '\u03A9',
    '&alpha;': '\u03B1',
    '&beta;': '\u03B2',
    '&gamma;': '\u03B3',
    '&delta;': '\u03B4',
    '&epsilon;': '\u03B5',
    '&zeta;': '\u03B6',
    '&eta;': '\u03B7',
    '&theta;': '\u03B8',
    '&iota;': '\u03B9',
    '&kappa;': '\u03BA',
    '&lambda;': '\u03BB',
    '&mu;': '\u03BC',
    '&nu;': '\u03BD',
    '&xi;': '\u03BE',
    '&omicron;': '\u03BF',
    '&pi;': '\u03C0',
    '&rho;': '\u03C1',
    '&sigmaf;': '\u03C2',
    '&sigma;': '\u03C3',
    '&tau;': '\u03C4',
    '&upsilon;': '\u03C5',
    '&phi;': '\u03C6',
    '&chi;': '\u03C7',
    '&psi;': '\u03C8',
    '&omega;': '\u03C9',
    '&thetasym;': '\u03D1',
    '&upsih;': '\u03D2',
    '&piv;': '\u03D6',
    '&bull;': '\u2022',
    '&hellip;': '\u2026',
    '&prime;': '\u2032',
    '&Prime;': '\u2033',
    '&oline;': '\u203E',
    '&frasl;': '\u2044',
    '&weierp;': '\u2118',
    '&image;': '\u2111',
    '&real;': '\u211C',
    '&trade;': '\u2122',
    '&alefsym;': '\u2135',
    '&larr;': '\u2190',
    '&uarr;': '\u2191',
    '&rarr;': '\u2192',
    '&darr;': '\u2193',
    '&harr;': '\u2194',
    '&crarr;': '\u21B5',
    '&lArr;': '\u21D0',
    '&uArr;': '\u21D1',
    '&rArr;': '\u21D2',
    '&dArr;': '\u21D3',
    '&hArr;': '\u21D4',
    '&forall;': '\u2200',
    '&part;': '\u2202',
    '&exist;': '\u2203',
    '&empty;': '\u2205',
    '&nabla;': '\u2207',
    '&isin;': '\u2208',
    '&notin;': '\u2209',
    '&ni;': '\u220B',
    '&prod;': '\u220F',
    '&sum;': '\u2211',
    '&minus;': '\u2212',
    '&lowast;': '\u2217',
    '&radic;': '\u221A',
    '&prop;': '\u221D',
    '&infin;': '\u221E',
    '&ang;': '\u2220',
    '&and;': '\u2227',
    '&or;': '\u2228',
    '&cap;': '\u2229',
    '&cup;': '\u222A',
    '&int;': '\u222B',
    '&there4;': '\u2234',
    '&sim;': '\u223C',
    '&cong;': '\u2245',
    '&asymp;': '\u2248',
    '&ne;': '\u2260',
    '&equiv;': '\u2261',
    '&le;': '\u2264',
    '&ge;': '\u2265',
    '&sub;': '\u2282',
    '&sup;': '\u2283',
    '&nsub;': '\u2284',
    '&sube;': '\u2286',
    '&supe;': '\u2287',
    '&oplus;': '\u2295',
    '&otimes;': '\u2297',
    '&perp;': '\u22A5',
    '&sdot;': '\u22C5',
    '&lceil;': '\u2308',
    '&rceil;': '\u2309',
    '&lfloor;': '\u230A',
    '&rfloor;': '\u230B',
    '&lang;': '\u2329',
    '&rang;': '\u232A',
    '&loz;': '\u25CA',
    '&spades;': '\u2660',
    '&clubs;': '\u2663',
    '&hearts;': '\u2665',
    '&diams;': '\u2666'
};

let decodeEntity = function (code) {
    // name type
    if (code.charAt(1) !== '#') {
        return HTML_ENTITIES[code] || code;
    }

    var n, c = code.charAt(2);
    // hex number
    if (c === 'x' || c === 'X') {
        c = code.substring(3, code.length - 1);
        n = parseInt(c, 16);
    } else {
        c = code.substring(2, code.length - 1);
        n = parseInt(c);
    }
    return isNaN(n) ? code : String.fromCharCode(n);
};

export class CmpxLib {
    static stringEmpty = stringEmpty;

    static noop = noop;

    static hasOwnProp(obj: any, prop: string) {
        return core_hasOwn.call(obj, prop);
    }

    static trace(e: any) {
        console.error && console.error(e.stack || e.message || e + '');
    }

    static isType(typename: string, value: any) {
        //typename:String, Array, Boolean, Object, RegExp, Date, Function,Number //兼容
        //typename:Null, Undefined,Arguments    //IE不兼容
        return toString.apply(value) === '[object ' + typename + ']';
    }

    static toStr(p: any): string {
        return CmpxLib.isNull(p) ? '' : p.toString();
    }

    static isUndefined(obj: any) {
        ///<summary>是否定义</summary>

        return (typeof (obj) === "undefined" || obj === undefined);
    }

    static isNull(obj: any) {
        ///<summary>是否Null</summary>

        return (obj === null || CmpxLib.isUndefined(obj));
    }

    static isBoolean(obj: any) {
        return CmpxLib.isType("Boolean", obj);
    }

    static isNullEmpty(s: any) {
        return (CmpxLib.isNull(s) || s === stringEmpty);
    }

    static isFunction(fun: any) {
        return CmpxLib.isType("Function", fun);
    }

    static isNumeric(n: any) {
        //return cmpx.isType("Number", n) && !isNaN(n) && isFinite(n);;
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    static isString(obj: any) {
        return CmpxLib.isType("String", obj);
    }

    static isObject(obj: any) {
        return obj && CmpxLib.isType("Object", obj)
            && !CmpxLib.isElement(obj) && !CmpxLib.isWindow(obj);//IE8以下isElement, isWindow认为Object
    }

    // static tryCatch(tryFn: Function, catchFn: (e: any) => any, args: Array<any> = [], thisArg: any = null): any {
    //     try {
    //         return tryFn.apply(thisArg, args);
    //     } catch (e) {
    //         return catchFn.call(thisArg, e);
    //     }
    // }

    static isPlainObject(obj: any) {
        if (!CmpxLib.isObject(obj)) return false;

        try {
            if (testObject(obj) === false) return false;
        } catch (e) {
            return false;
        }

        var key;
        for (key in obj) { }

        return key === undefined || core_hasOwn.call(obj, key);
    }

    static encodeHtml(html: string): string {
        return !html ? '' : html.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
            .replace(/\"/g, '&quot;').replace(/ /g, "&nbsp;").replace(/\'/g, "&#39;");
    }

    static decodeHtml(html: string): string {
        return !html ? '' : html.replace(/&#?\w+;/g, decodeEntity);
    }

    static isArray(value: any) {
        return Array.isArray ? Array.isArray(value) : CmpxLib.isType("Array", value);
    }

    static isWindow(obj: any) { return !!(obj && obj == obj.window); }

    static isElement(obj: any) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; }

    static trim(str: string, newline?: boolean) {
        return str ? (newline ? str.replace(/^(?:\s|\u3000|\ue4c6|\n|\r)*|(?:\s|\u3000|\ue4c6|\n|\r)*$/g, '') :
            str.replace(/^(?:\s|\u3000|\ue4c6)*|(?:\s|\u3000|\ue4c6)*$/g, '')) : '';
    }

    static replaceAll(s: string, str: string, repl: string, flags: string = "g") {
        if (CmpxLib.isNullEmpty(s) || CmpxLib.isNullEmpty(str)) return s;
        str = str.replace(/([^A-Za-z0-9 ])/g, "\\$1");
        s = s.replace(new RegExp(str, flags), repl);
        return s;
    }

    static inArray(list: Array<any>, p: any, thisArg: any = null): number {
        var isF = CmpxLib.isFunction(p),
            index = -1;
        CmpxLib.each(list, (item, idx) => {
            var ok = isF ? p.call(thisArg, item, idx) : (item == p);
            if (ok) {
                index = idx;
                return false;
            }
        }, thisArg);
        return index;
    }

    static toArray(p: any, start: number = 0, count: number = Number.MAX_VALUE): Array<any> {
        return p ? slice.apply(p, [start, count]) : p;
    }

    static arrayToObject<T>(array: Array<T>, fieldName: string): { [name: string]: T } {
        var obj: { [name: string]: T } = {};
        CmpxLib.each(array, function (item: any, index: number) {
            obj[item[fieldName]] = item;
        });
        return obj;
    }

    static each(list: any, fn: (item: any, idx: number) => any, thisArg: any = null) {
        if (!list) return;
        var len = list.length;
        for (let i = 0, len = list.length; i < len; i++) {
            if (fn.call(thisArg, list[i], i) === false) break;
        }
    }

    static eachProp(obj: any, callback: (item: any, name: string) => void, thisArg: any = null) {
        if (!obj) return;
        var item;
        for (var n in obj) {
            if (CmpxLib.hasOwnProp(obj, n)) {
                item = obj[n];
                if (callback.call(thisArg, item, n) === false) break;
            }
        }
    }

    static extend(obj: Object, ...args: Object[]): Object {
        if (obj) {
            CmpxLib.each(args, function (p: Object) {
                p && CmpxLib.eachProp(p, function (item: string, name: string) { obj[name] = item; });
            });
        }
        return obj;
    }

    static makeAutoId() {
        var t = new Date().valueOf();
        if ((++_tick) > 100000) _tick = 0;
        return [t, _tick].join('_');
    }

    /**
     * 是否类
     * @param p 参数
     * @param cls 类
     */
    static isClass(p, cls) {
        return p ? (p == cls || (p.prototype && p.prototype instanceof cls)) : false;
    }
}

let _tick = 0;