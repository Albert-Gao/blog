---
title: Use Kotlin to share native code between iOS and Android
date: 2018-02-22 11:17:07
tags:
  - kotlin-native
---

Kotlin native is a very promising project where you can use kotlin to write code which can then be shared between iOS and Android. Let's see in action how to set up a project for sharing native code. And we will use the `kotlin multi-platform` approach to make things even cleaner.

<!--more-->

## 1. Goal

1. We want to use XCode and Android Studio to edit the native while using another IDE to edit the sharing code part. 
    - I saw some other setup. They use root folder as a gradle project which will affect the Android project structure been displayed in the android studio where it adds some noise there.

2. We want to share more code between iOS and Android.
    - The main hurdle is the platform-specific API. But we can make them as `interface` and still shared the logic around them.

3. We want to have a clean structure where everything related should reside together.
    - I mean for the gradle phase as well. Such that, `android` folder is only for Android, `ios` folder is only for iOS. The root folder is for all projects.

4. We want to test the Kotlin native code as well.
    - It's native project so anything native can be tested via the strategy on that platform. But what about kotlin native, what about the `common` code? What about the platform specific code for `android` and `ios`? Yes, we have that part covered as well here in the example.

## 2. Folder structure

- iOS: XCode project
- Android: Android Studio project
- Shared:
  - common: Common code that is about to share.
  - ios
  - android

Very easy to understand. One interesting thing here is in the `Shared` folder, besides the `common` folder. What's the `android` and `ios` folder for? Well, they are for platform-specific API. 

### 2.1 Background knowledge for Kotlin multi-platform project

Let's say you want to have an `HTTP` kotlin class where you can do the normal `GET`, `POST` thing, but the `HTTP` implementation is different across platforms. If you use the old school `interface` way, you need to declare an `IHTTP` interface, then implement it twice in android and ios. Then inject it at runtime to make it work.

But you can via using the Kotlin multi-platform project, you don't need to inject, the compiler will only pick up the piece of codes depends on the building target. If you build for Android, it will only grab the Android implementation.

It currently works for `jvm`, `js` and `kotlin native`, oh, that's a nearly-all-platform code sharing tech right? :D

And it's very simple.

You need to `expect` an implementation of your `common` code.

```kotlin
expect class Platform {
  fun get():String
}
```

Then implement the actual code in somewhere else, like `android`.

```kotlin
actual class Platform {
  actual fun get():String {
    return "android"
  }
}
```

Or in `ios`:

```kotlin
actual class Platform {
  actual fun get():String {
    return "ios"
  }
}
```

Then with some proper setup in gradle, it will work flawlessly.

## 2.2 How to code the `common-ios`

Oh well, you may think that old school `interface` may better in terms of iOS because you need to implement the iOS API specific thing in swift or obj-c then pass it back to kotlin native. But that is not true. Because there is a 1-to-1 API match in kotlin native such that you can implement the iOS specific API in kotlin as well. And it has the same signature which means you can reuse all the existing knowledge. And kotlin and swift are very similar.

## 3. The example

All the code can be found on my GitHub repo.

[https://github.com/Albert-Gao/kotlin-native-mobile-multiplatform-example](https://github.com/Albert-Gao/kotlin-native-mobile-multiplatform-example)

Hope it helps. Thanks.
