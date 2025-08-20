"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Square } from "lucide-react"

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageSrc: string) => void
  onCancel: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      // Set initial crop area to center of image
      const containerWidth = containerRef.current?.clientWidth || 400
      const containerHeight = containerRef.current?.clientHeight || 300
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
      const displayWidth = img.width * scale
      const displayHeight = img.height * scale

      setCropArea({
        x: (displayWidth - 150) / 2,
        y: (displayHeight - 150) / 2,
        width: 150,
        height: 150,
      })
    }
    img.src = imageSrc
  }, [imageSrc])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y,
      })
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - rect.left - dragStart.x
      const newY = e.clientY - rect.top - dragStart.y

      // Constrain to image bounds
      const maxX = containerRef.current.clientWidth - cropArea.width
      const maxY = containerRef.current.clientHeight - cropArea.height

      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }))
    },
    [isDragging, dragStart, cropArea.width, cropArea.height],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const applyCrop = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !containerRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate scale factors
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const scaleX = imageSize.width / containerWidth
    const scaleY = imageSize.height / containerHeight

    // Set canvas size to crop area
    canvas.width = cropArea.width * scaleX
    canvas.height = cropArea.height * scaleY

    // Draw cropped image
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    // Convert to data URL
    const croppedImageSrc = canvas.toDataURL("image/png")
    onCropComplete(croppedImageSrc)
  }

  const presetCrops = [
    { name: "Square", ratio: 1 },
    { name: "16:9", ratio: 16 / 9 },
    { name: "4:3", ratio: 4 / 3 },
    { name: "3:2", ratio: 3 / 2 },
  ]

  const applyPresetCrop = (ratio: number) => {
    const containerWidth = containerRef.current?.clientWidth || 400
    const containerHeight = containerRef.current?.clientHeight || 300

    let width, height
    if (ratio >= 1) {
      width = Math.min(200, containerWidth - 40)
      height = width / ratio
    } else {
      height = Math.min(200, containerHeight - 40)
      width = height * ratio
    }

    setCropArea({
      x: (containerWidth - width) / 2,
      y: (containerHeight - height) / 2,
      width,
      height,
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={applyCrop}>
              <Check className="w-4 h-4 mr-1" />
              Apply Crop
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="relative bg-muted rounded-lg overflow-hidden" style={{ height: "400px" }}>
          <img
            ref={imageRef}
            src={imageSrc || "/placeholder.svg"}
            alt="Crop preview"
            className="w-full h-full object-contain"
            draggable={false}
          />

          {/* Crop overlay */}
          <div className="absolute inset-0 bg-black/50">
            <div
              className="absolute border-2 border-white cursor-move bg-transparent"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">Preset Ratios</h4>
        <div className="flex gap-2 flex-wrap">
          {presetCrops.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPresetCrop(preset.ratio)}
              className="gap-1"
            >
              <Square className="w-3 h-3" />
              {preset.name}
            </Button>
          ))}
        </div>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
