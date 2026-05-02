import { toast } from 'sonner'
import type { ServiceOrder } from '@/types/models'

export function shareOrderViaWhatsApp(order: ServiceOrder) {
  const responsible = order.expand?.responsible

  if (!responsible || !responsible.phone) {
    toast.error('Sem contato do responsável', {
      description:
        'A OS precisa ter um responsável com telefone cadastrado para compartilhar via WhatsApp.',
    })
    return
  }

  const phone = responsible.phone.replace(/\D/g, '')

  if (!phone) {
    toast.error('Telefone inválido', {
      description: 'O telefone do responsável não possui números válidos.',
    })
    return
  }

  const idStr = `ID: #${order.order_number || order.id}`
  const url = `${window.location.origin}/orders/${order.id}`

  const message = `Olá ${responsible.name}, segue o resumo da sua Ordem de Serviço.\n${idStr}\nTítulo: ${order.title}\nLink: ${url}`

  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank')
}
