import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  KanbanSquare,
  FileText,
  Settings,
  Users,
  UserCog,
  MessageSquare,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Pipeline', url: '/pipeline', icon: KanbanSquare },
  { title: 'Ordens de Serviço', url: '/orders', icon: FileText },
  { title: 'Usuários', url: '/settings/users', icon: Users },
  { title: 'Responsáveis', url: '/settings/responsibles', icon: UserCog },
  { title: 'Templates', url: '/settings/templates', icon: MessageSquare },
  { title: 'Configurações', url: '/settings/integrations', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-white font-bold text-xl">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex-1">
            Service<span className="text-sidebar-primary">Logic</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="my-1"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
