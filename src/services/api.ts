import pb from '@/lib/pocketbase/client'
import type { ServiceOrder, Comment, User, Integration } from '@/types/models'

export const getServiceOrders = () =>
  pb
    .collection('service_orders')
    .getFullList<ServiceOrder>({ expand: 'requester,assignee', sort: '-created' })

export const getServiceOrder = (id: string) =>
  pb.collection('service_orders').getOne<ServiceOrder>(id, { expand: 'requester,assignee' })

export const createServiceOrder = (data: Partial<ServiceOrder>) =>
  pb.collection('service_orders').create<ServiceOrder>(data)

export const updateServiceOrder = (id: string, data: Partial<ServiceOrder>) =>
  pb.collection('service_orders').update<ServiceOrder>(id, data)

export const getComments = (orderId: string) =>
  pb.collection('comments').getFullList<Comment>({
    filter: `service_order = '${orderId}'`,
    expand: 'user',
    sort: 'created',
  })

export const createComment = (data: Partial<Comment>) =>
  pb.collection('comments').create<Comment>(data)

export const updateComment = (id: string, data: Partial<Comment>) =>
  pb.collection('comments').update<Comment>(id, data)

export const deleteComment = (id: string) => pb.collection('comments').delete(id)

export const deleteServiceOrder = (id: string) => pb.collection('service_orders').delete(id)

export const getUsers = () => pb.collection('users').getFullList<User>({ sort: 'name' })

export const getIntegrations = () =>
  pb.collection('integrations').getFullList<Integration>({ sort: 'name' })

export const getIntegration = (id: string) => pb.collection('integrations').getOne<Integration>(id)

export const updateIntegration = (id: string, data: Partial<Integration>) =>
  pb.collection('integrations').update<Integration>(id, data)

export const sendWhatsAppMessage = (orderId: string, phone: string) =>
  pb.send(`/backend/v1/orders/${orderId}/whatsapp`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
    headers: { 'Content-Type': 'application/json' },
  })
