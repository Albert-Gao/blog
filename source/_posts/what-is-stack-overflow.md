---
title: What is stack overflow?
tags:
  - academic
  - memory
  - stackoverflow
  - quiz
id: 73
date: 2016-08-12 16:45:13
---

This is a question which will confuse the beginners for a while. And in order to know this, you need to know the memory first, which is the memory architecture of your program in runtime. To keep it simple. Let's firstly check the insanely simple C code below.

<!--more-->
```c
#include <stdio.h>;

void main(){
    int x=1;
    printf("%d", x);
}
```

Simple code, right? I just declare a variable, then I print it to the console. After compiling, when you run the code, the memory will set up a space for you. And it contains several sections, a text section to store your code file. a stack section for your functions. Let's say the memory just looks like the graph below.

![](/images/Screen-Shot-2016-08-12-at-16.18.34.png)

OK, remember the whole architecture is not this simple, it has other sections too, but we will keep it simple in this context. When your program get executed, the codes reside in the text section ('text segment' is the actual term, but I just follow my convention here.) . And your functions, `main()` reside in the stack. Let's say when we put a breakpoint at the line of `printf()`. we pause the code, then we take a close look at the stack only, it will look like below.

![](/images/Screen-Shot-2016-08-12-at-16.25.19.png)

Aha, here they are, our two functions, the bottom one, is the `main()`, it is at the bottom since it is the entry. Then it invoke the `printf()`, then `printf()` will add to the stack. If the `printf()` invokes another function, they will all add to the stack,too. In fact, when a function get pushed into the stack, it is not as simple as the text section, which means it is not just load its code. All the local variables will be pushed into the stack, too. So, here comes the problem: what will happen if we call tons of functions or declare and initialized a really big local variable?

**Good news:**

When the function has done its job, it will be removed from the stack, with all its local variables, the space it occupied will be empty and waiting its new hosts.

**Bad news:**

The size of this stack is fixed, it is not dynamic. Yes, which means you can use it up.

## What is the answer actually?

So, from the above context, you will know:

> Stack is a size fixed space, every function that you invoke during runtime will be loaded into it, and gets removed once it finishes executing.

So, **"Stack overflow" just means you have used up all the spaces of stack which the system allocated for you.** So let's say you have declare a really big array, 20000000, then you try to store 20000000 values into it. And it will crash in the middle. Or, you have a recursive call which calls itself again and again and you sadly make its base case wrong, so it will trap in a forever-looped function call and fills up the stack.

## So, how to deal with it?

It depends. But let's follow the above context, the cause is a really big local variable. Then the solution is to move them into the **heap**. You can achieve this by using `malloc()` in C. Heap is just another section in the memory which can be dynamically allocated. So you don't need to worry the space anymore. OK, you can used up heap, too, yes, then please, open Amazon.com, buy a RAM for the god's sake. xD

If you have more interests on the memory model, I have [a little writing here](/2016/08/13/understand-when-to-use-pointer-in-c-and-the-memory-model-in-programming/) too.
