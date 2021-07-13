---
title: How to easily setup mongodb for cypress
date: 2021-07-14 10:28:55
tags:
  - cypress
  - mongodb
---

Tests should be isolated with each other. Today let's see an easy way to setup and teardown your MongoDB database before each cypress run. The concept should be applicaple to other senario other than cypress, and the code for setup the MongoDB should be able to adapt to other cases as well.

<!--more-->

## 1. Dump your data with MongoDB Compass

If you haven't download, download it [here](https://www.mongodb.com/try/download/compass). It's a GUI for CRUD your MongoDB collections, directly from official MongoDB team.

After selecting the collection on the left hand side, you will see a Export icon with the label "Export Collection"

![ui of mongo compass](/images/mongo-compass.png)

Click that to export your collection, save as JSON.

## 2. Prepare for loading that data in your frontend app.

- Install `mongo` as dev-dependencies: `npm i mongo -D`
- add a folder named `database` in your `cypress` folder
- copy the previous JSON files into this newly created folder
- add a file named `seedMongo.js` in this folder with the following code

```javascript
const MongoClient = require("`mongodb`").MongoClient;
const { ObjectId } = require("mongodb");
const teams = require("./teams.json");
const users = require("./users.json");

const DB = "my-e2e";

const dataToSeed = {
  users,
  teams,
};

const oidToObjectId = (jsonData) =>
  jsonData.map((item) =>
    !!item.realtor
      ? {
          ...item,
          _id: ObjectId(item._id["$oid"]),
          realtor: ObjectId(item.realtor["$oid"]),
          createdAt: item.createdAt["$date"],
          updatedAt: item.updatedAt["$date"],
        }
      : {
          ...item,
          _id: ObjectId(item._id["$oid"]),
          createdAt: item.createdAt["$date"],
          updatedAt: item.updatedAt["$date"],
        }
  );

async function dropAndSeed(mongoClient, collectionName, jsonData) {
  const collection = mongoClient.db(DB).collection(collectionName);

  await collection.drop().catch((e) => {
    console.log("error when dropping", e);
    if (e.code !== 26) {
      throw e;
    }
  });
  await collection.insertMany(oidToObjectId(jsonData));
}

async function seedDB() {
  // Connection URL

  const uri = `mongodb://localhost:27017/${DB}`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    console.log("Connected correctly to server");

    for (const key of dataToSeed) {
      await dropAndSeed(client, key, dataToSeed[key]);
    }

    console.log("Database seeded! :)");

    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

seedDB();
```

Seems to be a lot going on but actually quite simple, let's decipher it. In short, any lines below `async function dropAndSeed` is generic. You only need to worry about the part above it.

So, you basically,

1. import the JSON data like `const apartments = require("./apartments.json");`
1. create the database name like `const DB = "my-e2e";`
1. create a pure object `dataToSeed` with all the JSON data, the key would be the collection name.
1. Change the logic in `oidToObjectId()` to suit your needs. The reason we need this is, the data dumped from `MongoDB Compass`, the id field is like this: `"_id": { "$oid": "60e6c7ae0973e96ac3ebaeb8"},`, the `oidToObjectId` will convert it to `"_id": ObjectId("60e6c7ae0973e96ac3ebaeb8")`, that's all.

## 3. add a command in your package.json

```json
"scripts":{
    "e2e:seedDB": "node ./cypress/database/seedLocalMongoDB.js"
}
```

## 4. Adding this step in your cypress test

```javascript
describe('The Homepage', () => {
  beforeEach(() => {
    cy.exec('npm run e2e:seedDB');
  });
```

## 5. End

That's it. Now the database will be teardown and re-seed before each run.
