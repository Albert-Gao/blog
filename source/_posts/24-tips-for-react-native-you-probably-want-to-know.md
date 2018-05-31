---
title: 24 tips for React Native you probably want to know
date: 2018-05-30 21:49:27
tags:
  - react-native
  - typescript
---

​React native is amazing. But things could be tough for times. Here are something I've from project to project that I want to share with you, which may save you some time in the future.

<!--more-->

## 1. For debug

### 1.1 Breakpoint

When IDE goes mad, like the Visual studio code or Webstorm won't stop at the breakpoint, besides figuring it out by walking through their Github issue. You can simply put a `debugger` in your code, then it will stop the execution during runtime.

### 1.2 Attach the packager process

When you `console.log` during dev-time, your information will be shown in the browser console. You can see that console information right from your IDE. If you use `react-native-tools` for Visual Studio code. You just go to the debug tab and run that `Attach to packager` command and reload the app. But, you need to:

- Close Chrome, because only one debugger should be attached for one packager process
- Packager itself needs to be opened.

The benefits are not only hot module reloading stills works, but also you can debug your code when you writing them, right inside IDE.

### 1.3 Atom

Yes, VSC is just much better but you need to know that you can literally open react debug tools (like the one you installed in Chrome) right inside Atom... And, yes, Nuclide supports RN, again... Just want to let you know...

### 1.4 How to inspect the bridge

We all know there is a bridge between the native and js side. React native uses it to communicate between the two to do the UI updates and more. This is how you can inspect it. Just add the following code to your `index.js`:

```javascript
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js';

const spyFunction = (msg) => {
  console.log(msg);
}

MessageQueue.spy(spyFunction)
```

Then in the console of your debugger, you should see lots of messages:

```javascript
Object {type: 0, module: "JSTimers", method: "callTimers", args: Array(1)}
```

The **type** field indicates the direction:

- If `type` equals `0` that means that the data is going from native to JavaScript;
- if it equals `1`, the data goes from JavaScript to native.

### 1.5 Native debug, a must have

