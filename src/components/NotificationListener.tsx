import { useEffect, useRef } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getServiceOrders } from '@/services/api'

export function NotificationListener() {
  const knownStatuses = useRef<Record<string, string>>({})
  const hasRequested = useRef(false)

  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default' &&
      !hasRequested.current
    ) {
      hasRequested.current = true
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    getServiceOrders()
      .then((orders) => {
        const map: Record<string, string> = {}
        orders.forEach((o) => {
          map[o.id] = o.status
        })
        knownStatuses.current = map
      })
      .catch(() => {})
  }, [])

  useRealtime('service_orders', (e) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    if (e.action === 'create') {
      knownStatuses.current[e.record.id] = e.record.status
      new Notification(`Nova OS ID: #${e.record.order_number || e.record.id.slice(0, 5)}`, {
        body: e.record.title,
      })
    } else if (e.action === 'update') {
      const prevStatus = knownStatuses.current[e.record.id]
      if (prevStatus && prevStatus !== e.record.status) {
        new Notification(`OS ID: #${e.record.order_number || e.record.id.slice(0, 5)} Atualizada`, {
          body: `Novo status: ${e.record.status}`,
        })
      }
      knownStatuses.current[e.record.id] = e.record.status
    }
  })

  return null
}
