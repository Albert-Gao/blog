---
title: Sorting algorithm step by step (2) Selection Sort
date: 2016-11-23 22:32:58
tags:
  - sort
  - algorithm
---

Previously, we have been through the insertion sort, an interesting idea, this time, let's look into something relatively normal. Selection sort, which is an algorithm very similar to the mind of human being when doing a sort.

<!--more-->

## 1. Start with example:

Let's start with the following array:

`[7,3,9,8,2,6]`

First, we start from left to right, as I said, normal, then we take note of the index of the first item.

`7 - [7,3,9,8,2,6]`

Then we compare `7` to the rest of the array one by one, every time we found a number which is smaller than `7`, we take note of that number too. We repeat this step until we meet the end of the array. Now it should look like this:

`7 - Smaller:2 - [7,3,9,8,2,6]`

Then we swap the positions between the two, in this case, we swap `7` and `2`.

`[2,3,9,8,7,6]`

Now the first round is over. The second round starts to rock. This time, we start from the second item of the array (since we already deal with the first one). It is `3`, and via the above method, it will stick with its original position (because all the following number is large than `3`), but we still need to compare from the third item: `5` to the end: `6`.

Now let's sort `9`:

`9 - [2,3,9,8,7,6]`

We compare `9` to the rest of the array which are `[8,7,6]` one by one. The result is like the following:

`9 - Smaller:6 - [2,3,9,8,7,6]`

Then we swap the postions of `9` and `6`. Now we get:

`[2,3,6,8,7,9]`

We repeat this step for the rest numbers from `8` to `9`, this will result in a sorted array.

`[2,3,6,7,8,9]`

## 2. Dig it

Selection sort is surely more easier than insertion sort, since it's as same as human mind. We compare items one by one, and for each comparison, we compare target number with the rest array. But everything comes with a cost, it is simple, so it is not fast.

- **Selection sort** (n == length of the array)
- Worth case: O(n^2)
- Average case: O(n^2)
- Best case: O(n^2)

Remeber that insertion sort can give a `O(n)` in its best case while selection sort consistently preforms in a `O(n^2)`. For the comparison sorting algorithm, we have already meet 2 methods. Is this the best we can do? Except for compare item one by one, what else could we do to improve the performance? Let the story continue in the 3rd story.

## 3. End with code

```c
void selection_sort(int *arr, int size) {
    int i,j,min_index,tempSwap;

    for (i=0; i<size-1; i++){
        min_index = i;

        for (j=i+1;j<size;j++){
            if (arr[j]<arr[min_index]){
                min_index=j;
            }
        }

        tempSwap = arr[min_index];
        arr[min_index]=arr[i];
        arr[i]=tempSwap;
    }
}
```

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
