---
title: How to return error response in json using bottle
date: 2017-09-20 22:37:11
tags:
  - python
---

Return an error message is a common task for restful API development. But things will get a little bit tricky when you need to deal with some legacy code base. Since their old dependencies will always cause you trouble. `Bottle` is a light weight python web framework with a long history, so it's friendly to the traditional view templating rendering idea but not for json response, at least not for error message. And when the framework is old, `Stack overflow` won't save you this time. Let's see how to solve it.

<!--more-->

# Let's start from a simple case

```python
@get('/item/<item_id>')
def get_item(item_id):
    return get_item_in_json(item_id)
```

It's simple, get a item from its id then return the information in JSON. However, what about you want to raise an error in the middle, let's say you want to check if the result is empty or not.

# 2 handy things for errors in bottle

1. HTTPError
2. abort()

You can use them via this way:

```python
return HTTPError(400, error_message)
raise HTTPError(400, error_message)
abort(code, error_message)
```

However, they won't work in this case.Since they will force you to return a HTML template with the error message.

>And it will fight against itself, try its best to make sure that you can't get the message in a JSON format.

I put a break point and went through its code, if you pass a `dict` as the `error_message`, in the middle of processing, `bottle` will automatically set the `Content-type` to `application/json`, which is nice. but finally it will use a default HTML template to fill the response body. Then you get a weird response with a `header` set to `json` but body is a `HTML page.`

# So it's simple now

We can still return a HTTPResponse.

```python
@get('/item/<item_id>')
def get_item(item_id):
    item = get_item_in_json(item_id)
    if not item:
        return HTTPResponse({'error': 'No such item'}, 400)
    return item
```

Still simple.

# What about DRY

So, you wanna define a function which take a string, and return an error if it's empty.

```python
def should_not_empty(target):
    if isinstance(target, str):
        if not str:
            return HTTPResponse({'error': 'No such item'}, 400)


@get('/item/<item_id>')
def get_item(item_id):
    item = get_item_in_json(item_id)
    should_not_empty(item)
    return item
```

A major problem is that even the `item` is empty, you will still return it. 

Because you are not in that router function `get_item()`, so even you return a `HTTPResponse` in `should_not_empty()`, it's just like you return a value from a function.

And not like `Express.js` in node, there is no explicit `next()` or `res` for you to pass as a context. Bottle use a global variable called `bottle.response`. Not work too even you return that. Still like return a value if you are not in a router function.

# The proper way to this is

```python
def should_not_empty(target):
    if isinstance(target, str):
        if not str:
            raise bottle.HTTPResponse(
                json.dumps({'error': "JSON seems invalid"}),
                400,
                headers={'Content-type': 'application/json'}
            )
```

By raising a `HTTPResponse` and explicitly set its `Content-type`, and use `json.dumps` to convert this dict. It will do the job this time. Strangely, if you set the error_message as `dict`, `bottle` won't set header for you.

> If you want to do things in the right way, bottle will ask you to do all the things by yourself!

That's end, hope it helps. :)