`Xcode`: After you running the app, Press the `Debug View Hierarchy` button, it will show all your views in a 3D way. You can inspect your full view tree in a very visual appealing way. This is a fantastic way to make yourself feel guilty because now you know how complex your UI actually is even though it seems to adopt a minimalist design concept. Just look at the [google image](https://www.google.com/search?newwindow=1&biw=1440&bih=826&tbm=isch&sa=1&ei=gnYOW8aGGIi70gTusrToDQ&q=xcode+debug+view+hierarchy&oq=xcode+debug+view+hierarchy&gs_l=img.3...870.1359.0.1654.4.4.0.0.0.0.0.0..0.0....0...1c.1.64.img..4.0.0....0.BIvtwn6CrWE) to see how cool it is.

`Android studio` :  Be sure to check `Android Profiler`, an awesome tool to analyze your app's performance on Android. CPU, memory, network, you get them all.

### 1.6 Check the native log

Just in case you forgot:

- `react-native log-ios`
- `react-native log-android`

You can see the native log from the command line.

### 1.7 Recommend

One lovely debugging tool is [reactotron](https://github.com/infinitered/reactotron). A desktop app for inspecting your React JS and React Native projects. macOS, Linux, and Windows. Really beautiful.

If you are using Mac. [react-native-debugger](https://github.com/jhen0409/react-native-debugger) is another good candidate. It combines React Inspector / Redux DevTools together. Just two steps.

- Install: `brew update && brew cask install react-native-debugger`
- Run: `open "rndebugger://set-debugger-loc?host=localhost&port=8081"`

### 1.8 Continues getting `Packager is not running` after refreshing

sometimes everything is right, but you still get that `packager is not running` message, instead of using CMD+R to refresh the page, you just need to click the bottom `Refresh Page` button, I know, they should be the same. But…

### 1.9 For the YellowBox

Yes, you can use `YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated',])` to ignore the warnings which showed in a yellow box. But it might be better that you put the link to the GitHub issue. Just in case you can check it regularly, and remove it finally.

## 2. You are in a different environment

### 2.1 Different result

> In most cases, React Native will use [JavaScriptCore](http://trac.webkit.org/wiki/JavaScriptCore), the JavaScript engine that powers Safari. Note that on iOS,  JavaScriptCore does not use JIT due to the absence of writable executable memory in iOS apps.

> When using Chrome debugging, all JavaScript code runs within Chrome itself, communicating with native code via WebSockets. Chrome uses [V8](https://code.google.com/p/v8/) as its JavaScript engine.

This is something very important to remember, a case that I've been dealt with is `moment.js` actually behaves differently. For instance, this month is May, so for the following code:

```javascript
moment().month()
// will return 4 because moment's index starts from 0
```

**It works ONLY when you test via `jest`, but when you run it in the react native environment. You will get 5.**

So, the takeaways here are:

- `Date` is the dark side of react native like `navigation`, remember this difference.
- Don't always question yourself.

### 2.2 Update your JSC for android

I forgot, but in one extreme case, update the JavaScriptCore actually solves the problem. The official jsc-android is not been updated since 2016. Use the community one instead, [jsc-android-buildscripts](https://github.com/react-community/jsc-android-buildscripts)

Open the link and skip to the `How to use it with my React Native app` part. It is actually quite easy.

## 3. Update your Android project

All the settings are too old if you are a native developer, rather than compatibility old.  It's more like centuries old and lost love from the team. But everything is transparent. Still, before update, be sure there are not any legacy plugins which still needs the old version. But still you can just update, and `git reset` if anything wrong happens.

### 3.1 Update gradle

Gradle is the building tool used in the JVM world.

Open `android/gradle/wrapper/gradle-wrapper.properties` , find the `distributionUrl=` line

Change the gradle version to `4.5.1` so the result looks like this:

`distributionUrl=https\://services.gradle.org/distributions/gradle-4.5.1-all.zip`

### 3.2 Update your android project right after generating the template

1. Open build.gradle under android/app/
2. find the android { } block
3. Change the following version to the below:

- compileSdkVersion 27
- buildToolsVersion "27.0.3"
- minSdkVersion 16
- targetSdkVersion 27

4. In the dependencies block, change the `appcompat` line to match the target version

- `compile "com.android.support:appcompat-v7:27.1.1"`

5. In the `android/build.gradle`

Update the android build tools
`classpath 'com.android.tools.build:gradle:3.1.2'`

### 3.3 Reduce your APK

By default, APK generated by React native includes JSCore binaries for both x86 and ARM. If you don't need x86 you could reduce the size.

Add the following line to your `/android/app/build.gradle`:

```bash
def enableSeparateBuildPerCPUArchitecture = true
```

It should generate 2 APK, one for x86 and one for ARM, upload all of them to the Google Play, the user will get the proper one according to their device.

### 3.4 Gradle

If you want learn something about gradle, I suggest you start from my blog: [Starting with gradle, creating a simple build.gradle](http://albertgao.xyz/2018/01/25/starting-with-gradle-creating-a-simple-build-gradle/). It is much easy to follow than the official document and just cost maybe 10 minutes.

## 4. Image, Image, Image

### 4.1 Use WebP could potentially saves 20% space. And end up in a smaller packager

But for Android, you need to add something to gradle. From the official document:

> You will need to add some optional modules in `android/app/build.gradle`, depending on the needs of your app.

```groovy
dependencies {
  // If your app supports Android versions before Ice Cream Sandwich (API level 14)
  compile 'com.facebook.fresco:animated-base-support:1.3.0'

  // For animated GIF support
  compile 'com.facebook.fresco:animated-gif:1.3.0'

  // For WebP support, including animated WebP
  compile 'com.facebook.fresco:animated-webp:1.3.0'
  compile 'com.facebook.fresco:webpsupport:1.3.0'

  // For WebP support, without animations
  compile 'com.facebook.fresco:webpsupport:1.3.0'
}
```

### 4.2 For current version of RN

You can just `require('/img/mine.png')` to load it.

### 4.3 This is how you do it natively

Sometimes, even put the image there will make your app feels much faster.

### For iOS

- Open Xcode, find `Images.xcassets`, drag the static assets into it.
- Make sure it is included in the building phase: Build Phases -> Copy Bundle Resources.
- Use it like this:

```html
<Image source={{uri: 'goodImage'}} />
```

No need for the extension, and you might need to add `width` and `height` for actually rendering it.

### For Android

- Open Android studio
- Drag your images to this folder: `android/app/src/main/res/drawable`
- The filename should start with the letter
- Then use it like the iOS

## 5. React technique still apply

### 5.1 PureComponent is not enough

If you use `react-navigation`, just like `react-router`, they need to include a dynamic variable in their `navigation` prop in order to cause re-render when changing the routes. And it will make the `PureComponent` useless because it simply does a shallow check against all props. You need to implement your own `shouldComponentUpdate()` and validate any `prop` but the `navigation`. Just that easy. One line is fine:

```javascript
shouldComponentUpdate(nextProp) {
    return nextProp.data != this.props.data
}
```

### 5.2 For the patterns

If you are not using either HOC (high order component) or render props that much and the community seems to talk about them every day. There is nothing wrong because you will use them when you need them, you just need to know when to use them, I feel like at least for me:

- HOC is more suitable for adding a reusable feature like I need to add a feature for a TextInput, you just put them in a HOC, and wrap the TextInput. I just want a feature, nothing changes.
  - You can use a factory method along with HOC to generate a different version of the same component like I'd like to generate 5 different `ListComponent`, they are all the same, the only differences are they focus on a different piece of redux state.
  - And you might want to give your HOC a `displayName` for a better debugging experience.
- Render Props is useful when you try to encapsulate a logic and letting the children decide how to render based on a changed input. This is why you see its lambda-like syntax because it will pass the processing result to the children.
  - Something like an `Auth` component, you do the authentication inside and pass the result to the children to do a rendering.

An important fact is to remember:

> the JSX element in React is not only for showing the UI. You can use them to declarative construct your logic.

And only after you accept this, you will feel better when you see things like `render props`, otherwise, it just seems very annoying.

## 6. React navigation

Actually, the v2 update seems pretty good. I know this library has some pretty bad reputation. But actually not that bad. It works quite well. Just some notes:

1. Navigators can be nested. Which mean, if you have the main screen which is 3 bottom tabs, and one of the tabs contains 3 top tab bar. You need to do something like this.

   ```javascript
   const ListTab = createMaterialTopTabNavigator(
     {
       INBOX: pickListScreen(Category.INBOX),
       TODAY: pickListScreen(Category.TODAY),
       TOMORROW: pickListScreen(Category.TOMORROW),
     }
   )

   const MainScreen = createBottomTabNavigator(
     {
       Home: HomeScreen
       List: ListTab,
   })
   ```

   And if you want to navigate to another from `HomeScreen`, you need to create a `stackNavigator` around them and replace the above `HomeScreen` with it.

2. No, there is NO header, it’s ONLY from stack navigator unless you wrap your screen in a stack navigator, you won't get a `header`.

3. If you want to remove the header shadow:

   ```javascript
   headerStyle:{
       // iOS
       borderBottomWidth:0,
       // Android
       elevation:0
   }
   ```

## 7. How to choose an open source project

1. Know your use case!
2. Inspect the source code, sometimes it is quite simple and maybe you just want a different API signature.
3. See the stars, see how much attention it gets. Less attention may end in no support soon.
4. Check whether the issues are urgent.
5. Check the PR, if lots of PR are unmerged, something must happen there.
6. Check the commits. Previously, when I check `sails.js` 's commit message. It blew my mind by seeing the team has a huge interest in fixing their `readme.md` or other docs without pushing meaningful codes for months...

## 8. For CLI

If you are coming from web world, you need to know that `create-react-native-app` is not the `create-react-app` equivalent. It's a solution provided by Expo and based on the official `react-native-cli`, it hides those native project away from you. They provide other pretty good tooling around react native. 

But if you want more control over your project, something like tweaking your react native Android and iOS project, I highly suggest you use the official `react-native-cli`. Still, one simple command, `react-native init ProjectName`, and you are good to go.

Because whenever you need to add some native code, which sounds pretty normal for react native, you need to `eject` your `create-react-native-app` as well.

## 9. For Typescript

### 9.1 About setup

```bash
react-native init ProjectName --template typescript
```

### 9.2 What about Hot reloading not work

First, confirm you have live reloading turned off and hot reloading turned on. Then, make your root component a class component.

I've run into an issue that `tsconfig.json` causes the trouble, where after I removed all the comments... The hot reloading finally works.

### 9.3 Start typing

#### For stateless functional component

```javascript
import React from 'react'

interface IMyProp {
    name: string
}

const My: React.SFC<IMyProp> = ({name}) => ()
```

#### For state component

```javascript
class My extends React.Component<IMyProp, IMyState>
```

#### For redux

```javascript
// need to install @types/redux first
import { Dispatch } from 'redux'
```

## 10. End

Hope it helps.