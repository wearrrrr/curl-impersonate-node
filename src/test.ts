import CurlImpersonate from ".";

(async () => {
    let ci = new CurlImpersonate("", {
        method: "GET",
        impersonate: "firefox-109",
        verbose: true,
    });
    let req = await ci.makeRequest("https://www.robotevents.com/VURC/2024-2025/QA/2057");
    console.log(req)
})();
