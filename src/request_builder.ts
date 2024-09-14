import { exec } from "child_process";
import path from "path";
import { BINARY_PATH, Browser, BrowserType, getDefaultPlatformBrowser, resolveBrowser } from "./browsers";
import { BrowserPresets, Preset, PresetMap } from "./presets";

export interface RequestPreset<T extends BrowserType> {
    name: T;
    version: PresetMap[T];
}

/**
 * Documentation: https://curl.se/docs/manpage.html#-w
 */
export interface CurlOutput {
    /**
     * Output the certificate chain with details. 
     * Supported only by the OpenSSL, GnuTLS, Schannel and Secure Transport backends. (Added in 7.88.0)
     */
    certs: string;

    /**
     * The Content-Type of the requested document, if there was any.
     */
    content_type: string | null;

    /**
     * The error message. (Added in 7.75.0)
     */
    errormsg: string | null;

    /**
     * The numerical exit code of the transfer. (Added in 7.75.0)
     */
    exitcode: number;

    /**
     * The ultimate filename that curl writes out to. 
     * This is only meaningful if curl is told to write to a file with the -O, --remote-name or -o, --output option. It is most useful in combination with the -J, --remote-header-name option.
     */
    filename_effective: string | null;

    /**
     * The initial path curl ended up in when logging on to the remote FTP server.
     */
    ftp_entry_path: string | null;

    /**
     * The numerical response code that was found in the last retrieved HTTP(S) or FTP(s) transfer.
     */
    http_code: number;

    /**
     * The numerical code that was found in the last response (from a proxy) to a curl CONNECT request.
     */
    http_connect: number;

    /**
     * The http version that was effectively used.
     */
    http_version: string;

    /**
     * The IP address of the local end of the most recently done connection - can be either IPv4 or IPv6.
     */
    local_ip: string;

    /**
     * The local port number of the most recently done connection.
     */
    local_port: number;

    /**
     * The http method used in the most recent HTTP request. (Added in 7.72.0)
     */
    method: string;

    /**
     * Number of server certificates received in the TLS handshake. Supported only by the OpenSSL, GnuTLS, Schannel and Secure Transport backends. (Added in 7.88.0)
     */
    num_certs: number;

    /**
     * Number of new connects made in the recent transfer.
     */
    num_connects: number;

    /**
     * The number of response headers in the most recent request (restarted at each redirect). Note that the status line IS NOT a header. (Added in 7.73.0)
     */
    num_headers: number;

    /**
     * Number of redirects that were followed in the request.
     */
    num_redirects: number;

    /**
     * The result of the HTTPS proxy's SSL peer certificate verification that was requested. 0 means the verification was successful.
     */
    proxy_ssl_verify_result: number;

    /**
     * When an HTTP request was made without -L, --location to follow redirects (or when --max-redirs is met), this variable shows the actual URL a redirect would have gone to.
     */
    redirect_url: string | null;

    /**
     * The Referer: header, if there was any. (Added in 7.76.0)
     */
    referer: string | null;

    /**
     * The remote IP address of the most recently done connection - can be either IPv4 or IPv6.
     */
    remote_ip: string;

    /**
     * The remote port number of the most recently done connection.
     */
    remote_port: number;

    /**
     * The numerical response code that was found in the last transfer (formerly known as "http_code").
     */
    response_code: number;

    /**
     * The URL scheme (sometimes called protocol) that was effectively used.
     */
    scheme: string;

    /**
     * The total amount of bytes that were downloaded. This is the size of the body/data that was transferred, excluding headers.
     */
    size_download: number;

    /**
     * The total amount of bytes of the downloaded headers.
     */
    size_header: number;

    /**
     * The total amount of bytes that were sent in the HTTP request.
     */
    size_request: number;

    /**
     * The total amount of bytes that were uploaded. This is the size of the body/data that was transferred, excluding headers.
     */
    size_upload: number;

    /**
     * The average download speed that curl measured for the complete download. Bytes per second.
     */
    speed_download: number;

    /**
     * The average upload speed that curl measured for the complete upload. Bytes per second.
     */
    speed_upload: number;

    /**
     * The result of the SSL peer certificate verification that was requested. 0 means the verification was successful.
     */
    ssl_verify_result: number;

    /**
     * The time, in seconds, it took from the start until the SSL/SSH/etc connect/handshake to the remote host was completed.
     */
    time_appconnect: number;

    /**
     * The time, in seconds, it took from the start until the TCP connect to the remote host (or proxy) was completed.
     */
    time_connect: number;

    /**
     * The time, in seconds, it took from the start until the name resolving was completed.
     */
    time_namelookup: number;

    /**
     * The time, in seconds, it took from the start until the file transfer was just about to begin. 
     * This includes all pre-transfer commands and negotiations that are specific to the particular protocol(s) involved.
     */
    time_pretransfer: number;

    /**
     * The time, in seconds, it took for all redirection steps including name lookup, connect, pretransfer and transfer before the final transaction was started. 
     * "time_redirect" shows the complete execution time for multiple redirections.
     */
    time_redirect: number;

    /**
     * The time, in seconds, it took from the start until the first byte is received. This includes time_pretransfer and also the time the server needed to calculate the result.
     */
    time_starttransfer: number;

