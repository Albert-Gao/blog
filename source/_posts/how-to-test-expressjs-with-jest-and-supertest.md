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

I recently changed from `Mocha`, `Chai` to `Jest`. Pretty lovely experiences. It took a while to figure out the right way to test an express route, but when it works, it works like a charm. I share my experiences here, hope it helps. I love jest assertion function more than `Chai`, seems more concise to me.

<!--more-->

## 1. Install

You need to install `babel-cli`, `babel-preset-env`, `jest`, `supertest` and `superagent`.

```bash
npm install --save-dev babel-cli babel-preset-env jest supertest superagent
```

## 2. Separate your `app` and `sever`

> The reason behind this is that it won't listen to the port after testing.

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

## 3. Use `done` to notify that it ends

Jest test will end when it hits the last line of the test function, so you need to use a `done()` to make it right.

```javascript
const request = require('supertest');
const app = require('../../src/app')

describe('Test the root path', () => {
    test('It should response the GET method', (done) => {
        request(app).get('/').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});
```

But that `done` is not a must, the following one is more neat.

## 4. Promise way

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

## 5. Async, await way to test

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
3. You don't need to use `babel-preset-env` if you use Node8 or above because it's supported.

## 6. Why not the Supertest way

Supertest way is still available. You just need to `return` the statement and remember not use `.end()` and the end.
Thanks **Adam Beres-Deak** for the hint!

A working example is as the following:

```javascript
const request = require('supertest');
const app = require('../../src/app')

describe('Test the root path', () => {
    test('It should response the GET method', () => {
        return request(app).get('/').expect(200);
    });
})
```

Notice that without that `return`, the test will always pass.

## 7. About the Database connection

You need to handle the database connection through the tests. In my case, I used this pattern:

```javascript
describe('Test the addLike method', () => {
    beforeAll(() => {
        mongoDB.connect();
    });

    afterAll((done) => {
        mongoDB.disconnect(done);
    });
}
```

Here I use mongoDB. I will connect at the beginning of this test suite, and disconnect at the end. And the `mongoDB` just a wrapper class.

```javascript
module.exports = {
    mongoose,
    connect: () => {
        mongoose.Promise = Promise;
        mongoose.connect(config.database[process.env.NODE_ENV]);
    },
    disconnect: (done) => {
        mongoose.disconnect(done);
    },
};
```

Notice that `done`? It is a variable used to indicate that an async operation is finished. `Jest` will give that as a parameter for that `afterAll`.

## 8 How to run the tests

You might want to use `jest --runInBand` to run the tests depending on how you structure your tests. Otherwise, multiple tests access same collection will cause random failing for your tests.

## 9. End

That's all, hope it help. :)