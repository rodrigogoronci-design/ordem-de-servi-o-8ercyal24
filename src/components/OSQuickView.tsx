import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { StatusBadge, PriorityBadge } from '@/components/badges'
import type { ServiceOrder } from '@/types/models'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, User, Phone, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function OSQuickView({ order }: { order: ServiceOrder }) {
  return (
    <>
      <SheetHeader className="mb-6">
        <SheetTitle className="text-xl font-bold flex items-center justify-between mt-4">
          <span>{order.title}</span>
        </SheetTitle>
        <SheetDescription className="flex gap-2 mt-2">
          <StatusBadge status={order.status} />
          <PriorityBadge priority={order.priority} />
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 text-sm">
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Descrição</h4>
          <p className="text-slate-600 bg-slate-50 p-3 rounded-md min-h-20 whitespace-pre-wrap">
            {order.description || 'Nenhuma descrição fornecida.'}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Solicitante
            </span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-white text-[10px]">
                  {order.expand?.requester?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate">
                {order.expand?.requester?.name || 'Desconhecido'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Técnico Atribuído
            </span>
            {order.expand?.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-secondary text-white text-[10px]">
                    {order.expand.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{order.expand.assignee.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-4 w-4" />
                <span>Não atribuído</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Prazo
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <span className="font-medium">
                {order.due_date ? format(new Date(order.due_date), 'dd/MM/yyyy') : 'Não definido'}
              </span>
            </div>
          </div>
        </div>

        {order.expand?.responsible && (
          <>
            <Separator />
            <div className="space-y-3">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Responsável (Contato)
              </span>
              <div className="bg-slate-50 p-3 rounded-md space-y-2 text-slate-700">
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {order.expand.responsible.name}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {order.expand.responsible.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {order.expand.responsible.email}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
