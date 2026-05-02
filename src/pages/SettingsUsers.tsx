import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getUsers, updateUser } from '@/services/api'
import type { User } from '@/types/models'
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
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

export default function SettingsUsers() {
  const { user } = useAuth()
  const isColaborador = user?.role === 'colaborador'

  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '' },
  })

  const load = async () => {
    try {
      setUsers(await getUsers())
    } catch (e) {
      toast.error('Erro ao carregar usuários')
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('users', load)

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
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro de usuários e clientes (solicitantes).
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
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
