---
title: How to fix ESLint parsing error for flow in next.js?
date: 2018-02-09 22:15:13
tags:
  - eslint
  - nextjs
  - flowjs
---

`next.js` is really amazing to enable SSR with react. And `flow.js` is great way to type check your code in an easy way. But after following the official example to setup the project. I get the `ESLint` parsing error when it encounters the flow `type` definition. Let's see how to solve it.

<!--more-->

## 1. Install flow

```bash
npm i -D babel-plugin-transform-flow-strip-types flow-bin
```

First, we install `flow` and a babel plugin to strip its type definition from the final code.

## 2. Configurations

Then we create a `.babelrc` in the root folder:

```json
{
  "presets": ["next/babel"],
  "plugins": ["transform-flow-strip-types"]
}
```

And a `.flowconfig` in the root folder:

```ini
[ignore]
.*/node_modules/*
```

## 3. Create flow type definition for your next.js

Create a `next.js.flow` in the `flow-typed` folder:

```javascript
/* @flow */

declare module "next" {
  declare type NextApp = {
    prepare(): Promise<void>,
    getRequestHandler(): any,
    render(req: any, res: any, pathname: string, query: any): any,
    renderToHTML(req: any, res: any, pathname: string, query: string): string,
    renderError(err: Error, req: any, res: any, pathname: any, query: any): any,
    renderErrorToHTML(
      err: Error,
      req: any,
      res: any,
      pathname: string,
      query: any
    ): string
  };
  declare module.exports: (...opts: any) => NextApp;
}

declare module "next/head" {
  declare module.exports: Class<React$Component<any, any>>;
}

declare module "next/link" {
  declare module.exports: Class<
    React$Component<{ href: string, prefetch?: boolean }, any>
  >;
}

declare module "next/error" {
  declare module.exports: Class<React$Component<{ statusCode: number }, any>>;
}

declare module "next/router" {
  declare module.exports: {
    route: string,
    pathname: string,
    query: Object,
    onRouteChangeStart: ?(url: string) => void,
    onRouteChangeComplete: ?(url: string) => void,
    onRouteChangeError: ?(
      err: Error & { cancelled: boolean },
      url: string
    ) => void,
    push(url: string, as: ?string): Promise<boolean>,
    replace(url: string, as: ?string): Promise<boolean>
  };
}

declare module "next/document" {
  declare export var Head: Class<React$Component<any, any>>;
  declare export var Main: Class<React$Component<any, any>>;
  declare export var NextScript: Class<React$Component<any, any>>;
  declare export default Class<React$Component<any, any>> & {
    getInitialProps: (ctx: {
      pathname: string,
      query: any,
      req?: any,
      res?: any,
      jsonPageRes?: any,
      err?: any
    }) => Promise<any>,
    renderPage(cb: Function): void
  };
}
```

You are pretty much done after this. You can start using `flow`. And this is exactly how the official example teach to do and it works. But, ESLint doesn't like it.

## 4. Install ESLint support

I assume you already have `ESLint` installed and setup.

```bash
npm i -D babel-eslint eslint-plugin-flowtype
```

> The trick is don't try to add any babel settings here in .babelrc because next.js settings handles that for you. So, ignore the babel related settings in eslint-plugin-flowtype. But you can still apply its flow rule settings.

## 5. Open your .eslintrc file

Merge the following lines into your existing settings:

```json
{
  "extends": ["plugin:flowtype/recommended"],
  "plugins": ["flowtype"]
}
```

## 6. End

Congratulations! All is well. :) Hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
