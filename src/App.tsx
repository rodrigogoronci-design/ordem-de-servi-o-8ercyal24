import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Pipeline from '@/pages/Pipeline'
import Orders from '@/pages/Orders'
import OrderNew from '@/pages/OrderNew'
import OrderDetail from '@/pages/OrderDetail'
import NotFound from '@/pages/NotFound'
import SettingsIntegrations from '@/pages/SettingsIntegrations'
import SettingsResponsibles from '@/pages/SettingsResponsibles'
import { AuthProvider } from '@/hooks/use-auth'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<OrderNew />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/settings/integrations" element={<SettingsIntegrations />} />
            <Route path="/settings/responsibles" element={<SettingsResponsibles />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
