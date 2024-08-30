/* 

    curl-impersonate by wearr.

    IF YOU PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED!

*/

import { exec } from "child_process";
import * as path from 'path';



/*

CurlImpersonateOptions:

    method: A string that should read HTTP methods, GET or POST.
    headers: HTTP Headers in the form of a key:value pair object.
    body: Only required if using a method such as POST or any other option that requires a payload.
    timeout: an integer in milliseconds for a connection time-out
    followRedirects: A boolean that indicates whether or not redirects should be followed 
    flags: A string array where options such as crypto certs are accepted or other curl-impersonate flags.

*/

import { CurlImpersonateOptions, CurlResponse, ValidBrowserType, ValidLinuxBrowsers } from "./interfaces";
import { presets } from "./presets";

export interface CurlImpersonateRequestOptions {
    method?: string;
    body?: unknown;
    flags?: string[];
    headers?: Record<string, string>;
    browser?: ValidBrowserType;
}

export class CurlImpersonate {
    static readonly VALID_METHODS: string[] = ["GET", "POST"];
    binary: string;
    private cwd?: string;
    impersonatePresets: String[];

    constructor(private url: string, private options: CurlImpersonateOptions) {
        this.url = url
        this.options = options
        this.binary = ""
        this.cwd = "";
        this.impersonatePresets = ["chrome-110", "chrome-116", "firefox-109", "firefox-117"]
    }

    private checkIfPresetAndMerge() {
        if (this.options.impersonate === undefined) {
            return
        }
        if (this.impersonatePresets.includes(this.options.impersonate)) {
            let preset = presets[this.options.impersonate]
            this.options.headers = Object.assign(this.options.headers ?? {}, preset.headers);
            this.options.flags = this.options.flags ? this.options.flags.concat(preset.flags) : preset.flags
        }
    }

    makeRequest(url?: string): Promise<CurlResponse> {
        if (url !== undefined) {
            this.url = url
        };
        return new Promise((resolve, reject) => {
            if (this.validateOptions(this.options)) {
                this.setProperBinary();
                this.checkIfPresetAndMerge();
                const headers = this.convertHeaderObjectToCURL();
                const flags = this.options.flags ?? [];
                if (this.options.method === "GET") {
                    this.getRequest(flags, headers)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                } else if (this.options.method === "POST") {
                    this.postRequest(flags, headers, this.options.body)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                } else {
                    // Handle other HTTP methods if needed
                    reject(new Error("Unsupported HTTP method"));
                }
            } else {
                reject(new Error("Invalid options"));
            }
        });
    }

    setNewURL(url: string) {
        this.url = url;
    }

    validateOptions(options: CurlImpersonateOptions) {
        if (CurlImpersonate.VALID_METHODS.includes(options.method.toUpperCase())) {
            try {
                new URL(this.url);
                return true;
            } catch {
                throw new Error("URL is invalid! Must have http:// or https:// !")
            }
        } else {
            throw new Error("Invalid Method! Valid HTTP methods are " + CurlImpersonate.VALID_METHODS.join(", "))
        }
    }

    private setupBodyArgument(body: Object | undefined) {
        if (body !== undefined) {
            try {
                JSON.stringify(body)
            } catch {
                return body // Assume that content type is anything except www-form-urlencoded or form-data, not quite sure if graphql is supported.
            }
        } else {
            throw new Error("Body is undefined in a post request! Current body is " + this.options.body)
        }
    }

