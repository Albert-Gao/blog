---
title: The evil pattern of Redux that reduces boilerplate
date: 2020-09-22 21:06:43
tags:
  - redux
  - react
  - typescript
---

With the `createSlice` of redux toolkit, the actions could generated when writing reducer, which nearly eliminate all boilerplate from Redux to a MobX level.

But still, can we do better? Let me show you the dark side of a Redux usage that you may like or not like. But it will make your Redux life easier in the future. And I will show you how to use Typescript to make it even better.

<!--more-->

## 1. The category of actions

How many kinds of state are there in a SPA? Global and local? Nah, we are going to talk about the state in Redux, which, are all global state. The `redux actions`, which used to update the state. When you want to update the state, you need to write actions.

```javascript
const initialAuthState = {
  isAuth: false,
  needOnBoarding: false,
  user: {
    name: "",
    age: 18,
    language: "en-US",
  },
};
```

The numbers of actions depends on your business logic, you could write a `UPDATE_IS_AUTH`, to update that `isAuth`, a `UPDATE_NEED_ON_BOARDING` to update that `needOnBoarding`, write a `LOGIN` to change both `isAuth` and `user`.

There will be numerous of possibilities depends on the shape of the state.

How many kinds of actions are there?

Only one? Just update the state? **To my experiences, there are 2 types of actions.**

1. The actions that has an special purpose like `LOGIN`
1. The actions that just updates state with payload from actions like `UPDATE_IS_AUTH`.

It has nothing to do with the numbers of properties the action are updating, but the `purpose`.

> Sometimes, the reducer to handle the second type will likely to have some logic that is more than just apply values from action directly to the redux state.

The reason we are inspecting of this, is we can do better in terms of how to write actions.

## 2. The 1st one: update with a special purpose

You write your actions, give it an name, like `UPDATE_IS_AUTH`:

```javascript
const TYPE = "UPDATE_IS_AUTH";

const updateIsAuth = (isAuth: boolean) => ({
  type: "UPDATE_IS_AUTH",
  payload: isAuth,
});
```

Feel free to use tools to make this boilerplate free, I just show the idea here.

There is no workaround here, you need to give it a sepcial name which is different than the others to make it stand out, so when debug, we know that the purpose of this action.

## The 2nd type: just update state

This is where things get interesting. Sometimes, we just wanted to update arbitrary numbers of properties of the state.

The good news is **`We only need ONE actions`**.

```javascript
const TYPE = "UPDATE_AUTH_STATE";

const updateAuthState = (newState: Partial<typeof initialAuthState>) => ({
  type: "UPDATE_AUTH_STATE",
  payload: newState,
});
```

We are writing Typescript, `Partial<typeof initialAuthState>` means we allow the user to pass any part of the auth state, be it `{isAuth:true, user:{name:'albert'}}` or `{needOnBoard:true, isAuth:true}`.

So no matter what you wanna do, as long as you want to update the redux state, you just need to use this action, and no matter how many properties you will add to your state, the code stays intact.

In another word, if you have this kind of action, you are done, you can do anything to your state.

How could that be the case?

This is the reducer to that action

```javascript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setState: (state, action) => {
      updateDeepNestedState(state, action.payload);
    },
  },
});
```

I am using the `createSlice` from `@reduxjs/toolkit`, so the action is derived, I do not need to write that `updateAuthState()` action creator, later, I can just `dispatch` `authSlice.actions.setState()` to update any part of the Redux state.

Even in the future I add something else, I do not need to change anything, I just `dispatch` `authSlice.actions.setState()`, everything gonna be OK.

The updateDeepNestedState function will handle updating a nested object for us. You can change it depends on your use case.

```javascript
function updateDeepNestedState(state: any, payload: any) {
  Object.keys(payload).forEach((key) => {
    if (typeof payload[key] === "object" && !Array.isArray(payload[key])) {
      updateDeepNestedState(state[key], payload[key]);
    } else {
      state[key] = payload[key];
    }
  });
}
```

> I am directly mutate the state here as redux toolkit is using immer underneath, if you are working on a legacy code base, where you need to write everything by yourselves, you have to change the implementation to make it immutable.

The logic is quite simple, I just iterate over the `action.payload`, and update the Redux counterpart with the payload.

## 3. The benefits of this evil pattern

1. Obviously, very less boilerplate, I've done this to `MobX` as well, which requires you to write an `@action` to update the state, similar implementation. But seems Mobx v6 can auto decorate your class methdos to `@action`. But What about Redux, well, this pattern will make you feel very comfortable.

2. Universal `post reducer logic`, for example, in my codebase, I disallow the user to update `isAuth` and `needOnBoarding` from this generic `setState` action (we will talk about that later), these 2 properties are derived from the state. But if we are writing lots of actions to handle different parts of updating, how could share the logic? Well, only one way, extract to a function, and invoke it in multiple reducers. But if you have this centralized place to update your state, you can just apply the logic here.

## 4. Typescript to its best

The Typescript will make your life even easier here, in terms of auto completion and cherry pick redux state to update.

### **If you want to let the user update any part of the reducer**

```javascript
const TYPE = "UPDATE_AUTH_STATE";

const updateAuthState = (newState: Partial<typeof initialAuthState>) => ({
  type: "UPDATE_AUTH_STATE",
  payload: newState,
});
```

### **If you want to prevent the user to update certain properties**

```javascript
const TYPE = "UPDATE_AUTH_STATE";

type AuthState = typeof initialAuthState;

const updateAuthState = (
  newState: Partial<Omit<AuthState, "isAuth" | "needOnBoarding">>
) => ({
  type: "UPDATE_AUTH_STATE",
  payload: newState,
});
```

Here, the user can not update `isAuth` and `needOnBoarding` from this action, as it is `omitted` from the type declaration.

## 5. Why repeat the word `evil`

This idea is an answer to a recent rant I heard from people,

> `I want to share state A,B,C and D, just update, but I do not want to touch Redux consider such simple requirements will result in many actions types, action creators, reducers, just thinking about them gives me headache.`

Then I showed them how to finish this kind of requirement within minutes and future proof.

But why `evil`? Well, imagine a world where you just see loads of `UPDATE_AUTH_STATE`, `UPDATE_USER_STATE`, what's the intention? It will make reasoning pretty hard, but I know there are big code base which has lots of reducers without any logic, just updating different part of the states directly from actions, it might benefit from this pattern.

## 6. How to determine the 1st type of actions: Actions with a special purpose

1. The reducer has some computation logic that is more than basic data structure operation.
1. The reducer has directly update the state from action, but with a flow, `STEP_1_ONBOARD`, `STEP_2_UPDATE`, `STEP_3_JOIN_ORGANIZATION`
1. The reducer has directly update the state from action, but with a fixed set of properties with a strong purpose, for example, `LOGIN`, `LOGOUT`.

## 7. End

That's all, hope you like it.
