---
title: How to add additional parameters to ViewModel via Kotlin
date: 2018-04-13 20:57:00
tags:
  - kotlin
  - android
---

With the new `android.arch.lifecycle.ViewModel`, you can extend your own ViewModel which is life cycle aware. Or you can use `AndroidViewModel` if you want to inject `context` to your model. One problem with the default `ViewModel` is the constructor takes zero parameters. If you want to make it takes parameters, you need to make a new `FactoryClass` for each view model. But with Kotlin, it could be more simple. Let's see how to do it.

<!--more-->

## 1. Normal way

If you want your view model to have a constructor which takes a parameter like this

```kotlin
class MyViewModel(
  val name:String
):ViewModel() {}
```

You need to create an according factory class like this:

```kotlin
class MyViewModelFactory(
    private val name: String
): ViewModelProvider.NewInstanceFactory() {

    @Suppress("UNCHECKED_CAST")
    override fun <T: ViewModel> create(modelClass:Class<T>): T {
        return MyViewModel(name) as T
    }
}
```

And use it:

```kotlin
binding.authViewModel = ViewModelProviders.of(
  this,
  MyViewModelFactory("albert")
).get(MyViewModel::class.java)
```

## 2. Kotlin way

The previous way works, but you have to create many factory class like that which seems overkill. So a more elegant kotlin is like this:

```kotlin
protected inline fun <VM : ViewModel> viewModelFactory(crossinline f: () -> VM) =
    object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(aClass: Class<T>):T = f() as T
    }
```

And use it like this:

```kotlin
binding.authViewModel = ViewModelProviders.of(
  this,
  viewModelFactory { MyViewModel("albert") }
).get(AuthViewModel::class.java)
```

You can add that viewModelFactory to your `BaseActivity` class so you can use it across apps.

## 3. End

Hope it helps.