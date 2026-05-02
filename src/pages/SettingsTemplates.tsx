import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
} from '@/services/api'
import type { NotificationTemplate } from '@/types/models'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  FormDescription,
} from '@/components/ui/form'
import { Edit, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const formSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  content: z.string().min(5, 'Conteúdo muito curto'),
})

export default function SettingsTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', content: '' },
  })

  const load = async () => {
    try {
      setTemplates(await getNotificationTemplates())
    } catch (e) {
      toast.error('Erro ao carregar templates')
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('notification_templates', load)

  const handleOpenNew = () => {
    form.reset({ name: '', content: '' })
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (t: NotificationTemplate) => {
    form.reset({ name: t.name, content: t.content })
    setEditingId(t.id)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateNotificationTemplate(editingId, values)
        toast.success('Template atualizado!')
      } else {
        await createNotificationTemplate(values)
        toast.success('Template criado!')
      }
      setIsDialogOpen(false)
    } catch (error) {
      const fieldErrs = extractFieldErrors(error)
      if (Object.keys(fieldErrs).length > 0) {
        Object.entries(fieldErrs).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg })
        })
      } else {
        toast.error('Erro ao salvar template')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteNotificationTemplate(deletingId)
      toast.success('Template excluído')
    } catch (e) {
      toast.error('Erro ao excluir template')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates de Mensagem</h2>
          <p className="text-muted-foreground">Gerencie os modelos de notificação do WhatsApp.</p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Template
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                  Nenhum template encontrado.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium whitespace-nowrap">{t.name}</TableCell>
                  <TableCell className="max-w-md truncate">{t.content}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeletingId(t.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>{editingId ? 'Editar Template' : 'Novo Template'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do template. Use as tags dinâmicas no conteúdo.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Notificação Padrão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" placeholder="Olá {nome}..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Variáveis disponíveis: {'{nome}'}, {'{titulo}'}, {'{status}'}, {'{id}'}
                    </FormDescription>
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
              Esta ação não pode ser desfeita. O template será excluído permanentemente.
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
