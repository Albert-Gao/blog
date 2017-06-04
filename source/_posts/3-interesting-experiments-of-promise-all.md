---
title: 3 interesting experiments of Promise.all()
date: 2017-06-04 19:00:20
tags:
  - javascript
  - promise
---

We use `Promise.all()` in javascript when we want to do something after resolving a promise queue. Let's use 3 examples to see the use cases. I use `node v6.10.2` to do the DEMO.

<!--more-->

## 0. Preparation
Of course, we can use `Promise` to achieve the same goal with less coding. But I think the HTTP example will make more sense. And very easy too.

First thing first, a server with 2 API. Just return a value with an HTTP status code.

``` javascript
router.get('/test1/', (req, res) => {
    res.status(200).json({
        ok: 'test1',
    });
});

router.get('/test2/', (req, res) => {
    res.status(200).json({
        ok: 'test2',
    });
});
```

We have 2 functions which will access the above 2 API and both return a `promise`.

```javascript
const a1 = () => {
    return axios.get('http://localhost:5678/test1/')
        .then((r) => {
            return r.data.ok;
        })
        .catch((e)=>{
            return 'a1-error';
        });
};


const a2 = () => {
    return axios.get('http://localhost:5678/test2/')
        .then((r) => {
            return r.data.ok;
        })
        .catch((e)=>{
            return 'a2-error';
        });
};
```

The `Promise.all()` logic is simple:

```javascript
const all = () => {
    const queue = [a1(), a2()];
    return promise.all(queue).then((v) => {
        console.log('all', v);
    }).catch((e) => {
        console.error('all-error', e.response.data);
    });
};
```

## 1. 1st experiment
This is a very normal case, we just execute `all()`. 

### 1.1 Result
```bash
all [ 'test1', 'test2' ]
```
The values received by `promise.all` is an array. Which is a value resolved from the promise queue.

### 1.2 Execution order
This part will assume I put some breakpoints at each of above functions to indicate the order of execution.

`a1.then` -> `a2.then` -> `promise.all.then`

## 2. 2nd experiment
We change HTTP status code of API2 `/test2/` to `400`. And do the same thing again.

### 2.1 Result
```bash
all [ 'test1', 'a2-error' ]
```

### 2.2 Execution order

`a1.then` -> `a2.catch` -> `promise.all.then`

>Which means, even it hits the `.catch` branch in one of your `promise`, as long as you return a value, it will trigger the `promise.all.then`.

### 2.3 A variation

So based on the above knowledge, if you use the change the `.catch` part of `a2` from `return 'a2-error'` to `throw e`.

The execution order will be:

`a1.then` -> `a2.catch` -> `promise.all.catch`

Because there is an exception now.

## 3. 3rd experiment
Now we change to a new interesting setup:

1. HTTP status: API1: `200`, API2: `400`
2. We remove the `.catch` branch of `a1` and `a2`.

This time, when we trigger the `all()`, what will happen?

### 3.1 Result:

```bash
all-error { ok: 'test2' }
```

### 3.2 Execution order:

`a1.then` -> `promise.all.catch`

>It's simple, since `a2` has no `.catch` function which means, whatever exception happens there, `promise.all` will trigger its `.catch` branch since one of the promise is 'failed'.

### 3.3 Variation:
OK, so, `promise.all.then` will get an array of all the value resolved by the promise queue. What about the errors?

Let's change the environment to this:

1. HTTP status: API1: `400`, API2: `400`
2. Everything else is the same.

#### 3.3.1 Result:

```javascript
all-error { ok: 'test1' }
```

Wow, `promise.all` only takes the first error it gets and return.

## 4. End.
Interesting? :)