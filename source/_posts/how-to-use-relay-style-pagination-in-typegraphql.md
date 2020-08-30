---
title: How to use Relay style pagination in TypeGraphql
date: 2020-08-30 23:00:49
tags:
  - relay
  - typescript
  - graphql
---

I am quite into [Relay](https://relay.dev/docs/en/experimental/step-by-step) these days, for its opinionated, typesafe and performant approach. Especially for the effortless pagination.

For the backend, I use [TypeGraphql](https://typegraphql.com/), so easy to pick up if you already familiar with Typscript, typesafe, explicit, code-first, and [very fast](https://typegraphql.com/docs/performance.html) even it uses a `js class` approach. Today, I will show you how to define the Relay connection in `TypeGraphql`. I am using `v1.0.0` here.

It's not about actual implementation, since it is related to your data access layer. This blog is purely focused on defining the `TypeGraphql` class and how to use them.

Let's cut to chase.

<!--more-->

## 1. What do we need

```javascript
{
  user {
    id
    name
    friendsConnection(first: 10, after: "opaqueCursor") {
      edges {
        cursor
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}
```

For the above example query, we need 4 type definition:

1. `ConnectinoArgs` for the `(first: 10, after: "opaqueCursor")`
1. `PageInfo` for the `pageInfo`
1. A generic `EdgeType` for `edges` so you add your item type
1. A generic `ConnectionType` for `friendsConnection` to combine `edges` and `pageInfo`

## 2. Define `ConnectionArgs`

This is for the arguments for querying the pagination, `before`, `after`, `first` and `last`.

> The `graphql-relay` here is from `@types/graphql-relay`, install it if you havn't.

```typescript
import * as Relay from "graphql-relay";
import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
  @Field((type) => String, {
    nullable: true,
    description: "Paginate before opaque cursor",
  })
  before?: Relay.ConnectionCursor;

  @Field((type) => String, {
    nullable: true,
    description: "Paginate after opaque cursor",
  })
  after?: Relay.ConnectionCursor;

  @Field((type) => Number, { nullable: true, description: "Paginate first" })
  first?: number;

  @Field((type) => Number, { nullable: true, description: "Paginate last" })
  last?: number;
}
```

## 3. Define the `PageInfo`

```typescript
import * as Relay from "graphql-relay";
import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

@ObjectType()
class PageInfo implements Relay.PageInfo {
  @Field((type) => Boolean)
  hasNextPage: boolean;

  @Field((type) => Boolean)
  hasPreviousPage: boolean;

  @Field((type) => String, { nullable: true })
  startCursor?: Relay.ConnectionCursor;

  @Field((type) => String, { nullable: true })
  endCursor?: Relay.ConnectionCursor;
}
```

## 4. Define the `EdgeType`

```typescript
import * as Relay from "graphql-relay";
import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

export function EdgeType<NodeType>(
  nodeName: string,
  nodeType: ClassType<NodeType>
) {
  @ObjectType(`${nodeName}Edge`, { isAbstract: true })
  abstract class Edge implements Relay.Edge<NodeType> {
    @Field((type) => nodeType)
    node: NodeType;

    @Field((type) => String, {
      description: "Used in `before` and `after` args",
    })
    cursor: Relay.ConnectionCursor;
  }

  return Edge;
}
```

> You may wonder why `EdgeType`? It is because of the convenience of doing Relay Store update later. If you return a `EdgeType` after `mutation`, you can insert the response into the local `connection` directly, otherwise, you have to create the `edge` by yourself, which doesn't sound very interesting.

Here, due to the limited reflection capabilities of TypeScript, you can't use the normal Typescript type for generic. The documentation is [here](https://typegraphql.com/docs/generic-types.html) is you want to learn more. So every time you want to use generic in `TypeGraphql`, you have to use this way.

## 5. Define the `ConntionType`

```typescript
import * as Relay from "graphql-relay";
import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

type ExtractNodeType<EdgeType> = EdgeType extends Relay.Edge<infer NodeType>
  ? NodeType
  : never;

export function ConnectionType<
  EdgeType extends Relay.Edge<NodeType>,
  NodeType = ExtractNodeType<EdgeType>
>(nodeName: string, edgeClass: ClassType<EdgeType>) {
  @ObjectType(`${nodeName}Connection`, { isAbstract: true })
  abstract class Connection implements Relay.Connection<NodeType> {
    @Field((type) => PageInfo)
    pageInfo: PageInfo;

    @Field((type) => [edgeClass])
    edges: EdgeType[];
  }

  return Connection;
}
```

## 6. How to use

I put all of the above code in a file named `relaySpec.ts`. The use it like this.

For the following type.

```typescript
@ObjectType()
export class User extends IdAndDates {
  @Field((type) => String)
  name: string;

  @Field((type) => String)
  email: string;

  @Field((type) => Boolean)
  emailVerified: boolean;
}
```

You can create its `EdgeType` and `ConnectionType` like this:

```typescript
import { EdgeType, ConnectionType } from "../../types/utils/relaySpec";

@ObjectType()
export class UserEdge extends EdgeType("user", User) {}

@ObjectType()
export class UserConnection extends ConnectionType<UserEdge>(
  "user",
  UserEdge
) {}
```

Now you can use the `UserEdge` and `UserConnection` along with the `ConnectionArgs` in your `resolver`.

## 7. End

That's all, hope it helps.
