---
title: Setup Nginx step by step
date: 2016-08-26 16:47:17
tags:
  - nginx
  - tutorial
  - linux
---

The last time, we have installed a linux system and have [done some preparation to make it ready to use](/2016/08/23/7-steps-you-should-do-when-setup-a-fresh-new-Ubuntu-server/). Now we will install a Nginx on it, and then your private server will become a web server and you can broadcast your ideas to the whole internet :)

Still, I will use Ubuntu 16.4.1, but solutions here still adoptable to the other linux distro.
<!--more-->

## Install Nginx.
Linux has some fantastic package management system. And `apt-get` is the Ubuntu's answer for this. You can use the default Ubuntu's command to install nginx without any problem.

``` bash
sudo apt-get update
sudo apt-get install nginx
```

We first update our repository list, then we update it.

## Let the firewall run.
Remember the last time when we setup a linux system? Firewall is important, it can make your server more secure, and after we install the nginx, we definitely gonna install one. Linux itself use a packet filtering system named `netfilter`, and you need to use commands like `iptables` to manipulate it to create your rules. While this takes time to get familiar with. Ubuntu has a ufw (uncomplicated firewall) to greatly simplify the procedures.

You can use the `list` command to check the application profiles.
``` bash
sudo ufw app list
```

And you will find that Nginx is on the list since it is installed on the system. Now let's enable it.

``` bash
sudo ufw allow 'Nginx HTTP'
```

Let's check the result:
```bash
sudo ufw status
```

You should find the action for Nginx is displayed as `ALLOW`.

## Set up the domain.
### if you have a domain.
Now you can go to your domain provider to set your domain to the IP of your server. And wait a few minutes for the DNS to refresh. Then when you type your domain in the browser. You will see the welcome page of Nginx.

### if you don't have a domain name.
IP is OK too, just type it in the browser, and you will see the result too :)

## Important directory of Nginx.
There are something you need to remember before using is the following place:

* **/var/www/html** : This is the default folder to put the webpage.
* **/etc/nginx** : This is folder to maintain the configuration files for nginx.
* **/etc/nginx/nginx.conf** : The global Nginx configuration file.
* **/etc/nginx/sites-available** : This is where you put the configuration for your site. If you have multiple sites, you will need create multiple files in this folder.
* **/etc/nginx/sites-enabled** : After you create the above configuration files, link them to this folder and nginx will recognize it and server it.


## Config your first site.

### go to the default folder
```bash
cd /var/www/html
```

### create a simple web page
```bash
sudo vim index.html
```

After the interface has shown, press `i` to enter interactive mode to enter your page. Let's make it simple.

```html
<html>
    <body>
        <h1>I love nginx!</h1>
    </body>
</html>
```

When you finish, press `esc`, then type `:wq`. This will save your page and back to the terminal.

## Config the sites.
### Create a configuration file to host the previous page

Go to the configuration folder first.

```bash
cd /etc/nginx/sites-available
```

Create the configuration files
```bash
sudo vim mysite
```
Then type the following, be careful, not to miss a single symbol.

```
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	server_name www.yourdomain.com;

	index index.html index.htm;

	root /var/www/html;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

It is easy to understand, right?

* The server block simply defines a server
* then the following two lines says it should listen to port 80, this is the default port for HTTP service.
* `server_name` indicates which domain name it should bound to.
* `index` indicates the default page when people try to visit your domain.
* `root` indicates the folder which contains the pages. Here we use the default one.
* `location` will map the request to your actual folder.

When you finish, press `ESC`, then type `:wq` to save and exit VIM.

## Make it alive.
Now as we said before, you should link your configuration  file to the `sites-enable` folder to make it alive. You can use this command:

```bash
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
```
Then remove the default site, don't need to worry, you just remove the link file, the actual file still sits in your `sites-available` folder:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

## Config the Nginx server
Calm down, we are nearly there. :)
Since it is a fresh new nginx, we need to configure something.

Let's start.

```bash
sudo vim /etc/nginx/nginx.conf
```

When the contents displays, press `i` to enter interactive mode. Now pay attention, don't mess up the original file, just do what I tell you to do.

### Modify the user
The first line, it indicates the user that installs this nginx, you should change it to the **current login user** since you use this user to install nginx.

```
user albertgao;
```

### Uncomment the below line
You just need to delete the
```
server_names_hash_bucket_size 64;
```

Now, press `ESC`, then type `:wq` to save and exit VIM.

### Test your settings.
Use this command:
```bash
sudo nginx -t
```

It should show something like below:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
### More commands:
There are more commands for you if you need them in the future. They are very much self-explained, so I won't go through them one by one.

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
sudo systemctl disable nginx
```

Otherwise, you are making mistake in the previous steps, just re-check the nginx.conf.

## Now let's setup the permission of your HTML folder
Linux is famous for its permission system. We just set to the nginx user to you, and we need to set the container folder `/var/www/html` to you, so the nginx can read it since you can only access anything belongs to you.

```bash
sudo chown -R $USER:$USER /var/www/html
```

But not enough, we only set the subfolder, we need to setup the permission for the parent folder too.

```bash
sudo chmod -R 755 /var/www
```

### Restart the nginx and enjoy!
The command is simple:

```bash
sudo service nginx restart
```

Now, just type your domain name in the browser, you should see the default `index.html` we've just created.

### Story ends here.
Now it is a long journey. But the logic is very clear:
* Install nginx.
* config the site
* config nginx
* prepare the permission
And you are good to go :)
