---
title: How to implement Relay node in Graphql
date: 2020-09-07 11:52:05
tags:
  - graphql
  - nexus
---

Relay is a great GraphQL client side library made by Facebook. It has a `Node` query which allows you to have a universal endpoint for querying all your endpoints in your GraphQL. Let's check how we do that, we will use [`Nexus`](https://nexusjs.org/), you can use the other GraphQL, but I found `Nexus` made me really productive.

You can use `toGlobalID()` and `fromGlobalID` from `graphql-relay` package. Then you can stop reading here. But I will use an easier way, which you can adopt for your green field project.

<!--more-->

## 1. Rationale

The benefit of having the `node()` query on your GraphQL root, is:

- not only Relay can do the refetch via this `node()`,
- but also you can use this node to query any entity that implements this interface. So instead of having separate query for `user()`, `company()` and `task()`, you can have this single `node()` query for getting `user`, `company` and `task` entities, if they all implement the `node interfaceType`.

## 2. For the global unique ID

Firstly, you need to adopt a convention for your id, which is:

> The id of an entity is combined by entity name and the real id.

For example, if you have a `user`, the id should be `user_cyasjkajkas`. If you have a `task`, the id should be `task_asjksakjas-12jh12hj-sakjasjksw`.

Not only you can identify the entity of the object, you also paved the way for the next step, which is easily identity the incoming query in the GraphQL endpoint without any additional saving in your database.

And via doing this, you remove that unnecessary step for wrapping the id.

## 3. Define the ID mapper function

This is for checking the pattern of the id.

```javascript
const isId = {
  task: (entity: { id: string }) => entity.id.startsWith(IdPrefix.task),
  user: (entity: { id: string }) => entity.id.startsWith(IdPrefix.user),
};
```

## 4. Define the `Node` type

We need to return the proper GraphQL `type`, from the `id`. So the `Task` and `User` that we are returning here, should be already defined in your codebase. `Nexus` can auto-find them, follow the convention if you use the other framework.

```javascript
const Node = schema.interfaceType({
  name: "Node",
  definition(t) {
    t.id("id");
    t.resolveType((entity) => {
      if (isId.task(entity)) {
        return "Task";
      } else if (isId.user(entity)) {
        return "User";
      }

      return null;
    });
  },
});
```

## 4. Define the `node` query for that type

You are doing the same thing, use the id pattern to retrieve the entity. It will then being used as the backing type for the underneath object type, for example, the result of `ctx.db.task.findOne({ where: { id } })` is a single task, and it will be used by your GraphQL type `Task` as the backing type.

And how does the framework now, that we want to resolve `Task` here, well, you already done that in the previous step.

```javascript
schema.extendType({
  type: "Query",
  definition(t) {
    t.field("node", {
      type: Node,
      args: { id: schema.idArg({ required: true }) },
      resolve: (_, args, ctx) => {
        if (isId.task(args)) {
          return ctx.db.task.findOne({ where: { id } });
        } else if (isId.user(args)) {
          return ctx.db.user.findOne({ where: { id } });
        }

        return null;
      },
    });
  },
});
```

BTW, what is that beautiful `ctx.db.task.findOne({ where: { id } })`? It's [`Prisma`](https://www.prisma.io/), and modern database access for Typescript and Node.js, auto generate all the types and very friendly to use.

## 5. Now You get the GraphQL schema

```javascript
type Query {
  node(id: ID!): Node
}
```

## 6. The end

Hope it helps. Of course, you can argue that the `if-else` here can be a more functional approach like using `cond()` from `rambda`, but I will leave that to you.
