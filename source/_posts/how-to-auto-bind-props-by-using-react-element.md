---
title: How to auto bind props by using React element
date: 2017-10-28 23:57:03
tags:
  - react
  - javascript
---

Binding `Props` to the component is a tedious work in `React`. Especially when you create a form. You may wonder, how to automatically bind these `props` to some components? Yes, you can, by using `React` elements.
And you can do more things, like creating elements and inserting them. Which means you can modify the component tree during runtime. Let's start.

<!--more-->

## What is React element

Let's start from a [quote](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html):

> An element is a plain object describing a component instance or DOM node and its desired properties.

When you are writing a `react` app, you are always dealing with `react` element, but it hides underneath by `babel`. Which is, when you write a `JSX` like this:

```xml
<p className='blog'>
  <b>
    Start!
  </b>
</p>
```

During compile time, `babel` will transpile the `JSX` to function call which use `React.createElement()`, and the result looks like this:

```javascript
{
  type: 'p',
  props: {
    className: 'blog',
    children: {
      type: 'b',
      props: {
        children: 'Start!'
      }
    }
  }
}
```

It always comes with two properties:

- `type`: (`string` | `ReactClass`)
- `props`: `Object`.

When the `type` is `string`, it represents a `Dom Node`. Otherwise, it will be a user-defined component.

```javascript
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}
```

And when it's not a `string`, `React` will call the related function to generate its element representation. And it will do it recursively until finally, it has a component tree to do its famous diff.

## React.Children API

You know there is a `prop.children` for you to access the children, most of the time, you just directly render it or call it in render function. But when you want to modify its behavior, you need to use `React.Children`, it will iterate through the `children` or `count` it.

## Let's solve a problem

Let's say you are in component A, there are multiple child components, which you need to bind part of the component A's `state` to them as `props`. You don't want to repeat yourself.

You want to have an `AutoBind` wrapper like this:

```xml
<AutoBind>
  <Item name="item1" />
  <Item name="item2" />  
</AutoBind>
```

Such that, the inside `<Item>` component could receive the following `props`:

```xml
  <Item
    name="item1"
    value={this.state.item1.value}
  />
    <Item
    name="item2"
    value={this.state.item2.value}
  />
```

This is an extremely simple example, but I know you already see its power in production. :D

## Let's start creating the AutoBind

```javascript
function AutoBind (props) {
  const { componentState, children } = props;
}
```

It needs to receive one `prop` which is the `state` of component A, so it could use to bind, the `children` `prop` will always be there when you have `children` component.

So you use it like this:

```xml
<AutoBind componentState={this.state}>
  <Item name="item1" />
  <Item name="item2" />
</AutoBind>
```

## Now, let's loop through the children

```javascript
function AutoBind (props) {
  const { componentState, children } = props;
  return React.Children.map(children, child => {
    // start to processing the child
  });
}
```

We will use the `React.Children.map` to do the loop, the 1st parameter is the `children` to loop, and the 2nd parameter is the value during each loop, very similar to the ES6's `forEach` or any other loop syntax. Then inside that curly brace, you can anything you want to that `child`, but remember:

> Always return a `React element`.

## Let's bind

```javascript
function AutoBind (props) {
  const { componentState, children } = props;
  return React.Children.map(children, child => {
    // start to processing the child
    const childName = child.props.name;
    return React.cloneElement(child, {
      value: componentState[childName].value
    });
  });
}
```

First we get the `name` of the children, `<Item name="item1" />`. Then we call `cloneElement`, which will simply clone the 1st parameter which should be a `react element`, with the new `prop` as the second parameter.

You may say that according to the statement here, it seems that the 2nd parameter will become the final `prop` of our result. Don't worry, the original `prop` will be there, and will be merged with the 2nd parameter. Which means, the final `prop` for the `<Item>` will be:

```javascript
{
  name: 'item1',
  value: {this.state.value}
}
```

rather than:

```javascript
{
  value: {this.state.value}
}
```

Now it works! No matter how many items are there, from `1` to `n`, you will always bind them with this `<AutoBind>` statement. And I believe you can start from this simple example to implement your own complex logic.

And don't worry, it's pretty quick:

> The cost of creating `React element` is much much more quicker compare to the DOM manipulation because nothing happens on DOM yet, it's after all just a function call like any other plain javascript code. And this is why `React` could be such fast.

## Add more weapons to your arsenal

You may notice the above code is pretty fragile in production because not only `React element` is available in the `JSX` representation. It could embed `javascript representation` as well!

And some element may not have `name` prop at all!

Well, remember the following:

1. Use `React.isValidElement()` to verify if the variable is a `react element` or not.
1. Anything passes the 1st check, `if (typeof child.type === 'string')`, it must be a HTML tag. otherwise, it's your own component.
1. `React.cloneElement` receives a 3rd parameter as the `children` of the element to clone.
1. `if (child.hasOwnProperty('children'))` means it has children. You need to parse it recursively.
1. `React.Children.count(children)` will count the number of the children.
1. `React.Children.only(children)` will make sure you only want to receive one `child`, otherwise, it will throw an error.
1. `React.Children.toArray(children)` will return the children opaque data structure as a flat array with keys assigned to each child. Useful if you want to manipulate collections of children in your render methods, especially if you want to reorder or slice this.props.children before passing it down.

## End

Hope it helps.

And, if you have interests, check my new lib [`veasy`](https://github.com/Albert-Gao/veasy): 

>A comprehensive react form solution which aims to eliminate all tedious logic. :)

It uses the auto bind strategy to recursively bind the state to each component which includes in the `schema`.

Thanks for reading. :)
