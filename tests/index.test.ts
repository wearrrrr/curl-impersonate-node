import { equal, notEqual } from "assert";
import CurlImpersonate from "../dist/index";

test("Returns a successful GET reponse on TLS Fingerprinting protected URL", async () => {
    let ci = new CurlImpersonate("", {
        method: "GET",
        headers: {
            "x-user-key": "amiami_dev"
        },
        impersonate: "firefox-109",
        verbose: true,
    });
    let req = await ci.makeRequest("https://api.amiami.com/api/v1.0/items?s_keywords=touhou%20plush&pagecnt=2&pagemax=30&lang=eng");
    expect(equal(req.statusCode, 200))
})

test("Returns a successful POST reponse", async () => {
    let ci = new CurlImpersonate("https://httpbin.org/post", {
        method: "POST",
        headers: {
            "user-agent": "node-curl-impersonate Test Suite -- contact@wearr.dev"
        },
        body: {
            title: "foo",
            body: "bar",
            userId: 1,
        }
    });
    let req = await ci.makeRequest()
    expect(equal(req.statusCode, 200))
})