    private setProperBinary() {
        let isFF = this.options.impersonate == "firefox-109" || this.options.impersonate == "firefox-117"
        switch (process.platform) {
            case "linux":
                if (process.arch == "x64") {
                    if (isFF) {
                        this.binary = "curl-impersonate-firefox-linux-x86"
                    } else {
                        this.binary = "curl-impersonate-chrome-linux-x86";
                    }

                    break;
                } else if (process.arch == "arm") {
                    if (isFF) {
                        this.binary = "curl-impersonate-firefox-linux-aarch64"
                    } else {
                        this.binary = "curl-impersonate-chrome-linux-aarch64";
                    }
                    break;
                } else {
                    throw new Error(`Unsupported architecture: ${process.arch}`);
                }
            case "darwin":
                if (isFF) {
                    this.binary = "curl-impersonate-firefox-darwin-x86"
                } else {
                    this.binary = "curl-impersonate-chrome-darwin-x86";
                }
                break;
            case "win32":
                this.binary = "curl-impersonate-win/curl_chrome116.bat";
                this.cwd = path.join(__dirname, "..", "bin/curl-impersonate-win");
                break;
            default:
                throw new Error(`Unsupported Platform! ${process.platform}`)
        }
    }

    private async getRequest(flags: Array<string>, headers: string): Promise<CurlResponse> {
        // GET REQUEST
        flags.push("-v")
        const binpath = path.join(__dirname, '..', 'bin', this.binary);
        const args = `${flags.join(' ')} ${headers} "${this.url}"`;
        if (this.options.verbose) {
            console.debug(new Object({
                binpath: binpath,
                args: args,
                url: this.url,
            }))
        }
        return new Promise<CurlResponse>((resolve, reject) => {
            exec(`${binpath} ${args}`, { cwd: this.cwd }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                const response = stdout.toString();
                const verbose = stderr.toString();
                const requestData = this.extractRequestData(verbose)
                const respHeaders = this.extractResponseHeaders(verbose)

                resolve({
                    ipAddress: requestData.ipAddress,
                    port: requestData.port,
                    statusCode: requestData.statusCode,
                    response: response,
                    responseHeaders: respHeaders,
                    requestHeaders: this.options.headers,
                    verboseStatus: this.options.verbose ? true : false
                })
            });
        })
    }

    private async postRequest(flags: Array<string>, headers: string, body: Object | undefined) {
        // POST REQUEST
        flags.push("-v")
        let curlBody = this.setupBodyArgument(body)
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} ${this.url}`;

        const result = exec(`${binpath} ${args} -d ${curlBody}`, (error, stdout, stderr) => {

        });
        let response = result.stdout.toString();
        let cleanedPayload = response.replace(/\s+\+\s+/g, '');
        let verbose = result.stderr.toString();

        let requestData = this.extractRequestData(verbose)
        let respHeaders = this.extractResponseHeaders(verbose)



        let returnObject: CurlResponse = {
            ipAddress: requestData.ipAddress,
            port: requestData.port,
            statusCode: requestData.statusCode,
            response: cleanedPayload,
            responseHeaders: respHeaders,
            requestHeaders: this.options.headers,
            verboseStatus: this.options.verbose,
        }
        return returnObject;
    }

    private async doRequest(flags: string[], headers: string, body?: object) {
        const fullFlags = [...flags, "-v"];

    }

    private extractRequestData(verbose: string) {
        // Define regular expressions to extract information
        const ipAddressRegex = /Trying (\S+):(\d+)/;
        const httpStatusRegex = /< HTTP\/2 (\d+) ([^\n]+)/;

        // Extract IP address and port
        const ipAddressMatch = verbose.match(ipAddressRegex);
        let port;
        let ipAddress;
        if (ipAddressMatch) {
            ipAddress = ipAddressMatch[1];
            port = parseInt(ipAddressMatch[2])
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
        }
    }

    private extractResponseHeaders(verbose: string) {
        const httpResponseRegex = /< ([^\n]+)/g;
        const responseHeaders: { [key: string]: string } = {};
        const match = verbose.match(httpResponseRegex);
        if (match) {
            match.forEach((header: string) => {
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

    private convertHeaderObjectToCURL() {
        return Object.entries(this.options.headers ?? {}).map(([key, value]) => `-H "${key}: ${value}"`).join(' ');
    }
}

const validateBrowserSelection = (browser: string) => {
    switch (process.platform) {
        case "linux":
            if (!ValidLinuxBrowsers.includes(browser)) {

            }
    }
}

interface BinaryResolution {
    binary: string;
    cwd?: string;
}

const binaryMap = {
    "chrome-darwin-x86": ""
}

export const resolveBinary = (defaultBrowser?: string): BinaryResolution => {
    const browser = defaultBrowser ?? "";
    let isFF = this.options.impersonate == "firefox-109" || this.options.impersonate == "firefox-117"
    switch (process.platform) {
        case "linux":
            if (process.arch == "x64") {
                if (isFF) {
                    return { binary: "curl-impersonate-firefox-linux-x86" }
                } else {
                    return { binary: "curl-impersonate-chrome-linux-x86" };
                }
            } else if (process.arch == "arm") {
                if (isFF) {
                    return { binary: "curl-impersonate-firefox-linux-aarch64" }
                } else {
                    return { binary: "curl-impersonate-chrome-linux-aarch64" };
                }
            } else {
                throw new Error(`Unsupported architecture: ${process.arch}`);
            }
        case "darwin":
            if (isFF) {
                return { binary: "curl-impersonate-firefox-darwin-x86" }
            } else {
                return { binary: "curl-impersonate-chrome-darwin-x86" };
            }
        case "win32":
            return {
                binary: "curl-impersonate-win/curl_chrome116.bat",
                cwd: path.join(__dirname, "..", "bin/curl-impersonate-win")
            }
        default:
            throw new Error(`Unsupported Platform! ${process.platform}`)
    }
}

const toHeader = (key: string, value: string) => {
    return `-H "${key}: ${value}"`;
}

interface ParsedRequestData {
    ip?: string;
    port?: number;
    status?: number;
}

const extractRequestData = (output: string): ParsedRequestData => {
    // Define regular expressions to extract information
    const ipAddressRegex = /Trying (\S+):(\d+)/;
    const httpStatusRegex = /< HTTP\/2 (\d+) ([^\n]+)/;

    // Extract IP address and port
    const ipAddressMatch = output.match(ipAddressRegex);
    let port;
    let ip;
    if (ipAddressMatch) {
        ip = ipAddressMatch[1];
        port = parseInt(ipAddressMatch[2])
    }

    // Extract HTTP status code and headers
    const httpStatusMatch = output.match(httpStatusRegex);
    let status;
    if (httpStatusMatch) {
        status = parseInt(httpStatusMatch[1]);
    }
    return { ip, port, status }
}

const extractResponseHeaders = (output: string): Record<string, string> => {
    const httpResponseRegex = /< ([^\n]+)/g;
    const headers: { [key: string]: string } = {};
    const match = output.match(httpResponseRegex);
    if (match) {
        match.forEach((header: string) => {
            const headerWithoutPrefix = header.substring(2); // Remove the first two characters
            const headerParts = headerWithoutPrefix.split(': ');
            if (headerParts.length > 1) {
                const headerName = headerParts[0].trim(); // Trim any leading/trailing spaces
                const headerValue = headerParts[1].trim(); // Trim any leading/trailing spaces
                headers[headerName] = headerValue;
            }
        });
    }
    return headers;
}

export const doRequest = (url: string, options: CurlImpersonateRequestOptions) => {
    const {
        browser,
        flags = [],
        headers = {},
        body,
        method = "GET"
    } = options;
    const { binary, cwd } = resolveBinary(browser);
    const binpath = path.join(__dirname, '..', 'bin', binary);
    const args = [
        ...flags,
        headers,
        `"${url}"`
    ].join(" ");

    return new Promise<CurlResponse>((resolve, reject) => {
        exec(`${binpath} ${args}`, { cwd }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            const response = stdout.toString();
            const verbose = stderr.toString();
            const { ip, port, status } = extractRequestData(verbose)
            const respHeaders = extractResponseHeaders(verbose)

            resolve({
                ip,
                port,
                status,
                response,
                responseHeaders: respHeaders,
                requestHeaders: headers,
            });
        });
    })
}

export default CurlImpersonate