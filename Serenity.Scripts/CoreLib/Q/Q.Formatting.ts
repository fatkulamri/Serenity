﻿
namespace Q {
    export namespace Culture {
        export let decimalSeparator = '.';
        export let dateSeparator = '/';
        export let groupSeparator = ',';
        export let dateOrder = 'dmy';
        export let dateFormat = 'dd/MM/yyyy';
        export let dateTimeFormat = 'dd/MM/yyyy HH:mm:ss';

        var s = Q.trimToNull($('script#ScriptCulture').html());
        if (s != null) {
            var sc = $.parseJSON(s);
            if (sc.DecimalSeparator != null)
                decimalSeparator = sc.DecimalSeparator;
            if (sc.GroupSeparator != null && sc.GroupSeparator != decimalSeparator)
                groupSeparator = sc.GroupSeparator;
            else if (groupSeparator == decimalSeparator)
                groupSeparator = decimalSeparator == '.' ? ',' : '.';
            if (sc.DateSeparator != null)
                dateSeparator = sc.DateSeparator;
            if (sc.DateOrder != null)
                dateOrder = sc.DateOrder;
            if (sc.DateFormat != null)
                dateFormat = sc.DateFormat;
            if (sc.DateTimeFormat != null)
                dateTimeFormat = sc.DateTimeFormat;
        }
    }

    export function formatNumber(n: number, fmt: string, dec?: string, grp?: string): string {
        let neg = '-';
        if (isNaN(n)) {
            return null;
        }

        dec = dec || Culture.decimalSeparator;
        grp = grp || Culture.groupSeparator;

        let r = "";
        if (fmt.indexOf(".") > -1) {
            let dp = dec;
            let df = fmt.substring(fmt.lastIndexOf(".") + 1);
            n = roundNumber(n, df.length); 
            let dv = n % 1;
            let ds = new String(dv.toFixed(df.length));
            ds = ds.substring(ds.lastIndexOf(".") + 1);
            for (let i = 0; i < df.length; i++) {
                if (df.charAt(i) == '#' && ds.charAt(i) != '0') {
                    dp += ds.charAt(i);
                    continue;
                }
                else if (df.charAt(i) == '#' && ds.charAt(i) == '0') {
                    let notParsed = ds.substring(i);
                    if (notParsed.match('[1-9]')) {
                        dp += ds.charAt(i);
                        continue;
                    }
                    else
                        break;
                }
                else if (df.charAt(i) == "0")
                    dp += ds.charAt(i);
                else
                    dp += df.charAt(i);
            }
            r += dp;
        }
        else
            n = Math.round(n);

        let ones = Math.floor(n);
        if (n < 0)
            ones = Math.ceil(n);
        let of = "";
        if (fmt.indexOf(".") == -1)
            of = fmt;
        else
            of = fmt.substring(0, fmt.indexOf("."));

        let op = "";
        if (!(ones == 0 && of.substr(of.length - 1) == '#')) {
            // find how many digits are in the group
            let oneText = new String(Math.abs(ones));
            let gl = 9999;
            if (of.lastIndexOf(",") != -1)
                gl = of.length - of.lastIndexOf(",") - 1;
            let gc = 0;
            for (let i = oneText.length - 1; i > -1; i--) {
                op = oneText.charAt(i) + op;
                gc++;
                if (gc == gl && i != 0) {
                    op = grp + op;
                    gc = 0;
                }
            }

            // account for any pre-data padding
            if (of.length > op.length) {
                let padStart = of.indexOf('0');
                if (padStart != -1) {
                    let padLen = of.length - padStart;
                    // pad to left with 0's or group char
                    let pos = of.length - op.length - 1;
                    while (op.length < padLen) {
                        let pc = of.charAt(pos);
                        // replace with real group char if needed
                        if (pc == ',')
                            pc = grp;
                        op = pc + op;
                        pos--;
                    }
                }
            }
        }

        if (!op && of.indexOf('0', of.length - 1) !== -1)
            op = '0';

        r = op + r;
        if (n < 0)
            r = neg + r;

        if (r.lastIndexOf(dec) == r.length - 1) {
            r = r.substring(0, r.length - 1);
        }

        return r;
    }

    export function parseInteger(s: string): number {
        s = trim(s.toString());
        let ts = Culture.groupSeparator;
        if (s && s.length && s.indexOf(ts) > 0) {
            s = s.replace(new RegExp("(\\b\\d{1,3})\\" + ts + "(?=\\d{3}(\\D|$))", "g"), '$1');
        }
        if (!(/^[-\+]?\d+$/.test(s)))
            return NaN;
        return parseInt(s, 10);
    }

