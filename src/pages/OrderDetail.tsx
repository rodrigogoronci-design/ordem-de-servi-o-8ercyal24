import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getServiceOrder, updateServiceOrder, deleteServiceOrder, getUsers } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { ServiceOrder, User } from '@/types/models'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/badges'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Clock, CalendarIcon, Edit, Trash } from 'lucide-react'
import { CommentsSection } from '@/components/CommentsSection'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const editSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
  status: z.enum(['aguardando', 'planejamento', 'executando', 'finalizado', 'cancelado']),
  assignee: z.string().optional(),
  due_date: z.date().optional(),
})

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [users, setUsers] = useState<User[]>([])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  })

  const load = async () => {
    if (!id) return
    try {
      const data = await getServiceOrder(id)
      setOrder(data)
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

  useEffect(() => {
    if (order && isEditOpen) {
      form.reset({
        title: order.title,
        description: order.description,
        priority: order.priority,
        status: order.status,
        assignee: order.assignee || 'none',
        due_date: order.due_date ? parseISO(order.due_date) : undefined,
      })
    }
  }, [order, isEditOpen, form])

  if (!order) return <div className="p-8">Carregando...</div>

  const handleUpdate = async (field: keyof ServiceOrder, value: string) => {
    try {
      await updateServiceOrder(order.id, { [field]: value === 'none' ? '' : value })
      toast.success('Atualizado com sucesso')
    } catch (e) {
      toast.error('Erro ao atualizar')
    }
  }

  const onSubmitEdit = async (values: z.infer<typeof editSchema>) => {
    setIsSubmitting(true)
    try {
      const data = {
        ...values,
        assignee: values.assignee === 'none' ? '' : values.assignee,
        due_date: values.due_date ? values.due_date.toISOString() : '',
      }
      await updateServiceOrder(order.id, data)
      toast.success('Ordem de serviço atualizada!')
      setIsEditOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!order.id) return
    try {
      await deleteServiceOrder(order.id)
      toast.success('Ordem de serviço excluída')
      navigate('/orders')
    } catch (error) {
      toast.error('Erro ao excluir OS')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <div className="flex gap-2 w-full sm:w-auto ml-14 sm:ml-0">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash className="w-4 h-4 mr-2" /> Excluir
          </Button>
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
              <CardTitle className="text-lg">Detalhes Rápidos</CardTitle>
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
                  value={order.assignee || 'none'}
                  onValueChange={(v) => handleUpdate('assignee', v)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não atribuído</SelectItem>
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
                    <CalendarIcon className="w-4 h-4" /> Prazo
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

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Editar Ordem de Serviço</SheetTitle>
            <SheetDescription>Modifique os dados da OS.</SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aguardando">Aguardando</SelectItem>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="executando">Executando</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não atribuído</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-1">
                    <FormLabel>Prazo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a Ordem de Serviço e
              todos os seus comentários associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir OS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
