---
title: Dependency injection on Android with dagger-android and Kotlin
date: 2018-04-18 11:20:33
tags:
  - android
  - dagger
  - kotlin
---

In previous [blog](http://www.albertgao.xyz/2018/04/17/dependency-injection-on-android-using-dagger-and-kotlin-in-minutes/), we used plain dagger to do the dependency injection on Android, but there is another package from Google named `dagger-android`, and it's tailed for Android. Things get more interesting here. Let's see.

<!--more-->

If you don't know what dagger is as well as dependency injection, and the some basic dagger terms like `module`, `component` seem secret to you. I strongly suggest you to read my other [blog](http://www.albertgao.xyz/2018/04/17/dependency-injection-on-android-using-dagger-and-kotlin-in-minutes/) first, which is an implementation with plain dagger. Because that is easier to understand and just take you minutes. Then you can come back and see this blog for a more Android approach and to see which pattern you like most.

## 1. The big picture

When Google writes `dagger-android`, they want to reduce the boilerplate code you need to write with plain `dagger`. So they introduce some new abstraction. And it's very easy to get lost here. So I think it might be better that we review this base pattern first. As I said in the previous blog. In order to do DI, you need to prepare these initialization of dependencies somewhere before you can use them. So here, in dagger's terms:

- You declare how to generate these dependencies in `@Module`.
- You use `@Component` to connect the dependencies with their consumers.
- Then inside the consumer class. You `@inject` these dependencies. `dagger` will create the instances from the `@Module`

## 2. Add dependencies

```groovy
apply plugin: 'kotlin-kapt'

dependencies {
    kapt 'com.google.dagger:dagger-compiler:2.15'
    implementation 'com.google.dagger:dagger-android:2.15'
    kapt 'com.google.dagger:dagger-android-processor:2.15'
    implementation 'com.google.dagger:dagger-android-support:2.15'
}
```

## 3. Let's create our modules

First, let's create an application wide `@Module`.

```kotlin
@Module
class AppModule {
    @Provides
    @Singleton
    fun provideSharedPreference(app: Application): SharedPreferences =
        PreferenceManager.getDefaultSharedPreferences(app)
}
```

> This `@Provides` is the provider for any consumer which has the `@Inject` decorator. Dagger will match the type for you. Which means when a `@Inject` asks for the type `SharedPreferences`, dagger will find through all `@Provide` and find a method which return type matches and get that instance from this method.

But something interesting here is that who will give that `app` parameter when calling this `provideSharedPreference()` method and where does it get it. Well, we will see that soon.

## 4. Create an App component

Now consider this is an application wide dependency, we will connect this `@Module` to the android `application` with a `@Component`. For those who has `React` or `Vue` experiences, it's not that `component` at all. :D

```kotlin
@Singleton
@Component(
    modules = [
        AndroidSupportInjectionModule::class,
        AppModule::class,
    ]
)
interface AppComponent: AndroidInjector<App> {
    @Component.Builder
    interface Builder {

        @BindsInstance
        fun create(app: Application):Builder

        fun build(): AppComponent
    }
}
```

Here, something different from the plain dagger is that this `interface` is based on another `interface`: `AndroidInjector<App>`. And needs to declare its `Builder` as well. The `App` here is your custome `application` class. We will create that later on.

This `Builder` is for dagger, so it knows how to `create()` it. For instance, in our example, we need to the caller to pass `app` when `create()`. No magic here, as the signature indicates, you have to pass it when you first invoke this method.

`@BindsInstance` is where it shines. It will take this incoming `app` parameter, and save it for using later, such that, in our previous `AppModule`, you can invoke `provideApplication()` with a parameter called `app`. And this is how it gets that parameter. Because the `app` has been `@BindsIntance` when the `AppComponent.Builder` first `create()`.

`AndroidSupportInjectionModule::class` is from dagger to inject into other types other than your `App`.

And good question here will be why this is an `interface`, well, because overall, dagger is more like a code generation than a library. It's an `interface` because dagger will generate the actual implementation for you as long as you declare all the things they want and in their way.

## 5. Let's create our custom application class

This is your normal custom `Application` class.

```kotlin
class App : DaggerApplication() {
    override fun applicationInjector(): AndroidInjector<out DaggerApplication> {
        return DaggerAppComponent
            .builder()
            .create(this)
            .build()
    }
}
```

Don't forget to add this `App` to the `AndroidManifests.xml` with `android:name=` attribute to enable it.

Something interesting is that we extend the App from `DaggerApplication` to reduce some boilerplate like before, the only thing you need to do is to override that `applicationInjector` method, initialize and return your `AppComponent` there.

then you call the `create()` method which you created in that `Builder` interface, passing `this` which just fits the signature: `fun create(app: Application):Builder`.

> The `DaggerAppComponent` will be unresolved until you run `Make Project` from the `Build` menu.

If you don't want to inherit from `DaggerApplication`, you have to implement the `HasActivityInjector` interface:

```kotlin
class App : Application(), HasActivityInjector {
    override fun activityInjector(): DispatchingAndroidInjector<Activity> = androidInjector

    @Inject
    lateinit var androidInjector: DispatchingAndroidInjector<Activity>

    override fun onCreate() {
        super.onCreate()
        DaggerAppComponent.builder().appModule(AppModule(this)).build().inject(this)
    }
}
```

> You need to know that `DaggerApplication` does much more things for you other than the several lines of boilerplate above. It handles things like `Service` and `BroadCastReceiver` to make your life easier in the future.

## 6. Time for connecting activity with this @Module

Create a new file `ActivitiesBindingModule.kt` with the following code:

```kotlin
@Module
abstract class ActivitiesBindingModule {

    @ContributesAndroidInjector
    abstract fun mainActivity():MainActivity

}
```

If you want to add more activities, just add them here use the same pattern.

Now connect the `ActivitiesBindingModule` into the `AppModule`.

```kotlin
@Singleton
@Component(
    modules = [
        AndroidSupportInjectionModule::class,
        AppModule::class,
        ActivitiesBindingModule::class
    ]
)
interface AppComponent: AndroidInjector<App> {
  // Builder
}
```

If you went through my previous blog, you will notice this part is different. You no longer declare a method: `fun inject(activity: MainActivity)`. You need to use a `ActivitiesBindingModule` to do the trick. But still you can write `component` for that activity. this is just easier.

## 7. Let's inject MainActivity

Open `MainActivity.kt`

```kotlin
class MainActivity : DaggerAppCompatActivity() {

    @Inject
    lateinit var preferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        println("Is abc in Preferences: ${preferences.contains("abc")}")
    }
}
```

It's more clean than before, you use `@Inject`, then you get the it. No more `(application as MyApp).myAppComponent.inject(this)`.

Run the app, you should see something like this in the console:

```bash
04-18 00:34:38.980 5566-5566/? I/System.out: Is abc in Preferences: false
```

The magic could happen only because we inherited from `DaggerAppCompatActivity`, other wise you need to call `AndroidInjection.inject(this)` in the `onCreate` by yourself.

## 8. What about Activity scope dependency

Let's see that you need some dependencies that is only for one activity. Here for example, we need one such thing for the `MainActivity`.

```kotlin
class BooleanKey(
    val name: String,
    val value: Boolean
)
```

Then we just inject in and use it in `MainActivity.kt`

```kotlin
class MainActivity : DaggerAppCompatActivity() {

    @Inject
    lateinit var abcKey: BooleanKey

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        println("value of abcKey: ${abcKey.value}")
    }
}
```

Where to get this `abcKey` initialized? Well, we create a `MainActivityModule`:

```kotlin
@Module
class MainActivityModule {

    @Provides
    fun provideABCKey(
        preference:SharedPreferences
    ):BooleanKey {
        return BooleanKey(
            name = "abc",
            value = preference.getBoolean("abc", false)
        )
    }

}
```

And connect it with the `ActivitiesBindingModule`:

```kotlin
@Module
abstract class ActivitiesBindingModule {

    @ContributesAndroidInjector(modules = [MainActivityModule::class])
    abstract fun mainActivity(): MainActivity

}
```

Run the app, you should see `value of abcKey: false` printed in the console.

**Highlight**

In that `provideABCKey(preference:SharedPreferences)`, it needs a `SharedPreferences`. How could dagger get it? 

Well, with all the setup, dagger has a graph of all your dependencies. And every time it needs a parameter in a `@Provides` function, it will check other `@Provides` functions to look for that type. In our case, it will find it from the `provideSharedPreference()` and get it from there. Much better, it's a singleton! No new instance created!

And this is a very important feature, remember the moments where you need to create an instance A in order to create instance B. And order for initialization matters only because there is a dependency chain? Well, they are all on `dagger` now. :)

