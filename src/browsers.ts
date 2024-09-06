import path from "path";

export type BrowserType = "chrome" | "firefox" | "safari";

export interface Browser {
    name: BrowserType;
    arch: NodeJS.Architecture;
    binary: string;
}

export const BINARY_PATH = path.join(__dirname, "..", "bin", process.platform);

export const BROWSERS: Record<string, Browser[] | undefined> = {
    win32: [
        {
            name: "chrome",
            arch: "x64",
            binary: "chrome-x64.exe",
        }
    ],
    darwin: [
        {
            name: "firefox",
            arch: "x64",
            binary: "firefox-x64"
        },
        {
            name: "chrome",
            arch: "x64",
            binary: "chrome-x64"
        }
    ],
    linux: [
        {
            name: "firefox",
            arch: "x64",
            binary: "firefox-x64"
        },
        {
            name: "chrome",
            arch: "x64",
            binary: "chrome-x64"
        },
        {
            name: "firefox",
            arch: "arm64",
            binary: "firefox-arm64"
        },
        {
            name: "chrome",
            arch: "arm64",
            binary: "chrome-arm64"
        }
    ]
}

export const getPlatformBrowsers = () => {
    return BROWSERS[process.platform];
}

export const getDefaultPlatformBrowser = () => {
    const browsers = getPlatformBrowsers();
    if (browsers === undefined) {
        return;
    }
    return browsers.find(b => b.arch === process.arch);
}

export const resolveBrowser = (browser: BrowserType) => {
    const browsers = getPlatformBrowsers();
    if (browsers === undefined) {
        return;
    }
    return browsers.find(b => b.name === browser && b.arch === process.arch);
}