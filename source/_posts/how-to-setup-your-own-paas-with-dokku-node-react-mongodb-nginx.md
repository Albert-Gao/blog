---
title: How to setup your own PaaS with Dokku + Node + React + Mongodb + Nginx
date: 2019-01-28 16:51:34
tags:
  - docker
  - dokku
---

Setup environment could be tedious, but [Dokku](http://dokku.viewdocs.io/dokku/) just makes it tremendously easy. Even more, you can have your own CD setup under 5 mins with everything. Let's see how we can get up and running for this app: A Node back-end with a create-react-app powered front end, and we will use MongoDB.

<!--more-->

I use Ubuntu 18 x64, it should be more or less the same if you use other Linux distribution. I assume you start everything from scratch, I mean, a fresh newly installed OS.

## 1.Install Dokku on your host

- Download the bash command to install:
  - `wget https://raw.githubusercontent.com/dokku/dokku/v0.14.5/bootstrap.sh;`
  - Find the latest version number here: https://github.com/dokku/dokku/releases
- Execute it:
  - `sudo DOKKU_TAG=v0.14.5 bash bootstrap.sh`

## 2. Setup Key and Host

- Open the IP or domain name from the browser.
- You will see a UI to setup the public key, you can paste it in the textbox or it will derive from the `~/.ssh/authorized_keys` on the host.
- Then setup your domain name, if you want to deploy to sub-domain, you need to select that `Use virtualhost naming for apps`. You don't need to put the protocol here. And if you only have a IP, just put it there (IP only, no protocol), it's fine.

## 3. Setup App and Database

- Login to your host
- Create the app to deploy: `dokku apps:create your-app-name`
- Setup MongoDB
  - Install: `sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo`
  - Set version number: `export MONGO_IMAGE_VERSION="4.0"`
  - Create the database: `dokku mongo:create your-db-name`
    For the permission problem: you can add the permission to that folder: `chmod a+w /var/lib/dokku/services`
- Link App to Database:
  - `dokku mongo:link your-db-name your-app-name`

## 4. Prepare the code

When deploying, you can either use `buildpack` from `Heroku` or setup your own `Dockerfile`.

Setup `buildpack` is super easy, you open the `package.json`, setup the node version and npm version with the one you like:

```json
"engines": {
  "node": "^10.0.0",
  "npm": ">= 6.4.1"
},
```

And then you just need a `start` script in `package.json` in order to start your back-end node app.

### 4.1 Building the front-end code

Something special here is that we need to build the front-end code.

The is my folder structure:

>---root <br>
>------client <br>
>------public

You can see here that the front end code sits in `client` folder which is a sub-folder of the back-end code (`root/`). The `public` folder is the folder for holding static assets. After building the front end code, the result should be ported to this folder.

So I add this simple script to `package.json`:

```json
"heroku-postbuild": "cd client && npm i && npm run build && cd .. && rm -rf ./public && mv ./client/build ./public",
```

Nothing fancy here, it goes to the `client` folder, install npm, then build, and go back to replace `public` with `client/build`.

The interesting part is `heroku-postbuild`, once `Dokku` sees this, it will run the command after building. Which means, it will happen in the end in the end.

## 5. Deploy

The basic idea of deploying is to `git push` the code to your server, then `Dokku` will create the Docker image, and swap with the production container.

So, in you repo, you first need to setup a `git remote`:

`git remote add repo-name dokku@IP-OR-DOMAIN:your-app-name`,

> The key part of this is to setup the private key on your local machine. So it can connect to the server and do the push.

Finally, let's push via `git push repo-name master`.

Your code will be there.

## 6. Setup port map

Your server app will expose some port, and in order to access it from the browser, we need to map it to port 80 **on the server**.

Login to the server, setup the port.

`dokku proxy:ports-set your-app-name http:80:your-app-port
`

Replace the `your-app-port` with your port in use.

So, every time, when Nginx receives a request, it will redirect to `your-app-port`.

## 7. Setup Ubuntu UFW

Since we are already on the server, let's setup the Ubuntu UFW. A built in firewall.

```bash
# enable it
ufw enable

# open ssh
ufw allow ssh

# open 80 port
ufw allow www

# check the status
ufw status
```

## 8. Connect your app to the MongoDB instance

You can get the connection string with this command on the server:

`dokku mongo:info your-db-name`

The `Dsn` field is what you need. :)

## 9. Not the end

So, everything will be fine, until you realize one problem, which is, every time you `git push`, it will deploy, but it will install the `node` and `npm` every time. This is due to the constraint that `HeroKu` will not cache your dependencies.

It maybe fine for most of time, but when you concern about the time or you are deploying to an environment where you can't easily access some website. Then you might want to change to another way to build, which is,

**`Use your own Dockerfile.`**

Once `Dokku` sees there is a `Dockerfile` in the root of your app, it will use it instead of `buildpack`.

I have written another [blog](/2019/01/28/how-to-create-your-own-dockerfile-for-a-rapid-dokku-deployment/) to cover that, to make it a lot faster.

## 10. End

Hope it helps.