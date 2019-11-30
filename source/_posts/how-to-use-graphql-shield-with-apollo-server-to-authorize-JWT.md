---
title: How to use Graphql Shield with Apollo Server to authorize JWT
date: 2019-12-01 11:07:47
tags:
  - graphql
  - apollo
---

[Graphql Shield](https://github.com/maticzav/graphql-shield) is a nice library to centralize your authorization rules. But how to use it with Apollo Server? Let's see. For example, what about I want to do authorization according to the information in JWT?

<!--more-->

## 1. Install `graphql middleware`

`npm i graphql-middleware`

## 2. Get the auth info from JWT

```javascript
const createContext = ({ req }) => {
  const { headers } = req;
  const auth = null;
  // parse Auth header and do something

  // put the auth info into context
  return { auth };
};
```

## 3. create a simple rule for one of your GraphQL path

For instance, I want to auth the `posts` path;

```javascript
const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => ctx.user !== null
);

const permissions = shield({
  Query: {
    posts: isAuthenticated
  }
});
```

## 4. Apply to Apollo server

Use `graphql-middleware` to combine your schema with the `permissions` you just created.

```javascript
import { ApolloServer } from "apollo-server";
import { schema } from "./schema";
import { applyMiddleware } from "graphql-middleware";

new ApolloServer({
  schema: applyMiddleware(schema, permissions),
  context: createContext
}).listen({ port: 4000 }, () =>
  console.log(
    `🚀 Server ready at: http://localhost:4000\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#5-using-the-graphql-api`
  )
);
```

## 5. End

It just works! Thanks.
