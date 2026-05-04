migrate(
  (app) => {
    let user
    try {
      user = app.findFirstRecordByData('_pb_users_auth_', 'email', 'rodrigogoronci@gmail.com')
    } catch (_) {
      const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_')
      user = new Record(usersCollection)
      user.setEmail('rodrigogoronci@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Admin')
      user.set('role', 'admin')
      app.save(user)
    }

    let r1, r2
    try {
      r1 = app.findFirstRecordByData('responsibles', 'email', 'joao.silva@example.com')
    } catch (_) {}
    try {
      r2 = app.findFirstRecordByData('responsibles', 'email', 'maria.oliveira@example.com')
    } catch (_) {}

    const orders = [
      {
        title: 'Manutenção Preventiva de Ar Condicionado',
        desc: 'Limpeza e troca de filtros do ar condicionado do setor de vendas.',
        status: 'aguardando',
        priority: 'media',
        resp: r1?.id,
        order_number: 1001,
      },
      {
        title: 'Troca de Lâmpadas Galpão A',
        desc: 'Substituição de 10 lâmpadas queimadas no Galpão Principal.',
        status: 'executando',
        priority: 'alta',
        resp: r2?.id,
        order_number: 1002,
      },
      {
        title: 'Reparo em Servidor Local',
        desc: 'Servidor apresentando falhas de conexão. Necessário diagnóstico e reparo.',
        status: 'planejamento',
        priority: 'urgente',
        resp: r1?.id,
        order_number: 1003,
      },
      {
        title: 'Pintura da Fachada',
        desc: 'Retoque na pintura da fachada principal do prédio.',
        status: 'aguardando',
        priority: 'baixa',
        resp: r2?.id,
        order_number: 1004,
      },
      {
        title: 'Atualização de Software',
        desc: 'Instalação da nova versão do sistema de gestão nas máquinas da recepção.',
        status: 'finalizado',
        priority: 'media',
        resp: r1?.id,
        order_number: 1005,
      },
    ]

    const collection = app.findCollectionByNameOrId('service_orders')

    for (const o of orders) {
      try {
        app.findFirstRecordByData('service_orders', 'order_number', o.order_number)
      } catch (_) {
        const record = new Record(collection)
        record.set('title', o.title)
        record.set('description', o.desc)
        record.set('status', o.status)
        record.set('priority', o.priority)
        record.set('requester', user.id)
        record.set('assignee', user.id)
        if (o.resp) record.set('responsible', o.resp)
        record.set('order_number', o.order_number)

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        record.set('due_date', tomorrow.toISOString())

        app.save(record)
      }
    }
  },
  (app) => {
    const orderNumbers = [1001, 1002, 1003, 1004, 1005]
    for (const num of orderNumbers) {
      try {
        const record = app.findFirstRecordByData('service_orders', 'order_number', num)
        app.delete(record)
      } catch (_) {}
    }
  },
)
