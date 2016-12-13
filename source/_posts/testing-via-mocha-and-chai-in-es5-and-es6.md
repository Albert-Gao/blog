---
title: Testing via Mocha and Chai in ES5 and ES6
date: 2016-12-09 09:16:17
tags:
  - test
  - javascript
  - mocha
  - chai
  - es5
  - es6
---

Testing is a crucial part for developing, for JavaScript as well. Since the foundation theories of testing is almost the same regardless of the languages you are using. I will focus on introduction to Mocha and Chai, and environment setting up in this article. And for both ES5 and ES6. And the library we are using is Mocha and Chai. Mocha is a BDD testing framework and Chai is an assertion library. And at the end, I will talk about why I don't use Jasmine for testing.

<!--more-->

## About the versions:
- "node.js": "4.6.2",
- "babel-preset-latest": "6.16.0",
- "babel-register": "6.18.0",
- "chai": "3.5.0",
- "mocha": "3.2.0"

## 1 minute for Mocha
There are so many little piece in Mocha, but you should know the following 3 for your first test. And conquer the rest at the [homepage of Mocha](https://mochajs.org/), not that long.

### Make your context via `describe()`
Your testing suites may consist of many parts. And you could distinguish them in a clear manner via `describe()`, you needs 2 parameters for it, the first one is the description and the second one is a function which will contain your tests afterwards.

```JavaScript
describe("Start to test function A", function(){
    // Your tests for fnA starts here
})

describe("Start to test function B", function(){
    // Your tests for fnB starts here
})
```

If you have more cases to address, you can use another function called `context()` to do the trick:

```JavaScript
describe("Start to test function A", function(){
    context("Test case 1", function(){
        // Your tests for case 1
    })
    context("Test case 2", function(){
        // Your tests for case 2
    })
})
```

### Write your tests in `it()`
Your real code for tests locates in `it()`, it has a same function signature as `describe()`.

```JavaScript
describe("Start to test function A", function(){
    it("should return 2 when we pass 1 and 1", function(){
        expect(addTwo(1, 1)).to.be.equal(2)
    })
})
```

Furthermore, if you are writing an asynchronous testing. Which means your testing code may ends later, but the whole block won't wait your tests to finish. You can pass a `done` to the callback function of `it()` to fix it.

```JavaScript
describe("Start to test function A", function(){
    it("should return 2 when we pass 1 and 1", function(done){
        expect(addTwo(1, 1)).to.be.equal(2)
        done()
    })
})
```

### You can hook your tests to do some preparation
With its default “BDD”-style interface, Mocha provides the hooks before(), after(), beforeEach(), and afterEach(). These should be used to set up preconditions and clean up after your tests.

```JavaScript
// Codes below are from Mochajs.org
describe('hooks', function() {

  before(function() {
    // runs before all tests in this block
  })

  after(function() {
    // runs after all tests in this block
  })

  beforeEach(function() {
    // runs before each test in this block
  })

  afterEach(function() {
    // runs after each test in this block
  })

  // test cases
  it("should return something", function(){
      // test codes here
  })
})
```

## 1 minute to Chai
Chai focus on assertion, it provides with 3 types of assertions. Codes below are from [http://Chaijs.com/guide/styles](Chaijs.com/guide/styles)

### Assert
This one has a similar feeling as the build-in `assert` in node.js.

```JavaScript
var assert = require('chai').assert
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

assert.typeOf(foo, 'string'); // without optional message
assert.typeOf(foo, 'string', 'foo is a string'); // with optional message
assert.equal(foo, 'bar', 'foo equal `bar`');
assert.lengthOf(foo, 3, 'foo`s value has a length of 3');
assert.lengthOf(beverages.tea, 3, 'beverages has 3 types of tea');
```

### Expect
The BDD style assertion of `expect()` enable you to represent your tests in a more human-reading-friendly way.

```JavaScript
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

expect(foo).not.to.be.a('number');
expect(foo).to.equal('bar');
expect(foo).to.have.length(3);
expect(beverages).to.have.property('tea').with.length(3);
```

### Should
Provides another approach to address your tests description. May have some issues when used with Internet Explorer, so be aware of browser compatibility.

```JavaScript
var should = require('chai').should() //actually call the function
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

foo.should.not.be.a('number');
foo.should.equal('bar');
foo.should.have.length(3);
beverages.should.have.property('tea').with.length(3);
```

### Languages chains
You can chain your description via the following methods. Here is a little disadvantage of using `Chai`. Non-native speaker may have a trouble on combine these words to a sentence, but seems not a big deal, they are very basic English.

- to
- be
- been
- is
- that
- which
- and
- has
- have
- with
- at
- of
- same


## Set up for ES5 Testing
Very easy to set up.

### First, you install them
```bash
# use NPM
npm init --yes
npm install mocha chai --save-dev

# or use fancy Yarn
yarn init --yes
yarn add mocha chai --dev
```

### Second, import them in your tests and write a simple test
Create a file named `test.js` locates in `test/` in your project folder.
```JavaScript
var expect = require("chai").expect
var should = require("chai").should()
var addTwo = require("../index").addTwo

describe("Test the behavior of addTwo()", function () {
    it('should return 2 when given 1 and 1 via expect()', function () {
        expect(addTwo(1, 1)).to.be.equal(2)
    })
    it('should not return 3 when given 1 and 1 via should()', function () {
        addTwo(1, 1).should.not.be.equal(3)
    })
})
```

### Third, write your function which needs to test.
The above tests will fail since there is no such `addTwo()`. It doesn't matter, we will add one now.
Create a file named `index.js` locates in the root of your project folder with the following codes:
```JavaScript
export addTwo = function (num1, num2) {
    return num1 + num2;
}
```

### Fourth, add the following section to your `package.json`.
If you already have a `scripts` section, you can replace it with the following one.
```JavaScript
"scripts": {
    "test": "./node_modules/mocha/bin/mocha test/*.js || exit 0"
},
```

### Run your tests via command line
```bash
npm run test

# Or, just:
npm test
```

You can do the second trick since the `test` is a reserved keyword of NPM.

## See the fancy result
```bash
> testMocha@1.0.0 test /Users/albertgao/codes/node/testMocha
> ./node_modules/mocha/bin/mocha test/*.js || exit 0

  Test the behavior of addTwo()
    ✓ should return 2 when given 1 and 1 via expect()
    ✓ should not return 3 when given 1 and 1 via should()

  2 passing (8ms)
```

## Set up for ES6 Testing
Testing for ES6 takes few more steps since you need to transpile your ES6 code to ES5.

### First, you install them
```bash
# use NPM
npm init --yes
npm install mocha chai --save-dev

# or use fancy Yarn
yarn init --yes
yarn add mocha chai --dev
```

### Second, import them in your tests and write a simple test
Create a file named `test.js` locates in `test/` in your project folder.
```JavaScript
import chai from "chai"
import {addTwo} from "../index"

let expect = chai.expect
let should = chai.should()

describe("Test the behavior of addTwo()", function () {
    it('should return 2 when given 1 and 1 via expect()', function () {
        expect(addTwo(1, 1)).to.be.equal(2)
    })
    it('should not return 3 when given 1 and 1 via should()', function () {
        addTwo(1, 1).should.not.be.equal(3)
    })
})
```
Something interesting happens here, I imported `chai`, then apply its two functions to local variables. Why not just `import {expect,should} from "chai"`, saddly, you can do it for `expect` but not `should`, 

According to the official docs now:
>It isn’t possible to chain a function call from an ES2015 import statement – it has to go on its own line.

But I saw a request on Github, which will enable `import "chai/should" in the future`, hopefully in the 4.0 version. It mentioned in official docs. But I tried with no luck.

Second, I didn't use `arrow functions` here since the nature of the arrow function, you will lose the context binding, let's say you want to use the built-in `this.timeout(200)` to structure your tests. Then you shouldn't use the arrow function even you are written in `ES6`. But if not, feel free to use it.

### Third, write your function which needs to test.
The above tests will fail since there is no such `addTwo()`. It doesn't matter, we will add one now.
Create a file named `index.js` locates in the root of your project folder with the following codes:
```JavaScript
let addTwo = (num1, num2) => {
    return num1 + num2;
}

export {addTwo}
```

### Fourth, add the Babel support
```bash
# use npm
npm install babel-preset-latest babel-register --save-dev

# or use fancy Yarn, -D === --dev
yarn add babel-preset-latest babel-register -D
```

### Fifth, create a `.babelrc` file at the root of your project folder
With the following contents:
```JavaScript
{
  "presets": ["latest"]
}
```

### Sixth, add the following section to your `package.json`.
If you already have a `scripts` section, you can replace it with the following one.
```JavaScript
"scripts": {
    "test": "./node_modules/mocha/bin/mocha test/*.js --require babel-register --reporter spec || exit 0"
},
```
The idea here is easy, Mocha just uses `babel-register` to transpile the file on the fly. Via this approach, you can write you tests and codes both in ES6, and tests them without pre-transpiling the code.

### Run your tests via command line
```bash
npm run test

# Or, just:
npm test
```

You can do the second trick since the `test` is a reserved keyword of NPM.

## See the fancy result
```bash
> testMocha@1.0.0 test /Users/albertgao/codes/node/testMocha
> ./node_modules/mocha/bin/mocha test/*.js --require babel-register --reporter spec || exit 0

  Test the behavior of addTwo()
    ✓ should return 2 when given 1 and 1 via expect()
    ✓ should not return 3 when given 1 and 1 via should()

  2 passing (8ms)
```

## Why not Jasmine?
A little off-topic talking before ending. Why not Jasmine? It is good, it is full featured. Has built-in assert, mock(spy), ajax call, etc. And it's easy to configure too. Sometimes just as same as Mocha, but with Mocha, you can choose your own favourite assertion library, like `Chai` or `better-assert`. And choose mock library like `Sinon.js`, and even for the reporter part, you can use different reporter for a different outlook, even for exporting a HTML report.

So the main differences between `Mocha` and `Jasmine` is that you don't this so called `javascript fatigue` anymore with `Jasmine`. But this is just why we love `JavaScript`, right? (Not wierd, think about it. :)