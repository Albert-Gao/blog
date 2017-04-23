---
title: Setting up React with Babel, Mocha, Chai, Enzyme and Webpack
date: 2017-04-23 02:56:50
tags:
   - test
   - react
   - babel
   - mocha
   - chai
   - enzyme
   - webpack
---

I'm not a big fan of black magic, especially when I set up my development environment. Every module I have installed, I want to know exactly what problem does it solve. And every feature I have used, I want to know how to customize it to suit my needs. You could use [create-react-app](https://github.com/facebookincubator/create-react-app), but I like to manage all the things by my own hands. And when you know what you need, it is not that hard. 

Now let's set up a React environment with Tests, ES6 and bundle enabled (With HMR).

We'll go through every step and explain why we need that module.

<!--more-->

## 1.First of all, what we want?
- We want to write React via ES6, so we need to `babel` as our transpiler
- We want to test our app via `Mocha`, and using `Chai` to make the assertion
- We will use `Enzyme` to test our React Component.
- We want to use ES6 to write our test cases as well.
- We want to bundle our project via `Webpack v2`.
- We will use the Hot Module Replacement (HMR) feature from Webpack to speed up our process.

## 2.Create the folder structure
```bash
root
--src/
--dist/
--tests/
```
**About the sub-folders:**
- `src`: Whole the source codes sit here.
- `dist`: All the transpilered codes (ES5 version) sit here.
- `tests`: Folder for test cases.

## 3.Install React
- Firstly, initialize a new NPM configuration there via `npm init —yes`, `yes` means default answer to all questions, speed up the procedure. 
   - It will generate a `package.json` at the root of your project folder.
- Secondly, Install React dependencies by `npm install --save react react-dom`
   - `--save` means `react` and `react-dom` are our dependencies. Our application needs them to run. And they'll appear in the `dependencies` section of your `package.json`

## 4.Add ES6 support
Now we will add `babel` via the following command:
- `npm install —save-dev babel-cli babel-preset-env babel-preset-react`
   - `babel-cli` is a built-in CLI which can be used to compile files from the command line.
   - `babel-preset-env` is a presets for determining the Babel plugins and polyfills you need based on your supported environments.
   - `babel-preset-react`: A preset for react related thing such as `jsx` and `flow.js`.
- Create a `.babelrc` file at the root of your folder, you can include it in the `package.json` as well if you prefer fewer files at your root.
   - `--save-dev` means we need these libs when we develop, but not for the production. And they'll appear in the `devDependencies` section of your `package.json`

```json
{
  "presets": ["env", "react"]
}
```

## 5.Add Webpack support
- Install webpack by using `npm install --save-dev webpack webpack-dev-server babel-loader babel-core`, we are ready to bundle our project.
   - `babel-loader` is a loader that webpack will use to deal with `.js` files.
   - `webpack-dev-server` is a local server for running your web app
- Add a `scripts` section in your `package.json`:

```json
"scripts": {
   "build": "./node_modules/.bin/webpack",
   "start": "./node_modules/.bin/webpack-dev-server --progress"
}
```

Then you can use `npm run build` to bundle your project via webpack or use `npm start` start your dev server.

- Add a configuration file named `webpack.config.js` at the root:

```javascript
var path = require('path')
var webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module:{
        rules:[{
            test: /\.jsx?$/,
            include:[path.resolve(__dirname, 'src')],
            exclude: [path.resolve(__dirname,"node_modules")],
            loader: "babel-loader"
        }]
    },
    devtool: "source-map",
    devServer: {
         contentBase: path.resolve(__dirname, 'dist'),
         publicPath: '/',
         port:9876
    },
}
```
All the settings here are self-explained via their names. the `app.js` is the entry file of our project, we will add it later. Beware the structure here, should be very easy to understand: 
- Our app starts at `entry`
- we want the final bundle file to be in the place mentioned by the `output`.
- We have some `rules` to deal with different files, `.jsx` is our current focus.
- And we want to enable `source-map` as a developing tool.
- Finally, we want a `devServer` which use the configuration we want.

## 6.Check if React works.
Create 3 files:
- `app.js` in the `src` folder: This is the entry of our project.

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import {Hello} from './HelloComponent'

ReactDOM.render(
   <Hello />,
   document.getElementById('root')
);

```

- `HelloComponent.js` in the `src` folder: This is our hello world ES6 component.

```javascript
import React from 'react'
export class Hello extends React.Component{
    render(){
        return(
            <div>
                <h1>Hello world</h1>
            </div>
        );
    }
}
```

- `index.html` in the `dist` folder.
```html
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <title>Start React</title>
   </head>
   <body>
      <div id="root"></div>
      <script src="bundle.js"></script>
   </body>
