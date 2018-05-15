---
title: How to separate platform api from kotlin multi-platform project
date: 2018-03-02 11:24:57
tags:
  - kotlin
  - gradle
---

Previously, we talked about how to [share code across platforms in kotlin world](/2018/02/22/use-kotlin-to-share-native-code-between-ios-and-android/). But as your code base grows, you will encounter a scenario where you might want decouple the code. Things like separating the platform specific implementation to another repo in order to reuse them in a future project. Well, lucky you, this is our topic today.

<!--more-->

## 1. Overall structure

- Project platforms
  - This repo contains the platform implementation. The repo provides you with a universal API across platforms as well as the platform implementation.
  - This is the code base where you need to implement each API twice or thirds depends on how many platforms you want to support.
- Project lib
  - This is the `common` code which you want to share across all platforms without any change. Such that, you can invoke `UserService.findAll()` to retrieve all the users no matter which platform you are working on.
  - This code will rely on `project platforms`. For instance, an API like `UserService.findAll()`, it needs to do an HTTP call where the actual implementation of sending an HTTP request is different across platforms. While using `project platforms`, this `project lib` can purely focus on the core business logic.
- Project app
  - This is could be a native app which will call `project lib` for preparing all the data, while it only needs to focus on the UI and UX. Or maybe some native platform-specific feature.

This is a reasonable approach, at least to me. Where every `project` could focus on their own business.

## 2. Setup the project platforms

This is the easiest one. Because it's just a typical kotlin multi-platform project setup. You can read the [official document](https://kotlinlang.org/docs/reference/multiplatform.html) for more detail. And you see [my blog](/2018/02/22/use-kotlin-to-share-native-code-between-ios-and-android/) if you want to do code sharing between iOS and Android.

It should contain the platform implementation and the related tests.

The folder structure is straightforward:

- common: for `common` code which contains all the `expect class`.
- platforms:
  - jvm: contains `actual class` implementation for a jvm
  - js: contains `actual class` implementation for a js
  - ...

## 3. Setup the project lib

The folder structure is like:

- common: business logic that we want to share across platforms
- bundle
  - jvm: Where we actually test and build the `common` for the `jvm` platform.
  - js: Where we actually test and build the `common` for the `js` platform.
  - ...

This is one is a little bit tricky because we want to make it `common`. To things needs to take care here are:

1. We need to add the `common` part from `project platforms` as dependencies.
2. We want to test this `common` business logic.
3. When we compile, we need to combine the platform implementations from `project platforms` along with the `common` to yield a platform-specific package.

First, let's solve them one by one:

1. Add `common` part as dependencies, I tried many ways, including adding the generated `jar` file or `sources-jar` file. Always something wrong here, either the auto-completion stops works, or the internal member can't be recognized while the namespace could be recognized. Only 2 ways work:
  - Just embed the source code from `project platforms :common` in you `sourceSets`: `main.kotlin.srcDirs += "$kotlin_idiom_path/interfaces/main"`
  - Add that common module as a subproject and add it to the dependencies.
  - I prefer the 1st one because now your gradle settings won't contain any noises. It will benefit the side-panel of gradle in IDEA as well.

2. In terms of the test, you just write the tests in this `common` folder. But you can't run the tests, you need to run them against the certain platform, otherwise, they are `common` code, which platform for them to run?

3. This is where the `bundle` coming into play. For building and testing. Let's take `jvm` for example.
  - First of all, you don't need to add any code here, this folder, as its name indicates, just for bundling code together. So, under in `:bundle:jvm` subproject, it only contains a `build.gradle` file.
  - You need to use `kotlin-platform-jvm` to compile this module
  - In the `sourceSets` setting: you need to add the source code from all the 3 places, both `common` modules from `project platforms` and this `project lib`, the source code of platform implementation from `project platforms`.
  - You need to add the tests only from `common` module of `project lib`, such that you can run the tests. And it won't run the tests from `project platforms`, because they will be taken care there. You don't need to worry about that. Now run the `gradle :bundle:jvm test` will run the tests.
  - Why I add the source code rather than use the `jar` file? Well, hard lessons learned, this is the only way currently.

## 4. The end

Now run the `:bundle:jvm build`, it will build a lib to that platform. Try to consume it, it works really well. :) If you want to know how to make `:bundle:ios`, `:bundle:js`, just see [my blog](/2018/02/22/use-kotlin-to-share-native-code-between-ios-and-android/).
