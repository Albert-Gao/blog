---
title: Use Kotlin to share native code among iOS, Android
date: 2018-02-22 11:17:07
tags:
  - kotlin-native
  - kotlin
---

When you try to deal with the across platform codes. You need to solve 2 things, one is the architecture of how to share the code, another one is how you share. Well, different languages might have different techniques. But in Kotlin, you can use multiplatform projects to share the code. And via kotlin native, you can even expand the support to iOS and Android, I mean, natively.

An example of supporting code sharing among iOS, Android, JVM and JS is added in this [repo](https://github.com/Albert-Gao/kotlin-multuplatform-including-mobile).

<!--more-->

## 1. Goal

- We want to use XCode and Android Studio to edit the native app while using another IDE to edit the sharing code part. (But you can use Android studio for editing the KN code as well because they use the same language and the setup will be ready.)
    - I saw some setups. They use root folder as a whole gradle project which will affect the Android project structure been displayed in the android studio because it will add some noise there.

- We want to share more code between iOS and Android.
    - The main hurdle is the platform-specific API. We can make them as `interface` and still shared the logic around them. But here we will use `kotlin multi-platform` approach to make the code more elegant.
    - Think of an API like this `UserService.getAllorNull()`, then your native side just need to bind the result to the UI. Even though the `HTTP` call is different across platform. But all the exception handling and data processing around the http call are the same and could be shared.

- We want to have a clean structure where everything related should reside together.
    - I mean for the gradle phase as well. Such that, `android` folder is only for Android, `ios` folder is only for iOS. The root folder is for all projects. And the gradle settings for `KN-android` should be in the `android` folder as well as the `iOS` side.

- We want to test the Kotlin native code as well.
    - It's native project so anything native can be tested via the strategy on that platform. But what about kotlin native part, what about the `common` code? What about the kotlin native platform specific code for `android` and `ios`? Yes, we have that part covered as well here in the example.

### 1.1 What about I don't need to care about the platform specific implementation

If all you need is the `kotlin-stdlib`, and no platform specific code to write. Then you don't need to use this setup. You can simply remove the `android` and `ios` folders from the `Shared`. And let the `common` just outputs an iOS framework for the XCode project to consume. For Android, embed the source code in Android studio to make it as dependency then it's fine.

## 2. Folder structure

- ios: XCode project
- android: Android Studio project
- common: Common code that is about to share across platforms without any change.
- platforms:
  - ios: platform specific API for iOS
  - android: platform specific API for Android

Very easy to understand. One interesting thing here is in the `common` folder, besides the `common` folder. What's the `platforms/android` and `platforms/ios` folder for? Well, they are for platform-specific API.

### 2.1 How to consume the lib

- Android related code will be shared via simply including the according module in the android project.
- iOS related code will be shared as an iOS framework because Kotlin native will generate that. We will then add it in the XCode building phase. You can see more details in my another [blog](http://www.albertgao.xyz/2018/01/14/how-to-create-kotlin-native-ios-project/).

### 2.2 Background knowledge for Kotlin multi-platform project

Let's say you want to have an `HTTP` kotlin class where you can do the normal `GET`, `POST` thing, but the `HTTP` implementation is different across platforms. If you use the old school `interface` way, you need to declare an `IHTTP` interface, then implement it twice in android and ios. Then inject it at runtime to make it work.

But via using the Kotlin multi-platform project, you don't need to inject, the compiler will only pick up the piece of codes depends on your building target. If you build for Android, it will only grab the Android implementation.

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

## 2.3 How to code the `platforms-ios`

Oh well, you may think that old school `interface` may better in terms of iOS because you need to implement the iOS API specific thing in swift or obj-c then pass it back to kotlin native. But that is not true. Because there is a 1-to-1 API match in kotlin native such that you can implement the iOS specific API in kotlin as well. And it has the same signature which means you can reuse all the existing knowledge. And kotlin and swift are very similar. And from v6, the building phase will link some of the iOS API (you need to build the others) for you if you are on a Mac.

Which means in a ideal world, your swift side just need to care about the UI part while all other logic will be handled in the Kotlin native side, shared across platform and tested well.

## 3. About the example

All the code for setup can be found in this repo.

[https://github.com/Albert-Gao/kotlin-native-mobile-multiplatform-example](https://github.com/Albert-Gao/kotlin-native-mobile-multiplatform-example)

- `Sample` class is for code that is sharing across platforms (Which means you have to use API from `kotlin-stdlib-common`).
- `Platform` class is a class which has been implemented twice for different platforms for showing the platform API case.

- Open `android` folder from the root in Android Studio, run the app, it will show a string from the `:shared-android` project.
- Open `ios` folder from the root in XCode, run the app, it will show a string from the `:shared-ios` project.

In fact, the native app retrieves the string by invoking the method from the `Sample` class. And the `Sample` class invokes the method from `Platform` class to get the string. When you build an iOS framework, the KN compiler will use `:platforms-ios` to build along with `:common`. And when you consume it in android project, the setup will use `:platforms-android` along with `:common`. No injection, no affection on the code structure, just that simple. Thanks to the `Multi-platform project` setup from kotlin.

It is a perfect example for showing how to share the code when you have to deal with the platform API.

Hope it helps. Thanks.
