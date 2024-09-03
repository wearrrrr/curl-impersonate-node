export const ValidMacOSBrowsers = ["chrome-110", "chrome-116", "firefox-109", "firefox-117"] as const;

export const ValidLinuxBrowsers = ["chrome-110", "chrome-116", "firefox-109", "firefox-117"] as const;

export const ValidWin32Browsers = ["chrome-104", "chrome-107", "chrome-110", "chrome-116", "safari-15.5"] as const;

export type ValidBrowserType =
    | typeof ValidWin32Browsers[number]
    | typeof ValidMacOSBrowsers[number]
    | typeof ValidLinuxBrowsers[number];

export interface CurlImpersonateOptions {
    method: string;
    headers: Object;
    flags?: Array<string>;
    body?: Object;
    timeout?: number | 10000;
    followRedirects?: boolean | true;
    verbose?: boolean | false;
    impersonate?: ValidBrowserType;
}

export interface CurlImpersonateResponse {
    ip?: string,
    port?: number,
    status?: number;
    response: string;
    responseHeaders: Object;
    requestHeaders: Object;
}
