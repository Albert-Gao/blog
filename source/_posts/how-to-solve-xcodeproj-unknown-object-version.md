---
title: How to solve [Xcodeproj] Unknown object version
date: 2021-05-15 16:11:37
tags: -react-native
---

Today I ran into this issue while installing React native 0.64.1. The `pod install` always threw error: `[Xcodeproj] Unknown object version`. Even with a basic command `react-native init`. Let's see how to solve it.

<!--more-->

1. Solution 1

The problem is the xcode version is not matching up with your cocoapods version, you have to `gem update xcodeproj`, if the `update` still not fix, you have to `gem uninstall xcodeproj` and `gem install xcodeproj`.

1. Solution 2
   Or, you can open `.xcodeproj`, in the project navigator, click the root project, check the right hand panel, `Identity and type`, change the `Project Format` to a version is below the latest version.

1. Solution 3
   In my case, none of these two above solution works. Maybe you have the same experience too, if you have `rbenv` installed, and think that you are using that version, then this might be the problem. React native will use the system version instead of the `rbenv` version, so you have to switch to the system version using `rbenv global system`, and `sudo gem uninstall cocoapods`, then `sudo gem install cocoapods`.

1. Hope it helps.
