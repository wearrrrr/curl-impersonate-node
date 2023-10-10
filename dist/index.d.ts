import { CurlImpersonateOptions, CurlResponse } from "./interfaces";
export declare class CurlImpersonate {
    url: string;
    options: CurlImpersonateOptions;
    validMethods: Array<String>;
    binary: string;
    impersonatePresets: String[];
    constructor(url: string, options: CurlImpersonateOptions);
    checkIfPresetAndMerge(): void;
    makeRequest(): Promise<CurlResponse>;
    validateOptions(options: CurlImpersonateOptions): boolean;
    setupBodyArgument(body: Object | undefined): Object | undefined;
    setProperBinary(): void;
    getRequest(flags: Array<string>, headers: string): Promise<CurlResponse>;
    postRequest(flags: Array<string>, headers: string, body: Object | undefined): Promise<CurlResponse>;
    extractRequestData(verbose: string): {
        ipAddress: string | undefined;
        port: number | undefined;
        statusCode: number | undefined;
    };
    extractResponseHeaders(verbose: string): {
        [key: string]: string;
    };
    convertHeaderObjectToCURL(): string;
}
export default CurlImpersonate;
