---
title: Sorting algorithm step by step (1) Insertion sort
date: 2016-11-08 23:36:51
tags:
  - sort
  - algorithm
---

The best way to learn a sorting algorithm is not coding, but demonstrates it. Insertion sort is such a good start to practice your sorting. The first confusion may start from the name, "insertion", most of the time, we are talking about insert new item into a collection. But in sorting, the overall array is just there, no more and no less. Why do we call it "insertion sort"?

<!--more-->

## 1. An simple example

The example is always a good way to learn. Let's start from a new array `arr` `[7,5,2,8]`:

We start from the second item which index is 1, we bump it out from the array:

`5` — `[7,@,2,8]` start index: 1

Noticed that I use a `@` to represent the original position hold by `5`. Then we start to compare, we compare `5` to all the items that is in the left hand side of it, which is `7` in this case. We found that `7 > 5`, then we move 7 to the right, it will occupy `5`'s position. Now the array becomes like this:

`5` - `[@,7,2,8]` start index: 1

Now the blank position has moved to the left since `7` has moved to the left, then we start to compare `5` to its left hand side ancestors. There is no more, so we **insert** `5` back to the blank space.

`[5,7,2,8]` start index: 1

Since we started from index 1, now we start from index 2, as previous, we bump `arr[2]` out.

`2` - `[5,7,@,8]` start index: 2

We compare `2` to its previous ancestors to the left hand side one by one. So we start comparing `2` to `7` first, which we found `7 > 2`, then we move 7 to the right.

`2` - `[5,@,7,8]` start index: 2

Then we compare '5' and `2`, we found that `5 > 2`, so we continue move 5 to the right, which the array now becomes:

`2` - `[@,5,7,8]` start index: 2

And since there is no more left hand side ancestors, we **insert** `2` back to `arr`:

`[2,5,7,8]` start index: 2

Now we start to bump `arr[3]` out.

`8` - `[2,5,7,@]` start index: 3

As usual, we compare from right to the leftmost. It seems that all the items are less than `8`, and when we finish comparing `2` and `8`, we **insert** `8` back to the `arr`, which is its original place:

`[2,5,7,8]` start index: 3

And when we increase the index by 1 to 4, it becomes `out of index`, so we stop, and now the array is sorted.

## 2. Algorithm brief

Insertion sort is just this easy, you start from the **2nd** item, we bump it out, and compare to all its ancestors to the leftmost item. Everytime we found a item which is bigger than the bumped item, we move it to right by one cell. Until we finishing comparing all its ancestors, we **insert** the bumped item back the blank space. And we repeat this one by one, until we hit the last item in the array. And the array is sorted.

## 3. The C version of insertion sort

Just give you the code, and everybody is happy.

```c
void insertion_sort(int *arr, int size) {
    int start,previousIndex,insertValue;

    for (start = 1; start < size; start++) {
        insertValue = arr[start];
        previousIndex = start - 1;

        while (previousIndex >= 0 && arr[previousIndex] > insertValue) {
            arr[previousIndex + 1] = arr[previousIndex];
            previousIndex--;
        }

        arr[previousIndex + 1] = insertValue;
    }
}
```

## 4. Fancy notation

Insertion sort is like what we did in reality, we compare item to each other. Then put them in the right place. But how do we know its efficiency? We use the big O notation, which simply indicates the time complexity of an algorithm:

- **Insertion sort** (n == length of the array)
- Worth case: O(n^2)
- Average case: O(n^2)
- Best case: O(n)

What does the above mean?

- Well, the worth case means when in the worth situation, if there are `n` items in the array. Insertion sort needs to compare `n^2` times to make the array sorted.
- The average case is its efficiency in most cases.
- Best case is the best result insertion sort can get, it just compares every item, then its job is done. It implies the array is just sorted or a nearly sorted array, so insertion sort just simply compare from start to the end.
- You will judge that for a `n` item, it should be `n-1` times comparing. How could it be `n`? OK, it just the concept of the big O notation. We only care about the significant part of a number. So, when `n` becomes large enough, `n-1` has very tiny difference compares to `n`, so we just note it as `n`.

> Although insertion sort is not that fast, and we can even say that n^2 is such a long time, but it is a very good example of why we shouldn't judge an algorithm by its time complexity only. We will see why in the future series, now you just need to know, when an array is nearly sorted, insertion sort runs really well.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
