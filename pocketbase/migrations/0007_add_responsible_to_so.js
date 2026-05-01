migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    col.fields.add(
      new RelationField({
        name: 'responsible',
        collectionId: app.findCollectionByNameOrId('responsibles').id,
        maxSelect: 1,
        cascadeDelete: false,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    col.fields.removeByName('responsible')
    app.save(col)
  },
)
