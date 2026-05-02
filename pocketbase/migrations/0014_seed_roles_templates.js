migrate((app) => {
  try {
    const admin = app.findAuthRecordByEmail('users', 'rodrigogoronci@gmail.com')
    admin.set('role', 'admin')
    app.save(admin)
  } catch (_) {}

  const templates = app.findCollectionByNameOrId('notification_templates')

  try {
    app.findFirstRecordByData('notification_templates', 'name', 'Execução')
  } catch (_) {
    const t1 = new Record(templates)
    t1.set('name', 'Execução')
    t1.set(
      'content',
      'Olá {nome}, a OS {id} ({titulo}) mudou para o status {status}. Já estamos trabalhando nela!',
    )
    app.save(t1)
  }

  try {
    app.findFirstRecordByData('notification_templates', 'name', 'Finalização')
  } catch (_) {
    const t2 = new Record(templates)
    t2.set('name', 'Finalização')
    t2.set('content', 'Olá {nome}, a OS {id} ({titulo}) foi finalizada com sucesso!')
    app.save(t2)
  }
})
