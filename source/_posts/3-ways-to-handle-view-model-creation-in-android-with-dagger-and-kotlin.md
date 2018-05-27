---
title: 3 ways to handle view model creation in Android with dagger and Kotlin
date: 2018-05-22 10:20:52
tags:
  - kotlin
  - android
  - dagger
---

The library that we are going to talk about in this blog is `ViewModel` from the official architecture component, `dagger-android` for managing dependency injection. If you want to learn `dagger-android` in a quick and easy way, I've got a [blog](http://www.albertgao.xyz/2018/04/18/dependency-injection-on-android-with-dagger-android-and-kotlin/) covered.
<!--more-->

## Only one way for the creation

Even you use things like `dagger` to handle dependencies, you need to know that you **ALWAY** use `ViewModelProviders.of().get()` to get the instance of your view model. It will manage the life cycle of a view model for you.

With this in mind, let's start.

## Case 1: Get an instance of view model without extra parameter

This one is quite easy. You create this method in your `BaseActivity` or `BaseFragment` or `Utils`.

```kotlin
protected inline fun <reified T : ViewModel> getViewModel(): T =
    ViewModelProviders.of(this)[T::class.java]
```

Then use it like this:

```kotlin
val listViewModel: ListViewModel = getViewModel()
```

The type `T` will be inferred from the left side.

## Case 2: Get an instance of view model with extra parameter

In this case, you need to create `ListViewModel(val listStore:ListStore)`, but `ListStore` is in `dagger`, how you do that?

Well, first, we always use `ViewProviders` to manage view model. So, we need to find another way to handle the customization phase of the view model, here **we will inject a view model factory to do the trick**.

Create the ViewModelFactory in a separate file:

```kotlin
class ViewModelFactory<T : ViewModel>
@Inject constructor(
    private val viewModel: Lazy<T>
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel?> create(modelClass: Class<T>): T =
        viewModel.get() as T
}
```

Then in your `activity` or `fragment`, create the ViewModelFactory and inject it.

```kotlin
@Inject lateinit var viewModelFactory: ViewModelFactory<ListViewModel>
```

**Here, we only inject the `ViewModelFactory`, not the `ViewModel`**.

Let's say that your `ViewModel` need a dependency named `listStore` which is under `dagger`'s management. This is how you declare it:

```kotlin
class ListViewModel
@Inject constructor(
    val listStore: ListStore
): ViewModel() {}
```

You have to `@inject` the dependencies from the constructor according to this line: `@Inject lateinit var viewModelFactory: ViewModelFactory<ListViewModel>`. Because the constructor of `ListViewModel` will be invoked during the `injection` of the `ViewModelFactory`.

Then, in your activity,

```kotlin
val viewModel:ListViewModel = getViewModel(viewModelFactory)
```

We can still re-use the `getViewModel()`?! Of course, you can't.

```kotlin
protected inline fun <reified T : ViewModel> getViewModel(
  viewModelFactory: ViewModelProvider.Factory
): T =
  ViewModelProviders.of(this, viewModelFactory)[T::class.java]
```

It's a just another overload version of `getViewModel()`

That's it.

## Case 3: Creating a view model with custom parameters without using dagger's injection

This case is for where your `ViewModel` needs some dependencies which are not under `dagger`'s management. Something like this:

```kotlin
class ListViewModel(
    val listId: String
): ViewModel() {}
```

The `ListViewModel` needs to get `listId` when it is initialized. How to do this?

First, we need a `ViewModelFactory`:

```kotlin
protected inline fun <VM : ViewModel> viewModelFactory(crossinline f: () -> VM) =
    object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(aClass: Class<T>):T = f() as T
    }
```

It's the same method as before with a slightly different signature.

And that famous `getViewModel()` is back:

```kotlin
protected inline fun <reified T : ViewModel> getViewModel(crossinline f:() -> T): T =
    ViewModelProviders.of(this, viewModelFactory { f() }).get(T::class.java)
```

Then you can use it like this:

```kotlin
val listViewModel:ListViewModel = getViewModel { ListViewModel(listId) }
```

## End

That's it. Now you get it. Hope it helps.
