---
title: How to create Kotlin Native iOS project
date: 2018-01-14 12:26:50
tags:
  - kotlin
  - kotlin-native
  - ios
  - gradle
---

Kotlin native is a nice way to share your code between Android and iOS. And you can fully write an iOS app in Kotlin, and it's not like `Xamarin` which has its own convention, Kotlin Native iOS follows Apple's convention which just like write an iOS app in another language.

At least currently when this blog is written. The biggest disadvantage is the toolchain. And the hardest part is setting up the project. In this blog, I will show you 2 different ways to set up the project (without `CLion`, no need to touch that at all), one is to implement everything with Kotlin Native. The second is using Kotlin native as a lib, which generates an iOS framework for sharing the coding with existing `Swift / Obj-C` Xcode project.

This is a very independent way, even in the future, this blog should be still valid I suppose.

Let's start!

<!--more-->

> Check [this blog](/2018/02/22/use-kotlin-to-share-native-code-between-ios-and-android/) if you want to learn more about code sharing between iOS and Android.

## 1. Implement everything in Kotlin Native (Obj-C + Kotlin)

### 1.1 Something to remember

1. I will use `Obj-C` as an example as in the official example.
1. You still need to have the according to `ViewController.h` and `ViewController.m` for the related UI you wanna add logic. Even though it will be kept the default.
1. All UI can be designed via storyboard, it's totally fine.
1. Everything else is in Kotlin. I mean even for codes like `AppDelegate`, you can code in Kotlin.

### 1.2 Blueprint

Basically, you still have a 100% Xcode Obj-C project. The only differences happen in the building phase. Kotlin native will generate the code via `gradle`, and you will swap the `Obj-C` counterparts with it. That's all.

### 1.3 Step by step

1. Create a fresh new Xcode `Single View App` `Obj-C` project. Named it as `myApp` or whatever you want.
1. In that `scene`, add 3 new views, `UILabel`, `UIButton` and a `UITextField`. Create 2 `outlets` in the `Obj-C`, name them as `label`, `textField` and `button`. And connect to the according view in the storyboard. The buttons should have an `action` named `buttonPressed`. Which means:

   - In the `ViewController.h`, you should have the following things inside the `interface`:

   ```obj-c
   @property (weak, nonatomic) IBOutlet UILabel *label;
   @property (weak, nonatomic) IBOutlet UITextField *textField;
   @property (weak, nonatomic) IBOutlet UIButton *button;

   - (IBAction)buttonPressed;
   ```

   - In the `ViewController.m`, you should have an `action method` in the `implementation`:

   ```obj-c
   - (IBAction)buttonPressed {
     // It's empty 'cos the code will be in Kotlin-side.
   }
   ```

1. Open the `Building Settings` of your project:
   - Press the Plus sign and select `New Run Script Phase`: Add a new script named `[KN] Remove original binary`, the command is `rm -f "$TARGET_BUILD_DIR/$EXECUTABLE_PATH"`. We start swapping!
   - Add another `New Run Script Phase` named `[KN] Build binary from Kotlin source`, the command is `./gradlew -p $SRCROOT compileKonanApp`.
   - Add another `New Run Script Phase` named `[KN] Replace binary`, the command is `cp "$SRCROOT/build/konan/bin/iphone/app.kexe" "$TARGET_BUILD_DIR/$EXECUTABLE_PATH"`.
1. Correct the order of all phases, the correct order should be:
   1. Target Dependencies
   1. `[KN] Remove original binary`
   1. Compile Sources
   1. Link Binary With Libraries
   1. `[KN] Build binary from Kotlin source`
   1. `[KN] Replace binary`
   1. `Copy Bundle Resources`
1. Now the iOS part is done. Let's add the Kotlin code:

   1. Create a `src/main/kotlin` folder and a `build.gradle` file at the same level of your Xcode project. So the folders look like this:
      - myApp
        - `myApp`
        - `myApp.xcodeproj`
        - `build.gradle`
        - `src`
   1. Paste the following code to your `gradle` file:

      ```groovy
      buildscript {
          repositories {
              mavenCentral()
              maven {
                  url "https://dl.bintray.com/jetbrains/kotlin-native-dependencies"
              }
          }

          dependencies {
              classpath "org.jetbrains.kotlin:kotlin-native-gradle-plugin:0.5"
          }
      }

      apply plugin: "konan"

      konan.targets = ["iphone", "iphone_sim"]

      konanArtifacts {
          program('app')
      }

      ```

   1. Now you need to make your `myApp` root folder a `kotlin` project with `gradle` support. The easiest way is to open `IDEA`, choose `import project`, and import your newly created `build.gradle`. Everything will be setup for you.

1. Now add a `main.kt` file to your `src/main/kotlin`. The code is:

```kotlin
import kotlinx.cinterop.*
import platform.Foundation.*
import platform.UIKit.*

fun main(args: Array<String>) {
    memScoped {
        val argc = args.size + 1
        val argv = (arrayOf("konan") + args).map { it.cstr.getPointer(memScope) }.toCValues()

        autoreleasepool {
            UIApplicationMain(argc, argv, null, NSStringFromClass(AppDelegate))
        }
    }
}

class AppDelegate : UIResponder(), UIApplicationDelegateProtocol {
    companion object : UIResponderMeta(), UIApplicationDelegateProtocolMeta {}

    override fun init() = initBy(AppDelegate())

    private var _window: UIWindow? = null
    override fun window() = _window
    override fun setWindow(window: UIWindow?) { _window = window }
}

@ExportObjCClass
class ViewController : UIViewController {

    constructor(aDecoder: NSCoder) : super(aDecoder)
    override fun initWithCoder(aDecoder: NSCoder) = initBy(ViewController(aDecoder))

    @ObjCOutlet
    lateinit var label: UILabel

    @ObjCOutlet
    lateinit var textField: UITextField

    @ObjCOutlet
    lateinit var button: UIButton

    @ObjCAction
    fun buttonPressed() {
        label.text = "Kotlin says: 'Hello, ${textField.text}!'"
    }
}
```

