import { equal } from "assert";
import { RequestBuilder } from "../src";

test("Returns a successful GET reponse on TLS Fingerprinting protected URL", async () => {
    const response = await new RequestBuilder()
        .url("https://api.amiami.com/api/v1.0/items?s_keywords=touhou%20plush&pagecnt=2&pagemax=30&lang=eng")
        .header("x-user-key", "amiami_dev")
        .send();

    expect(response.stderr).toBeUndefined();
    expect(equal(response.details?.http_code, 200));
});

test("Returns a successful POST reponse", async () => {
    const body = {
        title: "foo",
        body: "bar",
        userId: 1,
    };

    const response = await new RequestBuilder()
        .url("https://httpbin.org/post")
        .method("POST")
        .header("user-agent", "node-curl-impersonate Test Suit")
        .flag("-d", JSON.stringify(body))
        .send();

    expect(response.stderr).toBeUndefined();
    expect(equal(response.details?.http_code, 200));
})