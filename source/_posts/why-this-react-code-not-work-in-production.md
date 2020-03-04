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
isRegisteredComponent = child =>
  typeof child.type === "function" &&
  child.type.name.toString() === "RadioButton";
```

It works flawlessly. But after `yarn build`, which `create-react-app` will generate production code, it stops working.

## Why

The reason is simple, after `uglify`, the name of the component get changed from `RadioButton` to `r`, then this check failed to pass, so it stops working.

## How to solve

### Add a displayName property to `RadioButton`

```javascript
RadioButton.displayName = "RadioButton";
```

### Then the check will be

```javascript
isRegisteredComponent = child => child.type.displayName === "RadioButton";
```

So now you are rely on something stable and won't get uglified. Even better, reply on this is much better than rely on a `prop name`. And you should set the `displayName` for a `HOC` too to make it clear.

A takeaway is:

> remember the fact that your code maybe change when build for production, and handle that case as well.

Hope it helps. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
