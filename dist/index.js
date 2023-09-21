/*

    curl-impersonate by wearr.

    IF YOU PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED!

*/
import * as proc from "child_process";
import * as path from 'path';
export class CurlImpersonate {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.validMethods = ["GET", "POST"];
        this.binary = "";
    }
    makeRequest() {
        return new Promise((resolve, reject) => {
            if (this.validateOptions(this.options)) {
                this.setProperBinary();
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
        switch (process.platform) {
            case "linux":
                if (process.arch == "x64") {
                    this.binary = "curl-impersonate-chrome-linux-x86";
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
    async getRequest(flags, headers) {
        // GET REQUEST
        flags.push("-v");
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} ${this.url}`;
        const result = proc.spawnSync(`${binpath} ${args}`, { shell: true });
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
            verboseStatus: this.options.verbose ? true : false
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
export default CurlImpersonate;
//# sourceMappingURL=index.js.map