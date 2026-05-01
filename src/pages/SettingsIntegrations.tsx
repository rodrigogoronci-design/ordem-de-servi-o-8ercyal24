import { useState, useEffect, FormEvent } from 'react'
import { getIntegrations, updateIntegration } from '@/services/api'
import { Integration } from '@/types/models'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Edit2, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SettingsIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const loadData = async () => {
    try {
      const data = await getIntegrations()
      setIntegrations(data)
    } catch (err) {
      toast.error('Erro ao carregar integrações')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('integrations', () => {
    loadData()
  })

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as conexões externas e parâmetros de comunicação.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Serviços Conectados
          </CardTitle>
          <CardDescription>Lista de todas as integrações configuradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">{integration.name}</TableCell>
                  <TableCell>{integration.domain}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Ativo
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {integrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhuma integração encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedIntegration}
        onOpenChange={(open) => !open && setSelectedIntegration(null)}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
          <SheetHeader>
            <SheetTitle>Editar {selectedIntegration?.name}</SheetTitle>
            <SheetDescription>Configure os parâmetros de comunicação com a API.</SheetDescription>
          </SheetHeader>

          {selectedIntegration && (
            <IntegrationForm
              integration={selectedIntegration}
              onClose={() => setSelectedIntegration(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function IntegrationForm({
  integration,
  onClose,
}: {
  integration: Integration
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    api_url: integration.api_url,
    domain: integration.domain,
    auth_token: integration.auth_token,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.api_url || !formData.domain || !formData.auth_token) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      await updateIntegration(integration.id, formData)
      toast.success('Configurações atualizadas com sucesso')
      onClose()
    } catch (err) {
      toast.error('Erro ao atualizar configurações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api_url">URL da API</Label>
          <Input
            id="api_url"
            value={formData.api_url}
            onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
            placeholder="https://..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Domínio</Label>
          <Input
            id="domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="servicelogic"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth_token">Authorization Token (JWT)</Label>
          <Textarea
            id="auth_token"
            value={formData.auth_token}
            onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
            className="font-mono text-xs min-h-[120px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            O header Authorization será enviado como{' '}
            <code className="bg-muted px-1 rounded text-primary">Bearer {'{token}'}</code>.
          </p>
        </div>
      </div>

      <Alert>
        <Code className="h-4 w-4" />
        <AlertTitle>Formato da Mensagem (Referência)</AlertTitle>
        <AlertDescription>
          <pre className="text-xs mt-2 bg-muted p-3 rounded-md overflow-x-auto text-muted-foreground font-mono leading-relaxed">
            {`{
  "destinatario": "@NUMEROFONE",
  "conteudo": "Olá! Esta é uma mensagem sem template.",
  "prioridade": "HIGH",
  "parametros": {},
  "metadata": {
    "whatsappTipoMensagem": "TEXT"
  }
}`}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            O destinatário{' '}
            <code className="bg-muted px-1 rounded text-primary font-medium">@NUMEROFONE</code> deve
            ser substituído pelo formato{' '}
            <code className="bg-muted px-1 rounded text-primary font-medium">DDD99999999</code> no
            momento do envio.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