    /**
     * The total time, in seconds, that the full operation lasted.
     */
    time_total: number;

    /**
     * The URL that was fetched. (Added in 7.75.0)
     */
    url: string;

    /**
     * The scheme part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.scheme": string;

    /**
     * The user part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.user": string | null;

    /**
     * The password part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.password": string | null;

    /**
     * The options part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.options": string | null;

    /**
     * The host part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.host": string;

    /**
     * The port number of the URL that was fetched. If no port number was specified and the URL scheme is known, that scheme's default port number is shown. (Added in 8.1.0)
     */
    "url.port": number;

    /**
     * The path part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.path": string;

    /**
     * The query part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.query": string | null;

    /**
     * The fragment part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.fragment": string | null;

    /**
     * The zone ID part of the URL that was fetched. (Added in 8.1.0)
     */
    "url.zoneid": string | null;

    /**
     * The scheme part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.scheme": string;

    /**
     * The user part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.user": string | null;

    /**
     * The password part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.password": string | null;

    /**
     * The options part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.options": string | null;

    /**
     * The host part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.host": string;

    /**
     * The port number of the effective (last) URL that was fetched. If no port number was specified and the URL scheme is known, that scheme's default port number is shown. (Added in 8.1.0)
     */
    "urle.port": number;

    /**
     * The path part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.path": string;

    /**
     * The query part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.query": string | null;

    /**
     * The fragment part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.fragment": string | null;

    /**
     * The zone ID part of the effective (last) URL that was fetched. (Added in 8.1.0)
     */
    "urle.zoneid": string | null;

    /**
     * The URL that was fetched last. This is most meaningful if you have told curl to follow location: headers.
     */
    url_effective: string;

    urlnum: number;
    curl_version: string;
}

export interface CurlResultOk {
    response: string;
    details: CurlOutput;
    stderr: undefined;
}

export interface CurlResultErr {
    response: undefined;
    details: undefined;
    stderr: string;
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

    /**
     * Add a header to the request
     * @param name The name of the header to set
     * @param value The value of the header to set
     * @returns The RequestBuilder instance
     */
    header(name: string, value: string) {
        this._headers[name] = value;
        return this;
    }

    /**
     * Add multiple headers to the request
     * @param headers A record of headers to add to the request
     * @returns The RequestBuilder instance
     */
    headers(headers: Record<string, string>) {
        this._headers = { ...this._headers, ...headers };
        return this;
    }

    /**
     * Add a flag to the request
     * @param name The name of the flag to set
     * @param value The value of the flag to set
     * @returns The RequestBuilder instance
     */
    flag(name: string, value?: string) {
        if (value) {
            this._flags.push(`${name} "${value}"`);
        } else {
            this._flags.push(name);
        }
        return this;
    }

    /**
     * Follow redirects (sugar for this.flag("-L"))
     * @returns The RequestBuilder instance
     */
    follow() {
        this.flag("-L");
        return this;
    }

    /**
     * Add multiple flags to the request
     * @param flags A record of flags to add to the request
     * @returns The RequestBuilder instance
     */
    flags(flags: Record<string, string | undefined>) {
        for (const [flag, value] of Object.entries(flags)) {
            this.flag(flag, value);
        }
        return this;
    }

    /**
     * Set the browser and version preset for the request.
     * Throws if the browser is not supported on the current platform.
     * @param preset The preset to use for the request
     * @returns The RequestBuilder instance
     */
    preset<T extends BrowserType>(preset: RequestPreset<T>) {
        this._browser = resolveBrowser(preset.name);
        this._preset = BrowserPresets[preset.name][preset.version];
        return this;
    }

    /**
     * Send the request
     * @returns A promise that resolves with the response and details of the request
     */
    async send(): Promise<CurlResultOk | CurlResultErr> {
        const browser = this._browser ?? getDefaultPlatformBrowser();
        const preset = this._preset ?? Object.values(BrowserPresets[browser.name])[0];
        const headers = this.buildHeaderFlags({ ...this._headers, ...preset.headers });
        const flags = this.buildFlags(this._flags);

        const command = [
            path.join(BINARY_PATH, browser.binary),
            ...flags,
            ...preset.flags,
            ...headers,
            "-s",
            `-w "\\n%{json}"`,
            `-X ${this._method}`,
            `${this._url}`,
        ].join(" ");

        return new Promise((resolve, reject) => {
            exec(command, { cwd: BINARY_PATH }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }

                if (stderr.trim().length > 0) {
                    resolve({ response: undefined, details: undefined, stderr });
                    return;
                }
                const result = stdout.split("\n");
                const response = result.slice(0, result.length - 1).join("");
                const details: CurlOutput = JSON.parse(result.at(-1) ?? "{}");
                resolve({ response, details, stderr: undefined });
            });
        })
    }

    private buildFlags(flags: string[]) {
        const flagBlacklist = [
            "-w",
            "-s",
            "-v", // TODO: potentially add a way to parse stdout with flag included
            "-X"
        ];
        return flags.filter(flag => !flagBlacklist.includes(flag));
    }

    private buildHeaderFlags(headers: Record<string, string>) {
        return Object.entries(headers).map(([key, value]) => `-H "${key}: ${value}"`);
    }
}
