---
title: How to test react-hook-form with react-native-testing-library
date: 2020-07-19 21:02:34
tags:
  - react-native
  - jest
  - test
  - expo
---

I use react-hook-form for both web and react native without a single problem. Great library. When using react-hook-form v6. I encountered an issue where the validation works perfectly in code, but in test, the `errors` object is always empty even for wrong value. Let's see how to solve it. In this blog, I will demostrate how to test `react-hook-form` with `react-native-testing-library` for both iOS and Android within one test through `jest-expo`, and yes, we will use `jest` as the test runner.

<!--more-->

## 1. Setup the project

I will use `expo` for a quick demonstration.

```bash
# select blank template, JS or TS
expo init test-rhf

cd test-rhf
yarn add react-hook-form
yarn add --dev react-native-testing-library jest-expo
```

`jest-expo` is a library from the Expo team to do universal testing here, it will run your tests for every platform you setup, here, because `react-native-testing-library` only supports native device, we will not use web setup, via `expo`'s file extension pick up and the similarities between `react-native-testing-library` and `@testing-library/react`, share one single test file for both web and native devices should be easy, will try them later.

**In `package.json`:**

- add a `script`: `"test": "node_modules/.bin/jest"`
- add `jest` settings:

```json
"jest": {
    "projects": [
      {
        "preset": "jest-expo/ios",
        "setupFilesAfterEnv": [
          "<rootDir>/jestAfterEnvSetup.js"
        ]
      },
      {
        "preset": "jest-expo/android",
        "setupFilesAfterEnv": [
          "<rootDir>/jestAfterEnvSetup.js"
        ]
      }
    ]
  }
```

If you want to rewrite any `jest` rules, you have to write the new rule for each platform like the above example.

**create `jestAfterEnvSetup.js`:**

```javascript
global.window = {};
global.window = global;
```

> If you are using Typescript, you might need to `// @ts-ignore` the above lines

## 2. The application to test

Change `App.js` to the following:

```javascript
import React from "react";
import { Text, Button, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";

export default function App() {
  const { errors, control, handleSubmit } = useForm({
    defaultValues: { name: "" },
  });

  const errorText = errors["name"]?.message;
  const isError = Boolean(errorText);

  return (
    <View style={{ margin: 10 }}>
      <Controller
        control={control}
        render={({ onChange, onBlur, value }) => (
          <TextInput
            style={{ borderColor: "black" }}
            testID="nameInput"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
        rules={{ required: "name can't be blank" }}
        name="name"
      />

      {isError && <Text testID="nameErrorText">{errorText}</Text>}

      <Button
        testID="submitButton"
        title="submit"
        onPress={handleSubmit(async ({ name }) => {
          console.log(name);
        })}
      />
    </View>
  );
}
```

We have a simple form here, one text input for name, and it is required, one submit button for submit the values.

`expo start`, you will see this ugly application, press the submit button with a blank input will lead to an error.

We extract the `errorText` from `errors["name"]?.message`, than use `Boolean(errorText)` to check, if there is an error text, then there is an error.

## 3. The test

Create the file `App.test.js` at the same level of `App.js` with the following content:

```javascript
import * as React from "react";
import App from "./App";
import { render, fireEvent, act } from "react-native-testing-library";

it("should not trigger error for correct values", async () => {
  const { getByTestId, queryByTestId } = render(<App />);

  fireEvent.changeText(getByTestId("nameInput"), "ABCDEFG");

  await act(async () => {
    fireEvent.press(getByTestId("submitButton"));
  });

  expect(queryByTestId("nameErrorText")).not.toBeTruthy();
});

it("should trigger error for empty input", async () => {
  const { getByTestId, queryByTestId } = render(<App />);

  await act(async () => {
    fireEvent.press(getByTestId("submitButton"));
  });

  expect(queryByTestId("nameErrorText")).toBeTruthy();
});
```

We have 2 tests here, one for happy path, and one for unhappy path.
We will mimic the user's behaviour.

For the happy path: If we have a value, the `nameErrorText` should not been displayed.
For the unhappy path: If we don't have a value, then the application should show the `nameErrorText`.

The test should be quite easy to read. I won't explain them here.

The interesting part is:

```javascript
await act(async () => {
  fireEvent.press(getByTestId("submitButton"));
});
```

Why we need to `await act(async()=>{})` the pressing button event? It is because the validation in react-hook-form is always async, so you have to wait until it is finished. (Which is good, because real-world validation could be costy).

If you forget to wrap the `act()`, you will see a red warning: `Warning: An update to App inside a test was not wrapped in act(...)`

## 4. End

Run `yarn test`, you will see all tests pass.

Thanks for reading! Hope it helps.

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
