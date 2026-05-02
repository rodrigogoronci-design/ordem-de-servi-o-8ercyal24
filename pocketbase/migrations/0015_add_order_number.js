migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    if (!col.fields.getByName('order_number')) {
      col.fields.add(new NumberField({ name: 'order_number', min: 1, onlyInt: true }))
      app.save(col)
    }

    const records = app.findRecordsByFilter('service_orders', '1=1', 'created', 10000, 0)
    let nextNum = 1
    for (const record of records) {
      record.set('order_number', nextNum++)
      app.saveNoValidate(record)
    }

    col.addIndex('idx_so_order_number', true, 'order_number', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('service_orders')
    col.removeIndex('idx_so_order_number')
    col.fields.removeByName('order_number')
    app.save(col)
  },
)
