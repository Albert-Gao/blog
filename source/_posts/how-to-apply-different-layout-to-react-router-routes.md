---
title: How to apply different layout to React Router routes
date: 2019-12-04 21:23:20
tags:
  - react
  - react-router
  - typescript
---

Most of the SaaS sites has a similar pattern, marketing pages, pages after login. Marketing pages may or may not share elements in terms of the layout, but the pages after login will share something like sub-nav, top nav, modules, things like that. I use React outer v5 with Typescript, I thought it should be easy, but it took some time.

<!--more-->

## 1. Requirements

The requirements are fair simple. The website has 3 sections:

Most of the routes needs to be lazy loaded.

1. non-auth pages
   - before login
   - some of them share elements, and some don't)
1. a new user onboarding page
   - after login
   - only for new users
   - not share any layouts with the pages that need auth.
1. auth pages
   - after login
   - need a layout wrapper to share a common layout

## 2. Declare the routes constants

I thought this should be easy, but actually, it is not that easy.

```typescript
export const ROUTES = {
  /****************/
  /* BEFORE LOGIN */
  /****************/
  INDEX: "/",

  /******************/
  /*  AFTER LOGIN   */
  /* WITHOUT LAYOUT */
  /******************/
  NEW_USER_ONBOARD: "/new-user-onboard",

  /****************/
  /* AFTER LOGIN  */
  /* WITH LAYOUT  */
  /****************/
  DASHBOARD: "/dashboard"
} as const;
```

The `as const` will frozen `ROUTES`, when you try to modify this, it will give you an error.

## 3. Declare the non-auth routes and auth routes

```typescript
const BEFORE_AUTH_CONFIG = {
  [ROUTES.INDEX]: React.lazy(() =>
    import(/* webpackChunkName: "indexPage" */ "../pages/Index")
  )
} as const;

const AFTER_AUTH_TOP_CONFIGS = {
  [ROUTES.DASHBOARD]: lazy(() =>
    import(
      /* webpackChunkName: "dashboardPage" */ "../pages/Dashboard/Dashboard"
    )
  )
};

const AuthRoutesLayout: React.FC = ({ children }) => (
  <App>
    <Suspense fallback={"loading component"}>
      <Switch>{children}</Switch>
    </Suspense>
  </App>
);
```

There are several ways to do the rendering, you can just compose the `<Route>` component here. I prefer to use this plain object style, later on we will generate route component from this object. You can expand the data structure here, so you can pass more props to the factory method, but I found it fits my case.

The `AuthRoutesLayout` is for the sharing part, the `App` component contains the top level components that you want to share across pages.

## 4. Declare the special onboarding route

```typescript
const onBoardingRoute = (
  <ProtectedRoute
    exact
    path={ROUTES.NEW_USER_ONBOARD}
    component={lazy(() =>
      import(/* webpackChunkName: "newUserOnboard" */ "../pages/NewUserOnboard")
    )}
  />
);
```

Why this is not using the config style? Actually you can, but in my case, it is just this one page, and it needs some special logic when generic than the generic auth pages, I omitted them when writing the blog. But you get the idea.

## 5. Implement the ProtectedRoute

```typescript
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = props => {
  return isAuth() ? <Route {...rest} /> : <Redirect to="/login" />;
};
```

The logic is easy, go to route if the user is authenticated, otherwise we go to the `/login` page.

## 6. Transform the config object to a Route component

```javascript
import React from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "routes";

export const generateRouteFromConfig = (config, isProtectedRoute) =>
  Object.keys(config).map(path => {
    const Component = isProtectedRoute ? ProtectedRoute : Route;

    return <Component exact key={path} path={path} component={config[path]} />;
  });
```

This is the Javascript version, pretty straightforward, we pass a boolean, so we know if it is a protected route or a normal route.

This is the Typescript version, it is mainly for type checking the config object, to make sure it has a key of string and lazy component as key.

```typescript
import React, { LazyExoticComponent, FunctionComponent } from "react";
import { RouteComponentProps, StaticContext, Route } from "react-router";
import { ProtectedRoute } from "routes";

export const generateRouteFromConfig = (
  config: {
    [path: string]: LazyExoticComponent<
      FunctionComponent<RouteComponentProps<{}, StaticContext, any>>
    >;
  },
  isProtectedRoute: boolean
) =>
  Object.keys(config).map(path => {
    const Component = isProtectedRoute ? ProtectedRoute : Route;

    return (
      <Component
        exact
        key={path}
        path={path}
        component={config[path as keyof typeof config]}
      />
    );
  });
```

## 7. The final composing

```typescript
export const Routes: React.FC = observer(() => {
  return (
    <Router history={history}>
      <Suspense fallback={"loading component"}>
        <Switch>
          {generateRouteFromConfig(BEFORE_AUTH_CONFIG, false)}

          {onBoardingRoute}

          <AuthRoutesLayout>
            {generateRouteFromConfig(AFTER_AUTH_CONFIGS, true)}
          </AuthRoutesLayout>

          <Redirect to={ROUTES.INDEX} />
        </Switch>
      </Suspense>
    </Router>
  );
});
```

The previous 3 sections are all here. And we added a fallback path to `<Redirect to={ROUTES.INDEX} />`, so when we hit the non-exist pages, we will route the user to the index page.

## 8. End

That's all. Hope it helps.
