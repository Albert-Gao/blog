---
title: How to implement Facebook login via its official JS SDK
date: 2017-08-22 19:22:48
tags:
  - javascript
  - node
---

Most often in universal javascript project we tends to use `passport.js`. But a recent project requires to use the official SDK. The article will walk you through the flow with example code. Hope it could get you started. Even you just use `passport.js` or other languages, after reading this article, you should understand what happens underneath.

We use plain `Express` as our backend.

<!--more-->

# 1. Brief

The basic idea of authentication is just to get the identity to verify who you are so you could later on use to access some authorized resources. Here we just let the facebook do it for us, so we can confirm that is user is trustable. The thing we used to identify the user is called `access token`. You can use the token to a

# 2. Workflow

Before we even start, let's review what will happen next?

## 2.1 Flow

1. Place the Facebook button along with its `javascript` code, it will render a blue login button on the page. Press the button, it will leads the user to the facebook login page.

2. After the user grants the permission to our app, it will go to the callback URL you assigned at facebook developer portal along with an short-life access token.

3. Two things could happen after the last step:

   - You should exchange for a long life token with the previous one.
   - You could get some user information via the short life token.

4. Save the user to the database.

5. Generate a `JSON web token`(jwt) with your own signature and passback it back to the client.

6. The client could use the token to access an authorized endpoint.

## 2.2 Tip

1. If you just use facebook to authenticate a user, you could skip step 4 entirely. Because when your `jwt` expires, you could simply let the user login via facebook again.

2. The sub-steps in Step 3 could happen at the same time. Which means you could use `Promise.all` to make it happen faster.

3. A trick in step.2 is facebook won't redirect you to the callback URL as it did when you use `passport.js`, but don't worry here. You can still get the access token in the client side js.

# 3. Code for each step.

## 3.1 Add facebook button

```html
<div
  class="fb-login-button"
  data-max-rows="1"
  data-size="large"
  data-button-type="continue_with"
  data-show-faces="false"
  data-auto-logout-link="false"
  data-use-continue-as="false"
  scope="public_profile,email"
  onlogin="checkLoginState();"
></div>
```

