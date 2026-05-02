onRecordCreate((e) => {
  try {
    const records = $app.findRecordsByFilter('service_orders', '1=1', '-order_number', 1, 0)
    let max = 0
    if (records.length > 0) {
      max = records[0].getInt('order_number')
    }
    e.record.set('order_number', max + 1)
  } catch (_) {
    e.record.set('order_number', 1)
  }
  e.next()
}, 'service_orders')
