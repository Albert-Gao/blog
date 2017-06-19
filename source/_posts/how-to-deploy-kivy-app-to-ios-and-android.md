---
title: How to deploy Kivy app to iOS and Android
date: 2017-06-14 10:46:14
tags:
  - kivy
  - ios
  - android
---

Kivy is a framework which you could use to build your own mobile app purely in python. If you have any trouble at the deploying stage, I wish this blog could help you. :)

<!--more-->

# Android

1. Install buildozer:

```bash
# via pip (latest stable, recommended)
sudo pip install buildozer

# latest dev version
sudo pip install https://github.com/kivy/buildozer/archive/master.zip
```

2. Create the spec file, running the following command in your folder:

```bash
buildozer init
```

3. Although most of the fields are self-explanatory, it worths mentioning the following fields:

```ini
requirements = python3crystax, kivy, plyer  # put all your dependencies here
android.permissions = INTERNET, WRITE_EXTERNAL_STORAGE  # check official google doc to get these name right
android.ndk_path = /usr/local/Cellar/crystax-ndk/10.3.1_1/  # This is where you indicates the location of your NDK
log_level = 2  # Always open it to 2
```

4. Generate the APK, use the APK file in ./bin/ folder to install

```bash
buildozer android debug
```

5. Or plug your phone, generate and install in one go:

```bash
buildozer android debug deploy run
```

6. Deploy on production environment will need to add a sign tuso the package:
- Manually sign: https://developer.android.com/studio/publish/app-signing.html#signing-manually
- Use `release` rather than the `debug` in the previous command to package

However, the packaging for production is still not stable, I got package without any errors, but failed on install on the real device. Need to look for the updates.

# iOS

You are lucky to see this document (smile)

1. Install Xcode and related SDK

```bash
xcode-select --install
```

2. Install libs for building

```bash
brew install autoconf automake libtool pkg-config
brew link libtool
```

3. Install Cython

```bash
pip install cython  # Doc said must be 0.23, but I used the latest 0.25 without problem
```

4. Download kivy-ios and install:

```bash
git clone git://github.com/kivy/kivy-ios
cd kivy-ios
./toolchain.py build kivy
```

5. Anything happens in step 4, check the first line of toolchain.py if it links to the correct place of where your py2.7 locates

6. Create the Xcode project: (your entry file must be named as `main.py`)

```bash
$ ./toolchain.py create <title> <app_directory>
# Example
$ ./toolchain.py create Salect /Users/albertgao/codes/work/handset
```

7. You will see the a folder named `<title>-ios`, open it and open the project via `xxxxxx.xcodeproj`

8. Go to apple developer center and register as a developer

9. Open your project settings
- CMD + 1 to show the project navigator
- Double click your root folder, the project setting should be shown at the center of screen
- General → Signing → Choose your certificate and select the right team
- Build Settings → Enable Bitcode → No
- If you can't see Enable-Bitcode setting, try click the 'All' section at the top of setting section 

10. Now when you run the project, you will see the error in the console.

11. Every time you change your code, the code will be synced to the Xcode folder, and it will contain all files in your project and there is no way to configure the exception. Only solution here is to create a folder-in-the-middle to solve the problem.

# End

That's all. Hope it helps :)