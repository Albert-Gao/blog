---
title: How to test React-Redux hooks via Jest
date: 2019-11-05 12:41:16
tags:
  - react-hooks
  - react
  - jest
  - test
---

I love the new hooks from `redux-react`. It simplify things a lot. Let's see how to test it.
TBH, the solutions can be applied to any `react hooks`.

<!--more-->

## 1. Category

There are 2 kinds of hooks you will encounter.

- Separated custom hooks with / without jsx
- Component with hooks inside

And the essential concepts are: the first one is a unit test method, the 2nd solution is an integration test.

## 2. How to test separated custom hooks

### 2.1 The function to test

Let's say you have a custom hook function:

```javascript
import { useSelector, useDispatch } from "react-redux";
import { Selectors } from "./selectors";
import { Actions } from "./actions";

export const useReset = () => {
  const totalCost = useSelector(Selectors.totalCost);
  const dispatch = useDispatch();

  return () => {
    if (totalCost > 0) {
      dispatch(Actions.reset());
    }
  };
};
```

It is simple, we will dispatch `Actions.reset()` when `totalCost` is greater than 0.

### 2.2 Testing structure

For the testing part, the concept is:

> you can simply `monkeypatch` all the methods that you are using here in terms of changing the behavior when testing.

But in order to make the test easier to follow, we have a flow here:

1. You create a `setup()` outside your test suite to setup the testing environment by creating all the mocks.
1. In your test suites, you `clearMocks` after each test, and remove mocks after running the whole test suite by invoking `restoreAllMocks()` (including the global mock for `react-redux` so it won't affect the other tests).
1. In your test:
   1. Invoke the `setup()` to setup the environment
   1. Invoke the function to test
   1. Assert the result

> Some people prefer to to the setup in the `beforeEach`, but the problem is most of the time, you want to have a conditional mocking according to different test cases, by separating it into its own `setup()`, you can do whatever you want. And the procedures are just more easier to follow.

### 2.3 The code of tests

```javascript
import { useReset } from "./useReset";
import { Selectors } from "./selectors";
import { Actions } from "./actions";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(fn => fn()),
  useDispatch: () => jest.fn()
}));

const setup = ({ totalCost }) => {
  jest.spyOn(Selectors, "totalCost").mockReturnValue(totalCost);
  jest.spyOn(Actions, "reset");
};

describe("useReset", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("Success Case", () => {
    setup({ totalCost: 1 });

    const resetFunc = useReset();
    resetFunc();

    expect(Actions.reset).toHaveBeenCalledTimes(1);
  });

  test("Failure Case", () => {
    setup({ totalCost: 0 });

    const resetFunc = useReset();
    resetFunc();

    expect(Actions.reset).toHaveBeenCalledTimes(0);
  });
});
```

It follows the structure we talked in the previous section. One thing interesting here is the checking of `Actions.reset`. Previously I always return the `moneypatched` version from the `setup()` like `const { resetMock } = setup({ totalCost: 1 });`, and assert it in the test, but seems here we can assert the origin version directly, I am using `jest: 24.9.0`.

## 3. How to test component with hooks inside

TBH, the previous method can cover this case as well, but the problem is, in your component, you can use a lot of `useSelector`, and `monkeypatch` all of them will soon become a burden. So what you can do here, is to mock the whole `<Provider>`, so all the changes will be included. For the other hooks you are using, depends on the implementation, you might still have to `monkeypatch` some of them in the `setup()`.

And more importantly,

> In front-end, 100% coverage of unit tests is, of course, covering more bugs than 100% user flow coverage of E2E /integration tests. But the latter will cover more real-world user bugs. 'cos if the app doesn't work as an integrated bundle, it doesn't matter.

The ideas are simple:

> create a fake store `<Provider>` from the lib `redux-mock-store`, and use it to wrap your component, so every test is more like an integration test involved not only the Components but the selectors as well.

Below is the function to create the mock store, something interesting here is I have `MockApplicationState` as the initial state for testing, and will deep merge the partial state into this `MockApplicationState`. You might not need to do this depends on what you want to test.

```typescript
import React from "react";
import configureStore from "redux-mock-store";
import { mergeDeepRight } from "ramda";
import { MockApplicationState } from "./MockApplicationState";

export const getMockProvider = (partialState: Partial<ApplicationState>) => {
  const mockStore: any = configureStore();
  const store: any = mockStore(
    mergeDeepRight(MockApplicationState, partialState)
  );

  return {
    MockProvider: ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
    store
  };
};
```

So, for a component like this:

```javascript
const UserName:React.FC = () => {
    const firstName = useSelector(Selectors.firstName);
    const middleName = useSelector(Selectors.middleName);
    const lastName = useSelector(Selectors.lastName);

    return (
        // you jsx here
    )

}
```

This is how you test it, we use `enzyme` here for rendering, I know, I know...

```typescript
import { mount } from "enzyme";

jest.mock("react-redux", () => ({
  connect: () => jest.fn(),
  useSelector: jest.fn(fn => fn()),
  useDispatch: () => jest.fn()
}));

const setup = partialState => {
  const { MockProvider } = getMockProvider(partialState);

  // the other mocking you want to do like a custom hook

  return {
    MockProvider
    // you can return all mock instance from here, so you assert then in the tests
  };
};

test("it should work", () => {
  const { MockProvider } = setup();
  // you partial redux state here

  const wrapper = mount(
    <MockProvider>
      <UserName />
    </MockProvider>
  );

  // assert it
});
```

You can use `console.log(wrapper.debug())` comes from `enzyme` to check the structure that you are about to assert.

## 4. End

TBH, I prefer integration test more,

> In front-end, 100% coverage of unit tests is, of course, covering more bugs than 100% user flow coverage of E2E /integration tests. But the latter will cover more real-world user bugs. 'cos if the app doesn't work as an integrated bundle, it doesn't matter.

I saw so many cases where people just try to test the function in a way that is not aligned with the user usage, and that causes a lot of real world bugs, do more integration test. And another side-effect is, now when you refactor, less tests will be touched too, and the codebase will just be more robust.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
