---
title: Handle AWS lambda error with API gateway integration using Typescript in a clean way
date: 2019-07-08 00:14:39
tags:
  - serverless
  - typescript
---

I think I have a talent to make such a verbose title... xD

Anyway, error handling is tedious or hard, just like naming your blog. But you can't miss it, because it makes your code robust. AWS lambda is a great way to write your code, and its simple nature enables us to do something very interesting, and make your code clean, I previously looked a lot about best practice of error handling in lambda, but either they mentions other AWS services integration or just lambda-API gateway configuration. Today, let's talk about the code. How to make this part clean. Even more, we will use Typescript.

<!--more-->

## 1. Overview

First, we need to define `clean`, to my idea, I think, `clean` means it's pretty easy to grasp the intention of the function, and testing friendly. In traditional imperative programming. I'd like to separate the algorithm into smaller functions, and compose them in a top level function. Then every step should be easy unit testable.

## 2. Interact with API Gateway from lambda

Lambda is nothing but a plain function, it is nothing to do with the web concept, API Gateway is the layer which interact with the client, so if you want to communicate with your web client, you have to go through the API Gateway layer. And you need to speak its language. Something like this:

```javascript
interface PlainObject {
  [key: string]: any;
}

const buildRequest = (statusCode: number, body: PlainObject) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});
```

With the above function, now you can easily send a JSON back to the client, just use it will the `callback` which is the 3rd parameter of your lambda. invoking `callback(null, buildRequest(200, {message: 'ok'}))`, will return `200`, and a `{message: 'ok'}` to the client. Or, if you are using `async/await`, just return the response object directly, otherwise, you might face the warning in CloudWatch:

> Callback/response already delivered. Did your function invoke the callback and also return a promise? For more details

Even better, you can include lots of details rather than a simple message in this object, it will all be handled inside.

> The `body` property of the returned object MUST be a string.

## 3. What is the problem

> The above knowledge leads to our first question, if this `callback` is your only way to send a meaningful response, then you have to construct your logic in the handler function. Which, seems to be fine? Let's see a real world example

Or, if you just `return` the response, how could know it is the error case to `return`? or just a normal result? A lof of `if`?

Let's see the following lambda function

```javascript
const createCompany = async (event, context, callback) => {
  const idToken = getIdToken(event);
  if (!idToken) {
    callback(null, buildRequest(400, { message: "no id token" }));
    return;
  }

  const companyName = getCompanyName(idToken);
  if (!companyName) {
    callback(null, buildRequest(400, { message: "no company name" }));
    return;
  }

  try {
    const response = await companyService.create(company);
    callback(null, buildRequest(200, response));
  } catch (err) {
    callback(
      null,
      buildRequest(500, { message: "server error, please try again later" })
    );
  }
};
```

The logic here is simple:

1. get the idToken from the event
   - if no token, return error
1. get the company name from the idToken
   - if no company name, return error
1. send request to our microservice endpoint
   - if 200, return to the client
   - if error, return 500

This code is just...barely readable. When you have more complex logic than this, then it will become total disaster. And even each step `getIdToken`, `getCompanyName` is highly testable, since they either return a value or null, but the `createCompany` will be not that good.

## 4. What about something like this

```javascript
const createCompany = async (event, context, callback) => {
  const idToken = getIdToken(event);
  const companyName = getCompanyName(idToken);

  const response = await companyService.create(company);
  return response;
};
```

Wow, YES! You might say. But wait, didn't I just remove all the `if` for the error path, and `try catch` for the network part, such that it becomes easy to read.

What if I tell you that:

- inside the `getIdToken` and `getCompanyName`, it will try getting the value, and whenever the value is not there, it will throw an error.
- Same thing for that `companyService.create`
- which means in the body of `createCompany`, you just need to compose the happy path.
- And for all the errors, `createCompany` will handle them or return to the client.

With very few codes, we can do this, really!

## 5. Let's unify the errors first

First, let's unify all the error response:

```javascript
const success = (body: PlainObject) => buildResponse(200, body);

const badRequest = (body: PlainObject) => buildResponse(400, body);

const internalError = (body: PlainObject) => buildResponse(500, body);

const buildResponse = (statusCode: number, body: PlainObject) => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
    "Access-Control-Allow-Credentials": true,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});
```

Now we have `success`:200, `badRequest`:400, `internalError`: 500, pretty good start.

> You need to use them all over your logic every time you want to throw, you choose one of the functions.

Let's throw them, they born to be thrown. xD

## 6. One function you will how to handle the rest

```javascript
export const getIdToken = (event: APIGatewayEvent): IdToken => {
  let idTokenString;

  // parse, verify, extract;
  // try get the token from event

  if (!idTokenString) {
    throw badRequest({ message: "no id token" });
  }

  return JSON.parse(idTokenString);
};
```

Is this function testable, very:

```javascript
describe("getIdToken", () => {
  it("should return an object when everything is ok", () => {
    expect(getIdToken(correctEvent)).toEqual({
      "x-hasura-user-id": "auth0|5d19e6548cda8"
    });
  });

  it("should throw error if no IdToken", () => {
    expect(() => getIdToken(badEvent)).toThrowError();
  });
});
```

You have the idea how to refactor the rest two.

## 7. Now our champion, the higher-order function

```javascript
export const handleError = (
  handler: (
    event: APIGatewayProxyEvent,
    context: Context
  ) => Promise<PlainObject> | PlainObject
) => async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => {
  try {
    const result = await handler(event, context);

    callback(null, success(result));
  } catch (err) {
    callback(null, err);
  }
};
```

Let's digest it.

1. `handleError` is a function, which takes a function, and returns a function, which makes itself a higher-order function.
1. It takes a function `handler` which will accept `event, context` like usual, and returns a function which matches the normal handler signature (3 params).
1. In the body of the returned function, we try catch everything.
1. Any error being thrown inside the `handler` function, will be re-throw, and since we already unified the error response, we just re-throw without any wrapper.
1. If no errors, we return `success`

## 8. How to use it

You simply just wrap your `createCompany` lambda with it like this:

```javascript
export const createCompany = handleError((event, context) => {
  // our previous logic
});
```

Event better, it will give you error if you try to return anything that is not an object if you use TypeScript.

## 9. The final result

```javascript
const createCompany = handleError(async (event, context, callback) => {
  const idToken = getIdToken(event);
  const companyName = getCompanyName(idToken);

  const response = await companyService.create(company);
  return response;
});
```

What a result! Now you can just wrap this `handlerError` to each of your lambda, then you can make your code clean.

## 10. End

I think an important concept is you always want to make your top level (which composes all the steps) easier to follow, because every time you refactor or debug, this is where you start.

Hope it helps.

Ah, one more thing, I published this idea as a open source library recently: [micro-aws-lambda](https://github.com/Albert-Gao/micro-aws-lambda). A 7KB and 0 dependencies AWS Lambda library which supports middleware and easy debug.

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
