import path from "path";

export interface Browser {
    name: string;
    binary: string;
}

export const BINARY_PATH = path.join(__dirname, "..", "bin", process.platform);

export const BROWSERS: Record<string, Browser[] | undefined> = {
    win32: [
        {
            name: "chrome",
            binary: "chrome-x64.exe",
        }
    ],
    darwin: [
        {
            name: "firefox",
            binary: "firefox-x64"
        },
        {
            name: "chrome",
            binary: "chrome-x64"
        }
    ],
    linux: [
        {
            name: "firefox",
            binary: "firefox-x64"
        },
        {
            name: "chrome",
            binary: "chrome-x64"
        },
        {
            name: "firefox",
            binary: "firefox-arm64"
        },
        {
            name: "chrome",
            binary: "chrome-arm64"
        }
    ]
}

export const getPlatformBrowsers = () => {
    return BROWSERS[process.platform];
}
