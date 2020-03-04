---
title: Android permission handling done right with Kotlin
date: 2018-04-23 21:07:43
tags:
  - kotlin
  - android
---

Permission handling should be simple, but not the case in Android. Or at least before you know a lot about it. This article aims to solve that problem. And we will use `Anko` here to make it better.

<!--more-->

## 1. Official documentation

This is where you can find the [official solution](https://developer.android.com/training/permissions/requesting.html). It explains well but it depends on you how you shape your interactive model. Let's see how google designs this model.

## 2. Google's model

Below is the official code.

```kotlin
// Here, thisActivity is the current activity
if (ContextCompat.checkSelfPermission(thisActivity,
        Manifest.permission.READ_CONTACTS)
    != PackageManager.PERMISSION_GRANTED) {

    // Should we show an explanation?
    if (ActivityCompat.shouldShowRequestPermissionRationale(thisActivity,
            Manifest.permission.READ_CONTACTS)) {

        // Show an explanation to the user *asynchronously* -- don't block
        // this thread waiting for the user's response! After the user
        // sees the explanation, try again to request the permission.

    } else {

        // No explanation needed, we can request the permission.

        ActivityCompat.requestPermissions(thisActivity,
                arrayOf(Manifest.permission.READ_CONTACTS),
                MY_PERMISSIONS_REQUEST_READ_CONTACTS)

        // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
        // app-defined int constant. The callback method gets the
        // result of the request.
    }
} else {
    // Permission has already been granted
}
```

The code is easy to read:

1. Check whether we got the permission or not.
2. If yes, we go to the `else`: `Permission has already been granted` case.
3. If no, two sub-cases here:
   - show permission rationale, then ask permission again
   - no need to show permission rationale

The key part here is the usage of `shouldShowRequestPermissionRationale`.

And when a user runs through the flow:

The user will get the ask-for-permission-dialog right away. If he grants it, then all fine. If he denies it, then the next time it will then trigger the `shouldShowRequestPermissionRationale` block.

## 3. Problem

The problem is what about as soon as the user sees the ask-for-permission-dialog, he just denies, close the app and uninstall? Because it seems it's something like a system notification that we want to just use some feature without permission?

> Because `shouldShowRequestPermissionRationale` won't return `true` if this is the first time the user asks for permission.

And if you use this to show your real rationale, the code seems very clean, something like `if shouldShowRequestPermissionRationale then showReason`. Then you will be surprised to see that it won't work for the first time.

Things will become more interesting when the user denies after the 2nd time. The 3rd time there will be a `Never ask again` checkbox. And how to handle that after the user tick that option?

And when this is a very important permission to this app, we want some better model to handle it.

## 4. Design thinking

Always asks for permission when the user just trigger the feature, try not to ask for many permissions at the start. Because when the user just needs it, in that context, it will make them feel more comfortable to grant you the permission. And actually, it will be quite easy, and Kotlin will make it easier, which we will see later.

## 5. Our model

In the app. First, we check the permission, and we execute the tasks if we got the permission. And here is how we handle the case when the permission is not granted.

1. We always show a dialog to explain why we need the permission.
2. Then we try to request the permission.
   - Success case: We get the permission, cool, let's go on.
   - Failure case: We will display some further explanation and try to request again, or just stop because the user can press the button again to trigger the whole procedure again
   - NeverAskAgain case: We need to route the user to application settings page and let them enable it there because this is the only way. And besides that, we will show an explanation to tell the user what will happen.

## 6. Code blocks

With the above ideas in mind, let's see how to implement this.

### 6.1 How to check the permission

```kotlin
if (isPermissionGranted(SEND_SMS)) {
    // Great, got the permission
} else {
    // Show permission rationale and request
}

fun isPermissionGranted(permission:String):Boolean =
    ContextCompat.checkSelfPermission(
        this,
        permission
    ) == PackageManager.PERMISSION_GRANTED
```

Something needs to know here, you don't need to handle the API case where Google makes a change to the request model. `import android.support.v4.content.ContextCompat.checkSelfPermission` will handle it for you. If the above run under an older device (<= API 23), it will return true. So you can always execute the permission without a problem.

### 6.2 Show permission rationale

When the permission is not granted, inside the above `else` block, add this code

```kotlin
showPermissionReasonAndRequest(
    "Notice",
    "Hi, we will request SEND SMS permission. " +
        "This is required for authenticating your device, " +
        "please grant it.",
    SEND_SMS,
    this.requestCode
)

fun Activity.showPermissionReasonAndRequest(
    title: String,
    message: String,
    permission: String,
    requestCode: Int
) {
    alert(
        message,
        title
    ) {
        yesButton {
            ActivityCompat.requestPermissions(
                this@showPermissionReasonAndRequest,
                arrayOf(permission),
                requestCode
            )
        }
        noButton { }
    }.show()
}
```

We will show the reason, and after the user press `yes`, we will ask for permission and dismiss the `alert` if user presses `no` button.

### 6.3 Handle the three cases

You will see that we haven't used that `shouldShowRequestPermissionRationale`. When will we use it? Well, we will only use it to check the `never ask again` option has been ticked or not.

So after the user responds to your request. It will trigger `onRequestPermissionsResult` method, and this is where you can handle that.

```kotlin
override fun onRequestPermissionsResult(
    requestCode: Int,
    thePermissions: Array<String>,
    theGrantResults: IntArray
) {
    // It's not our expect permission
    if (requestCode != expectRequestCode) return

    if (isPermissionGranted(grantResultsParam)) {
        // Success case: Get the permission
        // Do something and return
        return
    }

    if (isUserCheckNeverAskAgain()) {
        // NeverAskAgain case - Never Ask Again has been checked
        // Do something and return
        return
    }

    // Failure case: Not getting permission
    // Do something here
}

fun isUserCheckNeverAskAgain() =
    !ActivityCompat.shouldShowRequestPermissionRationale(
        activity,
        SEND_SMS
    )
```

And this is how you route the user to the application setting screen.

```kotlin
val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
Uri.fromParts("package", packageName, null))
intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
startActivity(intent)
```

Then everything should behave as expected.

## 6. What about using some DSL to make it better

Although the above code works, can we make it any better? What about inside that `onRequestPermissionsResult()`, we can write something like this:

```kotlin
override fun onRequestPermissionsResult(
    requestCode: Int,
    thePermissions: Array<String>,
    theGrantResults: IntArray
) {
    permissionRequestHandler {

        actualRequestCode = requestCode
        expectRequestCode = this@LogDetailsActivity.requestCode
        permissionsParam = thePermissions
        grantResultsParam = theGrantResults

        onSuccess {
            // Do something when success
        }

        onFailure {
            // Do something for the failure case
        }

        onNeverAskAgain {
            message = "We noticed you have disabled our permission. " +
                "We will take you to the Application settings," +
                "you can re-enable the permission there"
        }
    }
}
```

It behaves exactly like the previous one. But in a more declarative and readable way. Even better, you can now reuse it in any `activity`. Wait for my next blog, we will see how easily Kotlin will enable us to do something fancy like this. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
