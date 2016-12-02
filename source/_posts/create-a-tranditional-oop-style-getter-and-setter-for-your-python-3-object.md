---
title: Create a tranditional java style getter and setter for your python 3 object
date: 2016-12-02 15:13:37
tags:
  - howto
  - python
  - tutorial
---

It would be very nature if you want to encapsulate the getter and setter logic to the properties of your class. And it's very easy via python 3 thanks to the new [decorators](https://docs.python.org/3/library/functions.html#property). Let's see how it works.

<!--more-->
## What we wanna achieve
We wanna something like this:
```python
a = lovelypython()
a.myname = "Awesome" # setter case
myobjectname = a.myname # getter case
```

It is easy if you just declare a class like below:

```python
class lovelypython():
    def __init__(self):
        self.myname = "Albert"
```

But let's say you want to modify the getter logic to every time when the user retrieve the `myname` property, you want to add a suffix of `is awesome`. It should ring you a bell to the getter and setter in java, c# or other traditional OOP languages. You can achieve that for python 3 as well.

## a plain object first
```python
class lovelypython():
    def __init__(self):
        self._myname = "Albert"
```
It is a simple python class which initialize a private property, pay attention that I use `self._myname` rather than `self.myname`, via this way, you are indicating this property is for internal use, below is a quote from PEP8:

>_single_leading_underscore : weak "internal use" indicator. E.g. from M import * does not import objects whose name starts with an underscore.

Notice that this is just a naming convention, people can still access this property to modify it.

## Expose the public property (make the getter)
Now let's say that you want to use `myname` as the public property name to expose. Then you just need to use the new `@property` decorator.

Let's add this new method to your `lovelypython` class:

```python
@property
myname(self):
    return self._myname + " is awesome"
```

Pay attention to the name of the method, it is the name of the public property. Now if you initialize an instance for the class, you will see that it works like a charm.

```python
lp = lovelypython()
print(lp.myname) 
#output -> Albert is awesome
```

You will say it is just a plain method which happens to have the same name, but if you try to invoke the method, you will get an error:

```bash
Traceback (most recent call last):
  File "/Users/albertgao/codes/python/test.py", line 10, in <module>
    print(lp.myname())
TypeError: 'str' object is not callable
```

Interesting, right? But it solves our getter thing aside, let's tackle the setter.

## Create the setter
The setter is easy as well:

```python
@myname.setter
def myname(self, val):
    self._myname = val
```

Now you can re-assign the value for the property:

```python
lp = lovelypython()
lp.myname = "Gao"
print(lp.myname)
# output -> Gao is awesome
```

## See them all.
The whole code block is below:

```python
class lovelypython():
    def __init__(self):
        self._myname = "Albert"

    @property
    def myname(self):
        return self._myname + " is awesome"

    @myname.setter
    def myname(self, val):
        self._myname = val
```