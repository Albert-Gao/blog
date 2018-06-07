---
title: Render screen or tab only when it has been displayed in React Navigation v2
date: 2018-06-04 20:21:27
tags:
  - react-native
  - react-navigation
---

`React navigation` `v2` is a library for handling navigation in `React Native`. When you are using Tab / Screen, maybe you only want to render it when it is been displayed. Otherwise, something like re-rendering multiple lists in multiple tabs. That's a disaster... Let's see how to do that.

<!--more-->

If you come from the web. Just like in `react-router`, in react navigation, the `navigation` prop will be changed to cause re-render. And when you are like me, use one same list component for multiple tabs, you will have problems when trying to figure out how to not-render and re-render at the proper time. But that is something we will solve today.

## 1. How to know that a tab is been entered or exited

React navigation provides a `this.props.navigation.addListener` method where you can subscribe the events.

you can use it like this

```javascript
componentDidMount() {
  const { addListener } = this.props.navigation
  const { isDisplayed } = this.state

  this.listeners = [
    addListener('didFocus', () => {
      if (isDisplayed !== true) {
        this.setState({ isDisplayed: true })
      }
    }),
    addListener('willBlur', () => {
      if (isDisplayed !== false) {
        this.setState({ isDisplayed: false })
      }
    }),
  ]
}
```

And unsubscribe like this:

```javascript
componentWillUnmount() {
  this.listeners.forEach(
    sub => { sub.remove() },
  )
}
```

- You can add the listeners to an array when `componentDidMount`
- unsubscribe them when `componentWillUnmount`
- Then you can use `this.state.isDisplayed` to check the status

> One **crucial** thing to remember, when you subscribe using that arrow function `addListener('didFocus', () => {})`, the context inside that lambda is not your current component, so you need to refer to an outside variable like I use `isDisplayed` rather than refer to `this.state.isDisplayed` directly, because that is not the same.

## 2. You can use 4 events

According to the [official doc](https://reactnavigation.org/docs/en/navigation-prop.html#addlistener-subscribe-to-updates-to-navigation-lifecycle):

- `willBlur` - the screen will be unfocused
- `willFocus` - the screen will focus
- `didFocus` - the screen focused (if there was a transition, the transition completed)
- `didBlur` - the screen unfocused (if there was a transition, the transition completed)

## 3. Let's implement shouldComponentUpdate

Two cases here:

1. The screen is about to displayed (from `false` to `true`)
2. The screen is been displayed (`true`) but `props` has been changed (which means its content is updating, the component should re-render)

```javascript
shouldComponentUpdate(
  nextProps,
  nextState,
) {
  const { isDisplayed } = this.state
  const { dataForRender } = this.props

  return (
    (!isDisplayed && nextState.isDisplayed) ||
    (isDisplayed && dataForRender !== nextProps.dataForRender)
  )
}
```

> You might think why not just `nextState.isDisplayed === true`. Well, not only it will not cause re-rendering when the screen has been displayed but props has been changed. But also it will cause the tab that is been exited to re-render. Which means, when exit `tab2` to `tab1`, both `tab1` and `tab2` will be re-rendered which is not what we want.

## 4. End

Anyway, you get it. Hope it helps.
