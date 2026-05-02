migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    if (!col.fields.getByName('signature')) {
      col.fields.add(
        new FileField({
          name: 'signature',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/png', 'image/jpeg'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    col.fields.removeByName('signature')
    app.save(col)
  },
)
