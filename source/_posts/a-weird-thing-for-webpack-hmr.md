---
title: Why the Webpack's HMR doesn't work even when there is no error
date: 2017-04-24 10:33:49
tags:
  - webpack
---

Previously, when I tried to set up [`webpack`](https://webpack.js.org/)'s [`HMR`](https://webpack.js.org/concepts/hot-module-replacement/) for [my own React develop environment](/2017/04/23/setting-up-react-with-babel-mocha-chai-enzyme-and-webpack/), I encountered a weird thing, I followed the [official tutorial](https://webpack.js.org/guides/hmr-react/), and still can't get it work, it's interesting to see that there is no error message. All the messages indicate that the system thinks it should work as expected. But actually it's not.

This is how I made it work at last, think it worths a note. And I [contributed a pull request to the official webpack documents and gets accepted](https://github.com/webpack/webpack.js.org/pull/1144).

<!--more-->

# The symptom
- You followed the [official tutorial](https://webpack.js.org/guides/hmr-react/)
- When you change the module, the Chrome console will give the following notices:
   - `[HMR]Update modules...blah blah blah`
   - `[HMR]App is up to date.`
- But nothing changes in the window, if you refresh, you get the updates.

# The reason
The previous outputs indicate the whole settings for `webpack` works fine. What prevents it to work is the module loading.

Before you set up that `["env",{"modules":false}]` or `["es2015",{"modules":false}]`to your existing `.babelrc`. Maybe there is a splitting settings of your `babel` which may not in the file `.babelrc`. This is why webpack still behaves like can't import that module even you have turn the `babel` one off.

# Find it and change
It should somewhere. But now, it's mostly like it is in the `webpack.config.js` as a `options` key or a `query` key. You need to turn off the module settings there as well.

# It shall work now.
You should get HMR works. Quite good, now you could inspect the outcomes without refreshing your browser window.

# Some thinking
A recommendation here is to only manage your `babel` configuration in the `.babelrc`. Remove the other splitting one.

But maybe you have the [same problem as mine](/2017/04/23/setting-up-react-with-babel-mocha-chai-enzyme-and-webpack/#9-Story-not-end), which is, if you turn off the module settings, your ES6 testing will refuse to work since they don't know the keyword `import` now. Two solutions for this:

1. Use a environment variable to manage this [like I said](/2017/04/23/setting-up-react-with-babel-mocha-chai-enzyme-and-webpack/#9-Story-not-end). Now all your babel settings are locating in the `.babelrc` file.
2. Splitting the webpack one to `webpack.config.js`, but be sure to turn off the module like `["env",{"modules":false}]` or `["es2015",{"modules":false}]`.

Hope it helps.
