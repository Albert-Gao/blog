---
title: How to get current app folder in Kivy
date: 2017-05-22 00:13:03
tags:
  - kivy
  - python
---

[Kivy](https://kivy.org/) is a python framework you can use to develop apps for Linux, Windows, OS X, Android and iOS. It's very common to create your folder to store some information which you can access across sessions. But things always get interesting in a across platforms framework since different behaviours for each platforms. Let's discuss them all.

<!--more-->

## 1. First thing first, use join() to link path
Don't combine the path and file name with a hard-code value. Always use the python built-in method `path.join()` to handle this. The reason is simple, different system has different representation for folder, `/` or `\`.
```python
import os

path = 'cache'
file_name = 'settings.json'

# Wrong
final_name = path + '/' + file_name

# Wrong
final_name = 'cache/settings.json'

# Correct
os.path.join(path, file_name)

```
And a better approach is store the path and file_name in a separate module then import it when you need it. So when you need to change it, you don't need to change everywhere.

## 2. Just use the python function
Then you can create folders or files to store your information.
```python
import os

cache_folder_name = 'cache'

if not os.path.exists(cache_folder_name):
   os.makedirs(cache_folder_name)
```
You may think that it should create a folder within your app's current folder. Yes, it is. But iOS doesn't like it. It will complain you don't have sufficient permission.

## 3. Use `__file__` to get the current folder
I used the current approach to get rid of the permission warning. The idea is simple, although you are using the absolute folder, you are actually in your own app's folder, so you should have the permission.
```python
# It will create a 'cache' folder inside your app's folder
CACHE_FOLDER_NAME = os.path.abspath(
   os.path.join(os.path.dirname(__file__), 'cache')
)
```

## 4. But... Kivy way is the best, even it has some quirks.
I still get the permission problem at some stage. Then I realize there is a [`user_data_dir`](https://kivy.org/docs/api-kivy.app.html#kivy.app.App.user_data_dir) API in Kivy which will give you the current app folder depending on different platforms. I read the source code, it's a property. So you could access it via `app.user_data_dir`.

But you'll have a problem. Which is when you have some initializing logic which you happen to separate in another module. It may not work, since when you load that module, the main app won't even there. It will give you an error like:

```python
AttributeError: 'NoneType' object has no attribute 'user_data_dir'
```

You can import module in your code block rather than at the head of you `.py` file, but it may break your logic. 

It turns out that the only way to access it is in the `App` class.

```python
class MyApp(App):

    def build(self):
        self.initilize_global_vars()
        return screen_manager

    def initilize_global_vars(self):
        root_folder = self.user_data_dir
        cache_folder = os.path.join(root_folder, 'cache')

        if not os.path.exists(cache_folder):
            os.makedirs(cache_folder)


if __name__ == '__main__':
    MyApp().run()

```

Or you can use `getattr(self, 'user_data_dir')` to get the value as well. But the above way is more easy.