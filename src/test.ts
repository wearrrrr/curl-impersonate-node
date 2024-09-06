import { RequestBuilder } from "./builder";

(async () => {
    console.time();
    // const response = await doRequest("https://www.robotevents.com/VURC/2024-2025/QA/2057");
    // console.log(response);
    const res = await new RequestBuilder()
        .url("https://www.robotevents.com/VURC/2024-2025/QA/2057")
        .preset({ name: "chrome", version: "107" })
        .send();
    console.log(res);
    console.timeEnd();
})();
