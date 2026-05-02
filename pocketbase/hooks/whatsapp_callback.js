routerAdd('POST', '/backend/v1/whatsapp/callback', (e) => {
  const body = e.requestInfo().body || {}
  const logId = body.logId
  const status = body.status

  if (logId && status === 'delivered') {
    try {
      const log = $app.findRecordById('notification_logs', logId)
      log.set('status', 'delivered')
      $app.save(log)

      const orderId = log.getString('service_order')
      if (orderId) {
        const order = $app.findRecordById('service_orders', orderId)
        if (order.getString('status') !== 'notificado') {
          order.set('status', 'notificado')
          $app.save(order)
        }
      }
    } catch (_) {}
  }
  return e.json(200, { success: true })
})
