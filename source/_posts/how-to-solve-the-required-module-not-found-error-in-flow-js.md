---
title: How to solve the required module not found error in flow.js
date: 2018-02-09 23:23:05
tags:
  - flowjs
---

I love typescript. But after I gave flow a try, it really makes things easier in terms of `react` related thing. It could handle the redux immutable check and easy to start. But one problem is that sometimes you just can't find type definition for the 3rd party libs as oppose to typescript, which is already widely adopted nowadays. So, how to solve it?

<!--more-->

The solution is still the same, you simply create a definition for that module, and let it return `any`.

Suppose that we are using `semantic-ui-react` like this:

```javascript
import {Search} from 'semantic-ui-react';
```

Run `npm run flow` will give you an error as: `semantic-ui-react. Required module not found`

## 1. Create a type definition folder for flow

Create a folder named `flow-typed` at the root of the project.

## 2. Create the definition file

Create a file which has the same name as the module, in the case: `semantic-ui-react.js.flow`

## 3. Create type definition

Put the following content in it:

```javascript
declare module 'semantic-ui-react' {
  declare module.exports: any;
}
```

Now `flow` again, you should be fine.

## 4. Fix the ESLint problem

If you use `eslint-plugin-flowtype`, you will get an error like `don't use any` like when you are in the strict mode of `TypeScript`. Simply disable ESLint check for the folder via creating a `.eslintignore` file in the root of that project and add `flow-typed/` to it.

## End

Now you are good to go. :)