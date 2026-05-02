import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getServiceOrders } from '@/services/api'
import type { ServiceOrder } from '@/types/models'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export default function Reports() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      getServiceOrders()
        .then(setOrders)
        .catch(() => toast.error('Erro ao carregar OS'))
    }
  }, [user?.role])

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const filteredOrders = orders.filter((o) => {
    if (!startDate && !endDate) return true
    const created = new Date(o.created)
    let valid = true
    if (startDate) {
      valid = valid && created >= new Date(startDate + 'T00:00:00')
    }
    if (endDate) {
      valid = valid && created <= new Date(endDate + 'T23:59:59')
    }
    return valid
  })

  const downloadCSV = () => {
    const headers = [
      'ID',
      'Título',
      'Descrição',
      'Status',
      'Prioridade',
      'Solicitante',
      'Responsável',
      'Data Vencimento',
      'Criado Em',
    ]
    const rows = filteredOrders.map((o) =>
      [
        o.id,
        o.title,
        o.description,
        o.status,
        o.priority,
        o.expand?.requester?.name || '',
        o.expand?.responsible?.name || '',
        o.due_date ? format(new Date(o.due_date), 'dd/MM/yyyy') : '',
        format(new Date(o.created), 'dd/MM/yyyy'),
      ]
        .map((v) => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(','),
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_os_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Relatório CSV baixado com sucesso')
  }

  const downloadPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) {
      toast.error('Por favor, permita pop-ups para gerar o PDF.')
      return
    }

    const html = `
      <html>
        <head>
          <title>Relatório de OS</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; }
            .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Relatório de Ordens de Serviço</h2>
          <div class="meta">
            <p><strong>Período:</strong> ${startDate ? format(new Date(startDate + 'T00:00:00'), 'dd/MM/yyyy') : 'Início'} até ${endDate ? format(new Date(endDate + 'T23:59:59'), 'dd/MM/yyyy') : 'Hoje'}</p>
            <p><strong>Total de Registros:</strong> ${filteredOrders.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Solicitante</th>
                <th>Criado Em</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders
                .map(
                  (o) => `
                <tr>
                  <td>${o.id}</td>
                  <td>${o.title}</td>
                  <td>${o.status.toUpperCase()}</td>
                  <td>${o.priority.toUpperCase()}</td>
                  <td>${o.expand?.requester?.name || '-'}</td>
                  <td>${format(new Date(o.created), 'dd/MM/yyyy')}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground mt-1">
          Gere e exporte relatórios de Ordens de Serviço.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período para gerar o relatório.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button onClick={downloadCSV} className="w-full sm:w-auto" variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button
              onClick={downloadPDF}
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
