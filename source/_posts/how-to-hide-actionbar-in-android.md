---
title: How to hide action bar in Android
date: 2018-04-17 12:15:08
tags:
  - android
---

ActionBar is good for UE, but sometimes we do want to hide it. Here we will see the ways to do it.

<!--more-->

## 1. Through the code

You can hide it in your `onCreate` method:

```kotlin
class MyActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.my_activity)
        supportActionBar?.hide()
    }
}
```

This line `supportActionBar?.hide()` did the job. Start the app, and it works.


## 2. Though the XML with theme

First, add a new style in the `styles.xml`:

```xml
<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
</style>
```

Then, open the `AndroidManifest.xml` and apply it to the activity you want to hide the action bar. Start the app, and it works.

```xml
<activity
    android:name=".ui.MyActivity"
    android:theme="@style/AppTheme.NoActionBar"
/>
```

## 3. Hide it in the Android studio designer

The above 2 ways works, but they won't affect the designer. Which makes it inconsistent to design the UI. In order to apply it to the designer, you need to manually select it in the Android Studio UI Designer.

Find the button which applies the theme to UI, should be at the top area of the UI designer, a button between the following 2 features:

- API version in Editor
- Locale in Editor

It's called `Theme in Editor`, click it to open the menu, and select a theme without ActionBar. Then it works.

## 4. End

Hope it helps. :)