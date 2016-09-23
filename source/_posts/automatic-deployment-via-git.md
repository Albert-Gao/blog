---
title: Automatic Deployment via git"
date: 2016-09-21 21:18:40
tags:
  - tutorial
  - git
---

If you use a static blog system as me or a static site. You may consider which deployment suits you better, sftp maybe a stable old-school way. Today let's use git to complete this quest. No, not push-then-pull, you can actually push only :)

<!--more-->

## 1. a hook? 
We will take advantage of one feature from git called `hooks`. It defines some actions that will be done after some triggers. For instance, you can define some actions right after the `push` command. Let's say you wanna copy a whole folder to different place after the server receive a `push`. Such as this, you have a automatic deployment system.

There are three typeof of hooks in git:

* pre-receive: As the name, the action will be taken as soon as the server receives a `push` command
* post-receive: Same as `pre-receive` but will operate on each branch
* update: Will be executed when `push` ends.

And, we will use the `update` one :)

## 2. Create a git repository on the server
The following command is simple, just create a folder named blog.git, then make it a git repository.

``` bash
cd /var
mkdir repo && cd repo
mkdir blog.git && cd blog.git
git init --bare
```

## 3. Make the hook
Now I assume that you still follow from section one, you should be in the `blog.git` folder.

```bash
cd hooks
```

Using the `ls` command you will see lots of sample files. But we will create our own, and the type is `post-receive`.

```bash
vim post-receive
```

Press `i` to enter the edit mode. Write down the following:

```bash
#!/bin/sh
git --work-tree=/var/www/blog --git-dir=/var/repo/blog.git checkout -f
```

It is easy to understand, all the files in the `git-dir` folderwill be checkouted to `work-tree` folder.

You should change that `/var/www/blog` to your own folder which holds all the files of your blog.

And this file should be executable. So we need to change its permission.

```bash
chmod +x post-receive
```

## 4. Local repository
Now, as normal, you need a local git repository to hold your codes. You can create whatever name you want.

```bash
mkdir blog && cd blog
git init
git remote add deploy ssh://username@domain.com/var/repo/blog.git
```

Change `username` to your own user name, and `domain.com` to your domain. Furthermore, add the folder hierarchy to the last.
In the example, I use `deploy` as the alias. I don't use `origin` since I have multiple remote repositories. You can use it if you wish.

## 5. Magic time.
From now on, every time after you writing a blog, you just simply follow the normal procedures of git, `add`,`commit` and `push`. Then your blogs will be automatically deploy to the server. This adopts if you maintain a static site as well.

```bash
git add -A
git commit -m "first try"
git push deploy master
```