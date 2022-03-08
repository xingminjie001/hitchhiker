"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const string_util_1 = require("../../utils/string_util");
const record_service_1 = require("../record_service");
const record_category_1 = require("../../common/record_category");
const parameter_type_1 = require("../../common/parameter_type");
class CurlImport {
    convert(target, collectionId) {
        const content = this.prepare(target);
        const args = yargs([content]);
        const url = this.parseUrl(args);
        const headers = this.parseHeaders(args);
        const body = this.parseBody(args, headers);
        const method = this.parseMethod(args, body);
        return record_service_1.RecordService.fromDto({
            id: string_util_1.StringUtil.generateUID(),
            collectionId,
            category: record_category_1.RecordCategory.record,
            name: url,
            parameterType: parameter_type_1.ParameterType.ManyToMany,
            method,
            body,
            headers,
            url
        });
    }
    prepare(curl) {
        return curl.trim()
            .replace(/\\\r|\\\n|\s{2,}/g, '')
            .replace(/(-X)(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)/, '$1 $2');
    }
    parseUrl(args) {
        let url = args._[1];
        if (!url) {
            url = args.L || args.location || args.compressed || args.url;
        }
        return url;
    }
    parseMethod(args, body) {
        let method = args.X || args.request;
        if (!method) {
            method = body ? 'POST' : 'GET';
        }
        if (args.I || args.head) {
            method = 'HEAD';
        }
        return method;
    }
    parseHeaders(args) {
        let headers = new Array();
        const headersTxt = args.H || args.header;
        if (headersTxt) {
            headers = string_util_1.StringUtil.stringToHeaders(Array.isArray(headersTxt) ? headersTxt.join('\n') : headersTxt);
        }
        const cookieStr = args.b || args.cookie;
        if (cookieStr && cookieStr.includes('=')) {
            headers.push({ key: 'Cookie', value: cookieStr, isActive: true });
        }
        let user = args.u || args.user;
        if (user) {
            headers.push({ key: 'Authorization', value: `Basic ${new Buffer(user).toString('base64')}`, isActive: true });
        }
        let agent = args.A || args['user-agent'];
        if (agent) {
            headers.push({ key: 'User-Agent', value: agent, isActive: true });
        }
        return headers;
    }
    parseBody(args, headers) {
        const contentTypeHeader = headers.find(h => (h.key || '').toLowerCase() === 'content-type');
        let body = args.d || args.data || args['data-binary'];
        if (Array.isArray(body)) {
            body = body.join('&');
        }
        if (body && !contentTypeHeader) {
            headers.push({ key: 'Content-Type', value: Array.isArray(body) ? 'application/x-www-form-urlencoded' : 'application/json', isActive: true });
        }
        return body;
    }
}
exports.CurlImport = CurlImport;
//# sourceMappingURL=curl_import.js.map