---
title: How to do generic type transferring with jsx in TypeScript
date: 2018-11-18 22:07:02
tags:
  - react
  - typescript
---

So I just encountered a problem where I want to make a better type checking in a `props` of a React component. It's about one `prop` takes an array of certain type X, and in another `prop`: callback, this type X needs to be the parameter of the callback. Let's see how to do that in TypeScript.

<!--more-->

## 1. Declare type for the `props`

```typescript
interface IDropDownProps<T> {
  items: Array<T>;
  getItemProps: (
    item: T,
    index: number,
  ) => object;
}
```

`T` means here we take a generic type `T` and use it through this `IDropDownProps`:

1. The `items` is an array of type `T`.
2. the first parameter of `getItemProps` takes type `T` as well.

In order to share type between these two `props`, we need to have this type `T` declared at the interface level, this is why wen have that `IDropDownProps<T>`.

Now things become interesting because when you apply this `IDropDownProps<T>` to a component, you `MUST` declare what this `T` is.

## 2. Declare the component

Now we need to declare the React component which takes this `IDropDownProps` as its `props`.

### 2.1 For a `class` component

it's just as easy as `class DropDown<T> extends React.Component<IDropDownProps<T>>`.

### 2.2 For a `function component`

With the introduction of `hooks`, `function component` will be the future of React. and remember the name `function component`, now it's been unified to this name compare to the `stateless functional component`, even in the latest version of `@types/react`, now you can use `React.FC` than `React.SFC`.

```typescript
function DropDown<T>({
  items,
  getItemProps,
}: IDropDownProps<T>) {
  // body
}
```

Don't know how to use it with a component been declared like this:

```typescript
const DropDown: React.FC<IDropDownProps<T>>
```

Feel free to comment if you know how.

### 3. Render this component with type `T`

We just declared the component, now we need to use it, the problem is, when we use a component, most of the time, we use `JSX` syntax. With Typescript 2.9, generic type in JSX syntax is possible.

So, you just use it like this:

```html
<DropDown<string>
  items={provinces}
  getItemProps={getItemProps}
/>
```

Now, if you pass a wrong callback like this:

```typescript
const getItemProps = (item: number) => {text: item}
```

The compiler will complain that the expected type for `item` is `string` where you declare it as a `number`.

### 4. End
Hope it helps. :)
