---
title: >-
  How to solve the callback response already delivered warning when writing AWS lambda
date: 2020-03-04 14:06:16
tags:
  - aws-lambda
  - node
---

If you have ever receive this warning from the log of your lambda,

> WARNING: Callback/response already delivered. Did your function invoke the callback and also return a promise? For more details, see: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html

I got this when implementing Cognito lambda trigger of the PreSignUp step.

Let's see how to solve it.

<!--more-->

## 1. What causes this

If you use Lambda proxy, and `async/await`. And you see the above warning, that means you are returning via invoking the `callback()`. Even though you are not return any promise.

something like:

```javascript
const handler = async (event, context, callback) => {
  await myAsyncFunc()

  callback(null, {
    statusCode: 200.
    body: JSON.stringify({message:"ok"})
  })
}
```

You will be shocked to see you are not returning any `Promise`, just invoking that `callback()` to return value. So basically, the error message does not apply at all.

## 2. Solution for the lambda handler

So, instead of using `callback()`, you just return the response directly.

```javascript
const handler = async (event, context, callback) => {
  await myAsyncFunc()

  return {
    statusCode: 200.
    body: JSON.stringify({message:"ok"})
  };
}
```

Set the `statusCode` to 400 when returning an error.

## 3. Solution for the Cognito trigger lambda

```javascript
const cognitoPreSignUpTrigger = async event => {
  await myAsyncFunc();

  return event;
};
```

You simple just return the event, **no worries about the error, simply LET IT THROW**, it will be caught by the gateway and being returned.

The trouble comes from the confusion of the error message, and all the online document for writing Cognito trigger is `callback()` based.

## 4. End

That's it, hope it helps.
