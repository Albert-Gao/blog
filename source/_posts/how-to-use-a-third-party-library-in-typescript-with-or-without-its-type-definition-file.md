---
title: >-
  How to use a third party library in Typescript with or without its type
  definition file?
tags:
  - tutorial
  - typescript
  - howto
id: 36
categories:
  - Blog
date: 2016-08-10 23:00:53
---

I love typescript, it is a superset of javascript, so basically anything you can do in javascript, you can do it in typescript, there is nearly nothing new to learn when you start coding via javascript. All you need to learn is some new weapons added to your arsenal by typescript.

Type is the first one, I love type, not only for the static typing, but also for the tooling it provided. Intellisense, aha, really great, you don't need to read any source code or documentation. Just a single dot, and our extraordinary coder will show you their self-explained method name, and you can also know the type of the parameter. Win! But how?

<!--more-->

So, you just download or install a package via NPM, then you include it in the html, finally you write your lovely .ts file, boom, the IDE is not happy.

&nbsp;

![](/images/Screen-Shot-2016-08-10-at-22.40.58.png)

No matter which function your are using, '$' or 'jQuery', it just doesn't work. It is easy to understand, since everything in typescript is strongly typed, you need to make typescript know what this '$' or 'jQuery' really is. But calm down, there is always solution and it is easy, find the **type definition** file for this third party library. To be honest, most of the popular libraries, you can always find the according type definition file.

## Solution 1 - Using the Typescript definition manager:

Just click this link [https://github.com/typings/typings](https://github.com/typings/typings) , install it via NPM, and find the according definition file.

```
# Install the Typings CLI package first.
npm install typings --global

# Search for the typeing file you need.
typings search jquery

# Install non-global typings.
typings install jquery --save
```

And in your code, you just need to add a reference at the beginning of the file:

```XML
/// <reference path="jquery/jquery.d.ts" />
```

Then, when you started to use JQuery, every one is happy. The term for this syntax is called "Triple-slash directives". The Triple-slash alone are single-line comments containing a single XML tag. The following contents are used as compiler directives.

![](/images/Screen-Shot-2016-08-10-at-22.40.30-300x78.png)

## Solution 2 - Download the type definition file only:

But sometimes, you just don't want to install a package just for one library. There is no need to make a mountain out of a molehill. So you just simply open this URL: [](https://github.com/DefinitelyTyped/DefinitelyTyped)

You can just use Ctrl+F or CMD+F to search the very one you need. And you will be lucky most of the time since this is such a huge store.

![](/images/Screen-Shot-2016-08-10-at-22.45.22-300x190.png)

## Solution 3 - No type definition or I just don't want use one.

Let's say I want to use a OAuth library.

![](/images/Screen-Shot-2016-08-10-at-21.27.10.png)

And I start searching, it seems that I am one of the never-win-lottery type.

![](/images/Screen-Shot-2016-08-10-at-22.48.14-300x88.png)

Here comes the final killer weapon, it is sort of cheating... Yes, I don't care what ever it is, just make it!

![](/images/Screen-Shot-2016-08-10-at-22.51.31.png)

OK, now the compiler is happy...

![](/images/Screen-Shot-2016-08-10-at-22.52.10-300x39.png)

Sometimes people are just lazy, right? xD

Or, you maybe wondering how we can get this object via runtime? Easy, you just wrap it in your HTML file as the old way. It means you can use whatever libraries you like without a stuck. Great!

## Solution 4 - DIY - Invent the wheel:

Yes, you can make a type definition file by yourself. And it is easy, you can find the section on the [official site](https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html), roughly speaking, it is just declare the type information so that the compiler won't have any bother.

![](/images/Screen-Shot-2016-08-10-at-22.58.20-300x140.png)

OK, pretty much of it, hope it helps someone :)
