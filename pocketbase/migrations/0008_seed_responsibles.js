migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('responsibles')

    const data = [
      { name: 'João Silva', phone: '11999998888', email: 'joao@example.com' },
      { name: 'Maria Oliveira', phone: '11988887777', email: 'maria@example.com' },
      { name: 'Carlos Santos', phone: '11977776666', email: 'carlos@example.com' },
    ]

    for (const item of data) {
      try {
        app.findFirstRecordByData('responsibles', 'email', item.email)
      } catch (_) {
        const record = new Record(col)
        record.set('name', item.name)
        record.set('phone', item.phone)
        record.set('email', item.email)
        app.save(record)
      }
    }
  },
  (app) => {
    const emails = ['joao@example.com', 'maria@example.com', 'carlos@example.com']
    for (const email of emails) {
      try {
        const record = app.findFirstRecordByData('responsibles', 'email', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
