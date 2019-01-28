---
title: How to create your own Dockerfile for a rapid Dokku deployment
date: 2019-01-28 18:43:45
tags:
  - dokku
  - docker
---

Dokku is good, and I wrote a [blog](/2019/01/28/how-to-setup-your-own-paas-with-dokku-node-react-mongodb-nginx/) for whole setup of Dokku + Node + React + MongoDB. This blog, we will address the issue where if you use the default `buildpack` for building, it will download Node and NPM everytime, which will make it very long in some circumstance, in this blog, we will `Dockerfile` to replace it, make it much more faster, because we will `multi-stage build` with its cache mechanism.

<!--more-->

## 1. What is the requirement

The environment is still the same:

- Node: back-end
- React.js: Front-end
- MongoDB: Database
- Dokku: Container

The folder structure looks like this:

>----root<br>
>--------client<br>
>--------public

- root: back-end code
- client: front-end code
- public: folder for holding all the static assets

The `React.js` is powered by `create-react-app`, for each deployment, we need to build the client, then it will yield a `build` folder, we need to replace the top level `public` with this `build` folder, so we can serve it from our back-end. It is actually quite simple.

## 2. Dockerfile

Create a dockerfile in the root folder.

```docker
# 1. build the front-end
FROM node:10-alpine AS build-react
RUN mkdir /temp-build
WORKDIR /temp-build
COPY client/package*.json ./
RUN npm install --silent
COPY client/. ./
RUN npm run build

# 2. prepare the back-end
FROM node:10-alpine
RUN mkdir /myApp
WORKDIR /offer111
COPY package*.json /myApp/
RUN npm install --slient
COPY . .
COPY --from=build-react /temp-build/build/ /myApp/public/

# 3. run this web-application
EXPOSE 3030
ENV NODE_ENV production

CMD [ "npm", "run", "start" ]
```

### 2.1 build the front-end

This part is pretty easy to understand. We use `10-alpine` here for the base, because it's small and fast. Then We create a new folder `/temp-build` in the container, then copy the `package.json` and `package-lock.json` there, and `npm install`, then we copy the whole folder over, and start building. The interesting part is `AS`, we name our stage as `build-react`, so we can refer to it later.

### 2.2 prepare the back-end

Here, we still use `10-alpine`, we create a new folder, we still do the same steps, copy `packages*.json`, then `install`, copy folder, swap `public` with `build` with this command: `COPY --from=build-react /temp-build/build/ /myApp/public/`.

### 2.3 run this web-application

We expose 3030, then set the production, and run `npm run start` at last.

## 3. End

 It is just that easy. Hope it helps.