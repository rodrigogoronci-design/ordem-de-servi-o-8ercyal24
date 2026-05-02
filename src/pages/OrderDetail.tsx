import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  getServiceOrder,
  updateServiceOrder,
  getComments,
  createComment,
  getNotificationTemplates,
  sendWhatsAppMessage,
} from '@/services/api'
import type { ServiceOrder, Comment, NotificationTemplate } from '@/types/models'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { MessageCircle, Send, ExternalLink, ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Notification Dialog State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [recipientType, setRecipientType] = useState<'requester' | 'responsible'>('requester')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const loadOrder = async () => {
    if (!id) return
    try {
      setOrder(await getServiceOrder(id))
    } catch (e) {
      toast.error('Erro ao carregar OS')
      navigate('/orders')
    }
  }

  const loadComments = async () => {
    if (!id) return
    try {
      setComments(await getComments(id))
    } catch {
      /* intentionally ignored */
    }
  }

  const loadTemplates = async () => {
    try {
      const data = await getNotificationTemplates()
      setTemplates(data)
      if (data.length > 0) setSelectedTemplateId(data[0].id)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadOrder()
    loadComments()
    loadTemplates()
  }, [id])

  useRealtime('service_orders', (e) => {
    if (e.record.id === id) loadOrder()
  })
  useRealtime('comments', (e) => {
    if (e.record.service_order === id) loadComments()
  })

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id || !user) return
    setIsSubmitting(true)
    try {
      await createComment({ service_order: id, content: newComment, user: user.id })
      setNewComment('')
      toast.success('Comentário adicionado')
    } catch (error) {
      toast.error('Erro ao adicionar comentário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMessagePreview = () => {
    if (!selectedTemplateId || !order) return { content: '', phone: '' }
    const template = templates.find((t) => t.id === selectedTemplateId)
    if (!template) return { content: '', phone: '' }

    let nome = ''
    let phone = ''
    if (recipientType === 'requester' && order.expand?.requester) {
      nome = order.expand.requester.name || 'Cliente'
      phone = order.expand.requester.phone || ''
    } else if (recipientType === 'responsible' && order.expand?.responsible) {
      nome = order.expand.responsible.name || 'Responsável'
      phone = order.expand.responsible.phone || ''
    }

    let content = template.content
    content = content.replace(/{nome}/g, nome)
    content = content.replace(/{titulo}/g, order.title)
    content = content.replace(/{status}/g, order.status)
    content = content.replace(/{id}/g, order.id)

    return { content, phone }
  }

  const { content: previewContent, phone: previewPhone } = getMessagePreview()

  const handleSendApi = async () => {
    if (!previewPhone) {
      toast.error('Destinatário selecionado não possui telefone cadastrado.')
      return
    }
    if (!id) return
    try {
      await sendWhatsAppMessage(id, { phone: previewPhone, message: previewContent })
      await updateServiceOrder(id, { last_notification_sent: new Date().toISOString() })
      toast.success('Notificação enviada com sucesso!')
      setIsNotificationOpen(false)
    } catch (e) {
      toast.error('Erro ao enviar notificação')
    }
  }

  const handleOpenWhatsAppWeb = () => {
    if (!previewPhone) {
      toast.error('Destinatário selecionado não possui telefone cadastrado.')
      return
    }
    const cleanPhone = previewPhone.replace(/\D/g, '')
    const encoded = encodeURIComponent(previewContent)
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
    setIsNotificationOpen(false)
  }

  if (!order) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 sm:mt-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{order.title}</h2>
          <p className="text-muted-foreground">OS #{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsNotificationOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Notificar
          </Button>
        </div>
      </div>

      {order.last_notification_sent && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
          <Clock className="w-4 h-4" />
          <span>
            Último envio de notificação:{' '}
            {format(new Date(order.last_notification_sent), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Ordem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-semibold text-sm">Descrição</span>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                  {order.description || 'Sem descrição'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="font-semibold text-sm block mb-1">Status</span>
                  <Badge variant={order.status === 'finalizado' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-sm block mb-1">Prioridade</span>
                  <Badge variant={order.priority === 'urgente' ? 'destructive' : 'outline'}>
                    {order.priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum comentário ainda.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{c.expand?.user?.name || 'Usuário'}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.created), 'dd/MM/yy HH:mm')}
                        </span>
                      </div>
                      <p className="text-slate-700">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envolvidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-semibold text-sm text-muted-foreground">Solicitante</span>
                <p className="font-medium">{order.expand?.requester?.name || '-'}</p>
                {order.expand?.requester?.phone && (
                  <p className="text-xs text-muted-foreground">{order.expand.requester.phone}</p>
                )}
              </div>
              <div className="pt-4 border-t">
                <span className="font-semibold text-sm text-muted-foreground">Atribuído a</span>
                <p className="font-medium">{order.expand?.assignee?.name || 'Não atribuído'}</p>
              </div>
              <div className="pt-4 border-t">
                <span className="font-semibold text-sm text-muted-foreground">
                  Responsável (Externo)
                </span>
                <p className="font-medium">{order.expand?.responsible?.name || 'Não definido'}</p>
                {order.expand?.responsible?.phone && (
                  <p className="text-xs text-muted-foreground">{order.expand.responsible.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificação WhatsApp</DialogTitle>
            <DialogDescription>Escolha o destinatário e o template da mensagem.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Destinatário</Label>
              <RadioGroup
                value={recipientType}
                onValueChange={(v) => setRecipientType(v as any)}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="requester" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">
                    Solicitante ({order.expand?.requester?.name || 'Sem nome'})
                    {order.expand?.requester?.phone
                      ? ` - ${order.expand.requester.phone}`
                      : ' (Sem telefone)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="responsible" id="r2" disabled={!order.responsible} />
                  <Label
                    htmlFor="r2"
                    className={cn('cursor-pointer', !order.responsible && 'opacity-50')}
                  >
                    Responsável ({order.expand?.responsible?.name || 'Nenhum'})
                    {order.expand?.responsible?.phone ? ` - ${order.expand.responsible.phone}` : ''}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Template de Mensagem</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Pré-visualização</Label>
              <div className="bg-slate-100 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                {previewContent || 'Selecione um template para ver a pré-visualização.'}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleOpenWhatsAppWeb} className="w-full sm:w-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir no WhatsApp Web
            </Button>
            <Button
              onClick={handleSendApi}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar via API
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
