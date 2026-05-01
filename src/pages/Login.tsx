import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('rodrigogoronci@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error('Erro ao acessar', {
        description: 'Verifique suas credenciais e tente novamente.',
      })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/20 glass-effect">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-lg">
            <span className="font-bold text-4xl">S</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Service Logic</CardTitle>
            <CardDescription>Acesse o painel de gestão de OS</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-transform"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
