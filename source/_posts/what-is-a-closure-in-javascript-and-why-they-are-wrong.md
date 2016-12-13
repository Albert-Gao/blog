---
title: What is a closure in JavaScript and why they are wrong?
tags:
  - closure
  - javascript
  - quiz
id: 128
date: 2016-08-21 02:05:56
---

JavaScript is a de facto dominance in the modern web development. And its dynamic nature makes it very easy to learn, and, and very easy to fail :) One of the most famous confusion out there is the concept of closure. And in fact,  you really shouldn't read the accepted answer on the [stack overflow](http://stackoverflow.com/questions/111102/how-do-JavaScript-closures-work)**.** Because it doesn't explain well as many other posts on the internet. Through this post, I will explain closure in a very straightforward way and tell you why they are wrong. Let's begin.

<!--more-->

## 1. Always start with code:

```JavaScript
function outside() {
    var text = "I love JavaScript."

    function inside() {
        console.log(text);
    }

    inside();
};

outside(); // "I love JavaScript."
```
The result is straightforward as the above, it will print that `text` variable. Let's push it a little bit.
```JavaScript
function outside() {
    var text = "I love JavaScript."

    return function() {
        console.log(text);
    };
};

outside()();  // "I love JavaScript."
```
Now we use the Immediately-Invoked Function Expression (IIFE), since the `outside()` will return a function, we just simply add another `()` after it, to invoke that function. The result is the same,  and it is easy to understand. Nothing strange here.

## 2. Here we get a miracle:
Let's go even further.

```JavaScript
function outside() {
    var text = "I love JavaScript."

    return function() {
        console.log(text);
    };
};

var trueOutside = outside();
trueOutside(); // "I love JavaScript."
```

Wow, something interesting happened, let's break them into pieces:

*   First, we define a function called `outside()`, it will return a anonymous function.
*   Second we assign the `outside()` to `trueOutside`, now the variable `trueOutside` will hold that inner anonymous function.
*   Finally we execute that `trueOutside()` which will invoke that inner function.

It should throws an error - "`text is not defined`". Since the variable `text` is not there when it executed. But it still behaves as normal. What happened? This is what we called closure comes into play. **The `trueOutside` here has become a closure.**

It hard to understand, especially when you come from a traditional programming language like C, C#, Java, you will be very confused at this stage, the reason is that you try to use the common memory model in the above languages such as <span style="color: #000000;">**stack**</span> to adopt to this scenario. What's in your mind is, when the `trueOutside()` runs, the `outside()` is not on the stack, since it has been executed so should be removed from the stack. Thus, when `trueOutside()` tries to execute, that variable `text` shouldn't be there, so the result should be a "`text is not defined`".

## 3. **Why they are wrong?**

This is the reason why I told you not to follow that accepted answer on stack overflow, since it is tried so hard to adopt the stack theory like "as if a 'stack frame' were allocated on the heap"... Totally absurd even for an analogy.

Remember:
> **The concept closure can't be explain well with "stack" but "execution context" or "execution environment".**

We'll talk more about the execution environment later. Let's check another common mistake. You can see many definitions online as the following one from the famous [W3School](http://www.w3schools.com/js/js_function_closures.asp):
> A closure is a function having access to the parent scope, even after the parent function has closed.

To be honest, this is deadly wrong. Because **it is nothing to do with the parent function and nothing to do with accessing  behaviour either,** Let's prove it with the following code.

```JavaScript
function outside() {
    var text = 1;

    return function() {
        text++;
        console.log(text);
    };
};

var trueOutside = outside();
trueOutside(); // 2
trueOutside(); // 3
trueOutside(); // 4
```
We executed `trueOutside()` for 3 times, Let's put down your questions first since we will explain later, let's follow the above definition, it said the inner function can access to the parent scope even when it is closed, OK, now we executed the parent function `outside()` :

```JavaScript
outside()();   // 2
```

It still outputs a 2, it never changes! It is always two! In fact, if it becomes 5, the JavaScript will completely be a non-sense language.

There is another post from a famous writer who tries to use scoping chain to explain this, but it doesn't make sense as the reason above. Since even the interpreter tries to find the variable `text` follow the scoping chain, it won't succeed since that `outside()` function is not valid anymore.

## 4. Where is the magic?

The magic happens when you assign the returned function to that variable `trueOutside`,  I said before, the `trueOutside` has become a closure. According to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures), the closure has the following properties.

**<span style="color: #0000ff;">A closure is a special kind of object that combines two things:</span>**

*   **<span style="color: #0000ff;">a function</span>**
*   **<span style="color: #0000ff;">the environment in which that function was created.</span>**
*   <span style="color: #0000ff;">The environment consists of any local variables that were in-scope at the time that the closure was created.</span>

So, it is easy to understand now, the closure `trueOutside`, it not only contains that returned anonymous function, but also it contains the variable `text`, since it was exist when the closure was created. So, it can executed well.  And it can be explained the last example I showed you before. Let's review it.

```JavaScript
function outside() {
    var text = 1;

    return function() {
        text++;
        console.log(text);
    };
};

var trueOutside = outside();
trueOutside(); // 2
trueOutside(); // 3
trueOutside(); // 4
```

Why it can accumulate? It is just that simple since **<span style="color: #0000ff;">the variable</span> `trueOutside`<span style="color: #0000ff;">has created a new execution context for that inner function, and it stores all the status inside itself without affecting the original parent function</span> `outside()`.**

## 5. Not the end

This is pretty much of closure. Maybe there is another famous example you have seen, which is the following, a closure when looping. Resulting in a very strange result.
```JavaScript
var funcs = [];
for (var i = 0; i < 3; i++) {          // let's create 3 functions
    funcs[i] = function() {            // and store them in funcs
        console.log("My value: " + i); // each should log its value.
    };
}
for (var j = 0; j < 3; j++) {
    funcs[j]();                        // and now let's run each one to see
}
```
What you expect the output to be? Since the variable `i` has increased step by step during the loop and the value had stored step by step into that function. It should output the following,

```JavaScript
My value: 0
My value: 1
My value: 2
```

But instead, it will output like this:

```JavaScript
My value: 3
My value: 3
My value: 3
```

Yes, this is JavaScript, always hits you with a unexpected pose. :) It is about the closure again, but it is easier to understand using the concept of "context". You can check it at [this post](/2016/08/25/why-not-making-functions-within-a-loop-in-javascript/), I will dissect it step by step. By far the most detailed explanation online xD Yes, since I checked tons of them before.
