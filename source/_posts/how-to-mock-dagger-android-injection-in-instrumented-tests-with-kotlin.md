---
title: How to mock dagger-android injection in instrumented tests with Kotlin
date: 2018-04-24 15:14:52
tags:
  - kotlin
  - android
  - dagger
---

Previously, we talked about how to do mock using [dagger 2](/2018/04/17/dependency-injection-on-android-using-dagger-and-kotlin-in-minutes/) and [dagger-android](/2018/04/18/dependency-injection-on-android-with-dagger-android-and-kotlin/). But as the wise man said: `If You Didn't Test It, It Doesn't Work`. So let's see how to do the test. An important part of doing the UI test is mock, we don't really want to deal with network request even it allows us to. Today, I share the knowledge of how to mock the injections from `dagger-android` in the UI test (instrumented tests). I write this because most of the online tutorials are using `dagger-android` in a `dagger 2` way which leads to more code, or even worse, some mixed up usage will make people even more confused. Even though `confuse` is a word that tends to be bound with `dagger`. :D Oh, well, it's a bad joke.

<!--more-->

## 1. Set up

Add something to your `build.gradle` of the `app` module (We start with the project created from last [`dagger-android` blog](/2018/04/18/dependency-injection-on-android-with-dagger-android-and-kotlin/) which is a default project created by Android Studio):

```groovy
apply plugin: 'kotlin-kapt'

android {
    defaultConfig {
        testInstrumentationRunner 'com.github.tmurakami.dexopener.DexOpenerAndroidJUnitRunner'
    }
}

dependencies {
    /* Mockito */
    androidTestImplementation "org.mockito:mockito-android:2.18.3"
    androidTestImplementation 'com.github.tmurakami:dexopener:0.12.1'

    /* Dagger */
    kapt 'com.google.dagger:dagger-compiler:2.15'
    kapt 'com.google.dagger:dagger-android-processor:2.15'
    implementation 'com.google.dagger:dagger-android:2.15'
    implementation 'com.google.dagger:dagger-android-support:2.15'
    kaptAndroidTest 'com.google.dagger:dagger-compiler:2.15'
    kaptAndroidTest 'com.google.dagger:dagger-android-processor:2.15'

    /* Dagger mock */
    testImplementation 'com.github.fabioCollini.daggermock:daggermock:0.8.4'
    testImplementation 'com.github.fabioCollini.daggermock:daggermock-kotlin:0.8.4'
    androidTestImplementation 'com.github.fabioCollini.daggermock:daggermock:0.8.4'
    androidTestImplementation 'com.github.fabioCollini.daggermock:daggermock-kotlin:0.8.4'
}
```

I will only show the lines we need to add.

- `mockito-android` is for mocking on the Android platform.
- `dexopener` is to solve the problem of `open` in Kotlin which we will talk soon
- `kaptAndroidTest` is for adding dagger support for UI test, why? Because there is something we need to re-write
- `daggerMock` is for making the whole procedure easy by linking mockito mocked object to your tests

### 1.1 What problem does `which Kotlin default compiles to` solve

- Kotlin default compiles your class to `final` class in Java.
- But `mockito` can't mock `final` class on Android.
- `dexopener` is for solving this problem.
- It won't make your production code `open`!

### 1.2 Some lessons learned in a hard way

- You can `open` your code manually but it's buggy because sometimes `mockito` won't tell which class hasn't been `open`ed and will give you some error message which is totally irrelevant. But with `dexopener`, it will mark all things as `open`.
- If you want to mock methods from a `.jar` file. You **HAVE to** `open` it by yourself. No way around it. `dexopener` can't mock the 3rd party library. But you can use `allopen` gradle plugin to make your life a little bit better.

## 2. Basic Idea

The basic idea here is:

- You still generate instances for injection in `@Module`
- But We'll create new `@Component` A only for testing
- This `@Component` will have a method to get that `@Module`
- During tests, we swap the `@Component` that the application use with our component A

Then things are easy:

- Without `DaggerMock`
  - In the `@Module`, instead of return real instance, you just return `mockito` mock.

- With `DaggerMock`
  - You declare the type you want to swap and mock it
  - You can then use the mock.
  - No need to change the `@Module`

## 3. Now let's create the Dagger Modules and Components only for testing

First, create a folder named `debug` at the same level of `main`. Then put a `java` folder in it, and we will start. Will create several files which only used in testing.

### 3.1 Add `@Module` only for testing

```kotlin
@Module
class AppModuleForTest {
    @Provides
    @Singleton
    fun provideSharedPreference(app: Application): SharedPreferences =
        PreferenceManager.getDefaultSharedPreferences(app)

    @Provides
    fun provideABCKey(
        preference:SharedPreferences
    ): BooleanKey = BooleanKey(
        name = "abc",
        value = preference.getBoolean("abc", false)
    )
}
```

Something is different from our previous blog:

