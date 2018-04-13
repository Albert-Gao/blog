---
title: Why unresolved reference for ViewModelProviders
date: 2018-04-13 14:21:49
tags:
  - android
  - kotlin
---

I encountered a weird thing today. In Android Studio 3.1.1, `import android.arch.lifecycle.ViewModelProvider` is totally while `import android.arch.lifecycle.ViewModelProviders` is not fine. Because there is no `ViewModelProviders` under `lifecycle` package. The solution is to add the packages by yourself. It doesn't even get mentioned in the official doc and most of the tutorials online. And after working with some already setup project. It finally beats me.

<!--more-->

Just add these 2 lines to the proper `build.gradle`:

```groovy
implementation "android.arch.lifecycle:extensions:1.1.1"
annotationProcessor "android.arch.lifecycle:compiler:1.1.1"
```

The version number maybe different in the future but it's fine, because Android Studio gonna tell the version number for the latest version.

Hope it helps.