Add `Zepto` and your own javascript file.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js"></script>
<script src="browser-auth.js"></script>
```

Now add the code for that login button, 2 things to notice,

1. In the `FB.init()`, add your own app ID.
2. The `if` `else` inside `FB.getLoginStatus` is where add your own logic.

```javascript
// browser-auth.js
$(document).ready(() => {
  window.fbAsyncInit = () => {
    FB.init({
      appId: "Your App ID here",
      cookie: true,
      xfbml: true,
      version: "v2.9"
    });
    FB.AppEvents.logPageView();

    window.checkLoginState = () => {
      FB.getLoginStatus(response => {
        if (response.status === "connected") {
          // The user accepts our request.
          startToAuth(response);
        } else {
          // The user decline our request, do something here if you want.
        }
      });
    };
  };

  (function(d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
});
```

## 3.2 Get the short life access token

It seems no matter what you set in that `Valid OAuth redirect URIs` in Developer portal, if you use official SDK, it won't go there. So, how do you get the access token? It will trigger the `checkLoginState()` that you just set and pass the token as the parameter.

Now let's assume the user grants our permission. We need to implement the `startToAuth()`

```javascript
function startToAuth(response) {
  $.ajax({
    type: "POST",
    url: "/api/auth/facebook",
    data: response,
    success: (data, status, xhr) => {
      // The access token is here in the data.
    },
    error: (xhr, errorType, error) => {
      // Handle the error here.
    }
  });
}
```

This is what the token looks like:

```javascript
{
    status: 'connected',
    authResponse: {
        accessToken: '...',
        expiresIn:'...',
        signedRequest:'...',
        userID:'...'
    }
}
```

## 3.3 Add the middleware you need to `Promise.all` the 2 sub-steps you need for Step 3

We need to exchange for the long time token and we need to retrieve the user information via the short time token.

```javascript
const asyncAllFBAuth = (req, res, next) => {
  const queue = [
    fbAuth.exchangeLongTimeToken(req),
    fbAuth.retrieveUserInfo(req)
  ];
  Promise.all(queue)
    .then(values => {
      res.locals.auth = values[0];
      res.locals.user = values[1];
      next();
    })
    .catch(err => {
      next(err);
    });
};
```

I assume you might have interests for the blog I wrote previously: [3 interesting experiments of Promise.all()](/2017/06/04/3-interesting-experiments-of-promise-all/)

This is how you exchange for the long time token:

```javascript
const exchangeLongTimeToken = req => {
  return axios
    .get("https://graph.facebook.com/oauth/access_token?", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: config.facebookAuth.appID,
        client_secret: config.facebookAuth.appSecret,
        fb_exchange_token: req.body.authResponse.accessToken
      }
    })
    .then(response => {
      if (response.status === 200 && !response.data.error) {
        return response.data;
      }
    });
};
```

This is how you retrieve the user information:

```javascript
const retrieveUserInfo = req => {
  const userID = req.body.authResponse.userID;
  return axios
    .get(
      `https://graph.facebook.com/${config.facebookAuth.appVer}/${userID}?`,
      {
        params: {
          access_token: req.body.authResponse.accessToken,
          fields:
            "id,name,short_name,name_format,first_name,middle_name,last_name,gender,email,verified,is_verified,cover,picture,timezone,currency,locale,age_range,updated_time,link,devices,is_shared_login,can_review_measurement_request"
        }
      }
    )
    .then(response => {
      if (response.status === 200 && !response.data.error) {
        return response.data;
      }
    });
};
```

**TIPS:**
Notice the `fields` there, it contains all the fields which you wanna retrieve from facebook. And the fields you see here, is the most possible fields you could get via the default permission. Feel free to copy it.

## 3.4 Issue a JWT with the information you want

Such that next time, when the user provide a valid jwt for login, you will get all the information in the below `signUser` variable without accessing the database.

```javascript
const issueJWT = (req, res, next) => {
  const signUser = {
    id: res.locals.user._id.toString(),
    screen_name: res.locals.user.name.screen_name,
    picture: res.locals.user.picture.url,
    iss: "projectTalk"
  };

  const expireTime = res.locals.token_expires_in || config.tokenExpired;

  jwt.sign(
    signUser,
    config.HS256,
    { expiresIn: expireTime, algorithm: "HS256" },
    (err, token) => {
      if (err) {
        next(err);
        return;
      }
      res.locals.token = token;
      next();
    }
  );
};
```

## 3.5 Finally, send the JWT back to the client.

```javascript
const fbLogin = (req, res) => {
  res.json({
    ok: true,
    url: "/home",
    token: res.locals.token
  });
};
```

The whole route looks like this:

```javascript
router.post(
  "/",
  [
    // isWrongFormat,
    // isBadSigned,
    asyncAllFBAuth,
    // assembleUserInfo,
    // removeUnusedData,
    // fbAuth.saveUser,
    issueJWT
    // saveToCookie
  ],
  fbLogin
);
```

I commented some validation and saving middleware here just for convenient, you need to do it if you wanna use it in production.

## 3.6 Now, modify the code in `3.2`

```javascript
function startToAuth(response) {
  $.ajax({
    type: "POST",
    url: "/api/auth/facebook",
    data: response,
    success: (data, status, xhr) => {
      // The access token is here in the data.
      window.location = data.url;

      // save the token in data.token to wherever you want
    },
    error: (xhr, errorType, error) => {
      // Handle the error here.
      console.error("errorType: ", errorType);
      console.error("error: ", error);
    }
  });
}
```

We just route to the URL which should display after successfully login here. It should be a protected resource. The reason we can access that is we already save that token to the cookie in the `saveToCookie` middleware.

> WARNING: Make sure you handle the CSRF problem when you implement the `saveToCookie` middleware.

# 4. End

It is basically all of it. Hope it helps. Or feel free to solve that problem of why it won't redirect me to the callback URL since maybe there's something I was missing. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
