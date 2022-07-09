---
title: How to validate request in Gin with Golang
date: 2022-07-09 19:47:27
tags:
  - golang
  - gin
---

Golang is an amazing language, and [gin](https://github.com/gin-gonic/gin) is a great backend framework to use. Conceptually, it has no differences than the any backend framework we used in other languages. But its documentation does cause some problems for a accomplish a simple thing like request validation. Here, I will share my findings in terms of how to grab the value and validation in gin.

<!--more-->

> There are 2 models here for request validation here.
>
> 1. You get the value first using `ctx.Param("userId")`, then validate by yourself.
> 2. You bind the request to struct, and do retrieve/validation in one go using `ctx.Bind()` or `ctx.ShouldBind()`.

I won't cover the 1st part, since you would rarely want to do that, but if you prefer code style validation to string like struct-binding, then combine with [ozzo-validation](https://go-ozzo.github.io/ozzo-validation/) might not be that bad.

The 2nd way is idiomatic-gin, and leads to less code. I suggest you look into it.

## 2nd way, use struct-binding to grab and validate in one go.

`Gin` is using a package called [validator](https://github.com/go-playground/validator) to do the struct-binding.

### For the path param

Let's say you want to grab the `userId` and `action` from `/user/:userId/*action`, and making sure they always there, you also want to make sure that the `userId` is a valid `uuid`. You can do something like this.

```golang
type RequestParam struct {
    UserId string `uri:"userId", binding:"required,uuid"`
    Action string `uri:"action", binding:"required"`
}

func handler(ctx *gin.Context) {
    var param RequestParam

	if err := c.BindUri(&param); err != nil {
		c.AbortWithStatusJSON(400, gin.H{
            "message": "bad request",
            "detail": err.Error()
        })
		return
	}
}
```

It's easy to digest, for example, the `UserId` field, has a meta data attached to it: `uri:"userId", binding:"required,uuid"`

- `uri:"userId"` means grab the value from `uri` which means a path parameter.
- `binding:"required,uuid"` means we will `bind` this value to the struct's property `UserId`, and it is a `required` field, and we expect its type to be `uuid`.

Then in the handler, you use `c.BindUri()` to do the getting and validation in one go.

If you want to use some other types other than `uuid`, check the `validator`'s [documentation](https://pkg.go.dev/github.com/go-playground/validator/v10).

### For the query strings

For example, to get the `userId` from `/user?userId=aaa-bbb-ccc-ddd`

You just use this struct.

```golang
type getUserByIdUri struct {
	ID string `form:"userId" binding:"required,uuid"`
}
```

And both `ctx.Bind()` or `ctx.BindQuery()` would do the trick for you.

### For the json body

For example, to get the `{"name":"albert", "birthday": "06/30"}` of the request body, you would use:

```golang
type RequestBody struct {
	Name: string `json:"name", binding:"required"`
    Birthday: string `json:"birthday", binding:"required,datetime=01/02"`
}
```

For getting/validation, `ctx.Bind()` and `ctx.BindJson()` are your friends.

### What about using one struct for combining the path param/query string/body part?

No, you can not, just call the `Bind` methods for multiple times.

```golang
var reqBody RequestBody
var reqPathParam RequestPathParam
var reqQueryStr RequestQueryString

if err := c.BindJSON(&reqBody); err != nil {
    // handle error
    return
}

if err := c.BindUri(&reqPathParam); err != nil {
    // handle error
    return
}

if err := c.BindQuery(&reqQueryStr); err != nil {
    // handle error
    return
}
```

This is a lot of code, but actually the validation logic is declarative, unless you are dealing with a custom validation which validator package is different.

### For validating the different type

Just swap the `uuid` to something else in the [documentation](https://pkg.go.dev/github.com/go-playground/validator/v10).

For example:

- an email: `binding:"required,email"`
- an timezone: `binding:"required,timezone"`
- an datetime: `binding:"required,datetime=2006/01/02"`

If you want to use some other types other than `uuid`, check the `validator`'s [documentation](https://pkg.go.dev/github.com/go-playground/validator/v10).

## End

Hope it helps, thanks.
