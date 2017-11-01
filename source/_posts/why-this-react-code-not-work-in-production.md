---
title: Why this React code not work in production
date: 2017-10-31 23:30:18
tags:
  - react
  - javascript
---

Today I was migrating a personal project to `create-react-app`, then I found my `RadioButton` stops working in production while it works perfectly in development. After I figured out why, I think it worth noticing people why.

<!--more-->

## What's the code

It's about auto-binding, where the `<RadioButtons>` will bind some `props` to its children if the `child` pass the following check.

```javascript
isRegisteredComponent = child => (
    typeof child.type === 'function' &&
    child.type.name.toString() === 'RadioButton'
);
```

It works flawlessly. But after `yarn build`, which `create-react-app` will generate production code, it stops working.

## Why

The reason is simple, after `uglify`, the name of the component get changed from `RadioButton` to `r`, then this check failed to pass, so it stops working.

## How to solve

This is a simple case, consider that the `<RadioButton>` will receive a unique `prop` named `option` before the auto binding happens, I just use that as a flag to do the change. Then everything is fine.

```javascript
isRegisteredComponent = child => (
    child.props.hasOwnProperty('option')
);
```

A takeaway is:

> remember the fact that your code maybe change when build for production, and handle that case as well.

Hope it helps. :)