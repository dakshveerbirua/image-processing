"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Check, X, Undo2, Redo2, Brush, Type, Square, Circle, ArrowRight } from "lucide-react"

interface ImageEditorToolsProps {
  imageSrc: string
  onEditComplete: (editedImageSrc: string) => void
  onCancel: () => void
}

type Tool = "brush" | "text" | "rectangle" | "circle" | "arrow"

interface DrawingState {
  tool: Tool
  color: string
  brushSize: number
  isDrawing: boolean
  lastX: number
  lastY: number
}

interface TextElement {
  id: string
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  isEditing: boolean
}

const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
]

export function ImageEditorTools({ imageSrc, onEditComplete, onCancel }: ImageEditorToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: "brush",
    color: "#ff0000",
    brushSize: 5,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  })
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [newText, setNewText] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const [history, setHistory] = useState<string[]>([])
  const [historyStep, setHistoryStep] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      saveToHistory()
    }
    img.src = imageSrc
  }, [imageSrc])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL()
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1)
      newHistory.push(dataURL)
      return newHistory
    })
    setHistoryStep((prev) => prev + 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1)
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = history[historyStep - 1]
      }
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1)
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = history[historyStep + 1]
      }
    }
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e)

    if (drawingState.tool === "text") {
      const textId = Date.now().toString()
      setTextElements((prev) => [
        ...prev,
        {
          id: textId,
          x,
          y,
          text: newText || "Sample Text",
          color: drawingState.color,
          fontSize,
          isEditing: true,
        },
      ])
      return
    }

    setDrawingState((prev) => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y,
    }))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const { x, y } = getCanvasCoordinates(e)

    ctx.globalCompositeOperation = "source-over"
    ctx.strokeStyle = drawingState.color
    ctx.lineWidth = drawingState.brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (drawingState.tool === "brush") {
      ctx.beginPath()
      ctx.moveTo(drawingState.lastX, drawingState.lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (drawingState.tool === "rectangle") {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        ctx.strokeRect(drawingState.lastX, drawingState.lastY, x - drawingState.lastX, y - drawingState.lastY)
      }
      img.src = history[historyStep]
    } else if (drawingState.tool === "circle") {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const radius = Math.sqrt(Math.pow(x - drawingState.lastX, 2) + Math.pow(y - drawingState.lastY, 2))
        ctx.beginPath()
        ctx.arc(drawingState.lastX, drawingState.lastY, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
      img.src = history[historyStep]
    } else if (drawingState.tool === "arrow") {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        drawArrow(ctx, drawingState.lastX, drawingState.lastY, x, y)
      }
      img.src = history[historyStep]
    }

    setDrawingState((prev) => ({ ...prev, lastX: x, lastY: y }))
  }

  const stopDrawing = () => {
    if (drawingState.isDrawing) {
      setDrawingState((prev) => ({ ...prev, isDrawing: false }))
      saveToHistory()
    }
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 20
    const angle = Math.atan2(toY - fromY, toX - fromX)

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const renderTextElements = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    textElements.forEach((textElement) => {
      ctx.font = `${textElement.fontSize}px Arial`
      ctx.fillStyle = textElement.color
      ctx.fillText(textElement.text, textElement.x, textElement.y)
    })
  }

  useEffect(() => {
    renderTextElements()
  }, [textElements])

  const applyEdits = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const editedImageSrc = canvas.toDataURL("image/png")
    onEditComplete(editedImageSrc)
  }

  const selectTool = (tool: Tool) => {
    setDrawingState((prev) => ({ ...prev, tool }))
  }

  const selectColor = (color: string) => {
    setDrawingState((prev) => ({ ...prev, color }))
  }

  const updateBrushSize = (size: number) => {
    setDrawingState((prev) => ({ ...prev, brushSize: size }))
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Tools</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={applyEdits}>
              <Check className="w-4 h-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-96 object-contain cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Tools</h4>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant={drawingState.tool === "brush" ? "default" : "outline"}
              size="sm"
              onClick={() => selectTool("brush")}
            >
              <Brush className="w-4 h-4" />
            </Button>
            <Button
              variant={drawingState.tool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => selectTool("text")}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant={drawingState.tool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => selectTool("rectangle")}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={drawingState.tool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => selectTool("circle")}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={drawingState.tool === "arrow" ? "default" : "outline"}
              size="sm"
              onClick={() => selectTool("arrow")}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Brush Size</label>
              <Slider
                value={[drawingState.brushSize]}
                onValueChange={(value) => updateBrushSize(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">{drawingState.brushSize}px</span>
            </div>

            {drawingState.tool === "text" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Text</label>
                  <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Enter text..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size</label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={12}
                    max={72}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground">{fontSize}px</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-4">Colors</h4>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 ${
                  drawingState.color === color ? "border-primary" : "border-border"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => selectColor(color)}
              />
            ))}
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Custom Color</label>
            <input
              type="color"
              value={drawingState.color}
              onChange={(e) => selectColor(e.target.value)}
              className="w-full h-10 rounded border border-border"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
