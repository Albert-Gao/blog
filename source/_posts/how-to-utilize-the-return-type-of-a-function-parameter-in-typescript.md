---
title: How to utilize the return type of a function parameter in TypeScript
date: 2020-06-08 15:12:54
tags:
  - typescript
---

Recent in my side-project. I've got an interesting requirement. I've a React Hook function `useRxQuery(queryFunc)` for getting data from `RxDB`. It takes a simple query function `queryFunc` as the argument takes an `RxDB` instance, and returns with data. Inside the hook, it does the preparation, executes that query function `queryFunc`, and returns the `data: T`.

So, how to auto-type the `ReturnType<>` of the hook function `useRxQuery`, such that whatever return from that query function `queryFunc` should be taken as the return type of the function `useRxQuery` automatically.

Let's solve it with the `infer` keyword in Typescript, and you can make your code much more robust in the future.

<!--more-->

## 1. Could you show me the question in code?

```typescript
function useRxQuery(queryFunc) {
  // remove logic for brevity
  // you just need to know `data` is from queryFunc()
  return data;
}
```

1st thing 1st, you might wonder why we need it, for example, the code below should just work:

```typescript
type Func = (a: number) => number;

const func: Func = (a) => a;

const wrapper = (func: Func) => func(1);
```

Hover your mouse over the `wrapper` in VS Code, you will see it gets the correct type inferred `const wrapper: (func: Func) => number`.

So why the trouble?

> It is because sometimes, like the logic in `useRxQuery`, it has lots of logic here, which lose the type information along the way. And in the end , when you return the `data`, the compiler can not form a direct relationship between the `data` and `queryFunc`. Thus, you lost the auto-infer from the Typescript compiler.

## 2. Easiest way

At the very last line, you do this `data as ReturnType<typeof queryFunc>`.

`ReturnType<>` is a built-in keyword in Typescript to extract the return type of a function, so basically means you cast the return type to the type you want. It can still catch lots of errors.

## 3. But life is never that easy

In my case, queryFunc is a type like this:

```typescript
type QueryFunc<DataType> = (rxDb: DBType) => RxQuery<any, DataType>;
```

And even worse, that generic `DataType` is being inferred from `RxQuery<>` and not typed by the programmer. Which means, you can use it like this:

```typescript
const data = useRxQuery((db) => db.users.findOne());
```

For the usage of `db.users.findOne()`, it is so good, you can all the types for free. But for this `useRxQuery`, how could we link the type of `data` from the `db.users.findOne()`, we do not even know how to get the `DataType` since it is implicitly inferred.

And the `as` keyword is not helping here, because it is embedded in the `QueryFunc<>` type.

## 4. The `infer` keyword comes to the rescue

Let's revisit the problem.

We have a function:

```typescript
type QueryFunc<DataType> = (rxDb: DBType) => RxQuery<any, DataType>;
```

And another wrapper function that takes the above function and returns whatever it returns.

```typescript
function useRxQuery(queryFunc: QueryFunc) {
  // logic
}
```

How to link the return type of the `useRxQuery` to have the same type as the return type of its parameter `queryFunc`? Which is `DataType` in our example.

So, more specifically, how to extract the generic type information from the `QueryFunc` type?

The answer is:

```Typescript
function useRxQuery<ReturnValueType>(
    queryFunc: QueryFunc<ReturnValueType>
): ReturnType<typeof queryFunc> extends RxQuery<any infer Return>
    ? Return
    : never
```

Wow, lots of going here.

Let's solve it step by step,

1. We need to create a middle layer type `ReturnValueType` to let the compiler aware that we have a generic type there for the parameter `queryFunc`. Even though we do not use it.
1. Next, we are trying to get the type `ReturnType<typeof queryFunc>`
1. We then check if it matches the type information of `QueryFunc` by checking if it can be `extends RxQuery<any infer Return>`.
   - Look at the `infer` here, it is a side-effect of this checking.
   - `infer Return`, means `infer` the 2nd generic type in that `RxQuery<any, DataType>`, which is `DataType`.
1. In the end, the `ternary operator` means if the `ReturnType<typeof queryFunc>` is `RxQuery<any infer Return>` then we return the type `Return`, otherwise we return nothing.

## 5. End

Now we you mouse over the `data` from the below example:

```typescript
const data = useRxQuery((db) => db.users.findOne());
```

No matter how you change that query, the type of `data` will always be matched.

I hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
