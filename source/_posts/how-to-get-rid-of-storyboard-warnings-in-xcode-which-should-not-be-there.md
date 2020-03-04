---
title: How to get rid of storyboard warnings in xcode which should not be there
date: 2018 01 30 12:26:17
tags:
  - xcode
---

I previously got a storyboard in XCode. It said `prototype table cells must have reuse identifiers.`. It's just that easy. We need an identifier for the table cell. But the problem is, I DO NOT have any table cells in this storybaord. And I double checked its `XML` code, not even for a single word `table`... So, Why `XCode` continues notify me this? Let's see how to solve this.

<!--more-->

It's just that easy. `Clean Cache`.

1. Clean “DerivedData” `~/Library/Developer/Xcode/DerivedData/`
2. Restart Xcode

Enjoy :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