    export function parseDecimal(s: string): number {
        if (s == null)
            return null;

        s = trim(s.toString());
        if (s.length == 0)
            return null;

        let ts = Culture.groupSeparator;

        if (s && s.length && s.indexOf(ts) > 0) {
            s = s.replace(new RegExp("(\\b\\d{1,3})\\" + ts + "(?=\\d{3}(\\D|$))", "g"), '$1');
        }

        if (!(new RegExp("^\\s*([-\\+])?(\\d*)\\" + Culture.decimalSeparator + "?(\\d*)\\s*$").test(s)))
            return NaN;

        return parseFloat(s.toString().replace(Culture.decimalSeparator, '.'));
    }

    function roundNumber(n: number, dec?: number): number {
        let power = Math.pow(10, dec || 0);
        let value = (Math.round(n * power) / power).toString();
        // ensure the decimal places are there
        if (dec > 0) {
            let dp = value.indexOf(".");
            if (dp == -1) {
                value += '.';
                dp = 0;
            }
            else {
                dp = value.length - (dp + 1);
            }
            while (dp < dec) {
                value += '0';
                dp++;
            }
        }
        return parseFloat(value);
    }

    export function toId(id: any): any {
        if (id == null)
            return null;
        if (typeof id == "number")
            return id;
        id = $.trim(id);
        if (id == null || !id.length)
            return null;
        if (id.length >= 15 || !(/^-?\d+$/.test(id)))
            return id;
        let v = parseInt(id, 10);
        if (isNaN(v))
            return id;
        return v;
    }

    export function formatDate(d: Date | string, format?: string) {
        if (!d) {
            return '';
        }

        let date: Date;
        if (typeof d == "string") {
            var res = Q.parseDate(d);
            if (!res)
                return d;
            date = res as Date;
        }
        else
            date = d;

        if (format == null || format == "d") {
            format = Culture.dateFormat;
        }
        else {
            switch (format) {
                case "g": format = Culture.dateTimeFormat.replace(":ss", ""); break;
                case "G": format = Culture.dateTimeFormat; break;
                case "s": format = "yyyy-MM-ddTHH:mm:ss"; break;
                case "u": return Q.formatISODateTimeUTC(date);
            }
        }

        let pad = function (i: number) {
            return Q.zeroPad(i, 2);
        };

        return format.replace(new RegExp('dd?|MM?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|fff|zz?z?|\\/', 'g'),
            function (fmt): any {
                switch (fmt) {
                    case '/': return Culture.dateSeparator;
                    case 'hh': return pad(((date.getHours() < 13) ? date.getHours() : (date.getHours() - 12)));
                    case 'h': return ((date.getHours() < 13) ? date.getHours() : (date.getHours() - 12));
                    case 'HH': return pad(date.getHours());
                    case 'H': return date.getHours();
                    case 'mm': return pad(date.getMinutes());
                    case 'm': return date.getMinutes();
                    case 'ss': return pad(date.getSeconds());
                    case 's': return date.getSeconds();
                    case 'yyyy': return date.getFullYear();
                    case 'yy': return date.getFullYear().toString().substr(2, 4);
                    case 'dd': return pad(date.getDate());
                    case 'd': return date.getDate().toString();
                    case 'MM': return pad(date.getMonth() + 1);
                    case 'M': return date.getMonth() + 1;
                    case 't': return ((date.getHours() < 12) ? 'A' : 'P');
                    case 'tt': return ((date.getHours() < 12) ? 'AM' : 'PM');
                    case 'fff': return Q.zeroPad(date.getMilliseconds(), 3);
                    case 'zzz':
                    case 'zz':
                    case 'z': return '';
                    default: return fmt;
                }
            }
        );
    }

    export function formatDayHourAndMin(n: number): string {
        if (n === 0)
            return '0';
        else if (!n)
            return '';
        let days = Math.floor(n / 24 / 60);
        let txt = "";
        if (days > 0) {
            txt += days.toString();
        }
        let mins = zeroPad(Math.floor((n % (24 * 60)) / (60)), 2) + ':' + zeroPad(n % 60, 2);
        if (mins != '00:00') {
            if (days > 0)
                txt += ".";
            txt += mins;
        }
        return txt;
    }

    export function formatISODateTimeUTC(d: Date): string {
        if (d == null)
            return "";
        let zeropad = function (num: number) { return ((num < 10) ? '0' : '') + num; };
        let str = d.getUTCFullYear() + "-" +
            zeropad(d.getUTCMonth() + 1) + "-" +
            zeropad(d.getUTCDate()) + "T" +
            zeropad(d.getUTCHours()) + ":" +
            zeropad(d.getUTCMinutes());
        let secs = Number(d.getUTCSeconds() + "." +
            ((d.getUTCMilliseconds() < 100) ? '0' : '') +
            zeropad(d.getUTCMilliseconds()));
        str += ":" + zeropad(secs) + "Z";
        return str;
    }

    let isoRegexp = /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;

