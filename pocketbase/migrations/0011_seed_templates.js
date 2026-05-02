migrate(
  (app) => {
    try {
      app.findFirstRecordByData('notification_templates', 'name', 'Notificação de OS')
      return
    } catch (_) {}

    const col = app.findCollectionByNameOrId('notification_templates')
    const record = new Record(col)
    record.set('name', 'Notificação de OS')
    record.set(
      'content',
      "Olá {nome}, informamos que a Ordem de Serviço '{titulo}' está com o status '{status}'. Por favor, verifique os detalhes.",
    )
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'notification_templates',
        'name',
        'Notificação de OS',
      )
      app.delete(record)
    } catch (_) {}
  },
)
