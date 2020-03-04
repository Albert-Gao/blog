---
title: How to remove the default back button from Android activity
date: 2018-02-23 09:48:52
tags:
  - android
  - kotlin
---

When you add a new activity in Android Studio. It will have a default back button at the upper left corner. How to remove it? I check many things online but they are not working. So, let's remove it by ourselves!

<!--more-->

## 1. Prerequisite

Appcompat has a version which is v7.

```groovy
implementation 'com.android.support:appcompat-v7:26.1.0'
```

## 2. Remove it

Add the following line in the `onCreate` function.

The kotlin version is as the following:

```kotlin
// kotlin
supportActionBar?.setDisplayHomeAsUpEnabled(false)
```

I assume the Jave version should be using `getSupportActionBar()` first to get an instance of `supportActionBar` then trigger that method.

Just this one line, the trick here is when you invoke that `setDisplayHomeAsUpEnabled`, it's from `supportActionBar` rather than `actionBar`.

## 3. End

Here you go. Hope it helps. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
