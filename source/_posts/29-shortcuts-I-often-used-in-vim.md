---
title: 29-shortcuts-I-often-used-in-vim
date: 2016-10-04 17:44:39
tags:
---

VIM is a great editor, but it will confused you at first since its unique design. But I still think you should learn it since it seems a must-have for every developer nowadays. Especially when you need to deal with some bash-heavy works.

And VIM is really just about shortcuts, you know them, use them, and you conquer VIM. Now I share the 29 shortcuts which I use a lot in daily. There are tons of them. But these 29 are the most intuitive ones and very easy to remember. You can be an efficient VIM user if you learn these 29 well I believe. :)

<!--more-->

## Brief for beginners
VIM has 3 modes:

* **Command Mode** : The following command are all valid in this mode.
* **Insert Mode** : The normal editing mode like any other editors out there.
* **Visual Mode** : Select contents for copying or cutting.

## Mode change
* **i** : Start insert mode at current cursor position
* **v** : Enter the visual mode.
* **ESC** : Exit insert/visual mode

## Cursor Movement
This is the most exciting part of VIM. Let's say you want to move to some special position in a line, either you need to press 'right' or 'left' a lot, or you need to move the hand to the mouse to do it. But in VIM, you can press `w`, and it will move the cursor as a word-base which is way more effective than the former ones.
* **w** : Jump by start of words (punctuation considered words)
* **b** : Jump backward by words (punctuation considered words)
* **0** : Start of line
* **$** : End of line
* **o** : Open (append) blank line below current line (no need to press return)
* **O** : Open blank line above current line

## Edit
* **u** : Undo
* **r** : Replace single character
* **cc** : Change an entire line
* **cw** : Change an word

## Select contetnts (you can copy and cut later)
* **v** : After entering visual mode, you can use up/down/right/left to select the contents you want, but there are 4 shortcuts in visual mode which can grant you a quicker operation.
  * **ab** : Select a () block with braces
  * **aB** : Select a {} block with brackets
  * **ib** : Select a () inner block without braces
  * **iB** : Select a {} inner block without brackets

## Copy
>In VIM, we don't say 'copy', we say 'yank'.
* **y** : Yank (copy) the selected contents
* **yy** : Yank a line
* **yw** : Yank a word

## Cut / Delete
* **d** : Delete/cut the selected contents
* **dl** : Delete/cut a letter, this shortcuts has an more simple alternative one, **x**
* **dw** : Delete/cut a word
* **dd** : Delete/cut a line

## Paste
* **p** : Paste the clipboard before the cursor, uppercase after the cursor

## Exit
* **:w** : Save file
* **:wq** : Save and exit
* **:q** : Quit
* **:q!** : Quit and ingore all changes.

## End
As I told before, VIM has tons of shortcuts, but now you are good to conquer the rest of them. :)