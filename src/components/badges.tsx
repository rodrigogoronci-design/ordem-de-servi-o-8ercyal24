import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OSStatus, OSPriority } from '@/types/models'

export function StatusBadge({
  status,
  className,
}: {
  status: OSStatus | string
  className?: string
}) {
  const config: Record<string, { label: string; color: string }> = {
    aguardando: { label: 'Aguardando', color: 'bg-gray-200 text-gray-800 hover:bg-gray-300' },
    planejamento: { label: 'Planejamento', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    executando: {
      label: 'Em Execução',
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    },
    finalizado: { label: 'Finalizado', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  }
  const c = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

  return (
    <Badge variant="outline" className={cn('border-none whitespace-nowrap', c.color, className)}>
      {c.label}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: OSPriority | string
  className?: string
}) {
  const config: Record<string, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
    media: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 animate-pulse-subtle' },
  }
  const c = config[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' }

  return (
    <Badge variant="outline" className={cn('border-none font-semibold', c.color, className)}>
      {c.label}
    </Badge>
  )
}
