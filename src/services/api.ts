import pb from '@/lib/pocketbase/client'
import type {
  ServiceOrder,
  Comment,
  User,
  Integration,
  Responsible,
  NotificationLog,
  NotificationTemplate,
  Invitation,
} from '@/types/models'

export const getServiceOrders = () =>
  pb
    .collection('service_orders')
    .getFullList<ServiceOrder>({ expand: 'requester,assignee,responsible', sort: '-created' })

export const getServiceOrder = (id: string) =>
  pb
    .collection('service_orders')
    .getOne<ServiceOrder>(id, { expand: 'requester,assignee,responsible' })

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

export const getResponsibles = () =>
  pb.collection('responsibles').getFullList<Responsible>({ sort: 'name' })

export const createResponsible = (data: Partial<Responsible>) =>
  pb.collection('responsibles').create<Responsible>(data)

export const updateResponsible = (id: string, data: Partial<Responsible>) =>
  pb.collection('responsibles').update<Responsible>(id, data)

export const deleteResponsible = (id: string) => pb.collection('responsibles').delete(id)

export const getNotificationTemplates = () =>
  pb.collection('notification_templates').getFullList<NotificationTemplate>({ sort: 'name' })

export const createNotificationTemplate = (data: Partial<NotificationTemplate>) =>
  pb.collection('notification_templates').create<NotificationTemplate>(data)

export const updateNotificationTemplate = (id: string, data: Partial<NotificationTemplate>) =>
  pb.collection('notification_templates').update<NotificationTemplate>(id, data)

export const deleteNotificationTemplate = (id: string) =>
  pb.collection('notification_templates').delete(id)

export const updateUser = (id: string, data: Partial<User>) =>
  pb.collection('users').update<User>(id, data)

export const getInvitations = () =>
  pb.collection('invitations').getFullList<Invitation>({ sort: '-created', expand: 'invited_by' })

export const createInvitation = (data: Partial<Invitation>) =>
  pb.collection('invitations').create<Invitation>(data)

export const deleteInvitation = (id: string) => pb.collection('invitations').delete(id)

export const getIntegrations = () =>
  pb.collection('integrations').getFullList<Integration>({ sort: 'name' })

export const getIntegration = (id: string) => pb.collection('integrations').getOne<Integration>(id)

export const updateIntegration = (id: string, data: Partial<Integration>) =>
  pb.collection('integrations').update<Integration>(id, data)

export const sendWhatsAppMessage = (orderId: string, payload?: any) =>
  pb.send(`/backend/v1/orders/${orderId}/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  })

export const logWhatsAppWeb = (orderId: string, payload: any) =>
  pb.send(`/backend/v1/orders/${orderId}/whatsapp_log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getNotificationLogs = (orderId: string) =>
  pb.collection('notification_logs').getFullList<NotificationLog>({
    filter: `service_order = '${orderId}'`,
    sort: '-created',
    expand: 'sent_by',
  })
