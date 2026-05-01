migrate(
  (app) => {
    const collection = new Collection({
      name: 'service_orders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['aguardando', 'planejamento', 'executando', 'finalizado', 'cancelado'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'priority',
          type: 'select',
          values: ['baixa', 'media', 'alta', 'urgente'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'requester',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'assignee',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'due_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_so_status ON service_orders (status)',
        'CREATE INDEX idx_so_priority ON service_orders (priority)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    app.delete(col)
  },
)
