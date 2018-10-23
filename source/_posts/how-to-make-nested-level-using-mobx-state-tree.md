---
title: How to make nested level using mobx-state-tree
date: 2018-10-23 18:57:05
tags:
  - mobx-state-tree
---

I've heard mobx-state-tree for a while. Today I looked into it, and found it's pretty lovely. Kind of the fat model pattern. Where it could make the code much more cleaner and far more less boilerplate compare to redux. Today, let's see how to make nested level in mobx-state-tree.

<!--more-->

## 1. What do we want

```javascript
{
  ui: {
    screenA: {
      isBookOpen: false,
      selected: 1
    }
  },
  entities: {
    books: ["a","b","c"]
  }
}
```

You can tell from the above shape, that we want all ui state reside under `ui`, and all the entities reside in `entities`. Which means in the future, we can have `screenB`, `screenC` in `ui`, and `stores`, `flowers` in `entities`.

## 2. No object type in MST

You can't write something like `types.model({ screenA: { isBookOpen: false }})`. You need to declare the content of `screenA` in another variable and assign it.

This is how you define `screenA`:

```javascript
const screenAModelDetail = types.model({
  isBookOpen: false,
  selected: 0,
});

const screenAModel = types.model({
  screenA: screenAModelDetail
});
```

For books, it's very simple:

```javascript
const booksModel = types.model({
  books: types.array(types.string),
});
```

## 3. Compose the top level

Now you can invoke the `types.compose` to compose all the nested level. It will flatten them.

```javascript
const storeModel = types.model({
  ui: types.compose(screenAModel),
  entities: types.compose(booksModel)
});
```

What about you want to add another `screenBModel`? You just add it as another parameter like this:

```javascript
const storeModel = types.model({
  ui: types.compose(
    screenAModel,
    screenBModel
  ),
  entities: types.compose(booksModel)
});
```

## 4. Let's do a quick test

Let's get a snapshot of this newly created model.

```javascript
const snapShot = getSnapshot(
  storeModel.create({
    ui: {
      screenA: {
        isBookOpen: true,
        selected: 1,
      }
    },
    entities: {
      books: []
    }
  })
);

console.log(snapShot)
```

You get this:

```javascript
{
  ui: {
    screenA: {
      isBookOpen: false,
      selected: 1
    }
  },
  entities: {
    books: []
  }
}
```

Congrats, you did it! :)