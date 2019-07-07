---
title: use stage to manage environment variables in Serverless framework
date: 2019-07-07 14:59:53
tags:
  - serverless
---

Serverless framework is a fantastic framework to simplified your serverless management. Most of the time, we have some configurations which are different among different environments. Let's say how could we achieve this with Serverless framework. Including manage tests in Jest.

<!--more-->

## 1. Overview

The application should be environment agnostic. So we manage all the values in the environment variables and use it in your lambda.

1. Separate environment variables in their own `.json` file.
1. Load the above `.json` file conditionally in your `serverless.yml`
1. Add all the environment variables from the loaded `.json` file

For the following sections, we will setup two environments, `dev` and `prod`, this setup is very scalable, adding more env like `uat` is just a matter of adding new `uat.json`.

## 2. Create `.json` file for your environment variables

This is the `./src/config/dev.json`

```json
{
  "SECRET": "1234",
}
```

This is the `./src/config/prod.json`

```json
{
  "SECRET": "5678",
}
```

## 3. Setup your `serverless.yml`

```yml
custom:
  stage: ${opt:stage, 'dev'}
  config: file(./src/config/${self:custom.stage}.json)
```

You will add this at the top level. Let's digest it line by line.

- We first created a `custom` section. This is how we DIY the settings.
- `stage: ${opt:stage, 'dev'}`: Means we will add a `stage` under `custom`, we would like to get the value from the CLI option `--stage BLAHBLAH`, if no value from the CLI option, the fallback value will be `dev`.
- finally, we created `config`, and it is a `file()`, the source of the file is `./src/config/${self:custom.stage}.json`, `self:custom.stage` refers to the current stage, which will be dynamic. Which means we will load `dev.json` or `prod.json` conditionally according to the CLI option or fallback value.

## 4. Map all the environment variables

```yml
provider:
  environment:
    SECRET: ${${self:custom.config}:SECRET}
```

After loading the file, the rest is as easy as map them to the `provider` section of your `serverless.yml`. Here, we created a `SECRET`, the value is from the `SECRET` property in the `.json` file.

> In your lambda, `process.env.SECRET` will give you the value. And the value will be dynamic according to the current `stage`.

The values under `provider` section will be shared across all functions. If you want a function-specific environment variable, you can add it under the very function that you want to configure.

## 5. What about unit test

I use Jest to test, the problem is when we run the tests via `jest`, we lose the support of the framework, so all our previous setup is not working anymore.

This is easy to solve. At the top of your test.

```javascript
import config from "../config/dev.json";
process.env = config;
```

You can use `test.json` if you have a different setup. It's very easy to understand, we import this json, and manually assign them to the `process.env`.

## 6. End

Hope it helps.

