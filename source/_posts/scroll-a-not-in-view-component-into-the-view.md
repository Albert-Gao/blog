---
title: Scroll a not in view component into the view
date: 2018-06-07 11:51:46
tags:
  - javascript
  - react
---

Sometimes, we have a long list, and then we want to locate the list to one of the items that got a change but not currently been shown in the viewport, let's see how to do that in React.

<!--more-->

## 1. Over-engineering

This is a horizontal list. So as a traditional react and redux guy... I first add `ref` for both the list and item, and every time when the matched item should be shown and not in the view, I will get its `offsetLeft`, and dispatch an action to the store, then it will trigger the re-rendering of the list, the list will `scrollTo` to that offset. It mostly works, but very unstable, I get the `offsetLeft` in `componentDidmount`, it seems that the list is not ready even when I retrieved it in the `componentDidmount` .

Then after a while, when I revisiting this code, it occurs to me that when I already got the `ref`... why bother to pass it, the item can scroll itself!

## 2. Get the ref

I use `styled component`, this is how I get the ref.

```javascript
const Box = Column.extend`
  justify-content: center;
  align-items: center;
`;

class ListItem extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

render() {
    return (
      <Box
        innerRef={this.ref}
      >
      </Box>
    );
  }
}
```

## 3. Then just scroll

We will use a javascript `scrollIntoView()`, and you need to call it when the DOM is ready, which means in `componentDidMount`.

```javascript
  componentDidMount() {
    const { isSelected } = this.props;

    if (isSelected) {
      this.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }
```

- `behavior` is for how to scroll, `smooth` will be a not-instant-scroll, so the user can see it's happening
- `block` and `inline` is for the final position.

Check the documentation on [MDN](https://developer.mozilla.org/en/docs/Web/API/Element/scrollIntoView).

## 4. That's it

Beware of the browser compatibility. But seems good to me in some cases.

Hope it helps.
