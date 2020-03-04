---
title: Starting with gradle, creating a simple build.gradle
date: 2018-01-25 14:50:27
tags:
  - gradle
---

`Gradle` is a famous build tool in `JVM` world. A build tool is just a tool to setup your project workflow. `Gradle` automates building, linting, testing, pushing and much more to make your life easier. Sometimes it can be hard to grasp how it works, even after reading the official documentation. Today, let's get `gradle` up and running in a few minutes.

<!--more-->

## 1. Some pre-knowledge of Gradle

Most of your `gradle` code will reside in the `build.gradle` file. It holds the configuration, and defines how you want to build your workflow. Later you will see how to write and execute a `task`. The most common `task` is `build`, which will compile your project. `Gradle` code is written in a language called `groovy`.

Before you have this omg-new-language-just-for-building idea, read this quote from google's documentation:

> You don’t need to know Groovy to start configuring your build because the Android plugin for Gradle introduces most of the DSL elements you need.

Build automation is a universal idea, not only for android. Most of the time, you don't need to implement your own task, there are `gradle plugins` which already contain these tasks for you to use. You just need to add these `plugins` as `dependencies` and put their `configuration blocks` in `build.gradle` with your own values.

The ideas above should make the `build.gradle` file pretty easy to understand, because now its functionalities are narrowed down to only manage your `plugins` and project `dependencies`.

## 2. A practical workflow for working with `gradle`

So now you should have a clear workflow:

1. You pick up the `gradle plugins` you want.
2. You add them as `dependencies` and `apply` them. Now you get the `gradle tasks`.
3. You can configure these `plugins` by adding their `configuration blocks` to your `build.gradle` file.
4. You then add the `dependencies` for your project.
5. You can configure your project information like `groupId`, `archiveBasename`, etc.
6. Happy gradling.

Let's try set up a `kotlin` project with `gradle`. How do we start? Well, from above we now know that we just need to find a plugin which implements kotlin related tasks for us. We will use the official `kotlin-gradle-plugin`.

## 3. Add plugins

There are two ways to add the dependencies, let's try the first one.

### 2.1 Informative way

```groovy
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.2.21"
    }
}

apply plugin: 'kotlin'
```

Seems like lots of things are going on here, but in fact, it's just that easy.

The first one is `buildscript`, it only controls dependencies for the `buildscript` process itself, not for the application code. Which means it will add the dependencies for this building session itself, which will properly help you to finish some tasks.

Inside `dependencies` of this `buildscript`, we want a plugin `org.jetbrains.kotlin:kotlin-gradle-plugin`. It's in one of the `repositories` called `mavenCentral`. Then you just need to `apply` them.

If you feel uncomfortable about this, then here is some real news to make you calm: 99% of plugin authors will give you this full code, you just need to copy and paste. :D

### 2.2 Simpler way

The above way applies to the plugin which uses `maven central` to publish. Some plugins will also use `plugin portal` which results in a simplified process.

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "1.2.21"
}
```

That's it, no `buildscript` or `apply`. You use the `plugins` DSL to add plugin dependencies. Much cleaner. But consider it's still [incubating](https://docs.gradle.org/current/userguide/feature_lifecycle.html) and might change in the future. Not all plugins are available in this way. But I'm sure it's the future.

## 4. Configure the plugin

We have said that you need to copy and paste the `configuration block` of the plugin in order to customize it to your own needs. By `configuration block`, I mean something like this:

```groovy
commandYouWantToUse {
    // Here is your settings
}
```

Another term to use is `XXX DSL`, because it's a DSL with specific settings. It will be put in your `build.gradle` file, just in the body of the file, not inside other blocks, and of course not `buildscript {}`. How to configure? Easy, read their documents.

No matter which plugin you are going to use, their configurations all look identical to the above.

Let's say that we want to see more information when the compiler is working. We just need to add something like this:

```groovy
compileKotlin {
    kotlinOptions.verbose = true
}
```

Just that easy.

## 5. Add the dependencies of your project

Now we need to add the dependencies of your application code, which you need to add, so when the building phase happens, they will be included. You will see something pretty familiar:

```groovy
repositories {
    mavenCentral()
}

dependencies {
    compile "org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.2.21"
    testCompile group: 'junit', name: 'junit', version: '4.12'
}
```

You define where to find the package, and you define the name of the package. They are different from the `dependencies` above. That `dependencies` need to reside inside the `buildscript {}` while this one just sits in the body of gradle. The `testCompile` command is for the libraries that you will use for the testing phase.

## 6. Configure the project information

This part is easy, most of the time, it's just as simple as declare some variables. Let's say we want to set up the `groupId` and `version` for our project. Just declare the following 2 variables:

```groovy
group 'myProject'
version '1.0-SNAPSHOT'
```

In terms of what kind of variables you can or need to declare, you can find this information in the `plugin` document. It's very straightforward.

If the plugin needs something, the document will tell you. If you need to customize anything, you just add it. Otherwise, don't bother.

## 7. End

That's it. Hope it helps. Any time you see a `configuration block` that you don't know, just google it. It must be either from `gradle` itself or some plugin. You can check the official gradle document for more `configuration block` that you could use. Or, to be honest, most of the time like most of the gradle users, you don't need to. Just find the plugin that most people use and adopt that, then you are good to go.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
