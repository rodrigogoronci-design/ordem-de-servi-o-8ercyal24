import { useState, useEffect } from 'react'
import { getServiceOrders, updateServiceOrder } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { ServiceOrder } from '@/types/models'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge, PriorityBadge } from '@/components/badges'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { OSQuickView } from '@/components/OSQuickView'
import { toast } from 'sonner'

const COLUMNS = [
  { id: 'aguardando', title: 'Aguardando', color: 'bg-slate-200' },
  { id: 'planejamento', title: 'Em Planejamento', color: 'bg-blue-200' },
  { id: 'executando', title: 'Executando', color: 'bg-orange-200' },
  { id: 'finalizado', title: 'Finalizado', color: 'bg-green-200' },
]

export default function Pipeline() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const load = async () => {
    try {
      setOrders(await getServiceOrders())
    } catch (e) {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('service_orders', load)

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData('text/plain', id)
  }

  const onDrop = async (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('text/plain')
    if (!orderId) return

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: colId as any } : o)))
    try {
      await updateServiceOrder(orderId, { status: colId as any })
      if (colId === 'finalizado') toast.success('OS marcada como finalizada!')
    } catch (err) {
      load()
      toast.error('Erro ao atualizar status')
    }
    setDraggedId(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Pipeline de Execução</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-0">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id)
          return (
            <div
              key={col.id}
              className="flex flex-col flex-shrink-0 w-80 bg-slate-100/50 rounded-xl border border-slate-200/60 h-full max-h-[80vh]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-white/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-slate-700">{col.title}</h3>
                </div>
                <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full font-medium">
                  {colOrders.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colOrders.map((order) => (
                  <Sheet key={order.id}>
                    <SheetTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => onDragStart(e, order.id)}
                        className={`cursor-grab active:cursor-grabbing transition-transform ${draggedId === order.id ? 'opacity-50' : 'hover:-translate-y-1'}`}
                      >
                        <Card className="shadow-sm border-slate-200 hover:shadow-md hover:border-primary/30 transition-all">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex justify-between items-start">
                              <PriorityBadge
                                priority={order.priority}
                                className="text-[10px] px-1.5 py-0"
                              />
                              <span className="text-xs text-slate-400 font-mono">
                                #{order.id.slice(0, 5)}
                              </span>
                            </div>
                            <p className="font-medium text-sm leading-snug line-clamp-2">
                              {order.title}
                            </p>
                            {order.expand?.responsible && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                Resp: {order.expand.responsible.name}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                {order.due_date
                                  ? format(new Date(order.due_date), 'dd/MM')
                                  : '--/--'}
                              </div>
                              {order.expand?.assignee && (
                                <Avatar
                                  className="w-6 h-6 border border-white shadow-sm"
                                  title={`Técnico: ${order.expand.assignee.name}`}
                                >
                                  <AvatarFallback className="bg-secondary text-white text-[10px]">
                                    {order.expand.assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                      <OSQuickView order={order} />
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