    export function parseISODateTime(s: string): Date {
        if (!s || !s.length)
            return null;

        s = s + "";
        if (typeof (s) != "string" || s.length === 0) {
            return null;
        }

        let res = s.match(isoRegexp);
        if (typeof (res) == "undefined" || res === null) {
            return null;
        }

        let year: number, month: number, day: number, hour: number, min: number, sec: number, msec: number;
        year = parseInt(res[1], 10);

        if (typeof (res[2]) == "undefined" || res[2] === '') {
            return new Date(year);
        }

        month = parseInt(res[2], 10) - 1;
        day = parseInt(res[3], 10);
        if (typeof (res[4]) == "undefined" || res[4] === '') {
            return new Date(year, month, day);
        }

        hour = parseInt(res[4], 10);
        min = parseInt(res[5], 10);
        sec = (typeof (res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;

        if (typeof (res[7]) != "undefined" && res[7] !== '') {
            msec = Math.round(1000.0 * parseFloat("0." + res[7]));
        }
        else {
            msec = 0;
        }

        if ((typeof (res[8]) == "undefined" || res[8] === '') && (typeof (res[9]) == "undefined" || res[9] === '')) {
            return new Date(year, month, day, hour, min, sec, msec);
        }

        let ofs: number;
        if (typeof (res[9]) != "undefined" && res[9] !== '') {
            ofs = parseInt(res[10], 10) * 3600000;
            if (typeof (res[11]) != "undefined" && res[11] !== '') {
                ofs += parseInt(res[11], 10) * 60000;
            }
            if (res[9] == "-") {
                ofs = -ofs;
            }
        }
        else {
            ofs = 0;
        }
        return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
    }

    export function parseHourAndMin(value: string) {
        let v = trim(value);
        if (v.length < 4 || v.length > 5)
            return NaN;
        let h: number, m: number;
        if (v.charAt(1) == ':') {
            h = parseInteger(v.substr(0, 1));
            m = parseInteger(v.substr(2, 2));
        }
        else {
            if (v.charAt(2) != ':')
                return NaN;
            h = parseInteger(v.substr(0, 2));
            m = parseInteger(v.substr(3, 2));
        }
        if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59)
            return NaN;
        return h * 60 + m;
    }

    export function parseDayHourAndMin(s: string): number {
        let days: number;
        let v = trim(s);
        if (!v)
            return NaN;
        let p = v.split('.');
        if (p.length == 0 || p.length > 2)
            return NaN;
        if (p.length == 1) {
            days = parseInteger(p[0]);
            if (!isNaN(days))
                return days * 24 * 60;
            return parseHourAndMin(p[0]);
        }
        else {
            days = parseInteger(p[0]);
            let hm = parseHourAndMin(p[1]);
            if (isNaN(days) || isNaN(hm))
                return NaN;
            return days * 24 * 60 + hm;
        }
    }

    export function parseDate(s: string, dateOrder?: string): any {
        if (!s || !s.length)
            return null;

        if (s.length >= 10 && s.charAt(4) === '-' && s.charAt(7) === '-' &&
            (s.length === 10 || (s.length > 10 && s.charAt(10) === 'T'))) {
            var res = Q.parseISODateTime(s);
            if (res == null)
                return false;
            return res;
        }

        let dateVal: any;
        let dArray: any;
        let d: number, m: number, y: number;
        dArray = splitDateString(s);
        if (!dArray)
            return false;

        if (dArray.length == 3) {
            dateOrder = dateOrder || Culture.dateOrder;
            switch (dateOrder) {
                case "dmy":
                    d = parseInt(dArray[0], 10);
                    m = parseInt(dArray[1], 10) - 1;
                    y = parseInt(dArray[2], 10);
                    break;
                case "ymd":
                    d = parseInt(dArray[2], 10);
                    m = parseInt(dArray[1], 10) - 1;
                    y = parseInt(dArray[0], 10);
                    break;
                case "mdy":
                default:
                    d = parseInt(dArray[1], 10);
                    m = parseInt(dArray[0], 10) - 1;
                    y = parseInt(dArray[2], 10);
                    break;
            }

            if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 0 || m > 11 || y > 9999 || y < 0)
                return false;

            if (y < 100) {
                let fullYear = new Date().getFullYear();
                let shortYearCutoff = (fullYear % 100) + 10;
                y += fullYear - fullYear % 100 + (y <= shortYearCutoff ? 0 : -100);
            }
            try {
                dateVal = new Date(y, m, d);
                if (isNaN(dateVal.getFullYear()))
                    return false;
            }
            catch (e) {
                return false;
            }
        }
        else if (dArray.length == 1) {
            try {
                dateVal = new Date(dArray[0]);
                if (isNaN(dateVal.getFullYear()))
                    return false;
            }
            catch (e) {
                return false;
            }
        }
        return dateVal;
    }

    export function splitDateString(s: string): string[] {
        s = trim(s);
        if (!s.length)
            return;
        if (s.indexOf("/") >= 0)
            return s.split("/");
        else if (s.indexOf(".") >= 0)
            return s.split(".");
        else if (s.indexOf("-") >= 0)
            return s.split("-");
        else if (s.indexOf("\\") >= 0)
            return s.split("\\");
        else
            return [s];
    }
}