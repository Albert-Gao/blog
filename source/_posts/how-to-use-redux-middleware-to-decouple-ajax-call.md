---
title: How to use Redux middleware to decouple ajax call?
date: 2017-12-07 22:15:40
tags:
  - redux
  - javascript
---

Redux is a great tool to manage your app state. But when you deal with the side effect like ajax call. The code will start to look like not that pure. In fact, we can make things right again using pure redux without any other libs. Your action could still be pure object. No more no less. Let's check how to do that.

<!--more-->

## What's wrong with `redux-thunk`

The code starts to look ugly when you add the side-effect like ajax call to the code. `Redux-thunk` works, and sometimes, the code really not that bad.

```javascript
export const actions = {
  LoadListRequested: () => ({
    type: actionTypes.LOADING_SWAPLIST_REQUESTED,
    status: LIST_STATUS.loading
  }),

  LoadListSuccessfully: swaps => ({
    type: actionTypes.LOADING_SWAPLIST_SUCCESSFULLY,
    status: LIST_STATUS.success,
    swaps: underscoreIDtoID(swaps.data)
  }),

  LoadListFailed: error => ({
    type: actionTypes.LOADING_SWAPLIST_FAILED,
    status: LIST_STATUS.failed,
    error
  }),

  LoadList: () => async dispatch => {
    dispatch(actions.LoadListRequested());
    try {
      const swaps = await swapService.find();
      dispatch(actions.LoadListSuccessfully(swaps));
    } catch (error) {
      dispatch(actions.LoadListFailed(error));
    }
  }
};
```

But compare to action creators which just yield pure javascript objects, adding ajax logic into the action creator just not feel right. And one solution is to add another layer to decouple the logic to another part of code. Like what `Redux-saga` does.

## Why not just Redux-saga

I know `redux-saga` and love to use it. But I have something to say.

1. The adding-another-layer nature of `redux-saga` indeed makes the code clean. But sometimes it makes things annoying as well. The most annoying part of `redux` is sometimes you need to open several files in order to make some changes. By using `redux-saga`, because some actions are taken over in the `saga` layer. You need to open one more file to complete the flow. Which will be overkill for some requirements like a simple ajax call.

2. `async` and `await` are production ready now for front-end. It actually makes `redux-saga` not that appealing if you don't have that complex logic.

> Highly recommend [ducks-modular-redux](https://github.com/erikras/ducks-modular-redux). It will make your folder not look that messy. I use this pattern before I know this concept, but this concept is just more complete.

## What about we can still send the pure javascript object

```javascript
LoadList: () => ({
    serviceName: 'swap',
    method: 'find',
    onLoad: actions.LoadListRequested,
    onSuccess: actions.LoadListSuccessfully,
    onFailure: actions.LoadListFailed
  })
```

It's a plain object to represent the things we wanna do. Quite readable. I want to call `swap service` with the `find` method. (Don't bother, it's just another way to say `send HTTP GET to /swap` in feathers.js). When `load`, `request success` or `request failure`, dispatch different actions. Very clean, and the `LoadList` is just like the others, `LoadListRequested`, `LoadListSuccessfully`, it yields pure object.

And you can make it more clean, like store all the `action types` in an array, and let the `redux middleware` handle this part, because most of the time, they follow the same pattern: A simple `onLoad` signal, `success` with data or `failure` with error object.

## What is a redux middleware?

The official definition:

> It provides a third-party extension point between dispatching an action, and the moment it reaches the reducer.

Aha, what a perfect place to handle the side effect like ajax call.

The flow is very simple:

1. You dispatch an plain action object with some unique property name, like the `serviceName` above.
1. Your middleware will know this is the action to process by filtering that unique property name. And it will then handle this action and dispatch another normal action with the result data.
1. Now the normal action will hit the `reducer`, and then `store`, `container`, `stateless` as usual.

## Write a middleware step by step

Although your business logic could be different, but the pattern of a middleware could be the same.

### 1. Write the middleware. Maybe you want to separate this in a single file?

```javascript
const ServiceMiddleware = store => next => async action => {

};
```

This is the signature of the middleware:

- `action` is the `action` you will receive.
- `next` is the next redux middleware.
- `store` is the store object, includes all the methods you need from store.

### 2. Let's filter the action.

```javascript
if (!action.serviceName) {
  next(action);
  return;
}
```

Simple, if the `action` is not our type, we just pass it to the `next` middleware and return.

### 3. Handle the ajax logic.

```javascript
const {
  serviceName,
  method,
  onLoad,
  onSuccess,
  onFailure
} = action;
const { dispatch } = store;
const service = FeathersClient.service(serviceName);

dispatch(onLoad);

try {
  let result;
  result = await service[method]();
  dispatch(onSuccess(result.data))
} catch (err) {
  dispatch(onFailure(err));
}
```

Still simple, we grab the `dispatch` method from `store`. Then we just do the normal ajax call. You can add more logic here but the concept is very simple.

I am using `feathers.js` here. But you can use `fetch` or `axios` to accomplish the same, grab the endpoint and http method from the action, then send the network request accordingly.

the result looks like this:

```javascript
const ServiceMiddleware = store => next => async action => {
  if (!action.serviceName) {
    next(action);
    return;
  }

  const {
    serviceName,
    method,
    onLoad,
    onSuccess,
    onFailure
  } = action;
  const { dispatch } = store;
  const service = FeathersClient.service(serviceName);

  dispatch(onLoad);

  try {
    let result;
    result = await service[method]();
    dispatch(onSuccess(result.data))
  } catch (err) {
    dispatch(onFailure(err));
  }
};
```

### 4. Apply your middleware.

```javascript
import { applyMiddleware, createStore } from 'redux';
import ServiceMiddleware from '../middlewares/ServiceMiddleware';

const store = createStore(
    reducers,
    applyMiddleware(ServiceMiddleware)
  );
```

### 5. That's all!

Hope it helps. :)
