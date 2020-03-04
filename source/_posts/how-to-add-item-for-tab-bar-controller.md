---
title: How to add item for tab bar controller in storyboard of Xcode
date: 2017-12-14 12:37:03
tags:
  - ios
  - storyboard
---

Storyboard is good for decoupling the UI from your business logic, but sometimes it could be challenge if you are a newbie.

<!--more-->

We will start from the very start.

## Create a storyboard

1. `CMD+N` to create a new file: User interface - storyboard
1. Single click the newly created storyboard to open it as the `interface builder` mode.

## Create a Tab Bar Controller

1. Open `Object library` in the `Utilities` panel, the shortcut is `CTRL+ALT+CMD+3`
1. Drag `Tab Bar Controller` into the storyboard. Now we have a tab bar controller along with 2 sub tab items.

## Add a new Tab Bar Item

1. Let's add the 3rd tab bar item.
1. Drag `View controller` into the storyboard.
1. Drag `Tab Bar Item` into the newly created view controller, it will sit at the same level of the `View`.

## Add the segue

1. From the `Tab Bar Controller Scene`, hold `CTRL` and drag a line from it to the new view controller.
1. From the pop-up, select `Relationship Segue - view controllers`

## End

Enjoy :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
