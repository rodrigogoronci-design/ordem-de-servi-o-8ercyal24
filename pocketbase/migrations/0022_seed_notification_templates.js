migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('notification_templates')

    const templates = [
      {
        name: 'Abertura de OS',
        content:
          'Olá {nome}, sua ordem de serviço {id} - {titulo} foi aberta e o status é: {status}.',
      },
      {
        name: 'Mudança de Status',
        content: 'Olá {nome}, o status da sua ordem de serviço {id} mudou para {status}.',
      },
      {
        name: 'Conclusão de Serviço',
        content: 'Olá {nome}, a ordem de serviço {id} - {titulo} foi concluída com sucesso!',
      },
    ]

    for (const t of templates) {
      try {
        app.findFirstRecordByData('notification_templates', 'name', t.name)
      } catch (_) {
        const record = new Record(collection)
        record.set('name', t.name)
        record.set('content', t.content)
        app.save(record)
      }
    }
  },
  (app) => {
    const names = ['Abertura de OS', 'Mudança de Status', 'Conclusão de Serviço']
    for (const name of names) {
      try {
        const record = app.findFirstRecordByData('notification_templates', 'name', name)
        app.delete(record)
      } catch (_) {}
    }
  },
)
