---
title: How to use blend tree in Unity for a 2D game
date: 2017-03-20 14:36:29
tags:
  - unity
  - game
---

A game is all about animation, your character plays different animations according to different states. When you develop a 2D game,sometimes you might need to change the direction that your character faces, it requires different animations, and if your game is a 8 direction game, it will be 8 animations for each action (run, walk, shoot, etc). It is a nightmare to create them in the animation view and transition them in code.

<!--more-->

Blend tree is the answer here. You can pass the in-game values to a blend tree and let the blend tree to automatic pick up the proper animation for you.

For example, when you want to render 8 direction walking animations,the whole work flow is like the following:

1. you create a blend tree
2. create 2 float type parameters: `moveX` and `moveY`
3. set its `Blend type` to `2D Simple Directional`
4. then you set the `Parameters` of the newly created blend tree to `moveX` and `moveY`
5. then you add all the 8 direction motions to the blend tree. 
   - In terms of the `PosX` and `PosY` values, imagine a simply 2D world with just x-axis and y-axis. Your character stands at `(0,0)`, 
   - so when he goes up, the coordinate will be `(0,1)`
   - so when he goes down, the coordinate will be `(0,-1)`
   - when goes right, the coordinate will be `(1,0)`
   - when goes down left, the coordinate will be `(1,-1)`
6. Create a boolean parameters named `isWalk` set it as the transistion `Conditions` from the `idle` to your new `walk` blend tree.

Then in your code, you can do something like this:

```csharp
void Start()
{
   animator = GetComponent<Animator>();
}

void Update(){
   // set the animation
   animator.SetBool("isWalk", true);

   // normalize the destination coordinate
   Vector2 pos = GetEnemyDirection(player, transform);

   // set the direction of the blend tree animation
   animator.SetFloat("moveX", pos.x);
   animator.SetFloat("moveY", pos.y);
}
```

The `GetEnemyDirection` is just a helper method which normalize your destination coordinate so it will always fall into the range `1, 1` Just as same as the `PosX` and `PosY` you have set before, right? :)

Via this way, it is very easy to manage a 8 direction game animation. But Blend tree is more than this, it can be used to blend between 2 animations to create a smooth transition, widely used in 3D animation such as transitioin from walk to run. But the idea is the same. You can learn more in the unity official documents.