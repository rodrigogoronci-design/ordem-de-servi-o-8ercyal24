migrate((app) => {
  const logs = new Collection({
    name: 'notification_logs',
    type: 'base',
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: 'service_order',
        type: 'relation',
        required: true,
        collectionId: app.findCollectionByNameOrId('service_orders').id,
        maxSelect: 1,
      },
      { name: 'recipient_name', type: 'text', required: true },
      { name: 'recipient_phone', type: 'text', required: true },
      { name: 'content', type: 'text', required: true },
      { name: 'status', type: 'text' },
      {
        name: 'sent_by',
        type: 'relation',
        required: true,
        collectionId: '_pb_users_auth_',
        maxSelect: 1,
      },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
  })
  app.save(logs)

  const templates = app.findCollectionByNameOrId('notification_templates')
  templates.createRule = "@request.auth.role = 'admin'"
  templates.updateRule = "@request.auth.role = 'admin'"
  templates.deleteRule = "@request.auth.role = 'admin'"
  app.save(templates)
})
