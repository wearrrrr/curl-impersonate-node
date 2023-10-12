import { CurlImpersonateOptions, CurlResponse } from "./interfaces";
export declare class CurlImpersonate {
    url: string;
    options: CurlImpersonateOptions;
    validMethods: Array<String>;
    binary: string;
    impersonatePresets: String[];
    constructor(url: string, options: CurlImpersonateOptions);
    private checkIfPresetAndMerge;
    makeRequest(url?: string): Promise<CurlResponse>;
    setNewURL(url: string): void;
    validateOptions(options: CurlImpersonateOptions): boolean;
    private setupBodyArgument;
    private setProperBinary;
    private getRequest;
    private postRequest;
    private extractRequestData;
    private extractResponseHeaders;
    private convertHeaderObjectToCURL;
}
export default CurlImpersonate;