## 9. Optimization

When we wrote that `MainActivityModule` class. Anytime when dagger tries to get that instance, it needs to create an instance of `MainActivityModule` first. That is not very good. We can make it better by make that `@Provides` function static. In Kotlin, the syntax would be:

```kotlin
@Module
abstract class MainActivityModule {

    @Module
    companion object {

      @JvmStatic
      @Provides
      fun provideABCKey(
          preference:SharedPreferences
      ):BooleanKey {
          return BooleanKey(
              name = "abc",
              value = preference.getBoolean("abc", false)
          )
      }

    }

}
```

Now, the dagger could invoke this method like this: `MainActivityModule.provideABCKey()` without the need of a new instance.

> Why make the class `abstract`? Well, this is for a better check, because now if any `@Provides` in this module is non-static, dagger will give you a compile time warning.

Furthermore, you can move this code into `MainActivityModule` class as well:

```kotlin
@ContributesAndroidInjector(modules = [MainActivityModule::class])
abstract fun mainActivity(): MainActivity
```

Then, you can remove that `ActivitiesBindingModule.kt`. But add this `MainActivityModule` to the `AppComponent`. Such that, everything belongs to `MainActivity` DI now resides in one place.

Which approach do you like? :) Sometimes, some activities may only want an application-wide injection. Which seems too much to create a `@Module` for it. Maybe a combination of both? But that means sometimes, something is here and sometimes something is there. So, might be better just use the current setup. :) But making methods `static`. What do you think? :)

## 10. Repo

You can find the repo [here](https://github.com/Albert-Gao/DaggerAndroidKotlinExample)

## 11. End

Hope it helps.
