migrate(
  (app) => {
    const collections = [
      'comments',
      'notification_logs',
      'service_orders',
      'integrations',
      'responsibles',
      'notification_templates',
      'invitations',
    ]

    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (err) {
        console.log(`Failed to truncate ${name}:`, err)
      }
    }
  },
  (app) => {
    // Empty down migration as deleted mock data cannot be restored automatically
  },
)
