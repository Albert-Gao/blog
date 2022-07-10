---
title: React state management libraries in 2022
date: 2022-02-19 10:12:24
tags:
  - javascript
  - react
  - redux
  - es6
---

The React state management library is a constant topic in React community, but seems we are pretty settled recently with some obvious winners. This blog will focus all the popular choices and compare them so one can have a quick understanding of the libraries, and when to use them. You can also take it as a super quick crash course to all the libraries that listed here. (If you feel one not listed, let me know, I will check and add :D )

Let's start.

<!--more-->

## 0. What you will get after reading

- How to use each library in a few minutes
- the opinionated pros/cons and my thoughts
- hopefully easier to make the decision of when to use which

To be noticed, no matter what I said about these libraries, they are all made from great developers in the community (not subjective judgement, they're all pretty well known), and all of them have decent downloads and thus battle tested, you can use them for ANY cases to be honest.

Most of the time, for these libraries, the differences are merely API design level, but this is what matters to us developers, right? We are folks with taste we are just that picky. :)

## 1. The problem

State management in React defines how you manage to share your state within your application, it can be global or just to be shared with a slice of your app, depends on your use cases.

For the React way of sharing state, you have to lift the state up to a level that all components that needs it can access, then pass it as a prop to the component.

The major problem is prop drilling, where sometimes you have to pass several levels down, and some components expose props just for the sake of passing down to their children. It gets worse when refactoring.

The state management libraries come to the rescue. They give you a mean to share the state across components without passing props around. and some other utilities.

## 2. The daily life pattern

This is the critical part for learning anything new, figure out the pattern and learn them in scale. I will categorize these libraries here as a big picture, for an easier understanding.

1. **Structure:**
   - There are 3 categories in terms of how the library would structure your global state.
     1. global:
        - everything in one big object. (of course there are ways to break it down.)
     1. multiple stores:
        - you can have multiple isolated stores, consumed in multiple places
     1. atomic state:
        - instead of create an object shaped store, you have one variable that can be reactive. For example, instead of having `userStore.name`, you just have a variable called `userName` which does the same thing.
1. **Read/Derive from store**
   - This is for getting the data from the store, could be a direct read (`user.name`), or something derived, for example, with a `user.plan` (with a value `paid`) we can derive a variable named `canUserBuy` with a value `true`, it's computed from the state via `user.plan === 'paid'` rather than we manually update a `canUserBuy` state every time. 2 categories here also. All of the libraries support directly read like `userStore.name`.
     1. selector function:
        - `const userName = (userStore) => userStore.name`.
        - since a selector is a function, it can contain logic, `const canUserBuy = (userStore) => userStore.plan === 'paid'`.
        - It's fine to do something like `const name = useSelector(state=>state.name)`, just remember you are creating that `state=>state.name` on every render.
        - `useMemo` is your friend when deriving unless the libraries provide you something out of the box.
        - The problem is if you create these function on the fly within a component, it will create a new function every time the component renders, to lift it outside the component body is the recommended way. But,
          > The performance is not a problem until it becomes a problem.
     1. a `getter` like fashion:
        - like `userStore.canUserBuy`
        - clean and unified way of access the store.
1. **Update the store:**
   - This part is important, since it will dictate how you encapsulate your logic.
     1. Reactish API
        - with a `setState` (from `React.useState`) like function.
        - `setUser(newUser)`
        - `setUser(prevUser => ({...prevUser, name: newName}))`
        - the good part is interface level similarities. the problem of this approach is it does not scale well, especially when the updating logic is complex. This is the time you start to use the `React.useReducer()` :)
     1. with an action object
        - the action part is decoupled from the store itself
        - You fire a function to let the store knows now it's the time to trigger a update. This function does not contain the logic of actual updating but an object to describe your intention.
        - `dispatch({type:'UPDATE_USER_NAME', payload: newName})`
     1. Encapuslated with the store
        - through a data model like API, something like `User.updateName()`,
        - the logic of how to do the update is included in the `updateName()`. The benefit is obvious, easy tracing and better maintainability.
   - You can argue that we should have another category like `directly-mutation` vs `immutable data structure`, but I do not think it's the case, because you can write a very thin wrapper with `immer` to make them all follow the `directly-mutation` way.

With these patterns in mind, it should hopefully pave the way for you to learn future libraries as well.

## 3. The scenarios

We are looking into these 6 scenarios:

1. categorizing
   - It connects the library to the `2. The daily life pattern` section
1. usage
   - how setup, read/derive and update
     - The derive part is fair important, since it is widely used, and most of the time, you want something more than just the original value, if there is an abstraction can make it easier, then it would be very nice.
   - async
     - I feel this part is not much needed nowadays since we are using libraries like `react-query` to handle the network related operations. So most of the time, the store contains no async related stuff at all. But could still be useful if you have some other async stuff to do.
