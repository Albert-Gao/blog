---
title: Test your model via Jest and Mongoose
date: 2017-06-19 22:38:16
tags:
  - test
  - jest
  - mongoose
  - mongodb
---

If the model is just plain schema, there is not much to test about. But with Mongoose, you can add instance methods and static methods which embeds lots of core logic around CRUD. You definitely wanna test this. In this blog, we will use `Jest` to test `Mongoose` model methods.

<!--more-->

# Integration test the logic in your model

Of course you can unit test your model by mocking the mongoose methods. But I really don't see the benefits of that. Yes, the CRUD part is taking care by mongoose and mongodb driver, no need to test that.

> But even the data is saved perfectly into the database doesn't mean you have saved the correct data.

Furthermore, for a bulk get, does your query give you the right result? Does your query still give you the expected result after you refactoring? This is something only integration test could tell you.

# Proper setup

The concept here is simple:

- `beforeAll()`: connect to database
- `afterAll()`: database disconnect
- `beforeEach()`: setup demo data
- `afterEach()`: remove demo data

There is another pattern for read-only method:

- `beforeAll()`: connect to database and prepare data
- `afterAll()`: database disconnect and remove them

The code looks like below:

```javascript
describe('Test the removeComment method', () => {
    let comment;

    beforeAll(() => {
        mongoose.connect(testDBURL);
    });

    beforeEach(() => {
        comment = new CommentModel(testData.normalComment);
        return comment.save();
    });

    afterEach(() => {
        return CommentModel.removeComments();
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });
};
```

Do remeber use `done()` to close the database, otherwise, you will get mad about some weird exception.

# Let's say you have a static method like this:

```javascript
isAlreadyLiked(threadID, userID) {
    return this.find({ _id: threadID })
        .elemMatch('likes.users', { id: userID })
        .exec();
},
```

# What to test?

This is the most important part you need to know. And it could adopts to any testing method like unit test and acceptance test.

- Will it give us the correct result when everything is OK?
- Will it handle the abnormal case like empty result?
- Will it handle the error case?
- Will it handle the edge case?
- Will it handle some special parameter? For instance, the `skip` or `limit` in a bulk get API.

# Let's test!

For the normal case:

```javascript
test("Should return a result when match", () => {
  return ThreadModel.isAlreadyLiked(thread.id, thread.author.id).then(
    result => {
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(thread.id);
      expect(result[0].text).toEqual(thread.text);
      expect(result[0].author.id).toEqual(thread.author.id);
    }
  );
});
```

For the abnormal case:

```javascript
test("Should return a empty result when not match", () => {
  return ThreadModel.isAlreadyLiked(thread.id, "593a9ea21736ec9b1a9e909b").then(
    result => {
      expect(result).toHaveLength(0);
    }
  );
});
```

For the error case:

```javascript
test("Should return error when objectID is bad", () => {
  return ThreadModel.isAlreadyLiked(thread.id, "593a9ea21736ec9b1a9e909ba")
    .then(result => {
      expect(result).toHaveLength(0);
    })
    .catch(err => {
      expect(err).toBeTruthy();
      expect(err.name).toBe("CastError");
      expect(err.message).toBe(
        'Cast to ObjectId failed for value "593a9ea21736ec9b1a9e909ba" at path "id" for model "Thread"'
      );
    });
});
```

An interesting fact here: You could see that I use both `.then()` and `.catch()` here which doesn't make any sense. The point is:

> For some important method, this tip will make sure that every error is wrapped in the normal `jest` error report rather than just throwing some error in the console. Furthermore, when dealing with promise, sometimes, `Jest` will give you some completely useless callstack which none of it is part of your code. This is how it could save your life, when the callstack is meaningless, try this.

# You could use `async/await` for sure:

When you try to assert an error:

```javascript
test("Should return error if no such comment", async () => {
  try {
    await CommentModel.getComment(author);
  } catch (err) {
    expect(err).toBeTruthy();
    expect(err.message).toEqual("No such comment");
  }
});
```

Notice here you just need to `await` that query since we don't care about its result.

When you just want to assert a normal result:

```javascript
test("Should decrease by 1", async () => {
  await ThreadModel.updateCommentCount(thread.id, -1);
  const result = await ThreadModel.findById(thread.id).exec();
  expect(result.comments.count).toEqual(2);
});
```

# Add an environment check

If you use environment variable for testing, it's good to test it to notify the people who run the test.

```javascript
test("Should failed when env not test ", () => {
  expect(process.env.NODE_ENV).toEqual("test");
});
```

# Add guard for specific code

There is no `conftest.py` concept in `Jest` which you could run some fixtures before you run all the tests. So the above check is not enough for prevent executing some dangerous methods like a handy `removeAll()`, So I add a check in that method too:

```javascript
if (process.env.NODE_ENV !== "test") {
  throw new Error(
    `[ENV -> ${process.env.NODE_ENV}] This method should only use when testing, try set process.env.NODE_ENV = "test"`
  );
}
```

# Tips about preparing data

In fact, it is the tip for use `Jest` in a async way.

If you just want to `save` one document, just `return` that promise, `Jest` will handle that for you.

```javascript
beforeEach(() => {
  comment = new CommentModel(testData.normalComment);
  return comment.save();
});
```

But when you need to save more document, `return` won't help you here. And besides promise chain, you could use fancy `async/await`:

```javascript
beforeEach(async () => {
  comment = new CommentModel(testData.normalComment);
  thread = new CommentModel(testData.normalThread);
  await thread.save();
  await comment.save();
});
```

# End

That's it, hope it helps.

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
