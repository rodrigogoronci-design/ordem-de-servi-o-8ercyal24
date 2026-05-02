import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  getResponsibles,
  createResponsible,
  updateResponsible,
  deleteResponsible,
} from '@/services/api'
import type { Responsible } from '@/types/models'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Edit, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const formSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
})

export default function SettingsResponsibles() {
  const { user } = useAuth()
  const isColaborador = user?.role === 'colaborador'

  const [responsibles, setResponsibles] = useState<Responsible[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phone: '', email: '' },
  })

  const load = async () => {
    try {
      setResponsibles(await getResponsibles())
    } catch (e) {
      toast.error('Erro ao carregar responsáveis')
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('responsibles', load)

  const handleOpenNew = () => {
    form.reset({ name: '', phone: '', email: '' })
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (r: Responsible) => {
    form.reset({ name: r.name, phone: r.phone, email: r.email })
    setEditingId(r.id)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateResponsible(editingId, values)
        toast.success('Responsável atualizado!')
      } else {
        await createResponsible(values)
        toast.success('Responsável criado!')
      }
      setIsDialogOpen(false)
    } catch (error) {
      const fieldErrs = extractFieldErrors(error)
      if (Object.keys(fieldErrs).length > 0) {
        Object.entries(fieldErrs).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg })
        })
      } else {
        toast.error('Erro ao salvar responsável')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteResponsible(deletingId)
      toast.success('Responsável excluído')
    } catch (e) {
      toast.error('Erro ao excluir responsável')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Responsáveis</h2>
          <p className="text-muted-foreground">Gerencie o cadastro de pessoas responsáveis.</p>
        </div>
        {!isColaborador && (
          <Button onClick={handleOpenNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo Responsável
          </Button>
        )}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responsibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Nenhum responsável encontrado.
                </TableCell>
              </TableRow>
            ) : (
              responsibles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    {isColaborador
                      ? r.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) 9****-$3')
                      : r.phone}
                  </TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell className="text-right">
                    {!isColaborador && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(r)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeletingId(r.id)}
                        >
                          <Trash className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle>
            <DialogDescription>Preencha os dados do responsável abaixo.</DialogDescription>
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
                      <Input placeholder="Ex: João Silva" {...field} />
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
                    <FormLabel>Telefone</FormLabel>
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ex: joao@email.com" {...field} />
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

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cadastro será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
