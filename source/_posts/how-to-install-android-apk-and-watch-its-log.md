---
title: How to install android apk and check its log
date: 2016-12-13 14:56:48
tags:
  - howto
  - tutorial
  - android
  - adb
  - logcat
---

When you are developing some cross platform apps, React native, Phonegap, Kivy, Native script, etc. It's very usual that you need to install the package to the real device, and it's totally fine for you to manually install the compiled APK. But if you want more productivity, you need use the `adb` command. Let's get a quick look for all of these.

<!--more-->

## Install you app
- install to the emulator: `adb -e install -r abc.apk`
- install to the device: `adb -d install -r abc.apk`
- Some tips:
    - `-e` stands for emulator.
    - `-d` stands for device.
    - `-r` stands for reinstall, so you can debug with ease. Otherwise, will give you an error, and you need uninstall and install.
- Dealing with the multiple devices:
    - When you have multiple devices and emulators connected to your laotop, the above commands won't work, you need to tell `abd` explicitly which destination you want to install.
    1. Check all the available devices: `adb devices`, It should give you some result like below:
    ```bash
    List of devices attached
    emulator-5554	device
    300453532e029200	device
    ```
    2. install to specific one: `adb -s 300453532e029200 install -r abc.apk`

## Check the log
- via the CLI
    - Mac or Linux: `adb logcat | grep “msg for filter”`
    - Windows: `adb logcat | FINDSTR “msg for filter"`
- via the Android Studio
    1. Open it: 
        - Click the button on bottom: `[6: Android Monitor]`
        - Shortcuts: `CMD + 6` (for Mac)
        - Menu: `View -> Tool Windows -> Android Monitor`
    2. Filter it:
        - Upper-left of this `Android Monitor` window, click that combo menu, and click `Edit filter configuration`
        - The rest is easy, just sort it by package name, `com.myapp.name` etc. Or use tag or other things to filter if you want.
        - And for filtering from all the log messages, you need to make sure the another combo menu set to `Verbose` as well. (Just besides the previous one)