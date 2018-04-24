---
title: How to test dynamic ui from Anko with expresso in Android
date: 2018-04-23 11:34:23
tags:
  - android
  - test
  - kotlin
---

When I say dynamic UI I mean the UI you generated from a library like `Anko` or just plain Android API.

<!--more-->

## 1. Test whether the alert has been shown

### 1.1 Add a title for this alert

```kotlin
alert{
    title = “myDialog”
}
```

### 1.2 Then assert it with the title

```kotlin
@Test
fun dialog_has_been_shown(){
    Espresso
        .onView(withText(“myDialog”))
        .inRoot(isDialog())
        .check(matches(ViewMatchers.isDisplayed()))
}
```

## 2.Check a TextEdit in an alert has been set to some error

### 2.1 Create a id

This is a file named `ids.xml` in `res/values`

```xml
<?xml version="1.0" encoding="utf-8"?>

<resources>
    <item type="id" name=“my_id” />
</resources>
```

### 2.2 Apply it to your TextEdit

```kotlin
alert {
    title = "Password"
    customView {
        verticalLayout {
            editText {
                id = R.id.my_id
            }
        }
    }
}
```

### 2.3 Assert in espresso like usual

```kotlin
Espresso
    .onView(ViewMatchers.withId(R.id.my_id))
    .check(matches(hasErrorText(“Wrong password”)))
```

## 3. End

Hope it helps. :)
