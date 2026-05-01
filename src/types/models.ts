export interface Responsible {
  id: string
  name: string
  phone: string
  email: string
  created: string
  updated: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export type OSStatus = 'aguardando' | 'planejamento' | 'executando' | 'finalizado' | 'cancelado'
export type OSPriority = 'baixa' | 'media' | 'alta' | 'urgente'

export interface ServiceOrder {
  id: string
  title: string
  description: string
  status: OSStatus
  priority: OSPriority
  requester: string
  assignee?: string
  responsible?: string
  due_date?: string
  created: string
  updated: string
  expand?: {
    requester?: User
    assignee?: User
    responsible?: Responsible
  }
}

export interface Comment {
  id: string
  service_order: string
  user: string
  content: string
  created: string
  expand?: {
    user?: User
  }
}

export interface Integration {
  id: string
  name: string
  api_url: string
  domain: string
  auth_token: string
  test_phone?: string
  created: string
  updated: string
}
