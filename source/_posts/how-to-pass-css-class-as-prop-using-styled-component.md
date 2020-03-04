---
title: How to pass css class as prop using styled component
date: 2018-10-10 22:42:10
tags:
  - css
  - styled-components
---

Styled components will be good if you use it from start, but things could be tricky in terms of mixing it up with other libraries or even your own code. Today, I will show you how to use styled components to generate css class and pass it to the 3rd party lib or your own component.

<!--more-->

## 1. Pass a CSS class

Let's say that you have a component called `<DatePicker>` and it receives a prop named `className` like this: `<DatePicker className="my-css-class">`

```javascript
const StyledMyPart = styled(DatePicker).attrs({
  className: "my-css-class"
})`
  &.my-css-class {
    font-size: 60px;
  }
`;
```

Then when you use `<StyledMyPart>`, the `className` prop has already beed resolved when you wrap it with styled components.

## 2. Pass CSS directly

Sometimes you want to pass `css` as prop and mix it up in the receiver component.

Firstly, your component should be able to process the passed-in `css`:

```javascript
import styled from "styled-components";

const Box = styled.div`
  color: red;
  ${props => props.addCSS}
`;

const DatePicker = () => <Box>DatePicker</Box>;
```

Secondly, declare the `css` style.

```javascript
import { css } from "styled-components";

const myCSS = css`
  font-size: 60px;
`;
```

Lastly, pass it down to the child component.

```javascript
<DatePicker addCSS={myCSS} />
```

Then the `myCSS` will be merged into the `<DatePicker>`

## 3. What about I need to pass css class to a prop not named as prop

Let's say that `<DatePicker>` is a third party library. And it takes 2 `props` in terms of modifying the styled.

One is called `className` and the other is `calendarClassName`.

Then unfortunately, styled component doesn't support it... You have to use the traditional css tooling like css modules or just pass the css class name as string.

I created an issue here:
https://github.com/styled-components/styled-components/issues/2076

## 3. End

Hope it helps. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
