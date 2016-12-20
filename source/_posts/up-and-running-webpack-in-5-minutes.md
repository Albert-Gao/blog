---
title: Up and running Webpack in 5 minutes
tags:
  - webpack
id: 123
date: 2016-08-17 22:06:13
---

Front end world has an incredible evolution speed. Especially for the tooling, new kids jump out everyday. Webpack is one of them and seems it will dominate for a while. You may hear its complexity and how its gonna replace your current toolchain. Today, let's bundle webpack like it bundle scripts for us xD

<!--more-->

## 1. What is webpack?

Roughly speaking, it is a tool for bundling your codes. You give it many files, it return you as one file. But it is much more than that, let's continue.

## 2. What is the difference between webpack and gulp/grunt browserify?

There are several differences:

1.  It heavily relies on its configuration file. Not like gulp or grunt you need to code. Here you just need to fill in the blanks. But you can code as well.
2.  It has a built-in pipeline, so you don't need to tell webpack the orders as you usually do in gulp.
3.  It can only manipulate javascript files, if you need more, you need to use **loaders**.
4.  It contains all the common features you need and more. It even get a local server.

## 3. Aha, a configuration-over-coding package, seems we need to learn a lot

Yes and no, you need to know all the properties to use it well, but you can start using it just by introducing just a few properties. Let's take a look at a what does this `webapck.config.js` looks like.

Since you will dealing with the configuration file all the time when you need to interact with webpack. Let's take a look at it first.

When I say "properties", I mean that <span style="color: #0000ff;">**the configuration file is just a file contains a javascript object. This object has many properties that webpack defines. You want new features or modify webpack's behavior? Just play with these properties.**</span>

```javascript
var webpack = require('webpack');
module.exports = {
    entry: "./entry.js",
    output: {
        path: './dist/',
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
    plugin: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
```
It feels... pretty easy, right? xD The next section will tell you how can these properties match with your work flow.

## 4. What happens when it need to processing files?

I will not go into every single properties in this section, I will show you just the very properties you need to up and running. And yes, this is not the actual procedure when the code is running, it is just a way to make sense of the configuration by mapping the running stage.

When webpack starts to executing, it will : (all the keywords below are the names of the properties)

1.  Check `entry`, to see which file or files to start.
2.  Check `module.loaders` or `module.loader` to understand the relations between file extension and loader. For instance, if you declare to load css, which loader should it use.
3.  check `plugins` to see if there are more functionalities you want to extend to.
4.  check `output` to see the where does it need to put the final bundle file.
5.  Start to bundle.
Let's look at the above sample again, does it make more sense now?

```javascript
var webpack = require('webpack');
module.exports = {
    entry: "./entry.js",
    output: {
        path: './dist/',
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
    plugin: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
```

## 5. QA:

### 5.1 I can't debug with the bundled js file! Give me sourcemap.

It is easy, just add a property `devtool:"source-map"`.

### 5.2 I am using typescript or ES6, can webpack bundle them?

Of course, just add a loader, I told you, when you need to load anything other than javascript you need a loader, right? Below is an example for typescript, for ES6, you can use a babel loader.

```javascript
module: {
     loaders: [
         {
             test: /\.css$/,
             loader: ExtractTextPlugin.extract("css-loader"),
             exclude: /node_modules/
         },
         {
             test: /\.ts$/,
             loader: 'awesome-typescript-loader',
             exclude: /node_modules/
         }
     ]
 }
 ```

### 5.3 I've required multiple modules in my project, can webpack works well?

Yes, it can. I have worked with a project which I import lots of modules. Some modules imported in the entry file, some of them imported in another file. Webpack can bundle all of them. You don't need to worry it.

## 6. Summary

Now I strongly suggest to check the [official site](http://webpack.github.io) for more detail, because now you have a clear picture on how the configuration file works, you can understand the documents as well. And they are all well written.

Furthermore, There are two ways to go:

1.  Check the [official page](http://webpack.github.io/docs/configuration.html) to see if there are more properties in this object you can use.
2.  Look through the [plugins](http://webpack.github.io/docs/list-of-plugins.html) and [loaders](http://webpack.github.io/docs/list-of-loaders.html) list to see if there are more features you need.
