---
title: How to bind an event handler to a class method in Typescript?
tags:
  - pitfall
  - typescript
  - howto
id: 98
date: 2016-08-15 00:12:39
---

In ES5, we can very easy bind a event to DOM using the native way: `document.addEventListener()` , or a jQuery way, `$(element).bind()` , `$(element).click()` or `$(element).on()` , use them according to different situations.

But in the ES6 or Typescript, you will face some pitfall if you don;t care the details. Suppose you have the following code:

<!--more-->
```javascript
class Foo{
    bar:string;

    constructor(){
        this.bar = "Does it work";
    }

    action():void{
        $(".button").on('click', "#buttonID", function(){
            console.log(this.bar);
        })
    }
}
```

In the runtime, an error will happen:

> Cannot read property 'bar'

But you actual have declared that property, right? The problem here is the scope of `function(){}`, it will create its own scope, so the this.bar inside that anonymous function, will refer to this anonymous function as the keyword `this` rather than your `class foo`.

The solution is very easy, use the arrow function syntax from ES6:

```javascript
action():void{
        $(".button").on('click', "#buttonID", ()=>{
            console.log(this.bar);
        })
    }
```

Now it works as expected. Why?  Because the arrow function syntax will not create its own `this` context, rather it captures the `this` value of the enclosing context.

I face this problem before, really cost sometime to figure it out. The frustrating part, I checked the compiled javascript code, nothing different than this. I thought it is just as same as the function keyword. But seems i am wrong, and i am happy to learn a new lesson :)
