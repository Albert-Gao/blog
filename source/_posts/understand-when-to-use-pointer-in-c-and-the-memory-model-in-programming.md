---
title: Understand when to use pointer in C and the memory model in programming.
id: 82
categories:
  - Blog
date: 2016-08-13 18:02:45
tags:
  - memory
---

Pointer in C is a powerful weapon, it can let us feel that we can manipulate the memory directly (Literally, not that true since the barrier as virtual memory and page table, but we can consider it like this.) And we know that you can use **`&`** to refer a memory address of a variable, and use **`*`** to deference an address to retrieve the inside value. And the relations between pointer and array, you can blahblahblah for a whole day.

But the question may come across, when do we need to use pointers and why? For instance, why `scanf()` need a pointer typed parameter while `printf()` doesn't? We can't just memorize function names. Aha, this may become tricky since it needs some background knowledge on the memory model. But clam down, we are here to solve it. And the memory model you will learn is not only applied to C, it's universal. Let's start!

<!--more-->

## 1. What does the memory look like?

When your program gets running, the system will allocate memory spaces for it. And this memory spaces contains several sections (Academic term as segment). It looks like the graph below:

![](/images/Screen-Shot-2016-08-13-at-16.34.42.png)

*   .text:  All your physical codes resides here.
*   .data:  All the global variables and static variables in your codes will be loaded here.
*   .bss: Two types of global variables will belong here: Those whose values are  uninitialized or initialized to zero.
*   stack: This is the play ground for your program, every function call will happen here.
*   heap: A space used for dynamic memory allocation, you can use `malloc()` or `realloc()` to manage it in C.

## 2. What happens in the memory when our program runs?

As the above we know that stack is the key place that relates to our codes. What happens there? Let's take a code for example.

```c
#include <stdio.h>;

int add(int x, int y){
    return x+y;
}

int printout(int x, int y, int result){
    printf("%d plus %d is %d",x,y,result);
}

int main(void){
    int a=1,b=1,c=0;
    c = add(a,b);
    printout(a,b,c);
    return 0;
}
```

The block is simple, it just add two numbers, then print a result. Let's see what happens here one by one, after it executes the line of `int a=1,b=1,c=0;`, the memory looks like below:

![](/images/Screen-Shot-2016-08-13-at-17.21.01.png)

You can see that the entry function `main()` has been loaded into the stack, with all the local variables. Now let's move forward. When it is executing the line `c=add(a,b);`, what happens? It will first executes the `add(a,b)` then assign the result to `c`, right? What does the memory looks like here?

![](/images/Screen-Shot-2016-08-13-at-17.26.00.png)

You see, the new function `add()` gets loaded, why I mark the `a` as `a'` and `b` as `b'`? It simply means that the value in variables `a`,`b` from `main()` will pass into function `add()` by value, means a copy of their value will be passed, not the actual variables.

Now there are 2 functions in the memory, or more precise, in the stack. Each of them occupies a space called the **stack frame**.

Now it is enough to solve our topic today, but let's do it a little further. Let's execute the line `printout(a,b,c);` and see what happened in the memory:

![](/images/Screen-Shot-2016-08-13-at-17.35.59.png)

Something interesting happens: the `add()` has been removed from the stack, and the function `printout()` has been added. What happens here indicates the:
> **The stack works like the data structure stack, LIFO, it will load the current invoking function into the space and remove it once its job done.**

## 3. So, when do we need to use pointer and why?

Now you get the enough context to conquer the problem:

> Since each loaded function occupies its own stack frame in the memory, **there is no way for them to access the local variables in another stack frame.**

![](/images/Screen-Shot-2016-08-13-at-17.41.32.png)

Let's say that you want modify the value in local variable `c` by the `add()`, so you don't need to assign the return value later. Since there is no way for the function `add()` to access the local variables `a` and `b` directly. The only solution here is to use the memory address. You pass the memory address of local variable `c` to a new modified version of `add()`, and the whole new codes will be look like below:

```c
#include <stdio.h>;

void add(int x, int y, int *result){
    *result = x+y;
}

int printout(int x, int y, int result){
    printf("%d plus %d is %d",x,y,result);
}

int main(void){
    int a=1,b=1,c=0;
    add(a,b,&c);
    printout(a,b,c);
    return 0;
}
```

The result is as same as before: `1 plus 1 is 2` . But now the function `add()` can access the local variable `c` via a alternative way - memory address, and it can save the result directly into it, so you don't have to assign the return value later and you don't need `add()` to return any value at all. All of this is achieved by the feature of pointer in C. And now you know why `scanf()` need a pointer typed parameter while `printf()` doesn't need.

## 4. Summary

Today we dive into the memory model when you coding and use C for example. It is a very useful knowledge, and this memory model is not only applied to C but also the other high level languages that you currently use. And a hint here, you can now understand [what is stack overflow actually](http://www.albertgao.xyz/2016/08/12/what-is-stack-overflow/) :)
