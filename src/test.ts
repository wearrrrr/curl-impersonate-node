import { doRequest } from ".";

(async () => {
    console.time();
    const response = await doRequest("https://www.robotevents.com/VURC/2024-2025/QA/2057");
    console.log(response);
    console.timeEnd();
})();
