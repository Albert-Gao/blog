---
title: How to solve the required module not found error in flow.js
date: 2018-02-09 23:23:05
tags:
  - flowjs
---

I love typescript. But after I gave flow a try, it really makes things easier in terms of `react` related thing. It could handle the redux immutable check and easy to start. But one problem is that sometimes you just can't find type definition for the 3rd party libs as oppose to typescript, which is already widely adopted nowadays. So, how to solve it?

<!--more-->

The solution is still the same, you simply create a definition for that module, and let it return `any`.

Suppose that we are using `no-where-to-find` like this:

```javascript
import {Search} from 'no-where-to-find';
```

Run `npm run flow` will give you an error as: `no-where-to-find. Required module not found`

## 1. Without installing any lib:

### 1.1 Create a type definition folder for flow

Create a folder named `flow-typed` at the root of the project.

### 1.2 Create the definition file

Create a file which has the same name as the module, in the case: `no-where-to-find.js.flow`

### 1.3 Create type definition

Put the following content in it:

The fastest way:

```javascript
declare module 'no-where-to-find' {
  declare module.exports: any;
}
```

Or you can declare the type by yourself if you know the signature.

```javascript
declare class URL {
  constructor(urlStr: string): URL;
  toString(): string;

  static compare(url1: URL, url2: URL): boolean;
};
```

You are good to go.

## 2. Automation via flow-typed

### 2.1 Install flow-typed

```bash
npm install -g flow-typed
```

### 2.2 Install the according type definition

Install type definition for packages in `packages.json` which could be found. And in fact, if it can't find the definition, it will generate the mock typed definition like the one we did in part one.

```bash
# Install all the definition only for dependencies
flow-typed install --ignoreDeps dev bundle peer
```

Or you can install for a specific package.
```bash
flow-typed install axios@0.11.x
```

You can update it as well

```bash
# Update all
flow-typed update

# Update the very one
flow-typed update underscore
```

### 2.3 Automatically create the stub

```bash
flow-typed create-stub foo
```

It will generate the mock type definition for the module `foo` in the `/flow-typed/npm` in order to prevent the `required module not found` error.

Now `flow` again, you should be fine.

## 3. Fix the ESLint problem

If you use `eslint-plugin-flowtype`, you will get an error like `don't use any` like when you are in the strict mode of `TypeScript`. Simply disable ESLint check for the folder via creating a `.eslintignore` file in the root of that project and add `flow-typed/` to it.

## End

Now you are good to go. :)