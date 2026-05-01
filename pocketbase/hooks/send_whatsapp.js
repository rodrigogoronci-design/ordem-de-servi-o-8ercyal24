routerAdd(
  'POST',
  '/backend/v1/orders/{id}/whatsapp',
  (e) => {
    const orderId = e.request.pathValue('id')
    let order

    try {
      order = $app.findRecordById('service_orders', orderId)
    } catch (_) {
      return e.notFoundError('OS não encontrada.')
    }

    try {
      $app.expandRecord(order, ['responsible'])
    } catch (_) {}

    const responsible = order.expandedOne('responsible')
    if (!responsible) {
      return e.badRequestError(
        'Falha ao enviar: Nenhum responsável atribuído a esta ordem de serviço.',
      )
    }

    const phoneRaw = responsible.getString('phone')
    const phone = phoneRaw ? phoneRaw.replace(/\D/g, '') : ''

    if (!phone) {
      return e.badRequestError(
        'Falha ao enviar: Nenhum responsável atribuído a esta ordem de serviço.',
      )
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

    const desc = order.getString('description') || ''
    const msg = `ID: ${order.id}\nTítulo: ${order.getString('title')}\nStatus: ${order.getString('status')}\nPrioridade: ${order.getString('priority')}\nDescrição: ${desc}`

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
        return e.badRequestError('Falha ao enviar mensagem via WhatsApp.')
      }
    } catch (err) {
      $app.logger().error('WhatsApp request failed', 'error', err.message)
      return e.badRequestError('Falha ao enviar mensagem via WhatsApp.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
