import { exec } from "child_process";
import path from "path";
import { BINARY_PATH, Browser, BrowserType, getDefaultPlatformBrowser, resolveBrowser } from "./browsers";
import { BrowserPresets, Preset, PresetMap } from "./presets";

export interface ParsedRequestData {
    ip?: string;
    port?: number;
    status?: number;
}

export interface RequestPreset<T extends BrowserType> {
    name: T;
    version: PresetMap[T];
}

export class RequestBuilder {
    private _url: string = "";
    private _browser?: Browser;
    private _preset?: Preset;
    private _method: string = "GET";
    private _flags: string[] = [];
    private _headers: Record<string, string> = {};

    url(url: string) {
        this._url = url;
        return this;
    }

    method(method: string) {
        this._method = method;
        return this;
    }

    header(name: string, value: string) {
        this._headers[name] = value;
        return this;
    }

    headers(headers: Record<string, string>) {
        this._headers = { ...this._headers, ...headers };
        return this;
    }

    flag(name: string, value: string) {
        this._flags.push(`${name} "${value}"`);
        return this;
    }

    flags(flags: Record<string, string>) {
        for (const [flag, value] of Object.entries(flags)) {
            this.flag(flag, value);
        }
        return this;
    }

    preset<T extends BrowserType>(preset: RequestPreset<T>) {
        this._browser = resolveBrowser(preset.name);
        this._preset = BrowserPresets[preset.name][preset.version];
        return this;
    }

    async send() {
        const browser = this._browser ?? getDefaultPlatformBrowser();
        const preset = this._preset ?? Object.values(BrowserPresets[browser.name])[0];
        const headers = this.buildHeaderFlags({ ...this._headers, ...preset.headers });

        const command = [
            path.join(BINARY_PATH, browser.binary),
            ...this._flags,
            ...preset.flags,
            ...headers,
            `-X ${this._method}`,
            `"${this._url}"`,
        ].join(" ");

        return new Promise((resolve, reject) => {
            exec(command, { cwd: BINARY_PATH }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                const response = stdout.toString();
                const verbose = stderr.toString();
                const { ip, port, status } = this.extractRequestData(verbose)

                resolve({
                    ip,
                    port,
                    status,
                    response,
                    requestHeaders: this._headers,
                    responseHeaders: this.extractResponseHeaders(verbose),
                });
            });
        })
    }

    private buildHeaderFlags(headers: Record<string, string>) {
        return Object.entries(headers).map(([key, value]) => `-H "${key}: ${value}"`);
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
}