1. middlewares:
   - What about I want to add some global bahaviours to the read/write part?
1. library specific
   - Can this library offer me more?
1. pros/cons and thinking
   - Let's start to be opinionated :)

## 4. The libraries

We will look at the following libraries

- React Context
- mobx
- react-tracked
- redux
- zustand
- jotai
- recoil
- xstate

### 4.1 React Context

- documentation: https://reactjs.org/docs/context.html

The `Context` is an official API to share state.

#### usage:

- Create a context `const MyContext = createContext()` outside the component
- Feed it with an initial value with
  `<MyContext.Provider value={ {name:'albert'} }>{children} </MyContext.Provider>`
- Consume it in the component body via: `const {name} = useContext(MyContext)`, the component must be a children of the above `<MyContext.Provider>`

#### The Problem

When most people think this is the React way of doing things without installing any 3rd party libraries. It actually introduces a problem of re-rendering. The reason is `useContext doesn't let you subscribe to a part of the context value (or some memoized selector) without fully re-rendering.` In other words, any part of the Context changes, all components with this `useContext()` in the body will get re-rendered no matter what.

And no, a `useMemo()` right below the `useContext()` will not save you because the re-rendering is ALREADY happening before even hitting the line of `useMemo()`.

#### The Solution

[Dan Abramov](https://twitter.com/dan_abramov) has a Github comment for this, so essentially, the way is to seprate this `useContext` from the actual rendering. You either wrap the consumer component with a `React.memo()` or `useMemo()` the final rendering part in total.

The detail can be found [here](https://github.com/facebook/react/issues/15156#issuecomment-474590693).

This makes the code to use `Context` in scale grows exponentially, and simply not an ideal candidate for lots of use cases.

Another good practice is to separate the read and write into different `Context`, most of the time, you will use `useState` in combination with a `useContext`.

```javascript
function Component({ children }) {
  const [state, setState] = useState({});

  return (
    // DO NOT do this
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );

  return (
    // DO this
    <MyContext.Provider value={state}>
      <MySetterContext.Provider value={setState}>
        {children}
      </MySetterContext.Provider>
    </MyContext.Provider>
  );
}
```

#### Always remember you can use component composition

For simple use cases, by just using component composition, you can avoid prop drilling problem. For example:

```javascript
// when you are doing this:
<User name="Albert" age={10} />

// instead of let the <User> pass the `name` and `age` down,
// maybe you can just

<UserBox>
  <NameBox>
    <Name>{name}</Name>
  </NameBox>
  <AgeBox>
    <Age>{age}</Age>
  </AgeBox>
</UserBox>;
```

This is a contrived example, but hopefully you get the idea of component composition, via this way, the <User> component does not need to pass the `name` of `age` props down. They will just be rendered in-place.

And this has more benefits then just avoiding props drilling, it provides more flexibilities, now the user can determine how to render the children, even with some logic.

#### When to use Context

1. `Context` is still a good use case for things like an one-time share, for example, the share of a theme, most of the time, you define your design system in a theme object, and it rarely changes through the whole lifecycle of an application until the user wants to swap the dark/light theme.

1. the `Context` is used in a small part of the application rather than a global state managent solution.

1. to share a singleton and manage its lifecycle

### 4.2 MobX

- repo: https://github.com/mobxjs/mobx
- documentation: https://mobx.js.org/README.html
- author: [Michel Weststrate](https://twitter.com/mweststrate) joined Facebook, is also the creator of `mobx-state-tree` and `immer`.

#### Categorizing

- structure:
  - multiple stores
- read/derive:
  - getter
- write:
  - encapsulated setter with built in `directly-mutation` support

#### Usage

```javascript
// create the store
import { makeAutoObservable, runInAction } from "mobx";

const userState = makeAutoObservable({
  // properties becomes observables
  name: '',

  // `getter` becomes computed (derive) property,
  get isUserAlbert() {
    return this.name === 'albert'
  }

  // `setter` becomes mobx actions
  // which is the updater of the store
  set updateName(nextName) {
    this.name = nextName;
  }

  // async updating is happens within a normal async function
  async updateFromRemote() {
    const nameOnServer = await getName();

    // if you want to update the store, wrap it with the runInAction()
    runInAction(()=>{
      this.name = nameOnServer;
    });
  }

  // if you dislike runInAction(), just write a generator function
  // underneath, it will be wrapped with a flow() from 'mobx';
  // just remember do this when calling from the user land,
  // `const res = await flowResult(store.updateFromRemoteFlowVersion())`
  *updateFromRemoteFlowVersion() {
    const nameOnServer = yield getName();

    this.name = nameOnServer;
  }
}
```

```javascript
// share the store
function MobxContextProvider({ children }) {
  return (
    <UserContext.Provider value={todoState}>{children}</UserContext.Provider>
  );
}

const useUserStore = () => useContext(UserContext);
```

```javascript
// consume the store
import { observer } from "mobx-react-lite";

const ToDos = observer(() => {
  const userStore = useUserStore();

  return (
    <>
      <button
        onClick={() => {
          userStore.updateName("Jim");
        }}
      >
        {userStore.name}
      </button>
      <button
        onClick={async () => {
          await userStore.updateFromRemote();
        }}
      >
        Update from server
      </button>
      <>{userStore.isUserAlbert}</>
    </>
  );
});
```

#### Terminology

- the state is called `observable state`
- the updater is called `action`
- the derived value is called `computed`

#### Middlewares

- no built in middlewares system

#### Library specific

- check `autorun()` and `when()` for auto side-effect, the name is pretty self-explanatory.

#### Beware

- always wrap the component with `observer()` when consumes the store
- lazy reading is faster here:
  - Slow: `<Name value={store.name}>`
  - Fast: `<Name store={store}>`, then use `store.name` inside the `<Name>`
- although you should be mobx-ready until here, still I highly recommend to read this before using MobX in scale to prevent any negative aha moment: https://mobx.js.org/understanding-reactivity.html

#### Pros

- A clean way in terms of create and consumes the store. The data model kind of way to create the global state is perfectly fits into human mind when creating state.
- `getter` instead of selector function is just a unbeatable less-overhead!
- multiple stores approach is really good for separation and good for code splitting.
- built-in directly-mutation support
- `autorun()` is handy for outside React side-effect
- `observer()` for free re-rendering prevention
- easy tracing, when everything is from the data model, the initialization, the original data, the derive data, the async action, it's just an one level down tracing compare some other "decoupled" approach, you have to be several levels down to get to the very line.

#### Cons

- The usage of `observer()` makes me feeling that I am using `memo()` everywhere and sort of a pre-optimization...
- has some gotchas when using, so one has to learn the mobx ways of doing things.
- the way of handling the `async` is bit of unclean compare to the other part. But check the above examples and form your opinions.

#### Thinking

> `mobx has too much magic`.

you probably heard this a lot online. It's actually not a problem, since you can always use `console.log()` to debug, and I never have such problem. But if we are talking about something happens outside your code, then yes, there is a lot. But still, this is quite a personal preference.

I personally quite like it, especially in the early days of React, the way you write the store just makes sense. I built a micro-framework for a company with mobx and styled-system, which enables an devOps to be a frontend dev within weeks, and can handle complex async actions without any problems, the data model like approach and selector free for deriving data really helps a lot. `User.isAdult` is just plain better than `const isAdult = useSelector(user=>user.age > 18)`, period. And all the gotchas can be abstracted away. Currently only `Mobx` provides such experiences in an OOP-like way.

Also, the latest version solved my biggest complaint, finally we do not need to write a class for the model, but a plain js object. Consider the problems of setting up the decorator support or write a giant object matcher in the end are really painful. The latest version solves it.

However, I rarely used it nowadays. I have 2 concerns,

- when you use MobX everywhere, the usage of `observer()` will be significant, then you will just blindly wrap all the components since you do not know when it will consume some reactive values, one might say it's good for the performance, but for me, I feel like it's pre-optimization nowadays.
- also, for some side-project, I am afraid I will forget the `gotcha` part months later when I revisit these projects.

This does not change the fact that MobX is a battle-tested, battery-included, and maybe the only library here that has the natural object oriented way of shaping your store with nearly a plain javascript only syntax.

Do give it a try.

#### Something more

- `mobx-state-tree`
  - This library is probably more popular in React native community since the famous ignite template is using it by default. You should be able to pick it up fairly quick after reading this section, it removes all the gotchas of MobX since underneath, it's a immutable data store rather than the usage tracking mechanism based on JS `proxy`. But I rarely use it since nowadays we all get used to Typescript and `mobx-state-tree` has its own APIs of declaring the types, you can derive the TS type from it though. Good to check it out for a solid mobx alternative. (Also had a problem of setting up the default value when declaring a store object :D Properly need to read through the doc more)
- `mobx-react-lite`
  - the main purpose is to use React Context to share the stores rather than a `Provider` from `mobx` package. Also it provides other hook based API for making things observable.
  - was once a little project when React hooks first came out, now it's merged into the mobx core repo,

### 4.3 react-tracked

- repo: https://github.com/dai-shi/react-tracked
- documentation: https://react-tracked.js.org/docs/introduction/
- author: [Daishi Kato](https://twitter.com/dai_shi) is an active developer of the React community, who introduced many different React state management libraries with different APIs. He is probably one of the most famous modern React state management solution provider. :)

#### Why you put this little gem here?

One might be surprised that I include `react-tracked`, but this library solves the problem of React Context, and if you like to manage your state with native React API, this is the one.

#### Categorizing

- structure:
  - multiple stores (each has its own `<Provider>` to wrap with)
- read/derive:
  - selector function
- write:
  - React-ish API, your beloved `useState()` is back, yeah!

#### Usage

```javascript
import { useState } from "react";
import { createContainer } from "react-tracked";

// create the state
const initialState = {
  count: 0,
};
const useMyState = () => useState(initialState);
const Container = createContainer(useMyState);

// share the state
function MyProvider({ children }) {
  return <Container.Provider>{children}</Container.Provider>;
}

// consume the state
function Component() {
  const [state, setState] = Container.useTracked();

  return (
    <button
      onClick={() => {
        setState((prev) => ({
          ...prev,
          count: prev.count + 1,
        }));
      }}
    >
      {state.count}
    </button>
  );
}

// to derive the state
const isNotOne = (state) => state.count !== 1;

function ComponentA() {
  const [state, setState] = useMyState();
  const isNotOneValue = Container.useSelector(isNotOne);
}

// performance optimization

/* when you only want to read: */
const state = Container.useTrackedState();

/* when you only want to write */
const setState = Container.useUpdate();

// destruct these methods for a cleaner usage
export const { useSelector: useMySelector, Provider: MyProvider } =
  createContainer(useMyState);
```

#### Middlewares

- N/A

#### Library specific

- check the `useTrackedSelector` API for using with a selector-free case for the directly-read case when using `react-redux`.

#### Beware

It's a JS `proxy` based solution, so there are gotchas where you might be surprised when using, easy to remember though, just read the [documentation](https://react-tracked.js.org/docs/caveats/) before using.

#### Pros

- Plain React
- Easy to pick up
- `useTrackedSelector` is a good wrapper for logic-less property accessing.
- strong Typescript support

#### Cons

- Plain React. So not much into it. For example, how to encapsulate your complex state updating logic, how to handle the async, that's up to you.
- have some gotchas, just a few though.

#### Thinking

If you love plain React, this would be perfect choice. I love the fact that you can use it either globally as one store or locally with multiple separate stores, for complex state updating, you might want to use it hand in hand with `useReducer()`. After solving the re-rendering problems, it should work very well.

### 4.4 Jotai

- repo: https://github.com/pmndrs/jotai
- documentation: https://jotai.org/docs/introduction
- author: [Daishi Kato](https://twitter.com/dai_shi) Yup, again :)

#### Categorizing

- structure:
  - atomic
- read/derive:
  - selector function
- write:
  - Reactish API

#### Usage

```javascript
import { atom, useAtom } from "jotai";

// create atoms, initial value can be object or array
const nameAtom = atom("albert");
const ageAtom = atom(1);

// then just use
function Component() {
  const [name, setName] = useAtom(nameAtom);

  return (
    <button
      onClick={() => {
        setName("jim");
      }}
    >
      {name}
    </button>
  );
}

// to derive data
const isAdultAlbertAtom = atom(
  (get) => get(nameAtom) === "albert" && get(ageAtom) >= 18
);

// only get the setState function for performance gain
const setName = useUpdateAtom(nameAtom);

// async atom, jotai does not care really, you just write async
// highlight here is, when you useAtom(asyncCountAtom)
// the component will get the <React.Suspend> support, wow!
const countAtom = atom(1);
const asyncAtom = atom(async (get) => get(countAtom) * 2);

// look at this beauty...
const Counter = () => (
  <React.Suspense fallback="Loading...">
    <ComponentWithAsyncAtom />
  </React.Suspense>
);
```

#### Terminology

- atom: an atom is atomic, so just think it as a `useState()` but can be shared across component without prop drilling. a string, a number, an array, you name it.

#### Middlewares

There are no built in middleware mechanism, but since the getter and setter are just plain function, you can built it by your self easily.

#### Library specific

- [19 integrations with other libraries](https://jotai.org/docs/api/utils) out of box, there are some integrations available in `jotai/blahblah`

for example, integrate with `immer` to get the directly-mutate experience is so easy.

```javascript
import { useAtom } from "jotai";
import { atomWithImmer } from "jotai/immer";

const countAtom = atomWithImmer(0);
```

#### Beware

The methonology here is atom, but `jotai` supports object, so nothing stops from creating a redux-like big global state object. But just make sure you know how to make the `jotai` be performant with this case. The official guide can be found [here](https://jotai.org/docs/advanced-recipes/large-objects). Essentially, just 2 new APIs `splitAtom` and `selectAtom` for subscribing to different parts of the state object.

#### Pros

- Reactish API make it feel very React idiomatic
- few APIs to pick up
- You can write updating logic for a derived value!
  - one variation of the `atom` function, is `atom((get)=>any, (get, set, nextValue)=>void)`, the 1st arg is a `getter` and the 2nd is a `setter`. Make it very powerful, Which means, when you happen to have a complex selector like `isLegitUser` in which you derive a boolean with multiple atoms, and happens to have a requirement to update it with complex logic, now not only you can, but they are all co-located together within the same atom, this is GOOD.
- many integrations with popular libs
- official devtools support!
- Support <React.Suspense>
- strong Typescript support

#### Cons

- If you get used to a namespaced state management model, like `userState.isAuth`, while you can still do that with `jotai`, but the complexity would be increased if you just keeping adding things.
- I feel like a file would be hard to manage if you just put loads of atom/derived atom in it, even each of them is atomic and easy enough to digest, but one atom per file might be overkill?

#### Thinking

`jotai` is really nice, there are loads of unique perspective and API design here. I do not have much complaint, and I do want to use in my next big side-project to give it a try in scale. Feel like a `recoil` with simpler API design.

My only concern is the original sin of this Reactish API, `useState(prev=>next)` could be easily be explode with complexity. While you can wrap the purposefully setter in a write atom, just wonder if it scales.

Really a gem!

### 4.5 recoil

- repo: https://github.com/facebookexperimental/Recoil
- documentation: https://recoiljs.org
- author: [David McCabe](https://twitter.com/mcc_abe) is a Facebook engineer, and yes, this repo is within Github `facebookexperimental` namespace.

#### Categorizing

- structure:
  - atom
- read/derive:
  - selector
- write:
  - Reactish API

#### Usage

```javascript
import { atom, useRecoilValue, selector } from "recoil";

// create an atom
const numberState = atom({
  key: "numberState",
  default: 0,
});

// then use it
function Component() {
  const [number, setNumber] = useRecoilState(numberState);

  return <button onClick={() => setNumber((num) => num + 1)}>{number}</button>;
}

// to derive an atom
const aboveFiveState = selector({
  key: "aboveFiveState",
  get: ({ get }) => {
    const number = get(numberState);

    return number > 5;
  },
});

// async atom
const userState = atom({
  key: "userState",
  get: async ({ get }) => getUser(),
});

// if you only want to read an atom
const number = useRecoilValue(numberState);

// if you only want to write to an atom
const setNumber = useSetRecoilState(numberState);
```

#### Middlewares

- it has a concept called `effects` to handle side effects, you can see it as a middleware mechanism

```javascript
const myState = atom({
  key: "myState",
  default: null,
  effects_UNSTABLE: [
    () => {
      // side effect 1
      return () => {
        /* clean up 1 */
      };
    },
    () => {
      // side effect 2
      return () => {
        /* clean up 2 */
      };
    },
  ],
});
```

Did you notice, even the side effect function itself has this vibe of `React.useEffect()`, you run the side effect, then return the clean up function, `recoil` is just that `Reactish`!

#### Library specific

- powerful async support, with utils like `useRecoilStateLoadable()`, `waitForAll()`, `waitForAny()`, `waitForAllSettled()`.

#### Beware

#### Pros

- From FB, so it might be used in scale and get latest React support
- powerful async utils
- the API surface is wide, you have a lot in your arsenal
- devtool is in experiment!
- strong Typescript support

#### Cons

- API interface has more to it than `jotai`. for example:
  - the `string` based key to index my atom, where `jotai` does not use it.
  - use `select()` to write a selector where in `jotai` they are all `atom()`
- has some learning curve to master for the advance async part.

#### Thinking

This is probably the first library introduced the term `atom` to React community. We were excited, and are still excited. It's easy to pick up but yet has lots of new APIs to enhance your experiences. It has performance built into its mind. The async support is just as easy as mark the setter or getter with `async`, it has built-in support for taming concurrent situation.

The `jotai` is a strong competitor in this space, and this 2 have loads of similarities. from a quick glance, you might think,

> "jotai is like a Recoil without that string key",

But there are more to it. Please read the official comparison on [`jotai`'s documentation](https://jotai.org/docs/basics/comparison#how-is-jotai-different-from-recoil?).

### 4.6 Redux

- repo: https://github.com/reduxjs/redux
- documentation: https://redux-toolkit.js.org
- author: [Dan Abramov](https://twitter.com/dan_abramov) joined Facebook. Now it's actively maintained and envolved by [Mark Erikson](https://twitter.com/acemarke).

#### Categorizing

- structure:
  - global store
- read/derive:
  - selector
- write:
  - action object

#### Usage

```javascript
import { createSlice, configureStore } from "@reduxjs/toolkit";

// create a slice
const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    incrementByAmount: (state, action) => {
      // immer support is built-in, just mutate the state, yeah!
      state.value += action.payload;
    },
  },
});
```

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

// share the slice
// step 1: compose your top level state
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// step 2: share it at the very top level
function App() {
  return (
    <Provider store={store}>
      <MyApp />
    </Provider>
  );
}
```

```javascript
// use the slice
import { configureStore } from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";

function MyApp() {
  const counter = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => {
        dispatch(counterSlice.actions.incrementByAmount(1));
      }}
    >
      {counter}
    </button>
  );
}
```

#### Terminology

- reducer
- action
- action creator
- thunk / redux-saga

No, no, no, no, no. Baby, it's 2021, for redux's terminology, we now only have one word.

- slice

It's a new way to write modern redux, a new way to connect reducer/action into one place, now for the majority use cases, you just write one slice. And everything can be derived from it.

#### Middlewares

Of course

```javascript
import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import rootReducer from "./reducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
```

#### Library specific

- [RTK Query (redux-toolkit-query)](https://redux-toolkit.js.org/rtk-query/overview) for handling network request in React hook, integrated with redux naturally, very similar syntax to `react-query` and fully-fledged! It's very\*5 powerful, be sure to check [it](https://redux-toolkit.js.org/rtk-query/overview) out.
- Remember to check `createEntityAdapter()` when creating CRUD like `reducers`.

#### Pros

- probably the most used React state management library
- `@reduxjs/toolkit` is the way to go. there is nearly no boilerplate code, I have the feeling that the amount of knowledge you have to learn in order use Redux like a pro is less than MobX nowadays.
- The `rtk-query` integration is just plain beautiful and powerful
- the `redux-devtool` never gets updated for years but still works like a charm!
- strong Typescript support

#### Cons

- Do you think the global state approach will hurt the code splitting when the codebase scales?
- `rtk-query` is too strict to use in complex async scenarios. It supports standard REST API really well. But for my case, I have some composed async operation like `deposit()`, in its implementation, it's not one call, it's multiple calls, while `react-query` can handle this quite easily since it does not have any opinion on how you write your async function, `rtk-query` has a strict format in terms of how you write your async operation, not a big fan, it's just so hard to get things done `rtk-query` if you have such usecases.
- `async` without `rtk-query` needs some minor setup.

#### Thinking

After the introduction of `createSlice()` in `@reduxjs/toolkit`, I just constantly install `redux` as my state management lib nowadays, no boilerplate, easy to debug, easy to find people to maintain. And the new way is really modern and integrates with Typescript very well.

My only complaint is with `rtk-query`, but it does not matter, since I can just use `react-query`.

The old problem of redux is the maintainability is so low, you have to open 4 files to debug one store update, now it's gone, it's a 1-step like tracing. I LOVE it.

Also, any time, you see a blog/tutorial tells you redux is bad because of the boilerplate and such with a date beyond 2021, block it. We do not want fake news in React community. :-D

### 4.7 Zustand

- repo: https://github.com/pmndrs/zustand
- documentation: https://github.com/pmndrs/zustand/blob/main/readme.md
- author: [0xca0a](https://twitter.com/0xca0a) is known for the famous `react-spring` lib. Now `zustand` is actively maintained by `Daishi`, yes, I know, yet again.

#### Categorizing

- structure:
  - multiple stores
- read/derive:
  - selector
- write:
  - encapsulated setter with built in `directly-mutation` support

#### Usage

```javascript
import create from "zustand";

// create the store
const useStore = create((set, get) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),

  // async is just as easy as it is
  asyncIncrease: async () => set((state) => ({ bears: state.bears + 2 })),
}));

// use the store
function BearCounter() {
  const bears = useStore((state) => state.bears);
  const increase = useStore((state) => state.increase);

  return <button onClick={increase}>{bears}</button>;
}

// you can even use it outside a component, for example, read the access token
const bears = useStore.getState().bears;
```

#### Middlewares

```javascript
import create from "zustand";
import produce from "immer";
import pipe from "ramda/es/pipe";

// damn, does not it feel like a real middleware pipeline...
const createStore = pipe(log, immer, create);
```

#### Pros

- No `<Provider>`
- very clean model and boilerplate free, good co-locating for actions/async actions, properties and even selectors
- can adopt `reducer` way to implement your state update logic
- has a [persist middleware](https://github.com/pmndrs/zustand/wiki/Persisting-the-store's-data) built-in
- great `Typescript` support
- compatible with `redux-devtool`
- very easy to learn
- [Can inform components transiently (without causing render)](https://github.com/pmndrs/zustand#transient-updates-for-often-occuring-state-changes)
- the state can be used outside a React component!

#### Cons

- `selector` can be a problem, but it is universal to the other libraries as well, but do remember to use my [auto-zustand-selectors-hook](https://www.npmjs.com/package/auto-zustand-selectors-hook) for auto generating selectors. So, not a con, just a shameless plug. :D

#### Thinking

`zustand` is my go-to lib nowadays for most projects. I was being asked `why use zustand if it's similar to redux`. My answer would be the easy to pick up and working as expected, if you want a library that you can use right after reading their readme.md on Github with least gotchas and less APIs to learn, `zustand` is probably the only one on this list.

Its usage is also quite flexible, there are multiple ways of using it. Most of the time, the beauty of `zustand` is you just use it, and it works, with very flexible usage. Highly recommend.

### 4.8 xstate

- repo: https://github.com/davidkpiano/xstate
- documentation: https://xstate.js.org/docs/
- author: [David](https://twitter.com/DavidKPiano) worked for Microsoft. And now working for his own company `Stately`, which is making visual software modeling tools and services for making app logic more accessible and robust.

#### Categorizing

- structure:
  - multiple stores
- read/derive:
  - selector
- write:
  - action object

#### Terminology

`xstate` is not a state management library, it is a state machine library. For complex UI, the value of using `xstate` is immense.

- `state`: represent the status of your UI, like "loading", "loaded" and "error".
- `guarded transition`: a state transition which depends on some condition
- `context`: consider this as the state we are talking in this blog, this is the way to share values among states.
- `machine`: define the transition among states and context
- `action`: a side effect that happens when entry/exit a state
- `event`: is a concept from the `createModel()` API, just a normal event, when an event is happening, it can either trigger a state transition or an arbitrary event handler.

> There are more terms than this, please check the [documentation](https://xstate.js.org/docs/guides/actions.html)

#### 20 secs Mental model

If you do not know what is a state machine, I will give a rough example here, so you can understand the the code in the `usage` section.

Let's say you are sending a network request for your UI, now you want to model the state of the UI.

We have:

- state: `loading`, `loaded`, and `error`
- events: `loadingEvent`, `loadedEvent` and `errorEvent`

This is how things hook up.

- when `loadingEvent` happens, we go to `loading` state
- when `loadedEvent` happens, we go to `loaded` state
- when `errorEvent` happens, we go to `error` state

> The rule of thumb is, your UI is ALWAYS in ONE of the states, and when the event happens, the transition happens, stateA changes to stateB.

and the normal `UI state` is now called `context` in `xstate`.

You can also have some other top level events like, `addToDo()` or `deleteToDo()`, it does not trigger a transition, just updating the `context`.

#### Usage

```javascript
import { assign, ContextFrom, createMachine, EventFrom } from "xstate";
import { createModel } from "xstate/lib/model";

// create the model to describe your context and events
// this is mostly for providing type inferring for typescript
// you can just use createMachine() alone
const toDosModel = createModel(
  {
    toDos: [
      { id: 1, text: "initial todo 1" },
      { id: 2, text: "initial todo 2" },
    ],
  },
  {
    events: {
      loadingEvent: () => ({}),
      loadedEvent: (toDos: ToDo[]) => toDos,
      errorEvent: () => ({}),
      addToDo: (newToDo: ToDo) => ({ payload: newToDo }),
      deleteToDo: (toDoId: number) => ({ payload: toDoId }),
    },
  }
);

// create your state machine,
// for example:
// loaded: { on: { loadingEvent: "loading" } },
// reads
// `loaded state` on `loadingEvent` changes to `loading state`
const toDosMachine = createMachine({
  id: "toDosMachine",
  initial: "loading",
  context: toDosModel.initialContext,
  states: {
    loading: { on: { loadedEvent: "loaded", errorEvent: "error" } },
    loaded: { on: { loadingEvent: "loading" } },
    error: { on: { loadingEvent: "loading" } },
  },
  on: {
    addToDo: {
      actions: assign({
        toDos: (context, event) => [...context.toDos, event.payload],
      }),
    },
    deleteToDo: {
      actions: assign({
        toDos: (context, event) =>
          context.toDos.filter((todo) => todo.id !== event.payload),
      }),
    },
  },
});
```

```javascript
import { useMachine } from "@xstate/react";

// use the state machine
function Component() {
  const [state, send] = useMachine(toDosMachine);

  useEffect(() => {
    async function run() {
      try {
        // this will trigger an state related event
        // which will cause the state.value to change
        // thus hits your `state.matches('loading')`
        send(toDosModel.events.loadingEvent());

        const toDos = await getListFromServer();

        send(toDosModel.events.loadedEvent(toDos));
      } catch (e) {
        send(toDosModel.events.errorEvent());
      }
    }

    run();
  }, []);

  // check the state and handle it
  if (state.matches("loading")) {
    return <>loading</>;
  }

  if (state.matches("error")) {
    return <>error, retry?</>;
  }

  // handle loaded

  return (
    <>
      {state.context.toDos.map((toDo) => (
        <li key={toDo.id}>
          {toDo.text}
          <button
            onClick={() => {
              // trigger a non-state related event
              // only change the context
              send(toDosModel.events.deleteToDo(toDo.id));
            }}
          >
            remove
          </button>
        </li>
      ))}
    </>
  );
}
```

```javascript
// The above example is for managing local state,
// if you want to use xstate to manage part of your app, or global state, this is how you do it
// share a `service` with a React.Context,
// then just normal useContext() to get the xstate service to do the thing like send(event)
import { useMachine, useSelector, useActor, useInterpret } from "@xstate/react";

// this is how you get a service
const gridStateService = useInterpret(gridStateMachine, { devTools: true });

// this is how you trigger an event
gridStateService.send(blahblahEvent);
```

#### Middlewares

N/A

#### Library specific

- devtool
- [visualizer](https://stately.ai/viz)

This is the most exciting part of this library, the dev tool will give you in-action state graph, `what's the current state of the UI?` is a complex question to answer sometimes, but with the xstate top-notch devtool, you can just interact with the UI and check the state flow. I will talk more about it later.

The `visualizer` is even more fun, you copy your state machine, we show you the graph. There is also a VSCode extension!

#### Beware

For new comers, a rule of thumb after writing the state machine, check the transition for every state for every event.

For example, when you initially design a state machine, you might think that `errorEvent` is only associated with `loading` state. Do me a favor, do review what happens when `errorEvent` being triggered with `loaded` event.

> **I now tend to check all the possible state-related events for every state.**

This not only solves bug, but also gives me comprehensive understanding to my UI! I did not even notice that some events are triggering from a different state than I thought!

What a benefit! `xstate` let me comprehend my UI flow!

#### Pros

- the devtool is unbeatable
- the comprehensive state machine related toolset
- really simplified the management of complex UI flow
- documentation auto-syncs with your code, more about it later

#### Cons

- deep learning curve, lots of new APIs, and not quite easy to setup
- ultimately, if you familiar with `redux` the old way, you will comprehand the usage of `createModel()` and `createMachine()` quite easily, but the downside is just like the old redux, the gap between each layer, makes it harder to get into the actual logic, always takes few more steps, `UI -> event creator in model -> state transition or action in machine`. Note, you do not have to use `createModel()` at all, but then for Typescript, you have to adopt a type-first approach rather than auto-infer to get the strong type safety.
- Typescript support is not that good, for example, event name is not type-checked at the moment.
- You might be very tempted to use `xstate` to manage the global UI state, then the reality is complex, for example, your network request is probably already handled by `react-query`, so you either use `xstate` for a `before-request` or `after-request` stage, which could still be complex, but when you look at that beautiful state flow graph, I do not know you, but I can feel there is a hollow in my heart. You can integrate with `react-query`, but personally, not a fan of that. The good news is the team is working on this, more packages is on the way, and network request will be built-in, yeah!

#### Thinking

The biggest value of `xstate` comes from 2 parts:

- documentation auto-sync with your code
  - Usually for complex UI, you write documentation with state flow graph, then start coding, now you have a maintenance burden, you have to update the other side everytime you change one side, and we all know that in the end, doc always lack behind. But with `xstate`, you define the state machine in code, then the graph is auto-generated for you, also, you can debug them on the fly, even better when you discuss the state with the product owner, you can discuss, and change the state machine on the fly, voilà, the graph gets updated automatically! This is really really the main selling point for me.
- state machine centralized mental model
  - you can argue the same thing can be done in any other state management library, but `xstate` forces you to have a `state machine mindset`, where everything must be derived from it. It takes time to get used to, but once you do, you will understand the benefits, it makes the logic much easier to follow since everything has a single dependency - the `state machine`, and combine it with the 1st advantage. It's really handy for taming complex UI.

## 5. End

I love all the libraries, they got loads of similarities as I summrized in the `The daily life pattern` section. But the experiences of using are quite differ. For me personally, my top choices are:

- **Go to:**
  - redux / zustand
- **Very tempted to use in scale:**
  - jotai / xstate

What are yours? and why?

Follow me on [twitter](https://twitter.com/albertgao) if you love to hear more of my dev thinkings. :)