The code should be pretty straightforward. As I said, it fully follows Apple's convention, but with a different language. And the binding between `Obj-C` and `Kotlin` happens at that decorator `@ObjCAction`.

Now, in the `Xcode`, build the project, run it, press the button, you will see `Kotlin says: 'Hello ABC'`, if you enter `ABC` in the `text field`.

## 2. Using Kotlin as a lib (Swift + Kotlin)

### 2.1 Blueprint

The project is fully Apple `Swift` Xcode project. Your Kotlin code will be compiled to an `iOS framework`, so it will include the according to `Obj-C to Swift` bindings for the `Swift` code to invoke. And in the swift, you just need to invoke that `framework`. The tricky part is for the simulator and real iOS device, the framework is different ('cos the different architecture), you should make it auto-swap according to the target you will run against. Take easy, we have `bash script` for that part.

### 2.2 Step by step.

1. Create a fresh new Xcode `Single View App` `Swift` project. Named it as `myApp` or whatever you want.
1. Add a `UILabel` to the `scene`.
1. Drag the `UILabel` to the `ViewController.swift` to create an `outlet` and named it as `myLabel`.
1. In the `viewDidLoad` method, let's change the text to `ok` by modifying the code to this:

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    myLabel.text = "OK"
}
```

5. Now let's add the Kotlin support. Create a `src/main/kotlin` folder and a `build.gradle` file at the same level of your Xcode project. So the folders look like this:
   - myApp
     - `myApp`
     - `myApp.xcodeproj`
     - `build.gradle`
     - `src`
1. Paste the following code to your `gradle` file:

```groovy
buildscript {
    ext.kotlin_native_version = '0.5'

    repositories {
        mavenCentral()
        maven {
            url "https://dl.bintray.com/jetbrains/kotlin-native-dependencies"
        }
    }

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-native-gradle-plugin:$kotlin_native_version"
    }
}

group 'nz.salect'
version '0.1'

apply plugin: "konan"

konan.targets = ["iphone", "iphone_sim"]

konanArtifacts {
    framework('nativeLibs')
}
```

7. Now you need to make your `myApp` root folder a `kotlin` project with `gradle` support. The easiest way is to open `IDEA`, choose `import project`, and import your newly created `build.gradle`. Everything will be set up for you.

1. Now add a `main.kt` in your `src/main/kotlin` folder:

```kotlin
package com.nocare.nativeLibs

open class Words {
    fun getWords():String {
        return "I am from Kotlin :)"
    }
}
```

    You get it, we will invoke the `getWords()` from the `swift` side and display the return value as the label text rather than our current `ok`.

9. Invoke the `./gradlew build`, there will be a `build` folder inside your project as `build/konan/bin`, inside the `bin`, there will be 2 folders, `iphone` and `iphone_sim`. Your framework will be there.

1. Move one of the `nativeLibs.framework` to the `build` folder manually, we will need it for a while.

1. Now we have the `framework`. Let's go back to `Xcode` project. Choose your project in the `Project navigator`. From the menu, `File -> Add Files to myApp`, choose the `nativeLibs.framework` from the `build` folder.

1. Add a new `Run script phase` named `[KN] Compile Kotlin Native to iOS framework`, the command is:

```bash
case "$PLATFORM_NAME" in
    iphoneos)
        NAME=iphone
        ;;
    iphonesimulator)
        NAME=iphone_sim
        ;;
    *)
        echo "Unknown platform: $PLATFORN_NAME"
        exit 1
        ;;
esac

"$SRCROOT/../../gradlew" -p "$SRCROOT/../../" "build"
rm -rf "$SRCROOT/build/"
mkdir "$SRCROOT/build/"
cp -a "$SRCROOT/../../build/konan/bin/$NAME/" "$SRCROOT/build/"
```

    You see, we will check your building target from the environment variable and copy the according to source to the `build` folder.

13. Go to the `building phases`, in the existing `Link Binary With Libraries`, drag the `nativeLibs.framework` from the `Project navigator` to the list.

1. Add a new `Run script phase` named `[KN] Embed Frameworks`, drag the `nativeLibs.framework` from the `Project navigator` to the list, choose the `Destination` as `Frameworks`.

1. Now the correct building orders should be:

   1. Target Dependencies
   1. `[KN] Compile Kotlin Native to iOS framework`
   1. Compile Sources
   1. Link Binary With Libraries
   1. Copy Bundle Resources
   1. `[KN] Embed Frameworks`

1. Now open your `ViewController.swift`:

   1. `import nativeLibs`
   1. Inside `viewDidLoad()` method, add the following 2 statements.

   ```swift
   private let words = NativeLibsWords()
   myLabel?.text = words.getWords()
   ```

   You will see that there is even a auto-completion suggestion thanks for the `obj-c bindings.`

1. Now Run your iOS app, enjoy :)

## 3. End

That's pretty all of it. As we use Kotlin native's `gradle` plugin for the building phase, this blog should be future-proof.

And it seems pretty complex at first, but in fact, it's always the same, build the kotlin code and replace its iOS counterpart.

Hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
