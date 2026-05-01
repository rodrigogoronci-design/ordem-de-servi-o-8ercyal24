migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'rodrigogoronci@gmail.com')
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('rodrigogoronci@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      app.save(admin)
    }

    const sos = app.findCollectionByNameOrId('service_orders')
    try {
      app.findFirstRecordByData('service_orders', 'title', 'Manutenção de Servidor')
    } catch (_) {
      const so1 = new Record(sos)
      so1.set('title', 'Manutenção de Servidor')
      so1.set(
        'description',
        'Servidor principal apresentando lentidão e falhas esporádicas. Necessário verificação de hardware e logs do sistema.',
      )
      so1.set('status', 'planejamento')
      so1.set('priority', 'alta')
      so1.set('requester', admin.id)
      so1.set('assignee', admin.id)
      app.save(so1)

      const so2 = new Record(sos)
      so2.set('title', 'Troca de Teclado - RH')
      so2.set('description', 'Teclado da máquina 05 no RH está com as teclas falhando.')
      so2.set('status', 'aguardando')
      so2.set('priority', 'baixa')
      so2.set('requester', admin.id)
      app.save(so2)

      const so3 = new Record(sos)
      so3.set('title', 'Instalação Software Financeiro')
      so3.set(
        'description',
        'Instalar novo ERP homologado nas máquinas do setor financeiro até o fim do mês.',
      )
      so3.set('status', 'executando')
      so3.set('priority', 'media')
      so3.set('requester', admin.id)
      so3.set('assignee', admin.id)
      app.save(so3)
    }
  },
  (app) => {},
)
