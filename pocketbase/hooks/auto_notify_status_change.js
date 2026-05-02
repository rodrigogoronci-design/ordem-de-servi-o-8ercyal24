onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.getString('status')
  const oldStatus = e.record.original().getString('status')

  if (newStatus === oldStatus) return e.next()
  if (newStatus !== 'executando' && newStatus !== 'finalizado') return e.next()

  const templateName = newStatus === 'executando' ? 'Execução' : 'Finalização'

  let template
  try {
    template = $app.findFirstRecordByData('notification_templates', 'name', templateName)
  } catch (_) {
    return e.next()
  }

  let integration
  try {
    const integrations = $app.findRecordsByFilter('integrations', '1=1', '-created', 1, 0)
    if (integrations.length > 0) integration = integrations[0]
  } catch (_) {}

  if (!integration) return e.next()

  try {
    $app.expandRecord(e.record, ['requester'])
  } catch (_) {}

  const requester = e.record.expandedOne('requester')
  if (!requester) return e.next()

  const phoneRaw = requester.getString('phone')
  const phone = phoneRaw ? phoneRaw.replace(/\D/g, '') : ''
  if (!phone) return e.next()

  let content = template.getString('content')
  content = content.replace(/{nome}/g, requester.getString('name') || 'Cliente')
  content = content.replace(/{titulo}/g, e.record.getString('title'))
  content = content.replace(/{status}/g, newStatus)
  content = content.replace(/{id}/g, e.record.id)
  content = content.replace(
    /{order_number}/g,
    String(e.record.getInt('order_number') || e.record.id),
  )

  const apiUrl = integration.getString('api_url')
  let token = integration.getString('auth_token')
  if (token && !token.toLowerCase().startsWith('bearer ')) {
    token = 'Bearer ' + token
  }

  let sendStatus = 'sent'
  try {
    const res = $http.send({
      url: apiUrl,
      method: 'POST',
      body: JSON.stringify({ phone: phone, message: content }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      timeout: 15,
    })
    if (res.statusCode < 200 || res.statusCode >= 300) {
      sendStatus = 'failed'
    }
  } catch (err) {
    sendStatus = 'failed'
  }

  try {
    const logsCol = $app.findCollectionByNameOrId('notification_logs')
    const log = new Record(logsCol)
    log.set('service_order', e.record.id)
    log.set('recipient_name', requester.getString('name') || 'Cliente')
    log.set('recipient_phone', phone)
    log.set('content', content)
    log.set('status', sendStatus)
    log.set('sent_by', requester.id)
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'service_orders')
