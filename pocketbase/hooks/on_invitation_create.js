onRecordAfterCreateSuccess((e) => {
  const email = e.record.getString('email')
  const token = e.record.getString('token')

  // Here we simulate sending an email via the logger
  const link = `https://ordem-de-servico-07c34.goskip.app/register?token=${token}`
  $app.logger().info('Email de convite gerado', 'to', email, 'link', link)

  e.next()
}, 'invitations')
