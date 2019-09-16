---
title: How to update Apollo Cache via React Hooks after calling REST api
date: 2019-09-16 11:40:17
tags:
  - graphql
  - apollo
---

Apollo local cache (InMemoryCache) works super great, but recently I have a problem with it, the UI re-renders when updating the cache after a GraphQL mutation, but not after I calling a traditional REST api and try to update the cache directly. The intention is simple, I want to update the local cache directly and re-render the UI. Let's see how to solve it.

<!--more-->

## 1. 2 cases in terms of updating the cache

> First thing first, all the below discussion are based on the fact that you try to update the cache not in the context of GraphQL, if you just want to update the cache after a GraphQL mutation, there are a lot of resources online, and it just works.

1. The object is simple, so you can just update the cache by yourself.
2. A very complex update which involves a lot of nested update, you'd rather just calling the endpoint again.

## 2. Handle case 1

The `writeData` and `writeQuery` won't work here since you are not dealing with GraphQL.

You need `updateQuery`, this is how you do it.

```javascript
import { useApolloClient } from '@apollo/react-hooks'
import { useQuery } from '@apollo/react-hooks'

const MyComponent = () => {
  const client = useApolloClient()
  const { updateQuery } = useQuery(GET_USERS_QUERY)

  const updateCacheAndReRenderUI = newUser => {
    updateQuery((prevUsers) => ({
      users: [newUser, ...prevUsers.users],
    }))
  }

  return <div />
}
```

The `updateQuery` function you get from the  `useQuery` hook will give you the previous data, and you just return a new data if something has changed.

Unlike the `cache.writeQuery` where you can mutate the `data` directly, here you have to return a new object to maintain the immutability.

No extra network request, the UI will be re-rendered.

According to the document:

> A function that allows you to update the query's result in the cache outside the context of a fetch, mutation, or subscription

## 3. Handle case 2

When the data structure is complex or there will be some side-effects happened not in your app, you can use the following method to get the latest update.

```javascript
import { useApolloClient } from '@apollo/react-hooks'
import { useQuery } from '@apollo/react-hooks'

const MyComponent = () => {
  const client = useApolloClient()
  const { refetch } = useQuery(GET_USERS_QUERY, {
    fetchPolicy: 'cache-and-network'
  })

  // call refetch() where you want the update to happen

  return <div />
}
```

via calling the `refetch()`, the UI who uses the same query, in this case:  `GET_USERS_QUERY`, will be re-rendered.

If you have any variables for the GraphQL query, `refetch()` takes it as the 1st parameter.

One thing to note is that `refetch()` will invoke the network request.

## 4. End

That is the end. Hope it helps.
