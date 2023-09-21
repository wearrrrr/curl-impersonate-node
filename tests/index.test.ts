import { notEqual } from "assert";
import CurlImpersonate from "../src/index";

test("Returns a successful response", async () => {
    let ci = new CurlImpersonate("https://google.com", {
        method: "GET",
        headers: {
            "user-agent": "Curl Impersonate -- Chrome 110"
        }
    });
    // ci.makeRequest().then((res) => {
    //     expect(notEqual(res, null));
    // })
    let req = await ci.makeRequest()
    expect(notEqual(req, null))
})

// test("Get response code from request", () => {
//     let ci = new CurlImpersonate("https://google.com", {
//         method: "GET",
//         headers: {
//             "user-agent": "Curl Impersonate -- Chrome 110"
//         }
//     });
//     ci.makeRequest().then((res) => {
        
//     })
// })