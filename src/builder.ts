import { exec } from "child_process";
import { cwd } from "process";
import { BROWSERS, Browser, getPlatformBrowsers } from "./browsers";

export interface ParsedRequestData {
    ip?: string;
    port?: number;
    status?: number;
}

export class RequestBuilder {
    private _url: string = "";
    private _browser?: Browser;
    private _method: string = "GET";
    private _flags: string[] = [];

    url(url: string) {
        this._url = url;
        return this;
    }

    method(method: string) {
        this._method = method;
        return this;
    }

    header(name: string, value: string) {
        return this.flag("-H", `${name} ${value}`);
    }

    headers(headers: [string, string][]) {
        return this.flags(headers);
    }

    flag(name: string, value: string) {
        this._flags.push(`${name} ${value}`);
        return this;
    }

    flags(flags: [string, string][]) {
        this._flags.push(...flags.map(([name, value]) => `${name} "${value}"`));
        return this;
    }

    browser(browser: string) {
        const browsers = getPlatformBrowsers();
        if (browsers === undefined) {
            return;
        }
        const foundBrowser = browsers.find(({ name }) => name === browser);
        if (foundBrowser !== undefined) {
            this._browser = foundBrowser;
        }
        return this;
    }

    async send() {
        this.flag("-X", this._method);

        if (this._browser === undefined) {
            const browsers = getPlatformBrowsers();
            if (browsers === undefined) {
                return;
            }
            this.browser(browsers[0].name);
        }

        const command = this._browser?.binary

        return new Promise((resolve, reject) => {
            exec(command, { cwd }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                const response = stdout.toString();
                const verbose = stderr.toString();
                const { ip, port, status } = this.extractRequestData(verbose)
                const respHeaders = this.extractResponseHeaders(verbose)
    
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

    private extractRequestData(output: string): ParsedRequestData {
        const ipAddressRegex = /Trying (\S+):(\d+)/;
        const httpStatusRegex = /< HTTP\/2 (\d+) ([^\n]+)/;

        const ipAddressMatch = output.match(ipAddressRegex);
        let port;
        let ip;
        if (ipAddressMatch) {
            ip = ipAddressMatch[1];
            port = parseInt(ipAddressMatch[2])
        }

        const httpStatusMatch = output.match(httpStatusRegex);
        let status;
        if (httpStatusMatch) {
            status = parseInt(httpStatusMatch[1]);
        }
        return { ip, port, status }
    }

    private extractResponseHeaders(output: string): Record<string, string> {
        const httpResponseRegex = /< ([^\n]+)/g;
        const headers: { [key: string]: string } = {};
        const match = output.match(httpResponseRegex);
        match?.forEach((header: string) => {
            const headerWithoutPrefix = header.substring(2); // Remove the first two characters
            const headerParts = headerWithoutPrefix.split(': ');
            if (headerParts.length > 1) {
                const headerName = headerParts[0].trim(); // Trim any leading/trailing spaces
                const headerValue = headerParts[1].trim(); // Trim any leading/trailing spaces
                headers[headerName] = headerValue;
            }
        });
        return headers;
    }

    static from() {

    }
}