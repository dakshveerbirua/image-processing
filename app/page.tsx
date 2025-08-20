"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, ZoomIn, ZoomOut, RotateCw, Maximize2, Download, Crop, Palette, Edit } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"
import { ImageFilters } from "@/components/image-filters"
import { ImageEditorTools } from "@/components/image-editor-tools"
import { ImageDownload } from "@/components/image-download"

export default function ImageEditor() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [filteredImage, setFilteredImage] = useState<string | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string } | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentImage = editedImage || filteredImage || croppedImage || uploadedImage

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        setCroppedImage(null) // Reset cropped image when new file is uploaded
        setFilteredImage(null) // Reset filtered image when new file is uploaded
        setEditedImage(null) // Reset edited image when new file is uploaded

        const img = new Image()
        img.onload = () => {
          setImageInfo({
            width: img.width,
            height: img.height,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleResetView = () => {
    setZoom(100)
    setRotation(0)
  }

  const handleCropComplete = (croppedImageSrc: string) => {
    setCroppedImage(croppedImageSrc)
    setFilteredImage(null) // Reset filters when cropping
    setEditedImage(null) // Reset edits when cropping
    setShowCropper(false)
    setZoom(100)
    setRotation(0)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
  }

  const startCropping = () => {
    setShowCropper(true)
  }

  const handleFiltersApply = (filteredImageSrc: string, filters: any) => {
    setFilteredImage(filteredImageSrc)
    setEditedImage(null) // Reset edits when applying filters
    setShowFilters(false)
    setZoom(100)
    setRotation(0)
  }

  const handleFiltersCancel = () => {
    setShowFilters(false)
  }

  const startFiltering = () => {
    setShowFilters(true)
  }

  const handleEditComplete = (editedImageSrc: string) => {
    setEditedImage(editedImageSrc)
    setShowEditor(false)
    setZoom(100)
    setRotation(0)
  }

  const handleEditCancel = () => {
    setShowEditor(false)
  }

  const startEditing = () => {
    setShowEditor(true)
  }

  const handleDownloadCancel = () => {
    setShowDownload(false)
  }

  const startDownload = () => {
    setShowDownload(true)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Image Editor Pro</h1>
          <p className="text-muted-foreground">Upload, edit, crop, filter, and download your images</p>
        </header>

        {!uploadedImage ? (
          <Card className="p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload your image</h3>
                  <p className="text-muted-foreground mb-4">Drag and drop an image here, or click to select</p>
                  <Button onClick={triggerFileInput} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Choose Image
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF, WebP (Max 10MB)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </Card>
        ) : showCropper ? (
          <ImageCropper
            imageSrc={editedImage || filteredImage || croppedImage || uploadedImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        ) : showFilters ? (
          <ImageFilters
            imageSrc={editedImage || croppedImage || uploadedImage}
            onFiltersApply={handleFiltersApply}
            onCancel={handleFiltersCancel}
          />
        ) : showEditor ? (
          <ImageEditorTools
            imageSrc={filteredImage || croppedImage || uploadedImage}
            onEditComplete={handleEditComplete}
            onCancel={handleEditCancel}
          />
        ) : showDownload ? (
          <ImageDownload imageSrc={currentImage} onCancel={handleDownloadCancel} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRotate}>
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetView}>
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative bg-muted rounded-lg overflow-hidden min-h-96 flex items-center justify-center">
                  <div className="overflow-auto max-h-96 w-full flex items-center justify-center">
                    <img
                      src={currentImage || "/placeholder.svg"}
                      alt="Uploaded image"
                      className="transition-transform duration-200 ease-in-out"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        maxWidth: "none",
                        height: "auto",
                      }}
                    />
                  </div>
                </div>
              </Card>

              {imageInfo && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Image Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <p className="font-medium">
                        {imageInfo.width} × {imageInfo.height}px
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <p className="font-medium">{imageInfo.size}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zoom:</span>
                      <p className="font-medium">{zoom}%</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={startCropping}>
                    <Crop className="w-4 h-4 mr-2" />
                    Crop Image
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={startFiltering}>
                    <Palette className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={startEditing}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Tools
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={startDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Upload New</h3>
                <Button onClick={() => setUploadedImage(null)} variant="secondary" className="w-full">
                  Choose Different Image
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
