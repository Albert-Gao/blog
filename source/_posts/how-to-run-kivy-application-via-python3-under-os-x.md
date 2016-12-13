---
title: How to run kivy application via python3 under OS X
date: 2016-11-20 17:29:10
tags:
  - kivy
  - tutorial
  - howto
---

## 1. Brief:
- Kivy is a framework which enable you to write cross platform app via python, and buildozer is a tool to package your code. Their documentation really sucks, this is why I wrote this to save you tons of time.
- Kivy provides a bundle package for OS X, which you can use a executable file named `kivy` to run your code instead of the native `python` one. But if you prefer the pythonic way (as I do), You could use this tested solution as a reference.
- Tested for Kivy 1.9.1, OS X Sierra 10.12.1 and Python 3.5, for python part, I tested 3.5.0, 3.5.1, 3.5.2;
- Couldn't make it via python 3.4.5
- For the future version: If you can't make it running under some specific python version, just try to adopt the python version in the Kivy Mac Bundle. This is how I solve it.

<!--more-->

## 2. Step by step:
- install Homebrew (a package manager for macOS) using the following command if you haven't
    - `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
- Install all the dependencies that Kivy needs via Homebrew
    - `brew install sdl2 sdl2_image sdl2_ttf sdl2_mixer gstreamer`
- Install Cython
    - [Recommend] `pip install cython`
    - the official version may say install a specific version of cython, but if you can't make it work just install the latest
- Install Kivy
    - [Recommend] via the Pip [Release]: 
        - `USE_OSX_FRAMEWORKS=0 pip install kivy`
    - via the Github [Development]: 
        - `USE_OSX_FRAMEWORKS=0 pip install https://github.com/kivy/kivy/archive/master.zip`
- Running!
    - `python3 your_app.py`

## 3. A tested Hello world for those who needs:
```python
import kivy
kivy.require('1.9.1') # replace with your current kivy version

from kivy.app import App
from kivy.uix.label import Label

class MyApp(App):
    def build(self):
        return Label(text='Hello world')

if __name__ == '__main__':
    MyApp().run()
```