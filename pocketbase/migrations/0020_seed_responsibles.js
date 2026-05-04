migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('responsibles')

    const responsibles = [
      { name: 'João Silva', phone: '11999999999', email: 'joao.silva@example.com' },
      { name: 'Maria Oliveira', phone: '11988888888', email: 'maria.oliveira@example.com' },
      { name: 'Carlos Mendes', phone: '11977777777', email: 'carlos.mendes@example.com' },
    ]

    for (const r of responsibles) {
      try {
        app.findFirstRecordByData('responsibles', 'email', r.email)
      } catch (_) {
        const record = new Record(collection)
        record.set('name', r.name)
        record.set('phone', r.phone)
        record.set('email', r.email)
        app.save(record)
      }
    }
  },
  (app) => {
    const emails = [
      'joao.silva@example.com',
      'maria.oliveira@example.com',
      'carlos.mendes@example.com',
    ]
    for (const email of emails) {
      try {
        const record = app.findFirstRecordByData('responsibles', 'email', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
