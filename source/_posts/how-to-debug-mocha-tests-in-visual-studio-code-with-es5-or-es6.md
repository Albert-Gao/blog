---
title: How to debug ES6 mocha tests in Visual Studio Code
date: 2016-12-16 23:37:35
tags:
  - debug
  - tutorial
  - howto
  - mocha
  - vsc
  - es5
  - es6
  - test
---

Previously, when I tried to debug the failed test in mocha, I start mocha in bash with `--debug-brk`, and attached the Visual Studio Code to that mocha process. My code is written in ES6, and I run mocha via `babel-register`. When I tried to enjoy the built-in debug function in VSC. Somehow, the stack seems completely irrelative to the actual code. Take me a while to figure it out. I searched a lot online, assembled all the information to solve the problem, I think it worths a blog to save someone else time.

<!--more--> 

Basically, 2 methods available. One is debug ES6 code directly and the other is to transpile ES6 to ES5 first, then debug the original ES6 test files. No matter which method you use, it will land in the correct line of the ES6 source code file nicely. 

This article assumed that you have already set up the testing environment otherwise you won't even have the debug problem. But if you do have a problem on setting up, I have a blog about this as well: [Testing via Mocha and Chai in ES5 and ES6](http://www.albertgao.xyz/2016/12/09/testing-via-mocha-and-chai-in-es5-and-es6/)

## 1. Debug the ES6 code without transpiling
The ES6 here means ES6 for both source code and tests file. Or the test file could be written in ES5 which is totally fine too.

In a word, 2 steps:
- add a user settings which enable you to debug ES6 code
- use built-in debug function to debug without running a separate mocha process

### Step 1:
Add the following sections to your [Launch Configurations](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations).

```javascript
{
    "name": "Run ES6 Tests",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceRoot}",
    "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
    "args": [
        "./test/*.js",
        "--require", "babel-register",
        "-u", "tdd",
        "--timeout", "999999",
        "--colors"
    ],
    "runtimeArgs": [
        "--nolazy"
    ],
    "sourceMaps": true
},
```

You can customize the above setting by modifying the `args` section, such as:
- The 1st line to where you hold your test file

### Step 2:
- Add a break point at the failed test: The exact `expect` function.
- Open the `Debug` panel
- Choose the above configuration: `Run ES6 Tests`
- Click the green arrow button to run!
- Click `Step Into (F11)`
- Jump to ES6 code beautifully.

## 2. Debug the transpiled ES5 codes
It just has 1 more step than the above one, transpile the ES6 code. But the result is same.

### Step 1:
Add the following sections to your [Launch Configurations](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations).

```javascript
{
    "name": "Run Tests",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceRoot}",
    "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
    "args": [
        "-u", "tdd",
        "--timeout", "999999",
        "--colors",
        "./dist/test/"
    ],
    "runtimeArgs": [
        "--nolazy"
    ],
    "sourceMaps": true,
    "outDir": "${workspaceRoot}/dist"
},
```

You may need to modify the following 2 places:
- `"./dist/test/"` to the folder which hold your transpiled tests files
- `"${workspaceRoot}/dist"` to the folder which hold your transpiled source code files.

### Step 2:

Use `babel` to transpile your ES6 code to ES5, if you don't know how to set up, read my [article](/2016/12/09/testing-via-mocha-and-chai-in-es5-and-es6/#6-Set-up-for-ES6-Testing) about this.

>if your tests is written in ES6 you need to transpile them as well, otherwise your stack will be a mess.

```json
  "scripts": {
    "build": "./node_modules/.bin/babel *.js --out-dir dist --source-maps && ./node_modules/.bin/babel ./test/test.js --out-dir dist --source-maps"
  },
```

### Step 3:
- Add a break point at the failed test: The exact `expect` function. You can add it in the ES6 test file, you don't need to touch that transpiled tests file at all.
- Open the `Debug` panel
- Choose the above configuration: `Run ES6 Tests`
- Click the green arrow button to run!
- Click `Step Into (F11)`
- Jump to ES6 code beautifully.

## 3. End
No more story share, hope it helps. :)