---
title: Update multiple UI with same source data in Android
date: 2018-05-29 18:02:13
tags:
  - kotlin
  - android
---

There are times when some data is updated, you want to update multiple UI, be them activities or fragments. You can update them manually but that code will look messy. Or you can use the observable pattern to update the UI every time the source data gets updated. Today I will show you how to use `MVVM` and `ViewModel` + `LiveData` from Google's new architecture component to achieve this. You can use `RxJava` to do the same thing. architecture component will be easier and less error-prone. Because they are life-cycle aware.

<!--more-->

## Big picture

It's kind of like Redux pattern - a nearly unidirectional data flow, where every change will happen at model layer and reflect back to view model layer, then bubble up to view layer. It's easy to reason about your data flow.

## First, let's check the cases

There is a data source in your app. And its updates need to reflect multiple UI,

* case 1: some UI maybe just need the whole data source
* case 2: some UI needs to process the data first before showing on the UI

You need to somehow create a single source of truth for all the UI and reflect the changes to them when something happens.

## 1. Model layer

It's a singleton, and expose the data source as a LiveData A. In the following code, it will be OrderLiveStore.liveData.

```kotlin
class OrderLiveStore(
    private val orderStore: OrderStore
) {
    var liveData: MutableLiveData<List<Order>> = MutableLiveData()

    init {
        liveData.value =  orderStore.items
    }

}
```

## 2. View model layer

`case 1:` You just inject that model to the view model, and expose the LiveData A to the view. Underneath considering the fact of singleton, all views which connect to this view model will get the update, because the view model simply just returns the same property from a singleton variable. I manage the singleton by using the `dagger`.

```kotlin
class OrdersViewModel
@Inject constructor(
orderLiveStore: OrderLiveStore
): ViewModel() {

    // expose to the view directly
    val orders: LiveData<List<Order>> = orderLiveStore.liveData

}
```

`case 2:` You still inject the model to the view model, but inside, you need to subscribe to it using `Transformations.map`, and do your processing, and expose the result to the view layer

```kotlin
class OrderViewModel(
orderLiveStore: OrderLiveStore,
private val orderId: String
) : ViewModel() {

    // expose to the view after processing it
    val order: LiveData<Order> = Transformations.map(orderLiveStore.liveData) {
        getNeededOrderFromList(it)
    }

    private fun getNeededOrderFromList(orderList: List<Order>?): Order? {
        // This method will be triggered every time orderStore.liveData gets updated
    }

}
```

You can see that in case 1, I use `dagger` to inject because it fits the case. In case 2, I created the view model in view with a custom parameter, because the view model needs some extra information to grab the needed pieces from the model layer. In my case, it is an `orderId:String`

## 3. View layer

Now it's simple, be it a fragment or an activity, you observe that data source and update your UI,

```kotlin
orderViewModel.orders.observe(this, Observer {
    // update the ui
})
```

or more elegantly, you can bind the `LiveData` from view model directly to the `xml` with data binding if you don't need that much pre-processing.

## 4. What about the CRUD

Well, you just update the model layer DIRECTLY. But the action will be started from one of the 2 layers

* view layer (if it's from a user)
* view model layer (if it's a side-effect).

But even it's from the view, the view should still call methods on view model, and view model will call some methods on the model layer or you can simply update it in the view model layer depends on the cases(because you get the single source of truth).

## 5. And the result will be what you want

Because everything is now connected to a single source of truth(a shared model layer), but, in a decoupled manner. Every layer does its own job.

## 6. One more tip

In order to get Transformations.map to work, you need to observe the result in the view, otherwise, that subscription from Transformations.map will not work at all.
