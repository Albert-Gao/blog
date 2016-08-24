---
title: 7 steps you should do when setup a fresh new Ubuntu server
tags:
  - tutorial
  - ubuntu
  - linux
categories:
  - Blog
date: 2016-08-23 20:04:00
---
when you have a linux server and a newly installed system, what's first thing you will do? Just dive into and play with the bash, no, never, it is not a windows desktop system. It needs some configurations first. Today, let's see how many basic steps do we need to take before we can actually use a fresh new linux system. Yes, I use **ubuntu 16.04.1** in this tutorial, but it should adopted to other linux distros as well. You just need to change `apt-get` part to the other package management system, like `Yum` in Cent OS.

At the below steps, i will not only show the commands, but also explain the detail behind it, so you can know why we use it.

Let's from the very beginning, let's say you just bought it...

<!--more-->

## Installing the system

Install your system with Ubuntu via the panel from your host. While it is installing, you can write down the IP address and root password along with it. (Yes, they will generate the very first password for you.)

## Login to your system
When it finish installing, you should open your terminal on Mac, or putty if you use Windows. Then you can connect to your server via this command:

``` bash
ssh root@11.22.33.44
```

* ssh: It is a protocol which provide you a way to login into the server.
* root: It is the default name of a super-user which will have the most privilege of the system.
* 11.22.33.44: It represents the IP of your server. You should change it to yours.

Then you can see a notification to ask you for entering the password. After it, you will see something like below:

``` bash
root@root:/$
```

Congrats, you made it! After the `$` sign, you can see the cursor, it is waiting for your command.

## Add a new user
We should not use `root` all the time, linux is famous by its well designed permission system. Roughly speaking, everything in this system has a owner, and owner belongs to some group, this will grant the according user the proper permission to read, write or execute the file. Let's use tom as the username, you are free to change to your name. Beware, this is the name you will use for the most of the time. Treat it well. And you need provide a password along it, make it harder for secure.

``` bash
adduser tom
```

>Caveat, when you see `tom` below, you should know that you need to change it to your own chosen name.

## Assign the user to a Group
As I said before, user can belong to some kind of group, with this form, we can apply different permissions more easily. Of course the groups can created by human beings, but there is a special group  created by the system called `sudo`, it is special since if someone is in the group, then it can execute some command which only the super user `root` can use, this will make your life more easier since you don't need to log out and re-login.

There are multiple ways to achieve this, but typing the command is most easy approach.

``` bash
usermod -aG sudo tom
```

This command is simple, is just simple says `add tom to Group sudo`.

## Add your key.
Typing password to enter the system is the most straightforward way, but it is not secure. Since the system can't identity you, anyone who get this password can login your system. There is another way by providing a key. It is much much secure. And you can use it to login your system via SSH also. It is called key pair.

It is called `pair` since there are two of them, one is a public key, one is a private key. It is more secure since it encrypts and decrypts with different keys, and only the public gets send to the server, your private key is always keep on your behalf, so even someone has intercepted your public key, he can't know your private key since the algorithm, it is use prime number to do the encryption which makes it nearly impossible to crack. But there are different algorithms as well, we will use the `rsa` type.

### Generate your key
In order to send your public key, you should generate your own key pair at first, linux has provides a command for you like always.

>NOTICE: All the steps in section 5, You MUST generate the key pair on your own machine.

``` bash
ssh-keygen -t rsa
```

Then it will ask you the location to store it, just hit enter since we will stick with the default location. Then it will ask you for a passphrase, it is just kind of a password wrap around your key pair to make it more secure.

Then you will see some notification to say that the keys has been generated and store in some place.

### Send your public key
Now you have your key pair, as I said, you need to send the public key to the server, more way to achieve this, but we will use a simple way, or, you may think it simple after some explanation.

``` bash
cat ~/.ssh/id_rsa.pub | ssh tom@11.22.33.44 "mkdir -p ~/.ssh && cat >>  ~/.ssh/authorized_keys"
```

* cat: show the content of the following file
* ~/.ssh/: the default folder to store your key pair, this is should be the default one. And `~` represents the home folder of your user.
* id_rsa.pub: the name of your public key file
* If this is not the case, you can find the correct combination in the results of step 5.1.
* **|**: This is a pipeline, it means the result from its lefthand side will be passed to its righthand side.
* ssh tom@11.22.33.44: you know this part, right? But pay attention, we are using **`tom`** to login rather than `root`.
* mkdir -p ~/.ssh : This will execute the first command, `mkdir` is to create a folder, and the folder is `~/.ssh`, `-p` means it will create the folder if it is not there and ignore this command if it is already there.
* &&: Just means `and`, it will connect the following command, and executes these two one by one.
* cat: Here you will encounter the 2nd usage of `cat`, create a new file
* \>>  ~/.ssh/authorized_keys: `>>` means append, it will append some contents to the following file

So overall, the whole command just means, copy your public key, login to your server and store them into a file which inside another folder. After hitting enter, you will need to input your password for `tom` which created by you in the first step.

## Re-login
Now let's re-login to your server via:

``` shell
ssh tom@11.22.33.44
```

You will notice that this time, no one asks for your password. Because the system has your public key, and you have a private key, these two can lock and unlock happily together. No one worries anymore. But you will need to enter the passphrase. But the system like mac can store it for you in its keychain app.

## Set up the firewall
Firewall can filter all your requests such that just certain requests can be sent. Maybe you have installed one on your personal computer, let's install it on your server too.

``` bash
sudo ufw allow OpenSSH
```
Can you see the `sudo` at the first position? Now you can use the command that only the user `root` can use. But you need to provide your password, that's easy, right?

Then let's start the firewall.

``` bash
sudo ufw enable
```
If you are curious, you can use the following command to check the status of your firewall.

``` bash
sudo ufw status
```

## Good to go~
Now this server has been yours, you can hang out in the fancy linux world. :)
