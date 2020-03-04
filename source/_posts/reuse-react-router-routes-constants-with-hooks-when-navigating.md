---
title: Reuse React router routes constants with hooks when navigating
date: 2019-09-07 15:29:45
tags:
  - react
  - react-router
  - react-hooks
  - typescript
---

When use React router, sometimes we need to define the route path as constants like `const USER = /user/:userId`, and the render the `<Route path={USER} />` later. However, when we try to navigate, for example `history.push()`, we have a problem which we need to replace that `:userId` with real user id. And when we do it every time we calling `history.push`, it won't be any prettier. This is how I solved it with several lines of code.

<!--more-->

## 1. Setup

```typescript
// we have routes constants like this
const ROUTES = {
  USER: '/user/:userId'
} as const

// our routes is like this
<Router>
 <Route
  exact
  path={ROUTES.USER}
  component={User}
 />
</Router>
```

The question is, how to navigate within components.

```typescript
<Button
  onClick={() => {
    // how to go to the ROUTES.USER
  }}
/>
```

## 2. Discuss

There are 2 main ways to solve it. One is centralize all the navigating function in one place, which enables you to encapsulate the detail.

But it feels too much, at least to me, some routes are barely used through the whole application, or just been used once, and centralize them seems weird to me.

So my solution is something like this:

```typescript
<Button
  onClick={() => {
    // ROUTES.USER === '/user/:userId'
    go.push(ROUTES.USER, { userId });
  }}
/>
```

It is as clean as this, we want to go to `ROUTES.USER`, and the path parameter is `{ userId }`, it can take multiple parameters. How cool is this!

If you know react router, you will argue that we are having an argument conflicting here. As the 2nd parameter of `history.push` is been used as passing `state`.

TBH, never a big fan of this `state` and never use it in real projects, it is like the passing state between pages when navgating in native mobile development. But the problem here is it is saved in the memory. So when user refresh the page, you lose it... And obviously you need to handle it in the code... And I think:

> `refreshing the page` is the one of the major ways of using the internet.

And here we change the parent reference from `history.push` to `go.push`, to indicate it is different.

### 3. Simple implementation

the major logic is here:

```typescript
import * as H from "history";

interface PlainObject {
  [key: string]: any;
}

const replacePathParams = (path: H.Path, pathParams?: PlainObject) => {
  let pathToGo = path;

  if (pathParams) {
    Object.keys(pathParams).forEach(param => {
      pathToGo = pathToGo.replace(`:${param}`, pathParams[param]);
    });
  }

  return pathToGo;
};
```

We just iterate over the pathParams and replace each `key`.

### 4. The hook

First, we create the React router 5 hook:

```typescript
import {
  __RouterContext as RouterContext,
  RouteComponentProps
} from "react-router";

export const useRouter = <T>(): RouteComponentProps<T> =>
  useContext(RouterContext) as RouteComponentProps<T>;
```

This hook will give you everything you want, `match`, `location`, `history`.

You can wrap the `replacePathParams` inside the function body.

But I have one more thing: `useGo`

```typescript
export const go = (history: H.History) => ({
  replace: (path: H.Path) => {
    history.replace(path);
  },
  push: (path: H.Path, pathParams?: PlainObject) => {
    history.push(replacePathParams(path, pathParams));
  }
});

export const useGo = () => {
  const { history } = useRouter();
  const result = useMemo(() => ({ go: go(history) }), [history]);
  return result;
};
```

### 5. How to use it

```typescript
const NavigationButton: React.FC<{ userId: string }> = ({ userId }) => {
  const { go } = useGo();

  return (
    <button
      onClick={() => {
        go.push(ROUTES.USER, { userId });
      }}
    >
      Go To User Page
    </button>
  );
};
```

### 6. End

Hope it helps. If you think you have a better way, drop a comment to let me know. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
