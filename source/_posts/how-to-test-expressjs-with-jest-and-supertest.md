---
title: How to test Express.js with Jest and Supertest
date: 2017-05-24 20:26:48
tags:
  - javascript
  - test
  - jest
  - supertest
  - es6
---

I recently changed from Mocha, Chai and supertest to Jest. Pretty lovely experiences, cost a while to figure out the right way to test an express route, but when it works, it works like a charm. I share my experiences here, hope it helps.

<!--more-->

## 1. Install.
You need to install `babel-cli`, `babel-preset-env`, `jest`, `supertest` and `superagent`.
```bash
npm install --save-dev babel-cli babel-preset-env jest supertest superagent
```

## 2. Separate your `app` and `sever`
The reason behind this is that so it won't listen to the port after testing.

```javascript
//app.js
const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

module.exports = app
```

This is your `server.js`:

```javascript
//server.js
const app = require('./app')

app.listen(5678, () => {
    console.log('Example app listening on port 5678!');
})
```

Then you can start your server via `node server.js`, and you can import that `app.js` for testing.

## 3. Promise way.

```javascript
const request = require('supertest');
const app = require('../../src/app')

describe('Test the root path', () => {
    test('It should response the GET method', () => {
        return request(app).get("/").then(response => {
            expect(response.statusCode).toBe(200)
        })
    });
})
```

Two Things to be noticed here:
1. That `return` is crucial, otherwise your tests will get stuck.
2. No need to pass `done` to your test.

## 4. Async, await way to test.
It's good to see that my beloved `async` and `await` from `.net` has a place in javascript world too.

```javascript
const request = require('supertest');
const app = require('../../src/app')

describe('Test the root path', () => {
    test('It should response the GET method', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
})
```

Does the imperative programming style and synchronous looking make you feel happy? :D Two things also be noticed here.

1. Use `async` to the function before you want to use `await`
2. You need the `babel-preset-env` package to use this.

## 5. Why not the Supertest way?
You may ask since we already use supertest, why not the supertest way?

I've got a working example with flaw as the following:

```javascript
const request = require('supertest');
const app = require('../../src/app')

describe('Test the root path', () => {
    test('It should response the GET method', () => {
        return request(app).get('/').expect(200).end();
    });
})
```

Two things again:
1. `done` doesn't work here.
2. Without that `return`, the test will always pass.

The flaw is that you will get warnings in your console:
```bash
  console.warn node_modules/superagent/lib/request-base.js:191
    Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises

  console.warn node_modules/superagent/lib/node/index.js:754
    Warning: .end() was called twice. This is not supported in superagent

 PASS  tests/backend/sever.test.js
  Test the root path
    ✓ It should response the GET method (29ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.403s
Ran all test suites.
  console.warn node_modules/superagent/lib/node/index.js:663
    superagent: double callback bug
```

Anyone has a solution is welcome to comment, thanks. :)

## 6. End
That's all, hope it help. :)