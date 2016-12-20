---
title: How to save a python object to disk and retrieve it later?
date: 2016-12-02 11:37:24
tags:
  - python
---

Objects are somethings which exists at run time, if we want to maintain its status across sessions, we need some intermediate technology such as serialization. With serialization you could flush the objects to the disk to make it persistent and deserialize it afterwards to convert it back from binary form to a runtime object.

<!--more-->

## 1. About the procedures:
The cases here are very simple, just 2:
- **Serialization:** Save an object to disk with a binary form
- **Deserialization:** Retrieve an object from a file

Python comes with a handy library called `pickle` which tackles this situation nicely.

## 2. Serialization : Save an object to the disk
We need to use `pickle.dump()` method:
    
```python
pickle.dump(your_object, file, pickle.HIGHEST_PROTOCOL)
```

You can use the handy `with` statement to write a object to the disk

```python
with open("super.file", "wb") as f:
    pickle.dump(self, f, pickle.HIGHEST_PROTOCOL)
```

You should notice that the file I will write the object to is named `super.file` rather than `super.txt` to imply that this file will be binary based rather than plain text.

## 3. Deserialization : Convert the file to python object
We will use `pickle.load()` method.

and it is as simple as `pickle.dump()` :

```python
dump = pickle.load(file)
```

As previous, an example with `with` statement:

```python
with open("super.file", "rb") as f:
    dump = pickle.load(f)

    # Now you can use the dump object as the original one  
    self.some_property = dump.some_property
```

## 4. End
With this `pickle` library under your belt, you could wrap it to make your own persistence solution in a decent manner.
Notice that this is just a simple intro to the `pickle` library. There are more methods for you to explorer. The official documents can be found here: [Python 2.7](https://docs.python.org/2.7/library/pickle.html) or [Python 3.5](https://docs.python.org/3.5/library/pickle.html).