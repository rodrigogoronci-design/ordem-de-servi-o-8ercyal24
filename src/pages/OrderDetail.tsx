import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getServiceOrder, updateServiceOrder, getUsers } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { ServiceOrder, User } from '@/types/models'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, PriorityBadge } from '@/components/badges'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { CommentsSection } from '@/components/CommentsSection'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [users, setUsers] = useState<User[]>([])

  const load = async () => {
    if (!id) return
    try {
      setOrder(await getServiceOrder(id))
    } catch (e) {
      toast.error('OS não encontrada')
      navigate('/orders')
    }
  }

  useEffect(() => {
    load()
    getUsers().then(setUsers)
  }, [id])

  useRealtime('service_orders', load)

  if (!order) return <div className="p-8">Carregando...</div>

  const handleUpdate = async (field: keyof ServiceOrder, value: string) => {
    try {
      await updateServiceOrder(order.id, { [field]: value })
      toast.success('Atualizado com sucesso')
    } catch (e) {
      toast.error('Erro ao atualizar')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{order.title}</h2>
            <StatusBadge status={order.status} className="text-sm px-3 py-1" />
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">ID: #{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[120px] whitespace-pre-wrap text-slate-700">
                {order.description || <span className="text-slate-400 italic">Sem descrição.</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Comunicações</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentsSection orderId={order.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={order.status} onValueChange={(v) => handleUpdate('status', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="planejamento">Em Planejamento</SelectItem>
                    <SelectItem value="executando">Executando</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={order.priority} onValueChange={(v) => handleUpdate('priority', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select
                  value={order.assignee || ''}
                  onValueChange={(v) => handleUpdate('assignee', v)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Prazo
                  </span>
                  <span className="font-medium">
                    {order.due_date ? format(new Date(order.due_date), 'dd/MM/yyyy') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Criado em
                  </span>
                  <span className="font-medium">
                    {format(new Date(order.created), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
