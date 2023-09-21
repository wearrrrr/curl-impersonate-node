interface CurlImpersonateOptions {
    method: string;
    headers: Object;
    flags?: Array<string>;
    body?: Object;
    timeout?: number | 10000;
    followRedirects?: boolean | true;
    verbose?: boolean | false;
}
export interface CurlImpersonate {
    url: string;
    options: CurlImpersonateOptions;
    validMethods: Array<String>;
    binary: string;
}
export interface CurlResponse {
    ipAddress: string | undefined;
    port: number | undefined;
    statusCode: number | undefined;
    response: string;
    responseHeaders: Object;
    requestHeaders: Object;
    verboseStatus: boolean | undefined;
}
export declare class CurlImpersonate {
    constructor(url: string, options: CurlImpersonateOptions);
    makeRequest(): Promise<CurlResponse>;
    validateOptions(options: CurlImpersonateOptions): boolean;
    setupBodyArgument(body: Object | undefined): Object | undefined;
    setProperBinary(): void;
    getRequest(flags: Array<string>, headers: string): Promise<CurlResponse>;
    postRequest(flags: Array<string>, headers: string, body: Object | undefined): Promise<CurlResponse>;
    convertHeaderObjectToCURL(): string;
}
export default CurlImpersonate;
