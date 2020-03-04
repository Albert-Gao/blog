---
title: Current situation of Kotlin Native (2018/2)
date: 2018-02-02 23:31:14
tags:
  - kotlin
  - kotlin-native
---

We have an eye on Kotlin Native (KN) from day 1. I highly like its portability. You can generate universal package for both Android and iOS, or even Windows, OS X, Linux. Just share some of my thoughts here from my current experiences.

<!--more-->

## 1. Why so hard now?

On my inspection, I believe that KN makes sense, and very good sense in the longer term for mobile development, but Kotlin Native is still far from production ready for the following reasons:

1. All the platform specific API hasn’t been published as maven artifacts, which mean you can’t add them as project dependencies in gradle which leads to many other problems like: - syntax highlight - autosuggestions - your code related to KN lib is fragile as they said:
   `warning: IMPORTANT: the library format is unstable now. It can change with any new git commit without warning!`

2. No documentation for API. And without any support from IDE. It will greatly slow down the job.

3. Multiplatform project needs to support KN in order to get benefits in terms of architecture. You can still just use the old school way (by declaring `interface`). But this should be ready in 0.6 (My feeling according to slack, still not sure.)

4. Still no stable version. In response to a question on the Kotlin Native slack channel “Any ETA on beta/1.0 version?” Nikolay Igotti replied( 25/December/2017) : “Not yet, however, being v0.x is mostly an internal thing, in general both compiler and runtime are pretty well tested and known to work on rather complex codebases, such as Video Player: https://github.com/JetBrains/kotlin-native/tree/master/samples/videoplayer“

5. CLion: The benefit of using CLion seems more for the KN dev team, and for projects integrating with the C family. When the developers deal with the cross-platform setup, they need to dig into the LLVM layer in order to build the bridge. CLion is the only IDE in JB family which supports Kotlin Native at this time, which is problematic for projects looking to go multiplatform with JVM or JS, and for iOS projects which combine with Swift and Xcode. There is no announced plan for supporting the other JB IDEs. Further, from the project leader’s talk in slack in late January 2018 on support for IDEA: `this is not yet completely decided, but CLion is currently the only option`. And you know, CLion doesn’t support gradle, and they use gradle to build…

## 2. Some tough problems

So we have some difficult situation here, which is:

1. CLion doesn’t support gradle. And the [issue](https://youtrack.jetbrains.com/issue/CPP-1104) is there since 2014.
2. The multiplatform project hasn’t support KN yet. But this one is easy and difficult.
   - It’s easy because once the maven dependencies is there, the support will be nearly there. Or we could build the whole thing by `gradle` ourseleves.
   - It’s hard because as I said… The KN libs hasn’t been published as maven dependencies yet.
   - And from the talk of slack, it seems that the team holds the releasing mainly because the KN lib has a completely different format, even for the file extention, it’s called `.klib` now. So, uploading it to maven or JCenter seems not ideal. I assume JB might end up with building a new repository just KN libs.

## 3. A new IDE which focused on Kotlin Native?

And when there are some problems on both IDEA and CLion, a potential answer from JetBrains might be a new IDE just for Kotlin native. The following video maybe a provenance for this:

> https://www.youtube.com/watch?v=QOIn8Uh3lkE at 6:20 Andrey Breslav said (in Russian) they started development of new commercial product for cross-mobile development, Android and iOS.

## 4. What could we do now?

If app developers wish to only build your lib using the kotlin-std-lib, and inject the platform-specific API at runtime, it’s doable, and the current Kotlin Native will fully fullfil your requirement, I have some examples for this. But then your codebase will be a mess because you need to build the bridge by yourself as the kotlin type has been converted to some special interface type, which you need to implement in the swift side as well…

## 5. In the future

So, 2 things are crucial for using KN in production:

1. Decent IDE support such that we could inspect the APIs signature, and do the building and setup thing easily(No matter CLion or IDEA, AppCode or a new IDE, this is essential)

2. Multiplatform project support KN in order to create an KN project without depending on the KN repo…. Which means they need to publish their platform lib in order to enable us to add them as the project dependencies in gradle. Otherwise, a single build on KN repo takes 2 hours…..on my 2017 i7 15″ retina MacBook pro.

## 6. Hope

But I will keep an eye on KN, because I think as I dig into more, I think KN starts to make more sense.

- You can really share your logic. The most awesome part is that you can invoke platform-specific API from kotlin side which means you don’t need to deal with the communication between languages. Which means you can really embed heaps of logic in the KN base.
- The multiplatform project is a really great way to share code across platforms. It just makes sense. You abstract your code in `common`, `js`, `jvm`, `ios` or `android`. And the gradle will grab the related pieces to compile according to the platform you wanna build against.
- This sort of embrace-the-platform-differences-rather-than-write-everything-once-and-run-anywhere concept has granted KN a very promising future compare to Xamarin’s replacing-them-all.
- Last, as a big fan of React Native, Kotlin native may greatly reduce the native part by centralizing them with one language and one toolchain.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
