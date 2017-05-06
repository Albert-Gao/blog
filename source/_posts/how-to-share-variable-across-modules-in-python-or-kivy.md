---
title: How to share variable across modules in Python or Kivy
date: 2017-05-06 20:25:40
tags:
  - kivy
  - python
---

Previously, I answered several questions on Stackoverflow.com about how to share values among different [Kivy](https://kivy.org/). In fact, you can handle it in a python way without using kivy framework at all. Here I will conclude both Kivy way and python way.

<!--more-->
## 1. Global variable
This is an approach using the built-in python keyword - `global`. If the 2 screens are in the same file, use the `global` variable so they can both access. That means, when you want to use the value, no matter for the first time or for later using, you need to use the keyword `global` to let the compiler know that it's not a local variable.

Disadvantage of this approach is quite obvious, that means if you use it too much, the `global` variables will be everywhere in your codebase, and it's hard to trace its value change or later refactoring.

```python
def create_new_number():
   global wow
   wow = 3

def read_new_number():
   global wow
   print(wow)

create_new_number()
read_new_number()

# It will output 3
```

## 2. Use a separate module to hold all the shared variables.
It's simple, use a single module to hold all the variables you want to use. And next, whenever you want to use them, just import this module, and use it. Don't worry, it will always use the latest value no matter how you set it in the original separate module.

### 2.1 A python example looks like this:
```python
# Separate file to hold the shared variables
# Global.py
MY_NUMBER = 0
```

The first file who need this variable
```python
# first.py
import Global

def change_number():
   Global.MY_NUMBER = 888
```

Now read the final result from a third file
```python
# main.py
import Global
import first

first.change_number()
print(Global.MY_NUMBER)

# When you run main.py
# It will output 888
```

### 2.2 Kivy example
Here is the file who holds the variable need to share:

```python
# GlobalShared.py
MY_NUMBER = 0
```

Here is the main file to hold the 2 screen, since now we use `GlobalShared.py` to hold the variable, it doesn't matter whether the 2 screens are in the same file or in 2 different files, here I put them all in `main.py` just for a quick hack. You can separate them if you need.

Every screen has 3 buttons

 - Read: read value of MY_NUMBER 
 - Change: add MY_NUMBER by 1 
 - Go: Go to next screen

You can see how it read the shared variable and change it while the other screen could still access and change the variable.

```python
# main.py
import GlobalShared
from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.screenmanager import Screen, ScreenManager

Builder.load_string("""
<ScreenOne>:
   BoxLayout:
      orientation:'vertical'
      Label:
            text: 'I am ScreenOne'
      Label:
            id: lbl1
      Button:
            text: 'Read'
            on_press: root.press_read()
      Button:
            text: 'Change'
            on_press: root.press_change()
      Button:
            text: 'Go to ScreenTwo'
            on_press: app.sm.current = "screen_2"
<ScreenTwo>:
   BoxLayout:
      orientation:'vertical'
      Label:
            text: 'I am ScreenTwo'
      Label:
            id: lbl2
      Button:
            text: 'Read'
            on_press: root.press_read()
      Button:
            text: 'Change'
            on_press: root.press_change()
      Button:
            text: 'Go to ScreenOne'
            on_press: app.sm.current = "screen_1"
""")


class ScreenOne(Screen):
   def press_read(self):
      self.ids.lbl1.text = "SharedVar is " + str(GlobalShared.MY_NUMBER)

   def press_change(self):
      GlobalShared.MY_NUMBER = GlobalShared.MY_NUMBER + 1
      self.ids.lbl1.text = "SharedVar is now " + str(GlobalShared.MY_NUMBER)


class ScreenTwo(Screen):
   def press_read(self):
      self.ids.lbl2.text = "SharedVar is now " + str(GlobalShared.MY_NUMBER)

   def press_change(self):
      GlobalShared.MY_NUMBER = GlobalShared.MY_NUMBER + 1
      self.ids.lbl2.text = "SharedVar is " + str(GlobalShared.MY_NUMBER)


class ScreenApp(App):
   sm = ScreenManager()

   def build(self):
      ScreenApp.sm.add_widget(ScreenOne(name='screen_1'))
      ScreenApp.sm.add_widget(ScreenTwo(name='screen_2'))
      return ScreenApp.sm


if __name__ == '__main__':
   ScreenApp().run()
```


## 3. Kivy way
The easiest way is Kivy way:
- declare a class-level variable at your `App` class
- Then you can get the value by `app.get_running_app().your_class_variable_name`
- Don't forget `from kivy.app import app`

That means you can use the kivy way to create a middle variable to manage the communication between two modules. this one is quick since you don't need a new file.

Below is the main file to hold the 2 screens, it doesn't matter whether the 2 screens are in the same file or in 2 different files, here I put them all in `main.py` just for a quick hack. You can separate them if you need.

Every screen has 3 buttons

 - Read: read value of MY_NUMBER 
 - Change: add MY_NUMBER by 1 
 - Go: Go to next screen

>Notice: You don't need a separate file now since all your shared variables will stored at your app class like the `MY_NUMBER` in `HandSetApp` below.

You can see how the two screens can access the same shared variable and change it

And I show 2 way here to access the shared variable:
- how to access it in `.kv` file.
   - use the `app.XXXX` to access your app instance from `.kv`
- how to access it in `.py` file.
   - use `App.get_running_app().XXXX` to access the variable

```python
from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.screenmanager import Screen, ScreenManager

Builder.load_string("""
<LoginScreen>:
   BoxLayout:
      orientation:'vertical'
      Label:
            text: 'I am LoginScreen'
      Label:
            id: lbl1
      Button:
            text: 'Read'
            on_press: root.press_read()
      Button:
            text: 'Change'
            on_press:
               app.MY_NUMBER = app.MY_NUMBER + 1
               root.ids.lbl1.text = 'SharedVar is ' + str(app.MY_NUMBER)
      Button:
            text: 'Go to ScreenTwo'
            on_press: app.sm.current = "screen_2"
<MenuScreen>:
   BoxLayout:
      orientation:'vertical'
      Label:
            text: 'I am MenuScreen'
      Label:
            id: lbl2
      Button:
            text: 'Read'
            on_press: root.press_read()
      Button:
            text: 'Change'
            on_press: 
               app.MY_NUMBER = app.MY_NUMBER + 1
               root.ids.lbl2.text = 'SharedVar is ' + str(app.MY_NUMBER)
      Button:
            text: 'Go to ScreenOne'
            on_press: app.sm.current = "screen_1"
""")

class LoginScreen(Screen):
   def press_read(self):
      app = App.get_running_app()
      self.ids.lbl1.text = "SharedVar is " + str(app.MY_NUMBER)

class MenuScreen(Screen):
   def press_read(self):
      app = App.get_running_app()
      self.ids.lbl2.text = "SharedVar is now " + str(app.MY_NUMBER)

class HandSetApp(App):
   MY_NUMBER = 0
   sm = ScreenManager()

   def build(self):
      HandSetApp.sm.add_widget(ScreenOne(name='screen_1'))
      HandSetApp.sm.add_widget(ScreenTwo(name='screen_2'))
      return HandSetApp.sm

if __name__ == '__main__':
   HandSetApp().run()
```

## 4. End
I love the separate module since it's easy and clean. Kivy way is sure quick, but if your variables are too many, your app class will become pretty ugly.