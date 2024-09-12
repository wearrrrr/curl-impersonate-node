import { RequestBuilder } from "./builder";

(async () => {
    
    try {
        console.time();
        const response = await new RequestBuilder()
            .url("https://www.robotevents.com/V5RC/2024-2025/QA/2057")
            .preset({ name: "chrome", version: "107" })
            .send();
        // console.log(response);
        console.timeEnd();
        if (response.stderr !== undefined) {
            console.log(response.stderr);
        }
    } catch(e) {
        console.error(e);
    }
})();
