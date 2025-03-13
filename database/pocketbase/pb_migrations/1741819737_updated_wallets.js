/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_120182150")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1397773795",
    "max": null,
    "min": null,
    "name": "agentSpendLimit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_120182150")

  // remove field
  collection.fields.removeById("number1397773795")

  return app.save(collection)
})
