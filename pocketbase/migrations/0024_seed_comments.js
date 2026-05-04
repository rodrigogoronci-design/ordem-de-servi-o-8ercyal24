migrate(
  (app) => {
    let user
    try {
      user = app.findFirstRecordByData('_pb_users_auth_', 'email', 'rodrigogoronci@gmail.com')
    } catch (_) {
      return
    }

    let o1, o2
    try {
      o1 = app.findFirstRecordByData('service_orders', 'order_number', 1001)
    } catch (_) {}
    try {
      o2 = app.findFirstRecordByData('service_orders', 'order_number', 1002)
    } catch (_) {}

    const collection = app.findCollectionByNameOrId('comments')

    if (o1) {
      try {
        app.findFirstRecordByFilter(
          'comments',
          `service_order = "${o1.id}" && content = "Filtros já foram comprados."`,
        )
      } catch (_) {
        const record = new Record(collection)
        record.set('service_order', o1.id)
        record.set('user', user.id)
        record.set('content', 'Filtros já foram comprados.')
        app.save(record)
      }
    }

    if (o2) {
      try {
        app.findFirstRecordByFilter(
          'comments',
          `service_order = "${o2.id}" && content = "Lâmpadas entregues, aguardando início."`,
        )
      } catch (_) {
        const record = new Record(collection)
        record.set('service_order', o2.id)
        record.set('user', user.id)
        record.set('content', 'Lâmpadas entregues, aguardando início.')
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'comments',
        `content = "Filtros já foram comprados." || content = "Lâmpadas entregues, aguardando início."`,
        '',
        10,
        0,
      )
      for (const r of records) {
        app.delete(r)
      }
    } catch (_) {}
  },
)
