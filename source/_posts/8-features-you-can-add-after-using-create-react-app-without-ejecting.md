---
title: 8 features you can add after using create-react-app without ejecting
date: 2018-11-11 10:59:33
tags:
  - create-react-app
---

I love `create-react-app`, it really makes my life easier. But still I can see there are things that I need to do after bootstrapping a new project with CRA. I will share them to you. And yes, no ejecting. And I create a [GitHub repo](https://github.com/Albert-Gao/enhanced-create-react-app) and added all of them for you.

<!--more-->

## 1. Format you code with `prettier`

Auto formatting the code is huge especially when team members all have the same `prettier` config in place.
`npm install prettier`.

1. `npm install -D prettier`.
2. Install extensions for your IDE.
3. Add `formatAllCode` script in `package.json` for formatting the whole codebase: `./node_modules/.bin/prettier --write './src/**/*.js'`
   - For TypeScript user: `./node_modules/.bin/prettier --parser typescript --write './src/**/*.ts' './src/**/*.tsx'`

## 2. Bundle analysis

Even though nowadays code splitting is very easy to do. But still we will wonder, what's make that bundle file so big. You can only answer this question by inspecting the bundle file.

1. `npm install -D webpack-bundle-analyzer`
2. Add `inspectBundle` script in `package.json`: `node ./inspectBundle.js`
3. Add the `inspectBundle.js` in the project root.

```javascript
// This file is for bundle info analysis.
// use it as `npm run bundleAnalysis` or `yarn bundleAnalysis`
// or directly `node buildAnalysis.js`

process.env.NODE_ENV = "production";
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const webpackConfigProd = require("react-scripts/config/webpack.config.prod");

webpackConfigProd.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: "static",
    reportFilename: "report.html"
  })
);

require("react-scripts/scripts/build");
```

## 3. Update packages easily

Updating packages is really a time-saver. It will check all your dependencies and let you choose which one to update.

- For `npm` user:
  1. `npm install -D npm-check`
  2. add `update` script to `package.json`: `./node_modules/.bin/npm-check -u`

- For `yarn` user:
  1. `yarn add --dev syncyarnlock`
  2. add `update` script to `package.json`: `yarn upgrade-interactive && syncyarnlock`

Why we need that `syncyarnlock` is that the current version `yarn` won't sync the updated version number to `package.json` after `upgrade-interactive`.

And one thing that `npm-check` is better is it will check the breaking change such as one lib bumps its version number from `1.0` to `2.0`.

### 4. Add normalise.css and use it

We all know resetting your css. But nowadays the cool kid all use `normalise.css`. Basically, it's a better version `reset.css`. As it said in its homepage:

> Normalize.css makes browsers render all elements more consistently and in line with modern standards. It precisely targets only the styles that need normalizing.

1. `npm install normalize.css`
2. Add `import 'normalize.css'` to the `index.js`.

### 5. Add Hot Module Reloading without ejecting

Just add one line in your `index.js`: 

```javascript
module.hot && module.hot.accept();
```

One caveat: it's just for develop the static things easier. For things like `state`, doesn't support.

### 6. Support absolute import

I hate doing things like `../../../../` for importing modules. And `create-react-app` supports it.

Just add a `.env` file in the project root with a single line: `NODE_PATH=src`.

Now when you importing, it's all starting from `src` folder, if you want to import `src/assets/logo.svg`, no matter where you are, you just `import logo from 'assets/logo.svg'`, huge win, and much easier to understand and refactor later on.

### 7. Add ESLint support for IDE

Add in-IDE ESLint linting tip is as easy as adding the following section to your package.json:

```json
"eslintConfig": {
  "extends": "react-app"
},
```

Now IDE like VS Code and WebStorm should do their job nicely after you installing the `ESLint` extensions and enable them.

You can even add your own rules here, but, they won't affect how CRA linting your code while building time.

### 8. Use Stylelint for your css

Nowadays, I feel that the IDE can do lots of style linting for you. But if you use `styled-components`, I strongly suggest to start using `stylelint`, it can find the little problem easily, otherwise, an extra `}` in your code might sabotage your whole page and very hard to figure out.

Check official [`styled-components` section](https://www.styled-components.com/docs/tooling#stylelint) for more information.

### END

That's all. Hope it helps. And I have a [GitHub repo](https://github.com/Albert-Gao/enhanced-create-react-app) for you to start with.