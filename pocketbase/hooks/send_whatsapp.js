routerAdd(
  'POST',
  '/backend/v1/orders/{id}/whatsapp',
  (e) => {
    const id = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    const phone = body.phone

    if (!phone || !/^\d{10,11}$/.test(phone)) {
      return e.badRequestError(
        'Número de telefone inválido. Use o formato DDD99999999 (apenas números).',
      )
    }

    const order = $app.findRecordById('service_orders', id)

    let integration
    try {
      integration = $app.findFirstRecordByFilter('integrations', "domain='servicelogic'")
    } catch (_) {
      return e.badRequestError("Integração 'servicelogic' não configurada.")
    }

    const apiUrl = integration.getString('api_url')
    const authToken = integration.getString('auth_token')

    if (!apiUrl || !authToken) {
      return e.badRequestError("Configurações da integração 'servicelogic' incompletas.")
    }

    const title = order.getString('title')
    const status = order.getString('status')
    const priority = order.getString('priority')
    const description = order.getString('description')

    const content = `[ID: ${id}] [Título: ${title}] [Status: ${status}] [Prioridade: ${priority}] [Descrição: ${description}]`

    const payload = {
      destinatario: phone,
      conteudo: content,
      prioridade: 'HIGH',
      parametros: {},
      metadata: {
        whatsappTipoMensagem: 'TEXT',
      },
    }

    const res = $http.send({
      url: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
      timeout: 15,
    })

    if (res.statusCode >= 400) {
      const errJson = res.json || {}
      $app
        .logger()
        .error(
          'Erro ao enviar WhatsApp',
          'status',
          res.statusCode,
          'response',
          JSON.stringify(errJson),
        )
      return e.internalServerError('Falha ao enviar mensagem via WhatsApp.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
