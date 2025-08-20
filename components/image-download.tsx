"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, X, FileImage, Settings } from "lucide-react"

interface ImageDownloadProps {
  imageSrc: string
  onCancel: () => void
}

type ImageFormat = "png" | "jpeg" | "webp"

interface DownloadSettings {
  format: ImageFormat
  quality: number
  filename: string
  width?: number
  height?: number
  maintainAspectRatio: boolean
}

export function ImageDownload({ imageSrc, onCancel }: ImageDownloadProps) {
  const [settings, setSettings] = useState<DownloadSettings>({
    format: "png",
    quality: 90,
    filename: "edited-image",
    maintainAspectRatio: true,
  })
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [customDimensions, setCustomDimensions] = useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height })
      setCustomDimensions({ width: img.width, height: img.height })
    }
    img.src = imageSrc
  }, [imageSrc])

  const updateSetting = <K extends keyof DownloadSettings>(key: K, value: DownloadSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateWidth = (width: number) => {
    setCustomDimensions((prev) => {
      if (settings.maintainAspectRatio && originalDimensions.width > 0) {
        const aspectRatio = originalDimensions.height / originalDimensions.width
        return { width, height: Math.round(width * aspectRatio) }
      }
      return { ...prev, width }
    })
  }

  const updateHeight = (height: number) => {
    setCustomDimensions((prev) => {
      if (settings.maintainAspectRatio && originalDimensions.height > 0) {
        const aspectRatio = originalDimensions.width / originalDimensions.height
        return { height, width: Math.round(height * aspectRatio) }
      }
      return { ...prev, height }
    })
  }

  const downloadImage = async () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = customDimensions.width || originalDimensions.width
      canvas.height = customDimensions.height || originalDimensions.height

      // Draw image with new dimensions
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert to desired format
      let mimeType = "image/png"
      let quality = 1

      if (settings.format === "jpeg") {
        mimeType = "image/jpeg"
        quality = settings.quality / 100
      } else if (settings.format === "webp") {
        mimeType = "image/webp"
        quality = settings.quality / 100
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) return

          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${settings.filename}.${settings.format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        },
        mimeType,
        quality,
      )
    }
    img.src = imageSrc
  }

  const presetSizes = [
    { name: "Original", width: originalDimensions.width, height: originalDimensions.height },
    { name: "HD (1920×1080)", width: 1920, height: 1080 },
    { name: "Full HD (1920×1080)", width: 1920, height: 1080 },
    { name: "Instagram Square (1080×1080)", width: 1080, height: 1080 },
    { name: "Instagram Story (1080×1920)", width: 1080, height: 1920 },
    { name: "Facebook Cover (1200×630)", width: 1200, height: 630 },
    { name: "Twitter Header (1500×500)", width: 1500, height: 500 },
  ]

  const applyPresetSize = (width: number, height: number) => {
    setCustomDimensions({ width, height })
  }

  const getEstimatedFileSize = () => {
    const pixels = customDimensions.width * customDimensions.height
    let bytesPerPixel = 4 // PNG default

    if (settings.format === "jpeg") {
      bytesPerPixel = 3 * (settings.quality / 100)
    } else if (settings.format === "webp") {
      bytesPerPixel = 2 * (settings.quality / 100)
    }

    const estimatedBytes = pixels * bytesPerPixel
    const estimatedMB = estimatedBytes / (1024 * 1024)

    if (estimatedMB < 1) {
      return `~${(estimatedMB * 1024).toFixed(0)} KB`
    }
    return `~${estimatedMB.toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Image
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden mb-6" style={{ height: "200px" }}>
          <img src={imageSrc || "/placeholder.svg"} alt="Download preview" className="w-full h-full object-contain" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Format & Quality
          </h4>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">File Name</label>
              <Input
                value={settings.filename}
                onChange={(e) => updateSetting("filename", e.target.value)}
                placeholder="Enter filename..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={settings.format} onValueChange={(value: ImageFormat) => updateSetting("format", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Lossless)</SelectItem>
                  <SelectItem value="jpeg">JPEG (Compressed)</SelectItem>
                  <SelectItem value="webp">WebP (Modern)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(settings.format === "jpeg" || settings.format === "webp") && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">{settings.quality}%</span>
                </div>
                <Slider
                  value={[settings.quality]}
                  onValueChange={(value) => updateSetting("quality", value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Estimated file size: {getEstimatedFileSize()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Dimensions
          </h4>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Original: {originalDimensions.width} × {originalDimensions.height}px
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Width</label>
                <Input
                  type="number"
                  value={customDimensions.width}
                  onChange={(e) => updateWidth(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Height</label>
                <Input
                  type="number"
                  value={customDimensions.height}
                  onChange={(e) => updateHeight(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aspectRatio"
                checked={settings.maintainAspectRatio}
                onChange={(e) => updateSetting("maintainAspectRatio", e.target.checked)}
                className="rounded"
              />
              <label htmlFor="aspectRatio" className="text-sm">
                Maintain aspect ratio
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preset Sizes</label>
              <div className="space-y-1">
                {presetSizes.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs bg-transparent"
                    onClick={() => applyPresetSize(preset.width, preset.height)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
