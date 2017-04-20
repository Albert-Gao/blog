---
title: Lessons learned from my latest refactoring
date: 2017-04-20 13:20:49
tags:
   - kivy
   - python
   - test
   - architecture
---

Recently, I have refactored a legacy code base. It's a mobile app written via python and using a framework named [Kivy](https://kivy.org/#home). It's quite a happy experience since the old one is good start for a refactoring, one folder to hold all files, one file to hold all logic, useless-over-complex logic, everything clued together, `global` comes from nowhere, no naming conventions. 

>We don't only deliver products, but also clean code base. That's what we do for a living. 

Most the experiences below comes from my previous practices of mobile dev, web dev and back-end dev. But without any surprising, they all fit in this project. And they should be adoptable to all languages as well.

<!--more-->

## TDD from beginning
This is a new code base, use TDD to code it, there is no wasting time in testing compare to try to locate a bug in a nasty code base.

>The best benefit you will gain from TDD is the confidence when you try to refactor your code base.Because you have fully prepared for the regression tests. 

This is a huge benefit. And by doing TDD, you won't be able to write a function which has tons of lines inside. Great. In most cases without TDD, when you found it's too hard to test a function or you need to mock a lot, that properly means your codes are coupled too much you need to fix them ASAP.

## Begin with the base libraries rather than UI
Somebody from the BDD world loves to start from the perspective of user that means start with the UI. But I prefer the inside-out way, test the all the base module first, then to the UI. The reason is when you go to the UI part, the data is already prepared. So you just need to test the styling part, interaction part which are belongs to the UI. Sounds like more separated logic: implement the business logic, then the UI to represent that logic.

## Folder structure is crucial
To make your folder tidy is a key to success. It means find things much more faster, and quite a visual pleasure. I used the following one.

```bash
# [] == folder
--[project root]
----[UI]
------[ComponentA]
--------ui.kv
--------A.py
------[ComponentB]
--------ui.kv
--------B.py
----------[SubComponentB]
------------ui.kv
------------B_C.py
----[Lib1]
------BaseClass.py
------ChildClass.py
----[Utils]
------Tools.py
------DEFAULT.py
----[tests]
------[test_UI]
------[test_Lib1]
--------test_BaseClass.py
------[test_Utils]
--------test_Tools.py
```

Besides the `tests` folder, folders like `UI` and `Lib1` is a module which means you need to put a empty `__init__.py` in it in order to `import` its module.

What's the difference between `Lib1` and `Utils`?
`Lib1` are something you need for your fundamental features, `DataStore`, `Routes`, etc. `Utils` just like a `util` class, which provide with bunch of function which is ready to use like `get_current_time_in_XXX_form()`.

**Two things here:**
1. I don't like the idea that the test files should sit by the side of your file-to-be-tested. I like them to sit in the `tests` folder. But feel free to change if you love that convention. It's good too since it's easy for refactoring. But I just like the visual clean way. :)

2. Separate the UI and logic is a no brainer. But separating the UI, separate them in a component based logic. And you will locate the problem very easily via this hierarchy.

## When import, import in a meaningful order
Sometimes you just need to import a lot. The very top section of your file will soon become a garbage bin which you don't want to see. So some orders should be adopted here, I love this order.

1. python module always on top.
2. framework module comes second
3. your own libs go last.

When different modules in a bundle, try importing them in a meaningful order, like UI -> libs -> Utils. Something like this:

```python
# 1.python built-in
import socket
import pickle

# 2.framework
from kivy.app import App
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.core.window import Window

# 3.your own module
# UI
from UI.MainTabs.MeTab.MeTab import MeTab
from UI.MainTabs.MeTab.MeTabNonReg import MeTabNonReg
# Libs
from Stores.UserStore import UserStore
# Utils
from Utils import Tools
from Utils import DEFAULTS
```

## Naming convention means a lot.
Every linting tool has a naming convention, it makes your code more readable. In python, it means a lot too. You just don't want to code to look like a Java code, right? PEP8 is your friend here, and when it comes to naming widgets, I personally love the combination of [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation) and python rule. That means put the type of the widget at the front then with its name, it will make your widgets super clear. A old habbit from my old VB6 coding experiences.

