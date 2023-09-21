interface CurlImpersonateOptions {
    method: string;
    headers: Object;
    flags?: Array<string>;
    body?: Object;
    timeout?: number | 10000;
    followRedirects?: boolean | true;
}
export interface CurlImpersonate {
    url: string;
    options: CurlImpersonateOptions;
    validMethods: Array<String>;
    binary: string;
}
export declare class CurlImpersonate {
    constructor(url: string, options: CurlImpersonateOptions);
    makeRequest(): Promise<unknown>;
    validateOptions(options: CurlImpersonateOptions): boolean;
    setProperBinary(): void;
    getRequest(flags: Array<string>, headers: string): Promise<string>;
    postRequest(flags: Array<string>, headers: string): Promise<string>;
    convertHeaderObjectToCURL(): string;
}
export default CurlImpersonate;
