---
title: Setup Monorepo via Yarn workspace for Serverless Framework and Expo with Typescript
date: 2020-04-10 16:20:16
tags:
---

I created a universal app with Expo for native mobile and web. It works wonderfully. I think a monorepo for local code sharing should efficient than publishing to a private package to Github registry (It works like a charm though).

I thought it's just a 5 min setup. But I was wrong... Still very easy though. In this blog, we will use monorepo to share code between the backend(Serverless framework) and frontend(Expo).

I always try my best to introduce less overhead and less dependencies to solve a problem.

Our goals

- `Yarn` only without `lerna`: Less overhead. And We do not need `lerna`
- Yarn version: `v1.22.4`
- Typescript support for all three modules
- I just want to focus on coding without worrying about building pipeline
- No no no, no Babel, that'll introduce loads of dev-dependencies, I want a clean tree.
- I will show you how to use as well

<!--more-->

## 1. Big picture

The project contains 3 parts:

1. Frontend:
   - Typescript
   - React native
   - PWA for Web
   - framework: [Expo](https://expo.io/)
   - building: [Expo](https://expo.io/)
1. Backend:
   - Typescript
   - AWS Lambda / Cognito
   - framework: [Serverless framework](https://serverless.com/)
   - building: just `tsc`
1. Code sharing:
   - Typescript
   - building: [tsdx](https://www.npmjs.com/package/tsdx)

> `tsdx` is a zero config CLI for Typescript written via the author of formik, Jared Palmer.

This is the final folder structure.

```bash
--monorepo
  --serverless --> build via tsc
  --universal  --> build via expo
  --shared     --> build via tsdx
```

There is no `packages` as you see, because we are not using `lerna`, and I am really want less nesting.

## 2. Setup

1. Creating the `monorepo` folder
1. Put the following `package.json` file into the folder:

```json
{
  "private": true,
  "workspaces": ["shared", "universal", "serverless"]
}
```

## 3. Manage the `shared` modules

```bash
## from ./monorepo
npx tsdx create shared
```

Choose template: `basic`

Open the `./monorepo/shared/package.json`, update the following properties

```json
{
  "name": "@monorepo/shared",
  "version": "0.0.1"
}
```

## 4. Manage the `serverless` part

```bash
# from ./monorepo
mkdir serverless
cd serverless
npm init -y
serverless create --template aws-nodejs
```

In the `./monorepo/serverless/package.json`

```json
{
  "name": "@monorepo/serverless",
  "script": {
    "build": "rm -rf ./dist > ./rm-err.txt && tsc"
  },
  "devDependencies": {
    "serverless": "^1.67.0",
    "serverless-plugin-monorepo": "^0.8.0",
    "typescript": "^3.8.3"
  }
}
```

> There is a problem with this monorepo approach, is the some packages will be hoisted to the `./monorepo` level `node_modules`, which will cause Serverless framework not included them in the final `.zip` file. `serverless-plugin-monorepo` is for solving this problem without disabling the hoisting feature from Yarn workspace.

Add this to your `serverless.yml`

```yaml
plugins:
  - serverless-plugin-monorepo
```

Also in `serverless.yml`, update this:

```yaml
functions:
  hello:
    handler: handler.hello
```

to

```yaml
functions:
  hello:
    handler: dist/handler.hello
```

We will point to the final transpiled code directly.

Let's add the `./monorepo/serverless/tsconfig.json`

```json
{
  "compilerOptions": {
    "preserveConstEnums": true,
    "strictNullChecks": true,
    "inlineSources": true,
    "inlineSourceMap": true,
    "sourceRoot": "./src",
    "lib": ["ES2019"],
    "module": "commonjs",
    "target": "ES2019",
    "outDir": "dist",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "rootDir": "./src",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["./src"],
  "exclude": ["node_modules", "src/**/*.spec.ts"]
}
```

I am using Node 12, so I compile to `ES2019` which has very less overheads. Change it if you are using a different node version. You can find this information from the [official Typescript repo](https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping).

## 5. Manage the `Expo` part

```bash
## from ./monorepo
expo init
```

Select the `[Managed] Blank Typescript` template,
give it a name `universal`

Update `./monorepo/universal/package.json`:

```json
{
  "name": "@monorepo/universal",
  "version": "1.0.0",
  "main": "__generated__/AppEntry.js",
  "scripts": {
    "postinstall": "expo-yarn-workspaces postinstall"
  },
  "devDependencies": {
    "expo-yarn-workspaces": "^1.2.1"
  }
}
```

Update the `./monorepo/universal/app.json`:

```json
"packagerOpts": {
    "config": "metro.config.js"
}
```

Create a file named `metro.config.js` under `./monorepo/universal/`

```javascript
const { createMetroConfiguration } = require("expo-yarn-workspaces");

module.exports = createMetroConfiguration(__dirname);
```

## 6. Tidy up

Removing all `node_modules` in the 3 sub-folders if has.

```bash
## from ./monorepo
yarn
```

Not everything has been setup.

You are good to go!

## 7. How to use

### How to consume the code in `shared` module

1. Import code like this `import {sum} from '@monorepo/shared'`
1. Any updates to `@monorepo/shared`, run the command `yarn build` under that `./monorepo/shared` or `yarn workspace @monorepo/shared build`

### How to add dependencies to one of the modules

`yarn workspace @monorepo/universal add BLAH`

## 8. End.

I had a problem with one of the dependencies not get the updated version even after I running with clearing the cache `expo start -c`, the solution is `expo update`, but that takes too long. So I want to setup a monorepo. It turns out works pretty well.

One thing I'd like to have but do not have time to figure it out is: in `@monorepo/shared/package.json`, change `main` to `./src/index.ts`, then in `Expo`, you can instantly get any code changes without building, which means, we are referring to the source code. But I do not know how to get it working with `@monorepo/serverless`, the `import {A} from '@monorepo/shared'` will be transpiled to `const A = require('@monorepo/shared')`. And of course, `@monorepo/shared` is not been brought and transpiled. If you know how to solve it, please let me know.

That's all, hope it helps!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
