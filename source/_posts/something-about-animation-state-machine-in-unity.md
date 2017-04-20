---
title: Something about the animation state machine in Unity
date: 2017-03-20 14:42:30
tags:
  - unity
  - game
---

Recently I finished my last paper for my study programm - Game Development, the final project is a 2D fighting game developed using Unity, I am responsible for anything related to the enemy (AI, state machine, animation tree, including Boss), openning cut scene, and a QTE(quick time event) system as well. We did a pretty well job and finally get a A+ for this paper. But still lots of lessons have been learned through the whole procedure. The biggest lesson is the coding pattern for a character which heavily relies on animation.

<!--more-->

## The animation is all.
Besides the physical engines, 3D knowledge (Which you don't need to know when develope a 2D game), APIs and other things. Animation is such a key topic which you will spend most of your time on it. So when you learn Unity, put a considerable time on the animation section.

### Coding align with the animation state machine.
The built-in animation system is just a state machine. Your character has several states (idle, sit, run, walk, etc), you use transitions to switch among them. And you can adjust the details of each transition by using according parameters.

When you programm your character, it's cool to jump into the `Update` method to start your journey. But be sure to code align with the animation system. This is a hard lesson that I've learned previously. At first, the logic I put into `Update` is more focused on the enemy AI, animation is just part of the it. Then when debug or think of the whole flow of the enemy, it causes so many problems, since they are not match. So for the 2nd enemy and the boss, I use a state machine in the enemy AI and it is just as same as the states that I've built in the animation system. It results in a much more cleaner code and gives a huge maintainability. But it's pity that you can't use `switch case` in C# for determine the current state.

A code sample is like the following, beware that when you declare the variable for the animation state, include the layer name, so the refer string is `Base Layer.walk` rather than `walk`. `walk` is the name of the state:

```Csharp
publc class ArcherAI:MonoBehaviour
{
   private int walkState = Animator.StringToHash("Base Layer.walk");
   private int aimState = Animator.StringToHash("Base Layer.aim");
   
   void Update()
   {
      currentBaseState = animator.GetCurrentAnimatorStateInfo(0);

      if (currentBaseState.fullPathHash.Equals(aimState))
      {
         //TODO: fire the arrow
      }
      else if (currentBaseState.fullPathHash.Equals(walkState))
      {
         //TODO: walk to the player
      }
   }
}
```
A important detail here is always remember that `Update()` is rendered in a frame basis. So before you change the current animation to a new one, your logic branch for the current animation will get exectued again and again. So you may need some kind of mark variable `isAimOver` to indicate whether it is a proper time to change to another animation state.
