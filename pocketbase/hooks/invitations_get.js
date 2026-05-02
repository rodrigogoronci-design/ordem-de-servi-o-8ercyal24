routerAdd(
  'GET',
  '/backend/v1/invitations/{token}',
  (e) => {
    const token = e.request.pathValue('token')
    try {
      const inv = $app.findFirstRecordByData('invitations', 'token', token)
      if (inv.getString('status') !== 'pending') {
        return e.badRequestError('Convite já utilizado ou inválido.')
      }
      return e.json(200, { email: inv.getString('email'), role: inv.getString('role') })
    } catch (_) {
      return e.notFoundError('Convite não encontrado.')
    }
  },
  $apis.requireGuestOnly(),
)
