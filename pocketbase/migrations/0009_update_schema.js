migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone' }))
    }
    app.save(users)

    const so = app.findCollectionByNameOrId('service_orders')
    if (!so.fields.getByName('last_notification_sent')) {
      so.fields.add(new DateField({ name: 'last_notification_sent' }))
    }
    app.save(so)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('phone')
    app.save(users)

    const so = app.findCollectionByNameOrId('service_orders')
    so.fields.removeByName('last_notification_sent')
    app.save(so)
  },
)
