/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text52910115",
    "max": 0,
    "min": 0,
    "name": "residence",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text922858135",
    "max": 0,
    "min": 0,
    "name": "timezone",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text384653905",
    "max": 0,
    "min": 0,
    "name": "defaultCurrency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json4153703544",
    "maxSize": 0,
    "name": "notificationPreferences",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("text52910115")

  // remove field
  collection.fields.removeById("text922858135")

  // remove field
  collection.fields.removeById("text384653905")

  // remove field
  collection.fields.removeById("json4153703544")

  return app.save(collection)
})
