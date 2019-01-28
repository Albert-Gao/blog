---
title: How to declare a function type variable in Typescript?
tags:
  - typescript
id: 48
date: 2016-08-11 13:24:36
---

There are many types in typescript, but since we love callback functions in javascript, how do we declare them in typescript? Let's take a look from the bottom to the top. And with along some practice thinking.

<!--more-->

## Solution 1 - any:

OK, this is the most ugly way to achieve it, you can simply declare a variable as 'any' type, then after, you can assign it a function to it. It's not recommend.

```javascript
let a:any;

a = function ():void{
    console.log("It works");
}
```

## Solution 2 - Function:

Sometimes, when you design the interfaces, you have no idea what the actual signature will be, but instead declaring a 'any' type, you can use a keyword 'Function', so you can take advantage of the type checking later.

```javascript
let a:Function;
a = function ():void{
    console.log("It works");
}
```

OK. So now when you want assign a value other than function to this variable 'a', the compiler will throw an error :
> Type 'xxxxx' is not assignable to  type 'Function'.

## Solution 3 - More specific signature:

Now, as your projects goes on, you have whole idea of what's going on there. So you can go back and modify your declaration to a more precise version using the fancy arrow function syntax, feel free to use it, it marked as 'standard' in ECMA2015.

```javascript
let a:(para:string)=>string;
a = function (pass:string):string{
    return pass;
}
```
The syntax here is very simple, it is just like the lambda function in Java or C#, the 'string' after the arrow is the type of the return value. The para: string defines the type of the parameter.

## Solution 4 - Use type

We can use `type` to declare a function type:

```javascript
type read = (name: string) => void;

const test:read = (value: string) => {
  console.log(value);
}
```

## Solution 5 - Interface them all

We are Typescript, we'd love to use the beloved `interface` for everything, well, you can, for just a function.

```javascript
interface read {
  (name: string): string;
}

const test:read = (value: string) => value;
```

## Summary

In practice, I often repeat the procedures from solution 2 to solution 3, and it make sense to me. You don't know the detail of the architecture, you simply assign it as a function, than later on you get more information, then you come back to make it better.
