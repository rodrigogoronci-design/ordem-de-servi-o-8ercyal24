migrate(
  (app) => {
    try {
      app.findFirstRecordByData('integrations', 'name', 'WhatsApp Z-API')
      return
    } catch (_) {}

    const col = app.findCollectionByNameOrId('integrations')
    const record = new Record(col)
    record.set('name', 'WhatsApp Z-API')
    record.set('api_url', 'https://notificacao.api.v2.slhub.com.br/v1/api/zapi/send-message')
    record.set('domain', 'servicelogic')
    record.set(
      'auth_token',
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJRb0pNejVETTAxTnU5ak5qVnJzN0RycGhPcTJiSy1ZX1E5em9JT25sXzNFIn0.eyJleHAiOjE3NzI2NDYzODEsImlhdCI6MTc3MjY0NjA4MSwiYXV0aF90aW1lIjoxNzcyNjQ1MDM5LCJqdGkiOiJjZmRkZDA4NS01ODVjLTQ3NDctODRhNC00OTlmMjU1MjgwNmIiLCJpc3MiOiJodHRwczovL2tleWNsb2FrLnNsaHViLmNvbS5ici9yZWFsbXMvc2wtaHViIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImRmZDk2YmE4LTA3ODctNGNhMi1hZTlhLTgwZTlhZGFjNzc0MiIsInR5cCI6IkJlYXJlciIsImF6cCI6InNsLWF1dGgtZnJvbnRlbmQiLCJub25jZSI6IjMzNTY0ZGUzLTAyZjMtNDlhYi1hY2UwLTBhYjY1MTA5YTA2ZiIsInNlc3Npb25fc3RhdGUiOiI1NzUxNTdmOC1hNTY4LTQ3MGEtYTQ0ZS01ODZiY2MwMDc0NWQiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXV0aC52Mi5zbGh1Yi5jb20uYnIvIiwiaHR0cDovL2xvY2FsaG9zdDozMDAyIiwiaHR0cHM6Ly9hdXRoLnYyLnNsaHViLmNvbS5iciIsImh0dHBzOi8vYXV0aC52Mi5zbGh1Yi5jb20uYnIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXNsLWh1YiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjU3NTE1N2Y4LWE1NjgtNDcwYS1hNDRlLTU4NmJjYzAwNzQ1ZCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTWFybG9uIE1hcmxpbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmxvbiIsImxvY2FsZSI6InB0LUJSIiwiZ2l2ZW5fbmFtZSI6Ik1hcmxvbiIsImZhbWlseV9uYW1lIjoiTWFybGluIiwiZW1haWwiOiJtYXJsb25Ac2VydmljZWxvZ2ljLmNvbS5iciJ9.E8800z7eXBPciotSNvkDbXcl3xXgCnfoBVdhyN-phJaorOQJqnrLDg0uSXKUrCRTlMN0DAFTmZDFrakHwFzUawg_eCYL0yWKg1OHshb0eVQ1nOyW_XGRuyKCAlgsdF0myWCAKjxT0Ca8sNeWxfavzN97hWw6CioyjeqbB6Sou3c6ULiMqyZyJSf2OIzo4PuQtTHNu6fnXtF3BEt8E9LTVXfTvCkXQIVm3g8A6A7BbT5JAu3T0quHFJFW0oxkfkoQEDAeps3UQW5HpRHU-WuyhiI1zb7UFac6Gt_gyHnNsvU2b96ZeVJX_nUwYpNci3WsFad-9W_dGlogYJW9DB5bRA',
    )
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('integrations', 'name', 'WhatsApp Z-API')
      app.delete(record)
    } catch (_) {}
  },
)
