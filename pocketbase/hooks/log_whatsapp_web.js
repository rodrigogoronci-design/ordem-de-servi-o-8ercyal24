routerAdd(
  'POST',
  '/backend/v1/orders/{id}/whatsapp_log',
  (e) => {
    const orderId = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    try {
      const logsCol = $app.findCollectionByNameOrId('notification_logs')
      const log = new Record(logsCol)
      log.set('service_order', orderId)
      log.set('recipient_name', body.recipient_name || 'Desconhecido')
      log.set('recipient_phone', body.recipient_phone || '')
      log.set('content', body.content || '')
      log.set('status', 'sent (web)')

      if (e.auth) {
        log.set('sent_by', e.auth.id)
      } else {
        try {
          const order = $app.findRecordById('service_orders', orderId)
          log.set('sent_by', order.getString('requester'))
        } catch (_) {}
      }

      $app.save(log)
    } catch (err) {
      return e.badRequestError('Erro ao salvar log')
    }
    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
