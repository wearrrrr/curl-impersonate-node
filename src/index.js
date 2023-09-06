"use strict";
/*

    curl-impersonate by wearr.

    IF YOU PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED!

*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlImpersonate = void 0;
class CurlImpersonate {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.validMethods = ["GET", "POST"];
        this.binary = "";
    }
    makeRequest() {
        if (this.validateOptions(this.options)) {
            this.setProperBinary();
            this.convertHeadersToArray();
        }
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
                catch (_a) {
                    throw new Error("URL is invalid! Must have http:// or https:// !");
                }
            }
        }
        else {
            throw new Error("Invalid Method! Valid HTTP methods are " + this.validMethods);
        }
    }
    setProperBinary() {
        switch (process.platform) {
            case "linux":
                if (process.arch == "x64") {
                    this.binary = "curl-impersonate-chrome-linux-x64";
                    break;
                }
                else if (process.arch == "arm") {
                    this.binary = "curl-impersonate-chrome-linux-aarch64";
                    break;
                }
                else {
                    throw new Error(`Unsupported architecture: ${process.arch}`);
                }
            case "darwin":
                this.binary = "curl-impersonate-chrome-darwin-x86";
                break;
            default:
                throw new Error(`Unsupported Platform! ${process.platform}`);
        }
    }
    convertHeadersToArray() {
        for (const header in this.options.headers) {
            Object.keys(header);
        }
    }
}
exports.CurlImpersonate = CurlImpersonate;
