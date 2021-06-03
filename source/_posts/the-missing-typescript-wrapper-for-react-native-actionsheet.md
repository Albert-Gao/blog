---
title: The missing Typescript wrapper for React native ActionSheet
date: 2021-06-03 11:32:15
tags:
  - react-native
  - typescript
---

For menus on React native. I still love ActionSheet, and I use `@expo/react-native-action-sheet`, yes, you can use it in non-Expo React native project, pretty good. An universal ActionSheet API for Android, iOS and Web. Great! The interface is 100% match the original RN ActionSheetIOS, with some additional settings for Android and Web.

Everything works perfectly, with a problem, the signature of that function `showActionSheetWithOptions()` generates too much boilerplate everytime I use it. It destroyed the simplicity of the ActionSheet.

In this blog, let's make it simple again, if you just use RN's ActionSheetIOS, this blog still helps you for cleaner code, if you are using Javascript, it helps too.

<!--more-->

## 1. The problem of the original function

```javascript
ActionSheetIOS.showActionSheetWithOptions(
  {
    options: ["Edit", "Remove", "Cancel"],
    destructiveButtonIndex: 1,
    cancelButtonIndex: 2,
  },
  (buttonIndex) => {
    if (buttonIndex === 0) {
      // Edit
    } else if (buttonIndex === 1) {
      // Remove
    }
  }
);
```

Seems simple, but you can soon imagine few problems here, what if we are adding more options, then we need to manage the `destructiveButtonIndex` or `cancelButtonIndex`, and that `if-else` callback will just grow big without any control. And what about the mapping between the button label and the callback, they use index for the `if` check, everytime we add or remove, we might need to re-map everything. Can we do anything to make it better?

## 2. What about something like this?

```typescript
showActionSheetWithOptions(
  ...createActionSheetOptions({
    title: "Update the watchlist",
    description: "change the settings of this watchlist",
    isCancelable: true,
    buttons: {
      Edit: handleEdit,
      Remove: handleRemove,
    },
    destructiveButtonLabel: "Remove",
  })
);
```

So, here, You are still use `showActionSheetWithOptions`, the only difference is the `createActionSheetOptions()` function, you use this new readable object to define your ActionSheet.

```javascript
{
    title: "Update the watchlist",
    description: "change the settings of this watchlist",
    isCancelable: true,
    buttons: {
      Edit: handleEdit,
      Remove: handleRemove,
    },
    destructiveButtonLabel: "Remove",
}
```

When you use it, you just destruct the return value into the original `showActionSheetWithOptions(...createActionSheetOptions({}))`.

You can imagine this scales well even you have loads of buttons.

Everything is descriptive by its parameter name, the only differences is that `buttons` parameter, instead of an array, we are using an object here, where the key is the button label, and the value the callback handler of that button.

The `destructiveButtonLabel` should equal to one of the keys from that `buttons` object. Even better, if you are using Typescript, the `destructiveButtonLabel` will be typed-checked, if you put anything that is not key of that `buttons` object, an error will pop up.

## 3. Show me the code

I will put two versions here, Typescript and Javascript.

**Typescript**

```typescript
import type { ActionSheetProps } from "@expo/react-native-action-sheet";

export function createActionSheetOptions<
  Buttons extends Record<string, () => void>
>({
  title,
  description,
  buttons,
  isCancelable,
  destructiveButtonLabel,
}: {
  title: string;
  description?: string;
  buttons: Buttons;
  destructiveButtonLabel?: keyof Buttons;
  isCancelable: boolean;
}): Parameters<ActionSheetProps["showActionSheetWithOptions"]> {
  let options = [];
  let buttonCallbackMappingToIndex: Array<() => void> = [];

  Object.entries(buttons).forEach(([key, value]) => {
    options.push(key);
    buttonCallbackMappingToIndex.push(value);
  });

  if (isCancelable) {
    options.push("Cancel");
  }

  const cancelButtonIndex = options.length - 1;

  const actionSheetOptions: Parameters<
    ActionSheetProps["showActionSheetWithOptions"]
  >[0] = {
    title,
    message: description,
    options,
    cancelButtonIndex,
  };

  if (destructiveButtonLabel) {
    actionSheetOptions.destructiveButtonIndex = options.findIndex(
      (text) => text === destructiveButtonLabel
    );
  }

  return [
    actionSheetOptions,
    (buttonIndex) => {
      if (buttonIndex !== cancelButtonIndex) {
        buttonCallbackMappingToIndex[buttonIndex]();
      }
    },
  ];
}
```

And here comes the Javascript version

```javascript
export function createActionSheetOptions({
  title,
  description,
  buttons,
  isCancelable,
  destructiveButtonLabel,
}) {
  let options = [];
  let buttonCallbackMappingToIndex = [];

  Object.entries(buttons).forEach(([key, value]) => {
    options.push(key);
    buttonCallbackMappingToIndex.push(value);
  });

  if (isCancelable) {
    options.push("Cancel");
  }

  const cancelButtonIndex = options.length - 1;

  const actionSheetOptions = {
    title,
    message: description,
    options,
    cancelButtonIndex,
  };

  if (destructiveButtonLabel) {
    actionSheetOptions.destructiveButtonIndex = options.findIndex(
      (text) => text === destructiveButtonLabel
    );
  }

  return [
    actionSheetOptions,
    (buttonIndex) => {
      if (buttonIndex !== cancelButtonIndex) {
        buttonCallbackMappingToIndex[buttonIndex]();
      }
    },
  ];
}
```

## 4. End

Hope it helps

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
