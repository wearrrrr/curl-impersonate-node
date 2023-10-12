"use strict";
/*

    curl-impersonate by wearr.

    IF YOU PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED!

*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlImpersonate = void 0;
const proc = __importStar(require("child_process"));
const path = __importStar(require("path"));
const presets_1 = require("./presets");
class CurlImpersonate {
    url;
    options;
    validMethods;
    binary;
    impersonatePresets;
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.validMethods = ["GET", "POST"];
        this.binary = "";
        this.impersonatePresets = ["chrome-110", "chrome-116", "firefox-109", "firefox-117"];
    }
    checkIfPresetAndMerge() {
        if (this.options.impersonate === undefined)
            return;
        if (this.impersonatePresets.includes(this.options.impersonate)) {
            let preset = presets_1.presets[this.options.impersonate];
            this.options.headers = Object.assign(this.options.headers, preset.headers);
            this.options.flags = this.options.flags ? this.options.flags.concat(preset.flags) : preset.flags;
        }
    }
    makeRequest(url) {
        if (url !== undefined)
            this.url = url;
        return new Promise((resolve, reject) => {
            if (this.validateOptions(this.options)) {
                this.setProperBinary();
                this.checkIfPresetAndMerge();
                let headers = this.convertHeaderObjectToCURL();
                let flags = this.options.flags || [];
                if (this.options.method == "GET") {
                    this.getRequest(flags, headers)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                }
                else if (this.options.method == "POST") {
                    this.postRequest(flags, headers, this.options.body)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                }
                else {
                    // Handle other HTTP methods if needed
                    reject(new Error("Unsupported HTTP method"));
                }
            }
            else {
                reject(new Error("Invalid options"));
            }
        });
    }
    setNewURL(url) {
        this.url = url;
    }
    validateOptions(options) {
        if (this.validMethods.includes(options.method.toUpperCase())) {
            if (options.body !== undefined && options.method == "GET") {
                throw new Error("Method is GET with an HTTP payload!");
            }
            else {
                try {
                    new URL(this.url);
                    return true;
                }
                catch {
                    throw new Error("URL is invalid! Must have http:// or https:// !");
                }
            }
        }
        else {
            throw new Error("Invalid Method! Valid HTTP methods are " + this.validMethods);
        }
    }
    setupBodyArgument(body) {
        if (body !== undefined) {
            try {
                JSON.stringify(body);
            }
            catch {
                return body; // Assume that content type is anything except www-form-urlencoded or form-data, not quite sure if graphql is supported.
            }
        }
        else {
            throw new Error("Body is undefined in a post request! Current body is " + this.options.body);
        }
    }
    setProperBinary() {
        let isFF = this.options.impersonate == "firefox-109" || this.options.impersonate == "firefox-117";
        switch (process.platform) {
            case "linux":
                if (process.arch == "x64") {
                    if (isFF) {
                        this.binary = "curl-impersonate-firefox-linux-x86";
                    }
                    else {
                        this.binary = "curl-impersonate-chrome-linux-x86";
                    }
                    break;
                }
                else if (process.arch == "arm") {
                    if (isFF) {
                        this.binary = "curl-impersonate-firefox-linux-aarch64";
                    }
                    else {
                        this.binary = "curl-impersonate-chrome-linux-aarch64";
                    }
                    break;
                }
                else {
                    throw new Error(`Unsupported architecture: ${process.arch}`);
                }
            case "darwin":
                if (isFF) {
                    this.binary = "curl-impersonate-firefox-darwin-x86";
                }
                else {
                    this.binary = "curl-impersonate-chrome-darwin-x86";
                }
                break;
            default:
                throw new Error(`Unsupported Platform! ${process.platform}`);
        }
    }
    async getRequest(flags, headers) {
        // GET REQUEST
        flags.push("-v");
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} '${this.url}'`;
        if (this.options.verbose) {
            console.log(new Object({
                binpath: binpath,
                args: args,
                url: this.url,
            }));
        }
        const result = proc.spawnSync(`${binpath} ${args}`, { shell: true });
        let response = result.stdout.toString();
        let verbose = result.stderr.toString();
        let requestData = this.extractRequestData(verbose);
        let respHeaders = this.extractResponseHeaders(verbose);
        let returnObject = {
            ipAddress: requestData.ipAddress,
            port: requestData.port,
            statusCode: requestData.statusCode,
            response: response,
            responseHeaders: respHeaders,
            requestHeaders: this.options.headers,
            verboseStatus: this.options.verbose ? true : false
        };
        return returnObject;
    }
    async postRequest(flags, headers, body) {
        // POST REQUEST
        flags.push("-v");
        let curlBody = this.setupBodyArgument(body);
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} ${this.url}`;
        const result = proc.spawnSync(`${binpath} ${args} -d ${curlBody}`, { shell: true });
        let response = result.stdout.toString();
        let cleanedPayload = response.replace(/\s+\+\s+/g, '');
        let verbose = result.stderr.toString();
        let requestData = this.extractRequestData(verbose);
        let respHeaders = this.extractResponseHeaders(verbose);
        let returnObject = {
            ipAddress: requestData.ipAddress,
            port: requestData.port,
            statusCode: requestData.statusCode,
            response: cleanedPayload,
            responseHeaders: respHeaders,
            requestHeaders: this.options.headers,
            verboseStatus: this.options.verbose,
        };
        return returnObject;
    }
    extractRequestData(verbose) {
        // Define regular expressions to extract information
        const ipAddressRegex = /Trying (\S+):(\d+)/;
        const httpStatusRegex = /< HTTP\/2 (\d+) ([^\n]+)/;
        // Extract IP address and port
        const ipAddressMatch = verbose.match(ipAddressRegex);
        let port;
        let ipAddress;
        if (ipAddressMatch) {
            ipAddress = ipAddressMatch[1];
            port = parseInt(ipAddressMatch[2]);
        }
        // Extract HTTP status code and headers
        const httpStatusMatch = verbose.match(httpStatusRegex);
        let statusCode;
        if (httpStatusMatch) {
            statusCode = parseInt(httpStatusMatch[1]);
        }
        return {
            ipAddress: ipAddress,
            port: port,
            statusCode: statusCode,
        };
    }
    extractResponseHeaders(verbose) {
        const httpResponseRegex = /< ([^\n]+)/g;
        let responseHeaders = {};
        const match = verbose.match(httpResponseRegex);
        if (match) {
            match.forEach((header) => {
                const headerWithoutPrefix = header.substring(2); // Remove the first two characters
                const headerParts = headerWithoutPrefix.split(': ');
                if (headerParts.length > 1) {
                    const headerName = headerParts[0].trim(); // Trim any leading/trailing spaces
                    const headerValue = headerParts[1].trim(); // Trim any leading/trailing spaces
                    responseHeaders[headerName] = headerValue;
                }
            });
        }
        return responseHeaders;
    }
    convertHeaderObjectToCURL() {
        return Object.entries(this.options.headers).map(([key, value]) => `-H '${key}: ${value}'`).join(' ');
    }
}
exports.CurlImpersonate = CurlImpersonate;
exports.default = CurlImpersonate;
//# sourceMappingURL=index.js.map