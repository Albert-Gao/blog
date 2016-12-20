---
title: How to package android apk via buildozer with Kivy
date: 2016-11-19 16:50:09
tags:
  - kivy
  - android
  - buildozer
---

## 1. Brief:
- Kivy is a framework which enable you to write cross platform app via python, and buildozer is a tool to package your code. Their documentation really sucks, this is why I wrote this to save you tons of time.
- Make sure you have follow through How to run Kivy application via python3 under OS X? and make it work.
- It's tested for Kivy 1.9.1, Python 3.5.2 and Buildozer 0.32 on OS X Sierra 10.12.1
- The first time packaging could be time consuming and throttling your laptop but that is OK, after downloading and compiling the libs, the future packaging could be fast

<!--more-->

## 2. Tips which worth a seperate section
There are 3 sources of documentation for buildozer (Yes, 3 sources...): 
- [[Recommend] Github](https://github.com/kivy/buildozer)
- [Readthedocs.io](http://buildozer.readthedocs.io/en/latest/)
- [Official Kivy site](https://kivy.org/docs/guide/packaging-android.html)

According to my tested experiences, here are their use cases:
- Github: If you want install and find the latest command
- Readthedocs.io: find some specific meanings of parameters
- Official Kivy site: find some introduction to buildozer

## 3. Install buildozer:
```bash
# via pip (latest stable, recommended)
pip install buildozer

# latest dev version
sudo pip install https://github.com/kivy/buildozer/archive/master.zip
```

## 4. Preparation
If this is your first installing and running buildozer, you need to follow this section carefully. Applies to Buildozer 0.32. For the future version, Section 6 may help.
If you have already installed some of them, you can skip it.
```bash
brew install autoconf automake
pip install colorama appdirs sh jinja2 six
```

## 5. Running
- Initialise the configuration file, this will generate a new file in the current project folder named `buildozer.spec`
    - `buildozer init`
- Package, deploy and running on android device (connect your device first)
    - `buildozer android_new debug deploy run`
- If still fails, and even with `log_level = 2`, you couldn't find the actural error, then try modifying the following line in buildozer.spec, works on Buildozer 0.32:
    - from `requirements = kivy`
    - to `requirements = hostpython2, kivy`

## 6. How to make it work (could be helpful even for future version)
The most tough part comes from the fact that buildozer may update the 3rd party libraries it use in furture version, so you need to figure out which libraries it needs.

First of all, open the file named buildozer.spec, find the line, log_level = 1, modify 1 to 2. So that you can see more detailed errors.

Then try to run the command "buildozer android_new debug deploy run" again, figure out which library it lack, you can only find them one by one.

There are currently 2 types of dependency errors:

- Python package 
    - `ERROR: The appdirs Python module could not be found, please install it.`
    - Solution: Install the python module by "pip install appdirs"
- Native package
    - `[WARNING]: Missing executable: autoconf is not installed`
    - Solution: Install it by "brew install autoconf"
    - Some libraries may have the different name, e.g., "libtoolize is not installed", but you should "brew install libtool", hope it helps.

## 7. Miscellaneous
- There will be a consistent error : "libtoolize is not installed" for buildozer 0.32 even you have installed it. Not a problem.
- If it doesn't running or even failed deploying, you can still copy the APK to your device and do a manual install. The APK is located in the bin/ under the current project, if you haven't modified the according lines in buildozer.spec.
- Using the following command if you wanna making a release package:
    - `buildozer android_new release deploy run`
