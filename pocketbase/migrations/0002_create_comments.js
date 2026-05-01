migrate(
  (app) => {
    const collection = new Collection({
      name: 'comments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'service_order',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('service_orders').id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('comments')
    app.delete(col)
  },
)
