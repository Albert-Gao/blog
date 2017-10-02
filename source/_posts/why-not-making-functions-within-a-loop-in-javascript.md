---
title: Why not making functions within a loop in JavaScript?
date: 2016-08-25 18:43:10
tags:
  - closure
  - javascript
---

Do you know JSLint? A tool which can help you write quality JavaScript code, it is developed by [Douglas Crockford](https://en.wikipedia.org/wiki/Douglas_Crockford). Who is the father of JavaScript, he surely has sufficient background to judge. :) And JSLint is very strict, and you can call it rigid sometimes, but he always has the point. If you have used the tool before, you may have noticed some errors, one of them may look like this : **"Don't make functions within a loop"**. OK, let's fix it, wait, what?

Yes, it may sound absurd at first, let's dive into to find out what the father wants to say xD

<!--more-->
## 1. Weird code
If you have follow me here from this article [What is a closure in JavaScript and why they are wrong](/2016/08/21/what-is-a-closure-in-javascript-and-why-they-are-wrong/). You may still curious about the following code. And if you don't know closure, you really should check [that article](/2016/08/21/what-is-a-closure-in-javascript-and-why-they-are-wrong/) first.

```javascript
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

Simple code, create a loop first, for each loop, assign the current value `i` to to a newly created function. Then start a new loop, execute the functions one by one, something will be output into the console.

This is the result you may expect.
```javascript
My value: 0
My value: 1
My value: 2
```

But instead, it will output like this:
```javascript
My value: 3
My value: 3
My value: 3
```

And before you run this code, Mr Douglas has already warned you, "**"Don't make functions within a loop"**". Yes, he make a point, but why?

## 2. Dissect the mystery.
**It is simple because, in that anonymous function created in the loop, you have referred a variable which belongs to the outside scope, so the next time when you execute this function, the variable `i` is 3.** You will ask, what? Haven't we store that value during the loop? Let's rewrite the above code a little.

```javascript
var i = 0,
    j = 0;
var funcs = [];
for (i = 0; i < 3; i++) {              // let's create 3 functions
    funcs[i] = function() {            // and store them in funcs
        console.log("My value: " + i); // each should log its value.
    };
}
for (j = 0; j < 3; j++) {
    funcs[j]();                        // and now let's run each one to see
}
```

You know the `variable hoist` and `scope` in JavaScript, right? Which is JavaScript doesn't have a block scope, so anytime we declare a variable, it will be hoisted to the top of its container function, if there is no container function, it will be hoisted to the global scope. So, this is the reason why `i` is appeared at the first of the block. And this is what happens next:

1. the variable `i` and `j` gets declared first
2. When the first loop runs, an anonymous function has been created inside the loop
3. Inside the newly created anonymous function, it referred a variable `i` which is not in its scope
4. After the first loop, the value of variable `i` accumulates to 3 since the loop runs for 3 times.
5. In the second loop, each function created in the first loop will be invoked.
6. When it gets invoked, the interpreter will check the value of `i`, and it found there is no `i` inside.
7. Since this anonymous has become a closure, the interpreter will look at its scope chain.
8. Finally, the interpreter founds the variable `i`, in the global scope, still within its lexical scope, which is totally legitimate for this anonymous function to refer.
9. And the value of `i` is `3`. We solved it in step 4.
10. So, a `3` will be output.
11. What happens afterwards for the second and third loop is totally the same from step 6~10.

>You see? The concept of **closure** in JavaScript makes it very dangerous to make new functions inside a loop. So, Mr Douglas has given us his advice with JSLint.

## 3. How to solve it?
Since we know the cause, we can solve it now, by using the same concept.

### 3.1 I love functions and I will create it at any cost!

You may think that since the `i` is a primitive value, we could simple declare a new variable inside that function in loop and assign the `i` to it. Something like

```javascript
for (i = 0; i < 3; i++) {
    funcs[i] = function() {
        var my_i = i
        console.log("My value: " + my_i);
    };
}
```

It won't work, still give you three `My value: 3`.

The reason is still as previous:

> When the anonymous function get executed, when it tries to evaluate my_i, it need to read from `i`, and `i` is already `3`

So, one way to solve this is to create another closure to save that temporary value. So it leads us to the following code:

```javascript
var i = 0;
var j = 0;
var funcs = [];

function printValue(num) {
    return function() {
        console.log("My value: ", num);
    }
}

for (i = 0; i < 3; i++) {
    funcs[i] = printValue(i);
}

for (j = 0; j < 3; j++) {
    funcs[j]();
}
```

We get what we want.

```javascript
My value: 0
My value: 1
My value: 2
```

What have we done? Simple, we create the function at first, and then, use it to the loop index inside that loop.

### 3.2 Does the father happy?
OK, if you use JSHint, mostly good, but if you use JSLint, still there are some complaints, I told you before, `rigid`, some of the complaints may seems really weird like `unexpected ++`, yes, he means when you create that for loop, shouldn't use `i++`, WHAT?!?!?! Yes, father thinks you should use `i+=1`... OK, more of this is out of topic.

## 4. Finally
Now you know why not making functions within a loop.

>Since the concept 'closure' in JavaScript will it tricky when dealing with the functions created inside a loop. You should always try to create the function first or execute it immediately after the creation.

OK. You know why and you know how. That's the end of the story. Hope it helps.
