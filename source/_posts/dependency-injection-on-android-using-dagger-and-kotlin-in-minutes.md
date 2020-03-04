---
title: Dependency injection on Android using plain Dagger and Kotlin in minutes
date: 2018-04-17 16:59:54
tags:
  - kotlin
  - android
  - dagger
---

DI is a pattern to decouple your code. You don't need to have a DI framework to handle the injection, but using such will make your application better. Things like singleton and initialization. Let's see how to do that in Android using Dagger. Even you don't what DI is, we will go through it pretty fast and clear. We will use Kotlin, plain Dagger and Android Studio here.

<!--more-->

> This is a setup with plain dagger, if you want to see how to setup with `dagger-android`, you should check this [blog](http://www.albertgao.xyz/2018/04/18/dependency-injection-on-android-with-dagger-android-and-kotlin/). But if you are pretty new to dagger. I strongly suggest to start with the plain dagger.

Here, we are starting from a new project created from Android Studio. The goal of the blog is to add application wide dependencies. Things like your HTTP client or SQL Lite things which you will use through most of your activities.

## 1. What is DI

It is a way that a `class A` could consume another `class B` as a dependency without worrying initialization details about that `class B`. Something like this:

```kotlin
class Company(
  private val staff:Staff
) {
  fun getStaffName():String = staff.name
}
```

Of course, you can create the instance of `staff` inside this `Company` class. But what about there are different subclasses of this `Staff class` which requires different signature for initialization? Or the signature for the constructor just changes in the future. Then you have to change every where where this `staff` gets initialized. With the code above, the company don't need to know how to initialize the `staff`, it just needs to consume.

> Here, we say, the `Staff class` has been `injected` into `Company class` as a dependency.

Actually, DI library will handle more things for you. Something like dependency chain. Where you need to create instance A in order to create instance B, then there is another instance C depends on instance B. And your `onCreate` method just got bloated by this.

And now you see the pattern here. You need to prepare these initialization of dependencies somewhere therefor you can use them later. So here, in dagger's terms:

- You declare how to generate these dependencies in `@Module`.
- You use `@Component` to connect the dependencies with their consumers.
- Then inside the consumer class. You `@inject` these dependencies. `dagger` will create the instances for from the `@Module`

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

This fake `MyRepo` simply needs the `context` to start with, and will return some string based on the `context`. After knowing how to inject this, you should handle most cases with ease.

So, add a file named `MyRepo.kt` with the following code:

```kotlin
class MyRepo(
    private val application: Application
) {
    fun getClassName():String = application.packageCodePath
}
```

Then we will use this `MyRepo` in the `MainActivity` to show the string in the console.

## 4. Create a Module to create dependencies

There is no such thing like auto-create, you need to manually write the creation and let `dagger` invoke it when it tries to inject the dependencies(consider this as auto creation). So, a `@Module` is for handling such cases where you write function to create all the instances.

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

- `@Module`: to mark a class as `dagger module`
- `@Provides`: to indicate this is where the dependency gets created, it's been provided by this method.
  - The name of the method doesn't matter. The type matters. `provideBlahBlah` is just a convention people use all the time when using `dagger`.
- `@Singleton`: to indicate this instance will be a singleton which always will give the same instance of class.

## 5. Create a component to prepare the connection

Before you just use the `@Module` as a repo for all the `dependencies`. You need to create a `dagger Component` which behaves like a middle layer between the `moduel` and actual consumer.

Create a new file with the following code:

```kotlin
@Singleton
@Component(modules = [MyAppModule::class])
interface MyAppComponent {
    fun inject(target: MainActivity)
}
```

The code means, it will use the `MyAppModule` as a source `module` and inject `MainActivity` with it.

- `modules = [MyAppModule::class]` this is an array, which means you can add more `modules` here as a starting point rather than just one.
- You can add new method like `fun inject(target: SecondActivity)` to support new activity

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

Now you have the module, you have to initialize it somewhere in order to use it later. Consider this is an appllication wide `module`, we will do the preparation in the `MyApp` class.

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

Here you initialize the an instance of `MyAppComponent` by yourself. Remember the `MyAppComponent` is an interface? The implementation will then be generated for you.

Here, the dependency will be created in the `initDagger` method which will be invoked in the `onCreate` method.

Look at this `.myAppModule(MyAppModule(app))`, remember we declared a parameter for the constrcutor of `MyAppModule`? It needs an `application`, now have to do pass it.

You may notice that the Android Studio may tell you that `unresolved reference DaggerMyAppComponent`. It's fine. You can just click the `Build` from the menu, and click `Make module app` from the dropdown menu.

Then a java file will be generated for you. And this problem will be resolved. If not works, go back to step 2 to see what you are missing.

> The name `DaggerMyAppComponent` matters, you need to change according to your component name. If your application component is named as `ABCComponent`, then you need to change it to `DaggerABCComponent`. As well as that `.myAppModule(MyAppModule(app))`. You need to adjust the `.myAppModule()` to your case.

After that `make module app`, the `.myAppModule` will likely to have a deprecated warning. It's fine too, it just indicates it gets no usage. After the following steps, it will gone.

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

So, what happens here.

- We create the property `myRepo` that will hold the dependency.
- And the decorator `@Inject` will let dagger knows that you want it to be injected.
- Then, in the `onCreate`, you start the injection with `(application as MyApp).myAppComponent.inject(this)`.
- And there is no magic here, the `inject(this)` already got its declaration in that `interface MyAppComponent`, remember? :)
- Dagger will then look through all `@Provides` in `@Module` to find one function that has a matched return type.
- Then you get your instance.

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

If you want to see how to setup with `dagger-android` which is another package from Google, you should check this [blog](http://www.albertgao.xyz/2018/04/18/dependency-injection-on-android-with-dagger-android-and-kotlin/). It designs to be more `magic` :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
