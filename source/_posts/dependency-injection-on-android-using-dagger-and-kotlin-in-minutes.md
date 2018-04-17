---
title: Dependency injection on Android using Dagger and Kotlin in minutes
date: 2018-04-17 16:59:54
tags:
  - kotlin
  - android
  - dagger
---

DI is a pattern to decouple your code. You don't need to have a DI framework to handle the injection, but using such will make your application better. Things like singleton and initialization. Let's see how to do that in Android using Dagger. Even you don't what DI is, we gonna go through it pretty fast and clear. We will use Kotlin, Dagger and Android Studio here.

<!--more-->

Here, we are starting from a new project created from Android Studio. The goal of the blog is to add application wide dependencies. Things like your HTTP client or SQL Lite things which you gonna use through most of your activities.

## 1. What is DI

It is a way that a `class A` could consume another `class B` as a dependency without worrying any details about that `class B`. Something like this:

```kotlin
class Company(
  private val staff:Staff
) {
  fun getStaffName():String = staff.name
}
```

You can create the instance of `staff` inside this `Company` class. But what about there are different subclasses of this `Staff class` which requires different signature for initialization? Or the signautre for the constructor just changes in the future. Then you have to change every where where this `staff` gets initialized. With the code above, the company don't need to know how to initialize the `staff`, it just need to consume. 

> Here, we say, the `Staff class` has been `injected` into `Company class` as a dependency.

## 2. Add packages in your build.gradle

First, open `build.gradle` in `app`, add the following settings in addition to your current gradle settings.

```groovy
apply plugin: 'kotlin-kapt'

dependencies {
  implementation 'com.google.dagger:dagger:2.15'
  kapt 'com.google.dagger:dagger-compiler:2.15'
  compileOnly 'javax.annotation:jsr250-api:1.0'
}
```

What is that `kapt`? Well, Dagger requires an annotation processor. For Java you use the Groovy methods `apt` or the newer `annotationProcessor`, while you need to use `kapt` for Kotlin. And it's been provided by that `kotlin-kapt` plugin.

## 3. Add some fake code

It simply needs the context to start, and will return some string based on the context. After knowing how to inject this, you should handle most cases with ease.

So, add a file named `MyRepo.kt` with the following code:

```kotlin
class MyRepo(
    private val application: Application
) {
    fun getClassName():String = application.packageCodePath
}
```

Then we will use this `MyRepo` in the `MainActivity` to show the string on the screen.

## 4. Create a Module to create dependencies

There is no such thing like auto-create, you need to manually write the creation and let `dagger` invoke it when it tries to inject the dependencies(consider this as auto creation). So, a `module` is for handling such cases where you write function to create all the instances.

```kotlin
@Module
class MyAppModule(
    private val app: Application
) {
    @Provides
    @Singleton
    fun provideMyRepo(): MyRepo = MyRepo(app)
}
```

You see, we inject the `application` into this `MyAppModule` for it to create an instance of `MyRepo`. It is easy to understand.

- `@Module`: to make a class as `dagger module`
- `@Provides`: to indicate this is where the dependency get created, it's been provided by this method.
  - The name of the method doesn't matter. The type matters. `provideBlahBlah` is just a convention people use all the time when using `dagger`.
- `@Singleton`: to indicate this instance gonna be a singleton which always gonna give the same instance of class.

## 5. Create a component to prepare the connection

Before you just use the `module` as a repo for all the `dependencies`. You need to create a `dagger Component` which behaves like a middle layer between the `moduel` and actual consumer.

Create a new file with the following code:

```kotlin
@Singleton
@Component(modules = [MyAppModule::class])
interface MyAppComponent {
    fun inject(target: MainActivity)
}
```

The code means, it will use the `MyAppModule` and inject into `MainActivity`.

- `modules = [MyAppModule::class]` this is an array, which means you can add more `modules` here as a starting point rather than just one.
- add new method like `fun inject(target: SecondActivity)` to support new activity

## 6. Extend your own application class

Create a file named `MyApp.kt` with the following code:

```kotlin
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
```

And add it to the `AndroidManifests.xml`

```xml
<application
        android:name=".MyApp">
```

## 6. Initialize the module in the application class

Now modify your `MyApp` class to the following:

```kotlin
class MyApp : Application() {
    lateinit var myAppComponent: MyAppComponent

    override fun onCreate() {
        super.onCreate()
        myAppComponent = initDagger(this)
    }

    private fun initDagger(app: MyApp): MyAppComponent =
        DaggerMyAppComponent
            .builder()
            .myAppModule(MyAppModule(app))
            .build()
}
```

The dependency will be created in the `initDagger` method which will be invoked in the `onCreate` method.

You may notice that the Android Studio may tell you that `unresolved reference DaggerMyAppComponent`. It's fine. You can just click the `Build` from the menu, and click `Make module app` from the dropdown menu.

Then a java file will be generated for you. And this problem will be resolved. If not works, go back to step 2 to see what you are missing.

> The name `DaggerMyAppComponent` matters, you need to change according to your component name. If your application component is named as `ABCComponent`, then you need to change it to `DaggerABCComponent`. As well as that `.myAppModule(MyAppModule(app))`. You need to adjust the `.myAppModule()` to your case.

After that `make module app`, the `.myAppModule` will likely to have a deprecated warning. It's fine, it just indicates it gets no usage. After the following steps, it will gone.

## 7. Start to inject

So far, we have created the dependencies and initialized it in `MyApp`. Now we will inject it. Open the `MainActivity.kt` and add the following code:

```kotlin
class MainActivity : AppCompatActivity() {

    @Inject
    lateinit var myRepo: MyRepo

    override fun onCreate(savedInstanceState: Bundle?) {
        (application as MyApp).myAppComponent.inject(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        println(myRepo.getPackagePath())
    }
}
```

So, here. We create the property `myRepo` that will hold the dependency. And the decorator `@Inject` will let dagger knows that you want it to be injected. Then, in the `onCreate`, you start the injection with `(application as MyApp).myAppComponent.inject(this)`.

## 8. Run the app

You should see the output in the console:

```bash
04-17 06:47:41.588 27291-27291/? I/System.out: /data/app/xyz.akbertgao.daggerkotlin-1/base.apk
```

## 9. Repo

You can find the repo here:
[AndroidDaggerKotlin](https://github.com/Albert-Gao/AndroidDaggerKotlin)

## 10. End

There are more things to learn. But I think you have a good start. Hope it helps.