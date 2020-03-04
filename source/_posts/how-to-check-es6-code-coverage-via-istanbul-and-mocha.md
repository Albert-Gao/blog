---
title: How to check ES6 code coverage via istanbul and mocha
date: 2016-12-20 23:39:10
tags:
  - es6
  - test
  - istanbul
  - javascript
  - mocha
---

As Wikipedia said, [code coverage](https://en.wikipedia.org/wiki/Code_coverage) is a measure used to describe the degree to which the source code of a program is executed when a particular test suite runs. Low code coverage means you haven't tested your code thoroughly. In javascript, you can use install [istanbul](https://www.npmjs.com/package/istanbul) to check it, but problems come again when you try to run it against ES6 code. Either `syntax error` for ES6 code or `No coverage information was collected`, I finally found an relative elegant way to solve.

<!--more-->

## 1. What I tried.

I use node v4.7.0. And I installed istanbul via `yarn add istanbul -D`, `npm install istanbul --save-dev` is ok as well. The version installed is `0.4.5`. I tried following commands:

- `./node_modules/.bin/istanbul cover ./node_modules/.bin/mocha`
  - Result: syntax error, it's ok since we don't declare the transpile
- `./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha`
  - Result: as before.
- `istanbul cover ./node_modules/.bin/_mocha test/*.js --require babel-register`
  - Result: syntax error, wow!
- `istanbul cover ./node_modules/.bin/_mocha test/*.js -- --require babel-register`
  - Result: No error but `No coverage information was collected`

### 1.1 mocha and \_mocha

Some post online will say that using `_mocha` solved the issue, but I tried with no luck, the difference is that `_mocha` is the actural execute file, `mocha` is just a wrapper around it.

## 2. Find the latest version of istanbul

Using the one of the following command to check:

- `npm info istanbul versions`
- `yarn info istanbul versions`

The result is very long,

```bash
  ......
  '0.4.3',
  '0.4.4',
  '0.4.5',
  '1.0.0-alpha.1',
  '1.0.0-alpha.2',
  '1.1.0-alpha.1' ]
```

But, we found the latest version, using alpha is not recommend, but it solved the problem.

## 3. Remove old and install the latest

- `npm uninstall istanbul`
- `npm install istanbul@1.1.0-alpha.1 --save-dev`

or

- `yarn remove istanbul`
- `yarn add istanbul@1.1.0-alpha.1 --dev`

## 4. Create your report

- `./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha test/*.js -- --require babel-register"`

> **Use `_mocha` here rather than `mocha`!**

Now you get it:

```bash
  ......

  about the error throwing case
    ✓ should throw an error when get a negative number
    ✓ should pass the throw-error test

  20 passing (18ms)

======= Coverage summary =======
Statements   : 94.29% ( 33/35 )
Branches     : 93.75% ( 15/16 )
Functions    : 100% ( 2/2 )
Lines        : 93.75% ( 30/32 )
================================
```

## 5. What does it mean?

- **Statements**: How many of the statements in you code are executed.
  - Using the above as an example: `94.29%` of statements get running when testing, and the number is `33`, the overall number is `35`.
  - Which means you need to write more tests to cover the missing `2` statements in order to achieve `100%`.
- **Branches**: Conditional statements create branches of code which may not be executed (e.g. if/else). This metric tells you how many of your branches have been executed.
- **Functions**: The proportion of the functions you have defined which have been called.
- **Lines**: The proportion of lines of code which have been executed.
  The above description comes from [here](https://github.com/dwyl/learn-istanbul). Click the link to learn a little more detail about istanbul.

## 6. Check the result via nice HTML

- [OS X] `open ./coverage/lcov-report/index.html`
- [Windows] `start chrome /coverage/lcov-report/index.html`

Simply click the file name in the result to see which line you are missing by reading the **red** line. The symbol `E` will tell you which branch you are missing to coverage.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
