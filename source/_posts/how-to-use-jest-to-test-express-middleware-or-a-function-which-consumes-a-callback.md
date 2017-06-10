---
title: How to use Jest to test Express middleware or a function which consumes a callback?
date: 2017-06-10 12:58:28
tags:
  - jest
  - test
  - javascript
  - express
---

Jest's document says that you could use `done` as a parameter to test a function which takes a callback function as a parameter, but is it really the answer to every case? Sometimes, errors in your assertion in your callback will yield a timeout with meaningless call stack. I happened to solve a problem with a different approach. The solution here is not only apply to express middleware, but also to any function which consumes a callback.

<!--more-->

## 1. A simple middleware which generate a JSON Web Token.

```javascript
const issueJWT = (req, res, next) => {
    const signUser = {
        id: res.locals.user._id.toString(),
    };

    jwt.sign( 
        signUser, 
        'HS256KEY', 
        { expiresIn: '120days', algorithm: 'HS256' },
        (err, token) => {
            if (err) { return next(err); }
            res.locals.token = token;
            next();
        });
};
```

The middleware is simple, just uses id and some key to generate a JWT, invoke error handler if there is an error. 

## 2. This is the test.

```javascript
test('Should return a JWT with proper value if nothing wrong happened', (done) => {
    const callback = (err) => {
        const JWT = response.locals.token;
        const tokenPayload = jwt.decode(JWT, { complete: true }).payload;

        expect(err).toBeFalsy();
        expect(tokenPayload).toHaveProperty('iat');
        expect(tokenPayload).toHaveProperty('exp');
        expect(tokenPayload).toHaveProperty('id');
        expect(tokenPayload).toHaveProperty('iss');
        done();
    };

    issueJWT(request, response, callback);
});
```

Is it pass? Yes, of course, and I actually use breakpoint to check it indeed invoked the callback function. And this is the way which follows the official documents said.

## 3. So, it works, what's the problem?

The problem is, when you have an error, you won't see a clear answer. The error message is like this:

>● Test issueJWT › Should return a JWT with proper value if nothing wrong happened
>
>    Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.
>
>      at pTimeout (node_modules/jest-jasmine2/build/queueRunner.js:53:21)
>      at Timeout.callback [as _onTimeout] (node_modules/jsdom/lib/jsdom/browser/Window.js:523:19)
>      at ontimeout (timers.js:380:14)
>      at tryOnTimeout (timers.js:244:5)
>      at Timer.listOnTimeout (timers.js:214:5)

OMG, this is something we don't want.

## 4. The solution.

The final solution is to wrap the logic inside a Promise.

```javascript
test('Should return a JWT with proper value if nothing wrong happened', () => {
    return new Promise(resolve => {
            issueJWT(request, response, (err) => {
                if (!err) {
                    resolve(response.locals.token);
                }
            });
        })
        .then((result) => {
            const tokenPayload = jwt.decode(result, {complete:true}).payload;

            expect(tokenPayload).toHaveProperty('iat');
            expect(tokenPayload).toHaveProperty('exp');
            expect(tokenPayload).toHaveProperty('id');
            expect(tokenPayload).toHaveProperty('iss');
        });
});
```

This time, when there is an error. You will get a meaningful stack and message.

 >● Test issueJWT › Should return a JWT with proper value if nothing wrong happened
>
>    expect(object).toHaveProperty(path)
>
>    Expected the object:
>      {"exp": 1507424033, "iat": 1497056033, "id": "5935240e5d8761601b691137"}
>
>    To have a nested property:
>      "iat1"
>
>
>      at tests/backend/unit/fblogin/issueJWT.test.js:48:34
>      at tryCatcher (node_modules/bluebird/js/release/util.js:16:23)

## 5. Use async / await to make it clear
The above solution may seems too heavy. But you can use `async / await` to make it a little bit concise.

```javascript
test('Should return a JWT with proper value if nothing wrong happened', async () => {
        const result = await new Promise((resolve) => {
            issueJWT(request, response, (err) => {
                if (!err) { resolve(response.locals.token); }
            });
        });

        const tokenPayload = jwt.decode(result, { complete: true, }).payload;

        expect(tokenPayload).toHaveProperty('iat');
        expect(tokenPayload).toHaveProperty('exp');
        expect(tokenPayload).toHaveProperty('id');
        expect(tokenPayload).toHaveProperty('iss');
    });
``` 

## 6. End of story.
A rule of thumb is, whenever your test pass, try to make it fail then check. :)