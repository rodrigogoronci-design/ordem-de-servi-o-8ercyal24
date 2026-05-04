migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('integrations')

    try {
      app.findFirstRecordByData('integrations', 'domain', 'whatsapp')
    } catch (_) {
      const record = new Record(collection)
      record.set('name', 'WhatsApp Business')
      record.set('api_url', 'https://api.example.com')
      record.set('domain', 'whatsapp')
      record.set('auth_token', 'secret_token_123')
      record.set('test_phone', '11900000000')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('integrations', 'domain', 'whatsapp')
      app.delete(record)
    } catch (_) {}
  },
)
