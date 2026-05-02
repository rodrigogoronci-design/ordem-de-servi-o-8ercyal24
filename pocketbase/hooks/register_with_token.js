routerAdd(
  'POST',
  '/backend/v1/register',
  (e) => {
    const body = e.requestInfo().body
    const token = body.token
    const password = body.password
    const name = body.name

    if (!token || !password || !name) {
      return e.badRequestError('Dados incompletos.')
    }

    let inv
    try {
      inv = $app.findFirstRecordByData('invitations', 'token', token)
    } catch (_) {
      return e.notFoundError('Convite inválido.')
    }

    if (inv.getString('status') !== 'pending') {
      return e.badRequestError('Convite já utilizado.')
    }

    const users = $app.findCollectionByNameOrId('_pb_users_auth_')
    const user = new Record(users)
    user.setEmail(inv.getString('email'))
    user.setPassword(password)
    user.set('name', name)
    user.set('role', inv.getString('role'))
    user.setVerified(true)

    $app.save(user)

    inv.set('status', 'accepted')
    $app.save(inv)

    return e.json(200, { success: true })
  },
  $apis.requireGuestOnly(),
)
