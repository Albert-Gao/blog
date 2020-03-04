---
title: How to make ajax call with native fetch API in javascript
tags:
  - fetch
  - ajax
  - javascript
id: 67
date: 2016-08-11 19:13:49
---

jQuery is great. Not only for its famous DOM manipulation but also for its extended functionalities, ajax is one of them. But when you use some libraries like React, you won't need jQuery at all. But still you need to make an ajax call, how to deal with it?

There are tons of libraries which you can use. But just a special one you should pay attention, Fetch API, [a living standard](https://fetch.spec.whatwg.org/), and will someday be implemented by every modern browser. In fact, the latest version of most browsers have all supported this API. Including Chrome(Desktop/Android), Firefox, Opera and Edge. Let's say how fancy it could be :) We'll see it in a high abstract view first, then break into pieces. So you can learn it in a very fast pace.

<!--more-->

## 1\. A fully code block:

```javascript
fetch(request)
  .then(function(response) {
    if (response.ok) {
      return response.json();
    }
  })
  .then(function(previousJSON) {
    console.log(previousJSON.name);
  })
  .catch(function(error) {
    console.log(error.message);
  });
```

## 2\. Why not ES6?

```javascript
fetch(request)
  .then(response => response.json())
  .then(previousJSON => console.log(previousJSON.name))
  .catch(error => console.log(error.message));
```

aha, just that easy, right? Please notice the following details, they are the foundations of this API:

1.  request;
2.  response;
3.  previousJSON in the second then()
4.  catch

## 3\. Let's check them one by one to make the code more concrete - Request:

There are mainly 2 ways to create this request object:

1.  URL
2.  request object

The 'URL' way is easy, you just pass the url as a string, not only for the json, but you can request a image, then later deal with it as a blob!

```javascript
fetch("http://www.abcdefg.com/abcdefg.jpg").then(...);
```

The 'request object' way is just a more complete way to form your request, you can modify every parameter of this request, then pass it into `fetch()`, to form a request body, you need 2 parameters, a URL as string and a Header object, the Header object is just HTTP Header in a javascript object way. Let's see the code:

```javascript
var myRequest = new Request(
    'http://mysite/api/people/id/1',
    {
         'method': 'GET',
         'Content-Type': 'application/json'
    });
fetch(myRequest).then(...);
```

If you have tons of headers to set, there is a `Header()` object you can use:

```javascript
var headers = new Headers();
headers.append('method', 'GET');
headers.append('Content-Type', 'text/json');

var myRequest = new Request("http://mysite",headers);
fetch(myRequest).then(...);
```

## 4\. response.ok

Before dive into the response object, let's see this check first: `if (response.ok)` , you may guess this is a new way to handle error, but then you find in the above block there is a `.catch()` function at the last of the chain. Then you get confused... In fact,

> The `ok` is a read-only property of the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) interface which contains a boolean stating whether the response was successful (**status in the range 200-299**) or not.

Yes, only 200-299, even a 404 is not in this scope. If you need to detect it, you can use the following property to retrieve this value:

```javascript
var httpStatus = response.status;
```

## 5\. Response object:

Since this is the most important object that we developers will deal with all over the day, Let's take a close look at how many fancy stuff are await us :) If the name is not that self-explanatory, I will add some comments there.

### 5.1 Read-Only Properties

- Response.headers
- Response.ok
- Response.status //return 200 etc.
- Response.statusText Read //return OK for 200
- Response.type //return basic, cors, opaque, error, etc
- Response.url
- Response.useFinalURL
- Body.bodyUsed //a Boolean that declares whether the body has been used in a response yet.

### 5.2 Methods

- Response.clone()
- Response.error() //return a new Response object associated with a network error.
- Response.redirect() //Creates a new response with a different URL.

### 5.3 More Methods you can use

The following method comes from the body object, but since the **response** object implements its interface, you can use it on the response object too, all they do is just taking a response stream and reads it to completion. Then use the according type to return it.

- Response.arrayBuffer()
- Response.blob()
- Response.formData()
- Response.json()
- Response.text()

> A side note: The **request** object implements these interfaces too, feel free to use them.

### 5.4 Let's make a meaningful function

```javascript
fetch(myRequest).then(function(response) {
  var contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    console.log("No JSON!!");
  }
});
```

## 6\. The next chain, previousJSON

In fact, like middlewares in node.js or ASP.Net Core, you can chain a lot `then()` methods here, and they will all return a promise object, then you can lots of functions here to decouple your logic. It means,

> every value you returned from a `then()` method, will pass into the next `then()` method as a parameter. And if you use the above methods to return, the return type will be Response. Great, so you can take advantage of the fancy things above again.

This is why I declare the parameter in the 2nd `then()` as a previousJSON, just for a hint. Let's review the previous block. I think now these make more sense now.

```javascript
fetch(request)
  .then(function(response) {
    if (response.ok) {
      return response.json();
    }
  })
  .then(function(previousJSON) {
    console.log(previousJSON.name);
  })
  .catch(function(error) {
    console.log(error.message);
  });
```

## 7. Can I use them now?

As I said, nearly all modern browsers have implemented this elegant API. But since we can't ingore IE, the **polyfill library** comes into play. Roughly speaking, this is a 3rd party library which implements this Fetch API following the standard, and deal with the underneath browser compatibility for you. So you can use them now, when the final day comes, you just delete this library and everything will be fine. Isn't that fantastic?

Just click this GitHub link and use it, today!

[https://github.com/github/fetch](https://github.com/github/fetch)

Or you can install via npm:

```
npm install whatwg-fetch --save
```

## 7.1 What is the whatwg- prefix here?

Some of you may wonder why this library has such a strange prefix. Here is why:

> The Web Hypertext Application Technology Working Group (WHATWG) is a growing community of people interested in evolving the Web. It focuses primarily on the development of HTML and APIs needed for Web applications.
>
> The WHATWG was founded by individuals of Apple, the Mozilla Foundation, and Opera Software in 2004, after a W3C workshop. Apple, Mozilla and Opera were becoming increasingly concerned about the W3C’s direction with XHTML, lack of interest in HTML and apparent disregard for the needs of real-world authors.

Yes, they are the standard! And they even list `fetch()` as a second line of their main focus standards.  And you can check the full details of this API [here](https://fetch.spec.whatwg.org/).

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
