routerAdd(
  'POST',
  '/backend/v1/orders/{id}/whatsapp',
  (e) => {
    const orderId = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    let order

    try {
      order = $app.findRecordById('service_orders', orderId)
    } catch (_) {
      return e.notFoundError('OS não encontrada.')
    }

    try {
      $app.expandRecord(order, ['responsible', 'requester'])
    } catch (_) {}

    const reqPhone = body.phone
    const reqMsg = body.message
    let phone = reqPhone
    let msg = reqMsg
    let recipientName = 'Desconhecido'

    if (!phone || !msg) {
      const responsible = order.expandedOne('responsible')
      if (!responsible) {
        return e.badRequestError(
          'Falha ao enviar: Nenhum responsável atribuído a esta ordem de serviço.',
        )
      }
      const phoneRaw = responsible.getString('phone')
      phone = phoneRaw ? phoneRaw.replace(/\D/g, '') : ''
      msg = `OS #${order.getInt('order_number') || order.id}\nTítulo: ${order.getString('title')}\nStatus: ${order.getString('status')}\nPrioridade: ${order.getString('priority')}\nDescrição: ${order.getString('description') || ''}`
      recipientName = responsible.getString('name')
    } else {
      if (
        order.expandedOne('responsible') &&
        order.expandedOne('responsible').getString('phone').replace(/\D/g, '') === phone
      ) {
        recipientName = order.expandedOne('responsible').getString('name')
      } else if (
        order.expandedOne('requester') &&
        order.expandedOne('requester').getString('phone').replace(/\D/g, '') === phone
      ) {
        recipientName = order.expandedOne('requester').getString('name')
      }
    }

    if (!phone) {
      return e.badRequestError('Falha ao enviar: Telefone inválido.')
    }

    let integration
    try {
      const integrations = $app.findRecordsByFilter('integrations', '1=1', '-created', 1, 0)
      if (integrations.length > 0) {
        integration = integrations[0]
      }
    } catch (_) {}

    if (!integration) {
      return e.badRequestError('Falha ao enviar mensagem via WhatsApp.')
    }

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
        body: JSON.stringify({ phone: phone, message: msg }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        timeout: 15,
      })

      if (res.statusCode < 200 || res.statusCode >= 300) {
        $app
          .logger()
          .error('WhatsApp API Error', 'status', res.statusCode, 'body', res.json || res.body)
        sendStatus = 'failed'
      }
    } catch (err) {
      $app.logger().error('WhatsApp request failed', 'error', err.message)
      sendStatus = 'failed'
    }

    try {
      const logsCol = $app.findCollectionByNameOrId('notification_logs')
      const log = new Record(logsCol)
      log.set('service_order', order.id)
      log.set('recipient_name', recipientName)
      log.set('recipient_phone', phone)
      log.set('content', msg)
      log.set('status', sendStatus)
      if (e.auth) log.set('sent_by', e.auth.id)
      else log.set('sent_by', order.getString('requester'))
      $app.save(log)
    } catch (_) {}

    if (sendStatus === 'failed') {
      return e.badRequestError('Falha ao enviar mensagem via WhatsApp.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