```python
# A text field
txt_name.color = [0,0,0,0]

# A picture widget
pic_user.source = "/pics/head.png"

# A list
lst_posts.disabled = False
```

You can distinguish a variable between a UI component and a python variable very easily just by looking at its name.

## Fixture is your solution to reduce boilerplate codes
There are always something you need to prepare when you try to test. A clean object or an object with some specific values. Let's say that you want to test 3 cases for an object, with a json value, with string or a class. You can combine them into one `fixture`. 

```python
@pytest.fixture(params=[test_json, test_string, test_class])
def get_test_base_store(request):
    return [BaseStore(data=request.param), request.param]
```

Then `pytest` will test 3 cases for you.

## Do not hard code anything
Hard code is a nest of potential bugs. This is some bugs which the compiler can't check for you.

```python
# bad
if file_name == "date.json":
   return current_date
elif file_name == "time.json":
   return current_time

# good
if param == PARAMS.DATE:
   return current_date
elif param == PARAMS.TIME:
   return current_time

# extra file. PARAM.py
DATE = 'date.json'
TIME = 'time.json'
```
Now you can change the name of your file as often as you want, and no typo will be there at all.

You can use `Enum` as well, they are available to python 3 and a package to python 2.

## Do test your modules with only constants
Follow the above one, what happened after you have separated your default values into one file? You need to test them! Why? Because when you change them, it may make your whole code base crash because you don't how much code are out there which rely all the variables. And the test is easy.

Let's say you have a class like this:
```python
class DEFAULT_NAMES:
    # Name of the folder
    CACHE_FOLDER = "cache/"
``` 

Your test cases could look like this:
```python

def test_if_there_are_str_typed_names_attributes_in_DEFAULT_class():
    from Utils.DEFAULTS import DEFAULT_NAMES

    assert isinstance(DEFAULT_NAMES.CACHE_FOLDER, str)
    assert DEFAULT_NAMES.CACHE_FOLDER is not ""
```

With this test case, you can ensure 3 things:
1. There is a attribute named `ALL_CACHE_FOLDER` in the class `DEFAULT_STORE_NAME`
2. This attribute is `str`.
3. It is not empty.

## xFail some cases to let things going
Sometimes the tests could be failed even your own code is right. It may caused by a 3rd party library. As long as it won't crash your code, there is no need to stuck here. You can safely make it using the decorator `@pytest.mark.xfail`. Then deal with it later.

## Refactor the test cases after code refactoring
When I start to test, I like to start with test if there is a module of something like that, to form the folder structure first. Something like below.

```python
def test_if_there_is_a_MainTab_module():
   from UI.MainScreen.MainTab import MainTab
```

But soon as your tests grow, you will learn the constraints here, you need to `import` this module in every test function. It will make it slow and meaningless, you can surely `import` them at the head of file or use a fixture to wrap them.

## Use test coverage tools to detect non-tested branch
Via TDD, it should be not that hard to get a 100% coverage very easily. But sometimes due to the framework you are using, it might be a little bit tricky to test all your code base (Like testing the UI part of a Kivy app). Then you need to test them as much as possible. Use a test coverage tool to find the branch that haven't tested by the tests and decrease the number of them.

## Explain your intention in the test function name
> We love documents when we learn things, but we hate documents when we write our own codes.

Anything worse than don't know what a variable is, is the unclear of a test. If you can't figure it out by seconds, you are wasting time. Something I love from the Javascript world is that how clear an intention of a test could be, something like this:
```JavaScript
describe("A suite is just a function", function() {
  var a;

  it("and so is a spec", function() {
    a = true;

    expect(a).toBe(true);
  });
});
```

And you can do that in python too, just make the name more clear:
```python
def test_if_the_constructor_takes_3_parameters():
    test_store = BaseStore(path=test_path, file_name="test.json", data="super")
```

## Run whole tests after each refactoring even you just change a little
Every time after a refactoring, run your whole test cases again. At first, you will find it will always pass. But soon as your code base grows, you will find the failed cases often. 

> Will my previous change affect other features? Just shut up and run the tests.

Since most of your codes are covered by test cases. The easiness to check if one change will affect another is such a pleasure.

## End
Consider that maintainability is such important, some times even more important than so-called performance issue. We want our code base to be tidy since this is our job, this is what we do for a living. Shipping ugly code will not only hurt yourself, but your team as well.