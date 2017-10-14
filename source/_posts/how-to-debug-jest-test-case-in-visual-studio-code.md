---
title: How to debug Jest test cases in Visual Studio Code
date: 2017-10-14 15:40:46
tags:
   - jest
   - test
   - vsc
---

Once again, I went back from `WebStorm` because some annoying bugs which I can't evaluate variables at runtime. But configuration in Visual Studio code could be a little bit tricky sometime. Thanks to my time spent before, I grabbed an old configuration, after modification, it works flawlessly in the current release of Visual Studio Code. Let's see how to debug Jest test cases in VSC.

<!--more-->

# Configuration

Open the `.vscode` folder inside your project, create a `launch.json` if you don't have one, if you already have one, just grab the part you need.

The configuration is as the following:

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Jest",
            "type": "node",
            "request": "launch",
            "env": { "NODE_ENV": "test" },
            "cwd": "${workspaceRoot}",
            "program": "${workspaceRoot}/node_modules/.bin/jest",
            "stopOnEntry": false,
            "args": [
                "--config=config/packages/jest.client.config.json"
            ],
            "runtimeArgs": ["--nolazy"],
            "console": "internalConsole",
            "sourceMaps": false,
            "internalConsoleOptions": "openOnSessionStart"
        }
    ]
}
```
Now put a break point somewhere in your test file. <br>Press that green play button in debug panel.<br>
Enjot :)

**Tips:**

1. `args` is where you put extra command line parameters for `jest-cli`
1. If you want to point to a specific config file, you can use the above example, the `config` folder I use is a direct sub-folder in the `${workspaceRoot}`.

# Extra tip

## Open inline values

Add the following line to the settings:

```json
"debug.inlineValues": true
```

It will   show variable values inline in editor while debugging. Which is pretty useful, must more clear than hovering your mouse there, it's `false` by default, so, turn it on if you haven't.

## Find extra settings

Open `settings`, `CMD+,` on `Mac`, search `debug`


# End

Hope it helps.