</html>
```

Run command `npm start`, and open `http://localhost:9876`, you will see your hello world.
Webpack dev server will build and display your app.

## 7.Add testing libraries
`npm install  --save-dev mocha chai enzyme babel-register react-test-renderer`
- `babel-register` is a plugin for `Mocha` to use on the fly to transpile your ES6 test files
- `react-test-renderer` is a plugin for `React 15.5.+`, since there is a breaking changing here, you need this plugin for `enzyme` to run.

Create a `test_Hello.js` in the `tests` folder:

```javascript
import chai from 'chai'
import React from 'react'
import {Hello} from '../app/HelloComponent'
import {shallow} from 'enzyme'

let expect = chai.expect

describe("<Hello/>", ()=>{
    "use strict";
    it('renders one <h1> tag', ()=>{
        const wrapper = shallow(<Hello />);
        expect(wrapper.find('h1')).to.have.length(1)
    });
})
```

It will test if there is an `h1` tag in our `<Hello/>` module, it should pass.

```bash
  <First/>
    ✓ renders one <h1> tag

  1 passing (28ms)

```


## 8.Add Hot Module Replacement support
HMR could speed up your workflow dramatically. Since it will update the changed modules on the fly without refreshing your page. Cool. It is provided by `webpack`. But you need to add some code in order to enjoy it.

Firstly, add the following setting to our previous `webpack.config.js`, the original settings **remain the same**:

```javascript
module.exports = {
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:9876',
        'webpack/hot/only-dev-server',
    ],
    devServer: {
        hot: true,
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
}
```

We are configuring entries and plugins for HMR. The whole config file is provided at the end of the article.

Secondly, add a hot loader plugin for babel via:
- `npm install --save react-hot-loader`
- Modify the `.babelrc` file to enable this plugin:
```javascript
{
  "presets": [["env",{"modules":false}], "react"],
  "plugins": ["react-hot-loader/babel"],
}
```

- Modify your `src/app.js` to this:
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import {Hello} from './HelloComponent'

const render = (Component) => {
    ReactDOM.render(
        <Component/>,
        document.getElementById('root')
    );
};

render(First)

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept('./Components', () => {
        render(Hello)
    });
}
```

The logic is mostly the same, but we will determine if the HMR setting is on, if it is on, will use `module.hot.accept` to render our app. Remember we have set `hot:true` previously? It will expose the `module.hot` API to our code, so we could detect it via `if (module.hot)`.

Thirdly, now use `npm start` to start your `webpack-dev-server`, if you have followed my tutorial so far, remember to stop and restart the server since we have changed its settings.
After the server has started, go changing the `HelloComponent.js` file, try changing the `Hello world` to `Hello HMR`, look at your browser, the content will change without refresh the page. That means the states of your components will be maintained, cool!

## 9. Story not end.
But if you try to run the test case via `npm test`, it will throw you an error:

```bash
/Users/albertgao/codes/github/React.TODO/tests/test_app.js:1
(function (exports, require, module, __filename, __dirname) { import chai from 'chai';
                                                              ^^^^^^

SyntaxError: Unexpected reserved word
    at exports.runInThisContext (vm.js:53:16)
    at Module._compile (module.js:373:25)
 
```

Wait, what? Shouldn't settle out the testing part before? Why it can't recognize the `import` keyword? The reason is we have set `"presets": [["env",{"modules":false}], "react"]` to enable the HMR feature. But it will cause we can't run our tests since we use the `import` feature. How to we make tests work via ES6 while the HMR could work also? A little tricky here:

First, change your `.babelrc` file to this:

```javascript
{
  "presets": [["env",{"modules":false}], "react"],
  "plugins": ["react-hot-loader/babel"],
  "env":{
    "test":{
      "presets":["env"]
    }
  }
}
```

The `env` here will enable us to use the Node.js environment variables to check whether we are under the `test` mode.

Then, change the `test` command in your `package.json` to use it:

```json
"scripts": {
    "test": "NODE_ENV=test ./node_modules/.bin/mocha --require babel-register tests/*.js --reporter spec||exit 0",
},
```

Re-run the test via `npm test`, it should work again.

## 10. The whole webpack.config.js

```javascript
var path = require('path')
var webpack = require('webpack');

module.exports = {
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:9876',
        'webpack/hot/only-dev-server',
        './src/app.js'
    ],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module:{
        rules:[{
            test: /\.jsx?$/,
            include:[path.resolve(__dirname, 'src')],
            exclude: [path.resolve(__dirname,"node_modules")],
            loader: "babel-loader"
        }]
    },
    devtool: "source-map",
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        port:9876
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
}
```

### 11. Happy ending.
Now everything should work as expected, and you are good to go.