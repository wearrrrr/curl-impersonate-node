import { notEqual } from "assert";
import CurlImpersonate from "../src/index";

test("Returns a successful GET reponse", async () => {
    let ci = new CurlImpersonate("https://httpbin.org/get", {
        method: "GET",
        headers: {
            "user-agent": "node-curl-impersonate Test Suite -- contact@wearr.dev"
        },
    });
    let req = await ci.makeRequest()
    console.log(req)
    expect(notEqual(req, null))
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
    expect(notEqual(req, null))
})