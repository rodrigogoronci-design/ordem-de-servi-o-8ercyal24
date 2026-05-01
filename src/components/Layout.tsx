import { Outlet, Navigate } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 lg:p-8 overflow-auto animate-fade-in-up">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
