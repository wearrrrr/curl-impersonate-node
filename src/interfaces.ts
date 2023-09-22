interface CurlImpersonateOptions {
    method: string;
    headers: Object;
    flags?: Array<string>;
    body?: Object;
    timeout?: number | 10000;
    followRedirects?: boolean | true;
    verbose?: boolean | false;
}

interface CurlResponse {
    ipAddress: string | undefined,
    port: number | undefined,
    statusCode: number | undefined;
    response: string;
    responseHeaders: Object;
    requestHeaders: Object;
    verboseStatus: boolean | undefined,
}

export { CurlImpersonateOptions, CurlResponse }