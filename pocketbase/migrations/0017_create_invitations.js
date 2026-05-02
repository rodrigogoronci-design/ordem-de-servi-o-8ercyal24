migrate(
  (app) => {
    const collection = new Collection({
      name: 'invitations',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: null,
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'email', type: 'email', required: true },
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['admin', 'colaborador', 'cliente'],
          maxSelect: 1,
        },
        { name: 'token', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'accepted'],
          maxSelect: 1,
        },
        {
          name: 'invited_by',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_invitations_token ON invitations (token)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('invitations')
    app.delete(collection)
  },
)
