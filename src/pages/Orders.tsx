import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getServiceOrders } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { ServiceOrder } from '@/types/models'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Eye, Edit, Printer } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '@/components/badges'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function Orders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const navigate = useNavigate()

  const load = async () => {
    const data = await getServiceOrders()
    setOrders(data)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('service_orders', load)

  const simulatePrint = () => {
    toast.success('Gerando PDF...', { description: 'O download iniciará em instantes.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Listagem completa e gerenciamento.</p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" /> Nova OS
          </Link>
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="hidden md:table-cell">Data Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500">
                    #{order.id.slice(0, 5)}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {order.title}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={order.priority} />
                  </TableCell>
                  <TableCell>
                    {order.expand?.assignee?.name || (
                      <span className="text-slate-400 text-sm">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-500">
                    {format(new Date(order.created), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizar Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={simulatePrint}>
                          <Printer className="mr-2 h-4 w-4" /> Imprimir PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
