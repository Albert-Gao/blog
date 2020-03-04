---
title: How to dump remote dokku-mongodb and restore local instance
date: 2019-04-10 01:06:07
tags:
  - mongodb
  - dokku
---

I have a side project using dokku, it works well. But then I want to dump the production data to local in order to test some cases. I thought it should be as simple as dump and restore, but I was wrong. It took me a while, I think write it down might help someone else or future me.

<!--more-->

## 1 Dump the database on the server

```bash
dokku mongo:export mongo_service_name > data.dump.gz
```

## 2 Download to your local machine

```bash
scp root@222.222.222.222:data.dump.gz ~/
```

## 3 Restore

```bash
mongorestore --host localhost:27017 --gzip --archive=data.dump.gz --db mongo_service_name
```

The tricky part is the name after `--db`, should match the database name in your dump file.

## 4 End

That's all. Hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
