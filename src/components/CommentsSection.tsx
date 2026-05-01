import { useState, useEffect } from 'react'
import { getComments, createComment, updateComment, deleteComment } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { Comment } from '@/types/models'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send, MoreVertical, Pencil, Trash, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export function CommentsSection({ orderId }: { orderId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user } = useAuth()

  const load = async () => {
    try {
      setComments(await getComments(orderId))
    } catch (e) {
      console.error('Error loading comments', e)
    }
  }

  useEffect(() => {
    load()
  }, [orderId])
  useRealtime('comments', load)

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      await createComment({ service_order: orderId, user: user.id, content: newComment })
      setNewComment('')
    } catch (e) {
      toast.error('Erro ao enviar comentário')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return
    try {
      await updateComment(id, { content: editContent })
      setEditingId(null)
      toast.success('Comentário atualizado')
    } catch (e) {
      toast.error('Erro ao atualizar comentário')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteComment(deletingId)
      toast.success('Comentário removido')
    } catch (e) {
      toast.error('Erro ao remover comentário')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum comentário ainda.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 group relative"
            >
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-white text-xs">
                  {c.expand?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-sm">
                    {c.expand?.user?.name || 'Desconhecido'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(c.created), 'dd/MM HH:mm', { locale: ptBR })}
                  </span>
                </div>
                {editingId === c.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 mr-1" /> Cancelar
                      </Button>
                      <Button size="sm" onClick={() => handleEdit(c.id)}>
                        <Check className="w-4 h-4 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                )}
              </div>
              {user?.id === c.user && editingId !== c.id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(c.id)
                          setEditContent(c.content)
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeletingId(c.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 bg-white p-4 rounded-xl border shadow-sm">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-white">{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Adicione uma atualização ou comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none border-slate-200"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={loading || !newComment.trim()}>
              <Send className="w-4 h-4 mr-2" /> Enviar
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
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
