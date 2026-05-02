import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { getServiceOrders } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import type { ServiceOrder } from '@/types/models'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [orders, setOrders] = useState<ServiceOrder[]>([])

  const loadData = async () => {
    try {
      const data = await getServiceOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('service_orders', loadData)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const openOrders = orders.filter(
    (o) => o.status !== 'finalizado' && o.status !== 'cancelado',
  ).length

  const finalizedOrders = orders.filter((o) => o.status === 'finalizado')

  const finalizedThisMonth = finalizedOrders.filter((o) => {
    const updated = new Date(o.updated)
    return updated.getMonth() === currentMonth && updated.getFullYear() === currentYear
  }).length

  let avgCompletionTime = 0
  if (finalizedOrders.length > 0) {
    const totalDays = finalizedOrders.reduce((acc, o) => {
      const created = new Date(o.created).getTime()
      const updated = new Date(o.updated).getTime()
      return acc + (updated - created) / (1000 * 60 * 60 * 24)
    }, 0)
    avgCompletionTime = totalDays / finalizedOrders.length
  }

  // Performance Chart Data (last 30 days)
  const performanceData = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(new Date(), 29 - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const count = finalizedOrders.filter(
      (o) => format(new Date(o.updated), 'yyyy-MM-dd') === dateStr,
    ).length
    return {
      date: format(d, 'dd/MM'),
      finalizados: count,
    }
  })

  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = [
    {
      id: 'aguardando',
      name: 'Aguardando',
      value: statusCounts['aguardando'] || 0,
      fill: 'var(--color-aguardando)',
    },
    {
      id: 'planejamento',
      name: 'Planejamento',
      value: statusCounts['planejamento'] || 0,
      fill: 'var(--color-planejamento)',
    },
    {
      id: 'executando',
      name: 'Em Execução',
      value: statusCounts['executando'] || 0,
      fill: 'var(--color-executando)',
    },
    {
      id: 'finalizado',
      name: 'Finalizado',
      value: statusCounts['finalizado'] || 0,
      fill: 'var(--color-finalizado)',
    },
  ].filter((d) => d.value > 0)

  const chartConfig = {
    value: { label: 'Quantidade' },
    aguardando: { label: 'Aguardando', color: 'hsl(var(--chart-4))' },
    planejamento: { label: 'Planejamento', color: 'hsl(var(--chart-1))' },
    executando: { label: 'Em Execução', color: 'hsl(var(--chart-2))' },
    finalizado: { label: 'Finalizado', color: 'hsl(var(--chart-3))' },
  }

  const metrics = [
    { title: 'Total Ativas', value: openOrders, icon: AlertCircle, color: 'text-orange-500' },
    {
      title: 'Finalizadas neste Mês',
      value: finalizedThisMonth,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Tempo Médio de Resolução',
      value: `${avgCompletionTime.toFixed(1)} dias`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    { title: 'Total Geral de OS', value: orders.length, icon: FileText, color: 'text-primary' },
  ]

  const chartConfigPerformance = {
    finalizados: { label: 'OS Finalizadas', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de Ordens de Serviço.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="card-hover-effect border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Performance (Últimos 30 Dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfigPerformance} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="finalizados"
                    fill="var(--color-finalizados)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">Nenhuma OS encontrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-start gap-4">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none line-clamp-1">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em{' '}
                      {format(new Date(order.created), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
