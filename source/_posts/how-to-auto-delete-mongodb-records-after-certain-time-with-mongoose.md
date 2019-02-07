---
title: How to auto delete Mongodb records after certain time with Mongoose
date: 2019-02-07 20:27:40
tags:
  - mongoose
  - mongodb
---

I have a requirement where I need to remove some records from a collection. Let's see how to do that in Mongoose. I use Mongoose: 5.4.9 and MongoDB v4.0.3.

<!--more-->

## 1. Setup the schema

```javascript
expireAt: {
  type: Date,
  default: Date.now,
  index: { expires: '5m' },
},
```

Here are the keys:

- It needs to be a `Date` type.
- It needs to setup a `index` with `expires` property.
- You can use `default` to setup the start time.

Take the above setup for example. The default value for `expireAt` field will be `Date.now`, when you create this record, you don't need to assign value for `expireAt`, so it will be assigned with `Date.now`. Then we setup it will expire after `5m`. Which means:

> After 5 minutes from creation, this record will be removed from Database.

`5m` is a shortcut here, you can refer to this [package](https://www.npmjs.com/package/ms) to check how to use words rather than number to make the setup more readable.

## 2. Why it doesn't work

If you change the `expires`, you might need to drop the original index, otherwise, it won't just work.

## 3. Something about TTL

It is about the concept of `TTL` in MongoDB: Time-To-Live. According to the official document:

> The background task that removes expired documents runs every 60 seconds. As a result, documents may remain in a collection during the period between the expiration of the document and the running of the background task.

> Because the duration of the removal operation depends on the workload of your mongod instance, expired data may exist for some time beyond the 60 second period between runs of the background task.

## 4. End

Hop it helps.