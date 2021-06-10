---
title: How to debug Typescript in VS Code
date: 2021-06-10 11:28:39
tags:
  - typescript
---

Since this waste me a hour. I decided to publish my experience here to save your time.

<!--more-->

## add the following config to your projectRoot/.vscode/launch.json

This is the only setup that works for me. The official VSCode documentation and ts-node documentation are all full of errors when running. This setup also enables you to use your own `tsconfig.json`, just swap that `tsconfig.debug.json`.

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid:"830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Debug Play.ts",
      "runtimeArgs": [
        "-r",
        "/absolute-path-to-project/node_modules/ts-node/register"
      ],
      "env": {
        "TS_NODE_PROJECT": "${workspaceFolder}/backend/tsconfig.debug.json"
      },
      "args": ["${workspaceFolder}/backend/play2.ts"]
    }
  ]
}
```
