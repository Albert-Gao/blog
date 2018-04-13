---
title: Minimal Android MVVM Databinding Setup with Kotlin
date: 2018-04-13 17:27:10
tags:
  - kotlin
  - android
---

Databinding for MVVM or any other pattern is a must have. Let's see how to set it up. The reason for this blog is that it seems most of the examples out there online either deprecated or just try to solve another problem. Our goal is to setup a project with a brand new project generated from Android Studio.

<!--more-->

**First thing first, creating a new project from Android Studio.**

## 1. Add dependencies to your build.gradle

```groovy
apply plugin: 'kotlin-kapt'

android {
  dataBinding {
      enabled = true
  }
}

dependencies {
    implementation "android.arch.lifecycle:extensions:1.1.1"
    annotationProcessor "android.arch.lifecycle:compiler:1.1.1"
    kapt "com.android.databinding:compiler:3.1.1"
}
```

## 2. Write a view model for the main activity

```kotlin
import android.arch.lifecycle.ViewModel

class MainViewModel: ViewModel() {
    val name = "albert"
}
```

## 3. Add the view model to the XML

```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <data>
        <variable
            name="viewModel"
            type="xyz.akbertgao.mvvmdatabindingexample.MainViewModel"
        >
        </variable>
    </data>

    <android.support.constraint.ConstraintLayout
        xmlns:app="http://schemas.android.com/apk/res-auto"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{viewModel.name}"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintLeft_toLeftOf="parent"
            app:layout_constraintRight_toRightOf="parent"
            app:layout_constraintTop_toTopOf="parent" />

    </android.support.constraint.ConstraintLayout>
</layout>
```

Something you need to aware is that `<data>` is in the `<layout>`. Which means you need to add it to the `XML`, because it is not there.

## 4. Add the connection in the MainActivity.kt

```kotlin
import xyz.akbertgao.mvvmdatabindingexample.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val binding = DataBindingUtil.setContentView<ActivityMainBinding>(this, R.layout.activity_main)
        binding.viewModel = ViewModelProviders.of(this).get(MainViewModel::class.java)
    }
}
```

What happens so far? In step 3, we use that `viewModel` variable in XML to do the binding. But it hasn't been initialized yet. So here, we first setup the binding, then populate the `binding.viewModel` with an actual instance of the `MainViewModel`.

**Run the app, it works now. You can see Albert on the screen**

## 5. What about bind an event handler

Let's see you want to bind a `onClick` for a button.

1. You need the `view:View` as parameter

```xml
<button
  android:onClick="@{ viewModel::onClick }"
/>
```

`onClick` needs to have according signature: `fun onClick(view:View)`

2. You don't need that `view:View` as parameter

```xml
<button
  android:onClick="@{ () -> viewModel.onClick() }"
/>
```

> The syntax here is just a lambda which wraps the method from view model which makes it very flexible. You can actually pass anything you want to the handler.

## 6. What about visibility

```xml
<data>
   <import type="android.view.View" />
</data>

<button
  android:visibility="@{viewModel.name != "" ? View.VISIBLE: View.GONE}">
/>
```

## 7. End

Hope it helps.
