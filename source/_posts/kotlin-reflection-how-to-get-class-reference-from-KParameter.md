---
title: Kotlin reflection - How to get class reference from KParameter
date: 2017-10-02 19:41:21
tags:
  - kotlin
  - reflection
---

I have a class reference and a set of data for initializing the class, I need to create instance of that class dynamically. I get the constructor from the class reference, I loop through its parameters and do a match between that set of data. Then call the `constructor.callby(param)`. All is fine, until one of the property is a custom class rather than a kotlin type like `kotlin.Int`. Let's see how to solve it.

<!--more-->

## Some setup

```Java
data class Student(
    val name:String,
    val age:Int,
    val lessons:List<Lesson>
)

val classRef= Student::class
val cons = classRef.primaryConstructor!!
cons.parameters.forEach{
    // do something with each parameter
}
```

The above code is simple, we retrieve a class and its constructor, then we loop through its parameters.
Now you can do the match up thing to restore the class.

## Get the class reference from KParameter

```Java
fun generateClass(param:KParameter):Any? {
    var result:Any? = null
    val paramName= param.type.toString()

    if (!paramName.startsWith("kotlin")) {
        result = param.type.classifier as KClass<*>
    }

    return result
}
```

In the above `forEach`, when we found that the parameter is a custom class, we need to do something about it. First, we make sure it's not a `kotlin` type by checking the `paramName` not `startsWith("kotlin")`, all `kotlin` types are started from `kotlin` even for `Collection` type.

Then we return `param.type.classifier as KClass<*>`, then you can repeat the code in `Some setup` to restore this nested property.

## Get the class reference from KParameter which is a List<\*>

But what happen if the property is not a custom class, but also a `List<CustomClass>`. Like the `lessons` property in the following `Student` class.

```Java
data class Lesson(
    val title:String,
    val length:Int
)
data class Student(
    val name:String,
    val age:Int,
    val lessons:List<Lesson>
)
```

We need to refactor our `generateClass` function.

```Java

fun generateClass(param:KParameter):Any? {
    var result:Any? = null
    val paramName= param.type.toString()

    if (paramName.startsWith("kotlin.collections.List")){
        val itemTypeName = paramName.substring(24).removeSuffix(">")
        if (!itemTypeName.startsWith("kotlin")){
            result = param.type.arguments[0].type?.classifier as KClass<*>
        }
    } else if (!paramName.startsWith("kotlin")) {
        result = param.type.classifier as KClass<*>
    }

    return result
}
```

Here things get a little bit interesting. First, we check it's a `List` type, then we type to retrieve the item type of that list. Let's say it's a `kotlin.collections.List<kotlin.Int>`, then it's not a list of custom class. But if the `itemTypeName` is not `startsWith("kotlin")`, then it is a custom class.

Then we retrieve the item type by using `param.type.arguments[0].type?.classifier as KClass<*>`

## End

That's all, hope it helps. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
