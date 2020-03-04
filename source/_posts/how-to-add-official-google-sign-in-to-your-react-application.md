---
title: How to add official Google sign-in to your React application
date: 2018-12-15 10:42:50
tags:
  - react
---

The hard part of this is, the official Google sign-in is using a `script` tag in your HTML and initialize it using the traditional in-browser vanilla JavaScript, which is not happening in React. And make it a little bit harder to make the two works together.

<!--more-->

## 1. You add the script to the `<head>` of HTML template

```html
<meta
  name="google-signin-client_id"
  content="your-client-ID.apps.googleusercontent.com"
/>
<script src="https://apis.google.com/js/platform.js" async defer></script>
```

If you use `create-react-app`, it locates in `/public/index.html`.

If you don't have that `your-client-ID`, open this [page](https://developers.google.com/identity/sign-in/web/sign-in), and click that **CONFIGURE A PROJECT** button.

## 2. You write a React component

The idea is, you just render a plain `div`, then after `componentDidMount`, use the Google API to re-render this `div` as a real follow-google-design button, **even better, you can bind your React component method to its `onsuccess` or `onfailure` callback**.

```javascript
const GOOGLE_BUTTON_ID = "google-sign-in-button";

class GoogleSignIn extends React.Component {
  componentDidMount() {
    window.gapi.signin2.render(GOOGLE_BUTTON_ID, {
      width: 200,
      height: 50,
      onsuccess: this.onSuccess
    });
  }

  onSuccess(googleUser) {
    const profile = googleUser.getBasicProfile();
    console.log("Name: " + profile.getName());
  }

  render() {
    return <div id={GOOGLE_BUTTON_ID} />;
  }
}
```

More info about the `render` API and the others can be found [here](https://developers.google.com/identity/sign-in/web/reference#gapisignin2renderid-options).

Now you can control the sign-in behavior from your React code.

## 3. What about you rely on the Google method when starting your app?

If you ever need to consume API under `gapi.auth2`, this is where things become hard. Because you have to initialize it. But the official example is using vanilla Javascript. Even worse, loading the `<script>` and mounting of your React application are totally happening in parallel, so when you consume the API, the google script may not even be loaded.

I first did something simple, I removed the `async` and `defer` attribute from the `<script>` tag. And add an `onload` attribute to an initializing function.

```html
<script>
  function initGoogle() {
    window.gapi.load("auth2", function() {
      window.gapi.auth2.init({
        client_id: "your-client-ID.apps.googleusercontent.com"
      });
    });
  }
</script>
<script
  src="https://apis.google.com/js/platform.js"
  onload="initGoogle()"
></script>
```

It appears working at first, but when you refresh the page, it's always going to throw an exception if you try to consume `gapi.auth2.blahblah`, it seems the `<script>` loading happens after mounting of your React app, even though we have removed its `async` and `defer` attributes to make it blocking rendering.

> That means we need to know the lifecycle of the loading `<script>` in your React app in order to get things done

For instance, I want to use its `isSignedIn` API for a simple local protected route, if the user is signed-in, let the user access the resource, otherwise, route the user to the login page.

## 4. Steps to get things done

### 4.1 First, add `<script>` tag

```html
<meta
  name="google-signin-client_id"
  content="your-client-ID.apps.googleusercontent.com"
/>
<script src="https://apis.google.com/js/platform.js" async defer></script>
```

Yes, it's the same as before, `async` and `defer` will be there, and we will be fine.

### 4.2 Manage the initializing `gapi.auth2` in React and mark its procedure

The idea here is:

- We use `setInterval` to verify whether the `<script>` tag has been loaded or not
- if loaded, we then `initialize` the `gapi.auth2` object
- For a better UX, we will save the steps in global store (Redux/MobX), then we can display different UI according to the different status, don't worry, it will be pretty fast most of the time, should take only less than 2 seconds.
- After initializing, we will `clearInterval`
- And when the status is been marked as done, your `React` app can use the Google API without any problems, because all the preparation has been done.

### 4.3 The code for `setInterval`

Here in that `googleLoadTimer` will continue to check if the `window.gapi` is ready if it's ready, that means `<script>` has been loaded. And it will `clearInterval` as a teardown as we mentioned before after finishing initializing the `gapi.auth2` object.

```javascript
function initGoogle(func) {
  window.gapi.load("auth2", function() {
    window.gapi.auth2
      .init({
        client_id: "your-client-ID.apps.googleusercontent.com"
      })
      .then(func);
  });
}

const googleLoadTimer = setInterval(() => {
  authStore.setAuthLoadingStatus(LOADING_STATUS.INITIAL);

  if (window.gapi) {
    authStore.setAuthLoadingStatus(LOADING_STATUS.LOADING);

    initGoogle(() => {
      clearInterval(googleLoadTimer);
      authStore.setAuthLoadingStatus(LOADING_STATUS.LOADED);
    });
  }
}, 90);
```

The `authStore` is a mobx store. Feel free to use a redux store here, you just need to `dispatch` some `actions` to a `reducer` which will be used later to indicate the steps, and you only need one property in this reducer, you can refer to the following mobx store code. You just need to swap `authStore.setAuthLoadingStatus(LOADING_STATUS.INITIAL);` with something like `dispatch(initialAction())` if you are using Redux.

### 4.4 The code for `AuthStore`

```typescript
export class AuthStore {
  @observable
  authLoadingStatus = LOADING_STATUS.INITIAL;

  @action.bound
  setAuthLoadingStatus(toStatus) {
    this.authLoadingStatus = toStatus;
  }
}
```

`LOADING_STATUS` is an object for preventing relying on the string directly.

```javascript
export const LOADING_STATUS {
  INITIAL = 'INITIAL',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  FAILED = 'FAILED',
}
```

### 4.5 Nearly done

The `googleLoadTimer` will be run when the app starts. And updates the `authStore.authLoadingStatus`, in your code. You can now know if the preparation is done like this:

```javascript
const isReady = authStore.authLoadingStatus === LOADING_STATUS.LOADED;
```

If `isReady` equals true, that means you can start using it.

I encapsulate the logic into a top-level component, `ProtectedRoute`, it's a simple route for protecting routes from un-google-logged-in user. Which means, before it uses `GoogleUser.isSignedIn()`, it will show the loading spinners according to the `authStore.authLoadingStatus`, it will only invoke the `GoogleUser.isSignedIn()` when the `isReady === true` (Otherwise, you will get exception because `gapi.auth2` is not ready to use).

## 5. End

Hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
