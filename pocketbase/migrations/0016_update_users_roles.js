migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = col.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'colaborador', 'cliente']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = col.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'colaborador']
      app.save(col)
    }
  },
)
