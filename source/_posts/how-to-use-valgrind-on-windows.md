---
title: How to use Valgrind on Windows
date: 2016-09-28 11:58:28
tags:
  - tutorial
  - valgrind
---

Valgrind is a famous tool to debug your memory leak, but what sad is it only supports Linux, yeah, not a perfect support even on Mac. But with the new Windows 10 Anniversary update, it all gonna happen. And works way much better than Mac with OS X. Let's rock!

<!--more-->

## What, Linux in a Windows?
It is easy since in the new update, windows has Ubuntu as a subsystem. And it is neither a virtual machine nor some kind of a container. It is a subsystem, roughly speaking, all the functions will finally invoked by Windows sys-call. So this is a 1st class, blazing fast solution. But the prerequisite is you need a new **Windows 10 version 1607 (Build 14393.187) or above**.

## How to install and use it?
When you search online, you will find that you need to join the Windows Insider program and open the developer mode. But no, you don't need to.
1. press `win+s` to open Cortana.
2. search for `windows features`, open `Turn Windows features On or Off.`
3. find `Windows Subsystem for Linux (Beta)`, click to turn it on.
4. After a restart you could now open your windows command line and input `bash`, then enter.
5. It will first download and install Ubuntu 14.04 from Windows store.
6. Then you need to configure your default user and password to the system. **This is just for this built-in Ubuntu, not Windows**
7. Afterwards, every time you need `bash`, you just open CLI then `bash` and enter, splendid!

## Try it first time.
It is a Ubuntu, so you might simply use the command. `sudo apt-get install valgrind`. Yes, it will work as a charm. But only for this part. If you want to use it, it will totally not work.

```bash
# valgrind -v ./test
--1791:0:aspacem   -1: ANON 0038000000-00383d5fff 4022272 r-x-- SmFixed d=0x000 i=205168  o=0       (0) m=0 /usr/lib/valgrind/memcheck-amd64-linux
--1791:0:aspacem  Valgrind: FATAL: aspacem assertion failed:
--1791:0:aspacem    segment_is_sane
--1791:0:aspacem    at m_aspacemgr/aspacemgr-linux.c:1502 (add_segment)
--1791:0:aspacem  Exiting now.
```
You may abort at this stage, since it is a beta feature, and the translation in the Sys-call level may seems a big deal. And after googling, you decide to abort. But, the story never ends like this :)

## How to deal with it?
A brief first:
>You just need to compile Valgrind by yourself on your own machine."

The idea is simple, the procedures is still easy but take a little bit longer than expected. But I will cover all the commands :)

1. Open `bash` in Windows.
2. Update your Ubuntu package lists by `sudo apt-get update`
~~3. Install SVN first via this command: `sudo apt-get install svn`~~
4. Ran Lottem confirmed you need to install subversion next: `sudo apt-get install subversion`
5. Find a folder you want to put the valgrind, anywhere is OK, we just need to compile.
6. Download source code of Valgrind via SVN `svn co svn://svn.valgrind.org/valgrind/trunk valgrind`. It will download the codes and put them into a new folder called `valgrind` right under then folder you create or locate in step 3.
7. Install the library used when compiling by `sudo apt-get install automake`
8. Ran Lottem confirmed that you need to `sudo apt-get install build-essential`
9. Go to the folder of Valgrind via `cd valgrind/`
10. Running the official bash script first by using `./autogen.sh`
11. Configure via `./configure`.
12. From now on, things will get much more normal. first, install `make` via `sudo apt-get install make`.
13. Then `make`, this command will build the files from many modules. Add `sudo` if failed (Thanks Waleed Mahmoud).
14. `make install`, it will copy compiled files into appropriate locations. Add `sudo` if failed (Thanks Waleed Mahmoud).
15. It's done already, but feel free to use `make clean`, it will delete all the temporary files generated while compiling.
16. A `make distclean` will make things much better.
17. Use `valgrind` as you wish.

## Happily ever after
I have built a linked list to test the leak, it works exactly the same way as linux, even better than Mac, OS X, yes, I mean it. The valgrind on OS X will tell you have some leak problems while there is no leak.

```bash
camus@ALBERTSURFACEB:/mnt/d/github/C_Playground$ valgrind ./main
==2529== Memcheck, a memory error detector
==2529== Copyright (C) 2002-2015, and GNU GPL'd, by Julian Seward et al.
==2529== Using Valgrind-3.12.0.SVN and LibVEX; rerun with -h for copyright info
==2529== Command: ./main
==2529==

3.00
4.00
5.00

4.00
5.00

5.00

==2529==
==2529== HEAP SUMMARY:
==2529==     in use at exit: 0 bytes in 0 blocks
==2529==   total heap usage: 6 allocs, 6 frees, 104 bytes allocated
==2529==
==2529== All heap blocks were freed -- no leaks are possible
==2529==
==2529== For counts of detected and suppressed errors, rerun with: -v
==2529== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
camus@ALBERTSURFACEB:/mnt/d/github/C_Playground$
```
And if you have a leak, it will tell you.

```bash
==2539== HEAP SUMMARY:
==2539==     in use at exit: 80 bytes in 5 blocks
==2539==   total heap usage: 6 allocs, 1 frees, 104 bytes allocated
==2539==
==2539== LEAK SUMMARY:
==2539==    definitely lost: 16 bytes in 1 blocks
==2539==    indirectly lost: 64 bytes in 4 blocks
==2539==      possibly lost: 0 bytes in 0 blocks
==2539==    still reachable: 0 bytes in 0 blocks
==2539==         suppressed: 0 bytes in 0 blocks
==2539== Rerun with --leak-check=full to see details of leaked memory
==2539==
==2539== For counts of detected and suppressed errors, rerun with: -v
==2539== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```
Furthermore, running `valgrind --leak-check=full ./main` will give the information of your stack. WOW! Fantastic! After I suffered so much from day 1 for the stupid Surface Book, this is the only time I feel Microsoft is a company you could rely on, haha xD
