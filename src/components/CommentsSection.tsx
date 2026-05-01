import { useState, useEffect } from 'react'
import { getComments, createComment } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import type { Comment } from '@/types/models'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

export function CommentsSection({ orderId }: { orderId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum comentário ainda.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100"
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
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
              </div>
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
    </div>
  )
}
