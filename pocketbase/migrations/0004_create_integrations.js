migrate(
  (app) => {
    const collection = new Collection({
      name: 'integrations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'api_url', type: 'text', required: true },
        { name: 'domain', type: 'text', required: true },
        { name: 'auth_token', type: 'text', required: true },
        { name: 'test_phone', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('integrations')
    app.delete(collection)
  },
)
