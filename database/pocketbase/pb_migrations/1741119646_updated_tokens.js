/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2638834880")

  // remove field
  collection.fields.removeById("text1619298236")

  // remove field
  collection.fields.removeById("text125850835")

  // remove field
  collection.fields.removeById("text1918038086")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json664259684",
    "maxSize": 0,
    "name": "decimal_place",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json85922377",
    "maxSize": 0,
    "name": "contract_address",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json1619298236",
    "maxSize": 0,
    "name": "network",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2638834880")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1619298236",
    "max": 0,
    "min": 0,
    "name": "network",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text125850835",
    "max": 0,
    "min": 0,
    "name": "contractAddress",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1918038086",
    "max": 0,
    "min": 0,
    "name": "decimals",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("json664259684")

  // remove field
  collection.fields.removeById("json85922377")

  // remove field
  collection.fields.removeById("json1619298236")

  return app.save(collection)
})
