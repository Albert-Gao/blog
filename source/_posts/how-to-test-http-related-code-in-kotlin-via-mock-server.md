---
title: How to test HTTP related code in Kotlin via mock-server
date: 2018-03-15 14:22:23
tags:
  - kotlin
  - test
---

Mock is the answer to this kind of case when you need to deal with the IO thing like network request. Such that, you can test your logic without worrying about the underneath implementation. But sometimes it's not the case. Integration test is the answer.

<!--more-->

## 1. Use case

My case is I have an `expect` class where I need to implement in across several platforms. Let's say there is a `httpGet()` method. In terms of Android, I use the `HttpURLConnection` to implement the `httpGet()` method. If I want to test whether it works or not, I just need to mock `HttpURLConnection` and assert whether it has been set up with correct parameters before sending. But it's not ideal. Because in the end, I might change to another lib, I might just wrap around some famous 3rd party lib to do the job. But at that time, I need to refactor the tests as well. Because the current tests are locked to testing the detail which is coupled with `HttpURLConnection`.

So instead, I want to write some integration tests which will send actual requests. Then assert the response to see whether everything works or not.

## 2. Benefits

1. No mock at all. The tests are as clean as insanely easy unit tests. You call a method and assert its return value.
1. You can move the tests to the `common` code, such that, you just need to write the tests once, and it will test for all platforms.
   - If you don't know what does `common` code mean here, it's code which meant to be shared across without change a single line. It's from the Kotlin multi-platform project.
   - You can also check my [blog](/2018/02/22/use-kotlin-to-share-native-code-between-ios-and-android/) for how to set up a codebase where you can share code among Android, iOS, JVM, JS.
   - **It's not as easy as it sounds because you may use different `MockServer` across platforms and they may have different API. But I think it should work after adding another layer to abstract the differences.**

## 3. Setup

We will use this one: [MockServer](http://www.mock-server.com/). And first thing first, add a dependency to your `build.gradle`.

```groovy
testCompile 'org.mock-server:mockserver-netty:5.3.0'
```

You can always find the latest version number on their [Github release page](https://github.com/jamesdbloom/mockserver/releases).

## 4. Add an abstract class for setting up the server

```java
import org.mockserver.client.server.MockServerClient
import org.mockserver.integration.ClientAndServer
import kotlin.test.*
import org.mockserver.model.HttpRequest.request
import org.mockserver.model.HttpResponse.response

val random = Random()
internal fun randomFrom(from: Int = 1024, to: Int = 65535) : Int {
    return random.nextInt(to - from) + from
}

abstract class HttpTestBase {
    private val port = randomFrom()
    var mockServer: MockServerClient = MockServerClient("localhost", port)
    val url = "http://localhost:$port"

    @BeforeTest
    fun prepare() {
        mockServer = ClientAndServer.startClientAndServer(port)
    }

    @AfterTest
    fun tearDown() {
        mockServer.close()
    }
}
```

OK, it's as simple as it will start a new server on a random port. Open it before each test and close it after each test.

The reason we need that random port number is we might need the server for multiple test suites and we don't want they have conflicts with each other.

The official documentation mentions you can setup a sessionID or correlationId header to run tests in parallel. I don't use it because I don't want to modify my request format just for the tests.

## 5. Write the test

Now you can write the integration tests in an easy way.

```groovy
class PostTest: HttpTestBase() {
    @Test
    fun post() {
        // setup an API route with response
        mockServer.setup(
            "POST",
            "/users",
            200,
            "{\"name\":\"albert\"}"
        )

        // invoke your http related method
        val result = post(
            url = "$url/users",
            headers = null,
            json = null
        )

        // assert the result
        assertEquals(
            mapOf("name" to "albert"),
            result
        )

        // check the request
        mockServer.verifyRequest(
            "GET",
            "/users"
        )
    }
}
```

It should be pretty straightforward.

## 6. Some extension methods

In fact, `mockServer.setup()` and `mockServer.verifyRequest()` are not from `MockServer`. I wrapped them for easy access.

```kotlin
internal fun MockServerClient.setup(
    requestMethod:String,
    requestPath:String,
    responseStatus: Int,
    responseBody:String
) {

    this.`when`(
        request()
            .withMethod(requestMethod)
            .withPath(requestPath)

    )
        .respond(
            response()
              .withStatusCode(responseStatus)
              .withBody(responseBody)
        )
}

internal fun MockServerClient.verifyRequest(
    method: String?,
    path: String?,
    headers: Map<String, *>?
) {
    val request = request()

    method?.let { request.withMethod(method) }
    path?.let { request.withPath(path) }
    headers?.let {
        for ((key, value) in headers) {
            request.withHeader(
              header(key, value.toString())
            )
        }
    }

    this.verify(request)
}
```

From here, you can know the standard way to set up the MockServer and verify its request.

## 7. End

Actually, you can further simplify this, if you just want to have a single server if you just to have one server setup for all tests such that you don't need to invoke `mockServer.setup()` in each test. You just need to set it up in a `@BeforeTest` or `@BeforeAll`.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
