migrate((app) => {
  const users = app.findCollectionByNameOrId('users')
  users.fields.add(
    new SelectField({
      name: 'role',
      values: ['admin', 'colaborador'],
      maxSelect: 1,
    }),
  )
  app.save(users)

  const orders = app.findCollectionByNameOrId('service_orders')
  const statusField = orders.fields.getByName('status')
  statusField.values = [
    'aguardando',
    'planejamento',
    'executando',
    'finalizado',
    'cancelado',
    'notificado',
  ]
  app.save(orders)
})