- We changed the name to `AppModuleForTest` for more clear and prevent conflicts. Because we already used the name `AppModule` in `src/main/java/..../AppModule.kt`
- We moved the `provideABCKey()` method from `MainActivityModule` here to the `AppModuleForTest` to make it application wide. Because it makes mock easier.

### 3.2 Add `@Component` only for testing

```kotlin
@Singleton
@Component(
    modules = [
        AndroidSupportInjectionModule::class,
        AppModuleForTest::class,
        ActivitiesBindingModuleForTest::class
    ]
)
interface AppComponentForTest: AndroidInjector<App> {
    @Component.Builder
    interface Builder {
        fun appModuleForTest(appModuleForTest: AppModuleForTest):Builder

        @BindsInstance
        fun create(app: Application):Builder

        fun build(): AppComponentForTest
    }
}
```

This is nearly identical to our original version of `AppComponent`, just one change:

- We add an `appModuleForTest()` in the `Builder` interface for swapping modules later when testing.

### 3.3 Add Activity binding `@Module`

```kotlin
@Module
abstract class ActivitiesBindingModuleForTest {

    @ContributesAndroidInjector
    abstract fun mainActivity(): MainActivity

}
```

This is nearly identical to our original version of `AppComponent`, just one change:

- We removed the `(modules = [MainActivityModule::class])` from the `@ContributesAndroidInjector` decorator because all dependencies are now in `AppModuleForTest`. They all become application wide dependencies.

### 3.4 For easy usage in the future

Sounds like a lot, but in fact, it's very easy. Every time you want to add new dependencies for testing:

1. Copy all `@Provides` methods into `AppModuleForTest` to make them application wide dependencies.
2. Add the according activity to `ActivitiesBindingModuleForTest` class.

That's it.

## 4. For those who don't want to use DaggerMock user

Now everything is set up, in the `AppModuleForTest.kt`, instead of returning the real implementation, return the `mockito` mocked object.

**Why I don't use this way**:

It works, but requires lots of code, thinking of this. How could you prepare for another test suites when you want to change the setup value of mocks. You create new `AppModuleForTest` class then swap again?!

Come on, there must be some better solutions to this.

Knowing we can do things like this, is just for better understanding what `DaggerMock` does for us underneath.

## 5. For DaggerMock user

First we create a new file named `espressoDaggerMockRule.kt` in the `androidTest/java/your-package-path/`:

```kotlin
fun espressoDaggerMockRule() = DaggerMock.rule<AppComponentForTest>(AppModuleForTest()) {
    set { component -> component.inject(app) }
    customizeBuilder<AppComponentForTest.Builder> { it.create(app) }
}

val app: App
    get() = InstrumentationRegistry.getInstrumentation().targetContext.applicationContext as App
```

What it does is just swap the `@Module` with our `AppModuleForTest` class. Then we can build the dependency graph. And every time, you mock something in your test, `DaggerMock` will look through this graph, find the `@Provides` method and change the return value for you, so `espresso` will get your mocked version instance instead.

## 6. Write test

This is our activity:

```kotlin
class MainActivity : DaggerAppCompatActivity() {

    @Inject
    lateinit var preferences: SharedPreferences

    @Inject
    lateinit var abcKey: BooleanKey

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        println("Is abc in Preferences: ${preferences.contains("abc")}")
        println("value of abcKey: ${abcKey.value}")

        findViewById<TextView>(R.id.my_text_view).text = abcKey.name
    }
}
```

You will see the `TextView` sets its `text` to the `abcKey` which is an instance of `BooleanKey` and will be injected by `dagger-android`. If you run the app, you will see the value is `abc`.

Which `@Provides` by a method in `MainActivityModule`, but during the test, we will swap with our mocked version. Give it a new value then assert that.

The code for the test is:

```kotlin
@SmallTest
@RunWith(AndroidJUnit4::class)
class DemoInstrumentedTest {

    @Rule
    @JvmField
    var rule = espressoDaggerMockRule()

    @Rule
    @JvmField
    val mainActivityRule = ActivityTestRule(MainActivity::class.java, false, false)

    @Mock
    private lateinit var mockBooleanKey: BooleanKey


    @Test
    fun it_should_show_name_from_mock_object() {
        `when`(mockBooleanKey.name).thenReturn("albert")

        mainActivityRule.launchActivity(null)

        onView(withId(R.id.my_text_view)).check(matches(ViewMatchers.withText("albert")))
    }
}
```

What happens here?

1. We declared a new rule which uses our `espressoDaggerMockRule`
2. We give 2 extra parameters to `ActivityTestRule` to make it not start the activity, such that we can prepare the mock.
3. We use `@Mock` decorator to mock that `BooleanKey`
4. In the test, we change the return value of the `name` property to "albert"
5. Then we `launchActivity`
6. We assert whether the `TextView` has the "albert" or not.

And wow, the test passes!

Elegant, easy and concise code.

## 7. Talk is cheap, show me the code

[DaggerAndroidKotlinExample](https://github.com/Albert-Gao/DaggerAndroidKotlinExample/tree/withTest)

## 8. End

Hope it helps.
