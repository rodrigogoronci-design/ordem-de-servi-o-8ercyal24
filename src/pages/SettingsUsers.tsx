import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  getUsers,
  updateUser,
  getInvitations,
  createInvitation,
  deleteInvitation,
} from '@/services/api'
import type { User, Invitation } from '@/types/models'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Edit, Plus, Trash, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'colaborador', 'cliente']),
})

export default function SettingsUsers() {
  const { user } = useAuth()
  const isColaborador = user?.role === 'colaborador'

  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '' },
  })

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'cliente' },
  })

  const load = async () => {
    try {
      setUsers(await getUsers())
      if (!isColaborador) {
        setInvitations(await getInvitations())
      }
    } catch (e) {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('users', load)
  useRealtime('invitations', load, !isColaborador)

  const copyToClipboard = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência')
  }

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteInvitation(id)
      toast.success('Convite removido')
    } catch (e) {
      toast.error('Erro ao remover convite')
    }
  }

  const onInviteSubmit = async (values: z.infer<typeof inviteSchema>) => {
    setIsSubmitting(true)
    try {
      await createInvitation({
        email: values.email,
        role: values.role,
        token: Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2),
        status: 'pending',
        invited_by: user.id,
      })
      toast.success('Convite gerado com sucesso!')
      setIsInviteOpen(false)
      inviteForm.reset()
    } catch (error) {
      const fieldErrs = extractFieldErrors(error)
      if (Object.keys(fieldErrs).length > 0) {
        Object.entries(fieldErrs).forEach(([field, msg]) => {
          inviteForm.setError(field as any, { message: msg })
        })
      } else {
        toast.error('Erro ao gerar convite')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (u: User) => {
    form.reset({ name: u.name || '', phone: u.phone || '' })
    setEditingUser(u)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingUser) return
    setIsSubmitting(true)
    try {
      await updateUser(editingUser.id, values)
      toast.success('Usuário atualizado!')
      setIsDialogOpen(false)
    } catch (error) {
      const fieldErrs = extractFieldErrors(error)
      if (Object.keys(fieldErrs).length > 0) {
        Object.entries(fieldErrs).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg })
        })
      } else {
        toast.error('Erro ao salvar usuário')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários & Convites</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro de usuários e envie convites de acesso.
          </p>
        </div>
        {!isColaborador && (
          <Button onClick={() => setIsInviteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Convidar Usuário
          </Button>
        )}
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          {!isColaborador && <TabsTrigger value="convites">Convites Enviados</TabsTrigger>}
        </TabsList>

        <TabsContent value="usuarios">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || '-'}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role || '-'}</TableCell>
                      <TableCell>
                        {u.phone
                          ? isColaborador
                            ? u.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) 9****-$3')
                            : u.phone
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isColaborador && (
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {!isColaborador && (
          <TabsContent value="convites">
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil Destino</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                        Nenhum convite pendente ou enviado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell className="capitalize">{inv.role}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === 'accepted' ? 'default' : 'secondary'}>
                            {inv.status === 'accepted' ? 'Aceito' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {inv.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(inv.token)}
                                title="Copiar link"
                              >
                                <Copy className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteInvite(inv.id)}
                                title="Excluir convite"
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Gere um link de convite para permitir que o usuário crie sua conta com um perfil
              específico.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Convidado</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ex: joao@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="colaborador">Usuário (Colaborador)</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Gerando...' : 'Gerar Convite'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados de contato do usuário.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 11999998888"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
