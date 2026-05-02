import { useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
  onSave: (file: File) => void
  onCancel: () => void
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  useEffect(() => {
    initCanvas()
    const canvas = canvasRef.current
    if (!canvas) return

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        return {
          x: (e as TouchEvent).touches[0].clientX - rect.left,
          y: (e as TouchEvent).touches[0].clientY - rect.top,
        }
      }
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      }
    }

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      const { x, y } = getPos(e)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return
      e.preventDefault()
      const { x, y } = getPos(e)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }

    const stop = () => {
      isDrawing.current = false
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', stop)
    canvas.addEventListener('mouseout', stop)

    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', stop)

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseup', stop)
      canvas.removeEventListener('mouseout', stop)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', stop)
    }
  }, [initCanvas])

  const clear = () => {
    initCanvas()
  }

  const handleSave = () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'signature.png', { type: 'image/png' })
        onSave(file)
      }
    }, 'image/png')
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden bg-slate-50 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-64 touch-none block cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={clear}>
          Limpar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          Salvar Assinatura
        </Button>
      </div>
    </div>
  )
}
