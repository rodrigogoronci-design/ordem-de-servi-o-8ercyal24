import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export default function Register() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', password: '' },
  })

  useEffect(() => {
    if (!token) {
      toast.error('Token não fornecido.')
      navigate('/login')
      return
    }

    const checkToken = async () => {
      try {
        const res = await pb.send(`/backend/v1/invitations/${token}`, { method: 'GET' })
        setInvitation(res)
      } catch (err) {
        toast.error('Convite inválido ou já utilizado.')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    checkToken()
  }, [token, navigate])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await pb.send('/backend/v1/register', {
        method: 'POST',
        body: JSON.stringify({
          token,
          name: values.name,
          password: values.password,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao realizar cadastro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-muted-foreground animate-pulse">Verificando convite...</p>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold text-xl">
          S
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">
          Service<span className="text-primary">Logic</span>
        </span>
      </div>

      <Card className="w-full max-w-md shadow-lg border-slate-200/60">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Criar sua conta</CardTitle>
          <CardDescription className="text-base">
            Você foi convidado para participar como{' '}
            <span className="font-semibold text-foreground capitalize">{invitation.role}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={invitation.email} disabled className="bg-slate-100" />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Crie uma senha forte..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Completar Cadastro'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
