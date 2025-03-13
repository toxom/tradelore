/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_120182150")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2726680096",
    "hidden": false,
    "id": "relation401296961",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "agentId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_120182150")

  // remove field
  collection.fields.removeById("relation401296961")

  return app.save(collection)
})
