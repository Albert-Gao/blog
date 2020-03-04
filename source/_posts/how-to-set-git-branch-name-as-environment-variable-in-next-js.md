---
title: How to set Git branch name as environment variable in next.js
date: 2020-02-17 20:02:19
tags:
  - nextjs
  - git
---

It has something to do with the `next.config.js`.

<!--more-->

## 1. Install package

`npm i current-git-branch --save-dev`

## 2. Add the following code to your `next.config.js`

```javascript
const currentGitBranchName = require("current-git-branch");

module.exports = {
  env: {
    GIT_BRANCH: currentGitBranchName()
  }
};
```

## 3. Then print it in your code

```javascript
console.log(process.env.GIT_BRANCH);
```

It works for both client side and server side, because it happens at build time and the environment variable has been injected into the code.

## 4. End

Hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
