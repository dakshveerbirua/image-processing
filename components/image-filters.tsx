"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Check, X, RotateCcw, Palette } from "lucide-react"

interface ImageFiltersProps {
  imageSrc: string
  onFiltersApply: (filteredImageSrc: string, filters: FilterValues) => void
  onCancel: () => void
}

interface FilterValues {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  hueRotate: number
  sepia: number
  grayscale: number
  invert: number
}

const defaultFilters: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
}

const presetFilters = [
  { name: "Original", filters: defaultFilters },
  { name: "Vintage", filters: { ...defaultFilters, sepia: 30, contrast: 110, brightness: 110 } },
  { name: "B&W", filters: { ...defaultFilters, grayscale: 100, contrast: 110 } },
  { name: "Warm", filters: { ...defaultFilters, hueRotate: 15, saturation: 120, brightness: 105 } },
  { name: "Cool", filters: { ...defaultFilters, hueRotate: 180, saturation: 110, brightness: 95 } },
  { name: "High Contrast", filters: { ...defaultFilters, contrast: 150, brightness: 105 } },
  { name: "Soft", filters: { ...defaultFilters, blur: 1, brightness: 110, contrast: 90 } },
  { name: "Dramatic", filters: { ...defaultFilters, contrast: 140, saturation: 130, brightness: 90 } },
]

export function ImageFilters({ imageSrc, onFiltersApply, onCancel }: ImageFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)

  const updateFilter = (key: keyof FilterValues, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyPreset = (presetFilters: FilterValues) => {
    setFilters(presetFilters)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const generateFilterString = (filterValues: FilterValues) => {
    return `brightness(${filterValues.brightness}%) contrast(${filterValues.contrast}%) saturate(${filterValues.saturation}%) blur(${filterValues.blur}px) hue-rotate(${filterValues.hueRotate}deg) sepia(${filterValues.sepia}%) grayscale(${filterValues.grayscale}%) invert(${filterValues.invert}%)`
  }

  const applyFilters = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (ctx) {
        // Apply filters using canvas context
        ctx.filter = generateFilterString(filters)
        ctx.drawImage(img, 0, 0)

        const filteredImageSrc = canvas.toDataURL("image/png")
        onFiltersApply(filteredImageSrc, filters)
      }
    }

    img.src = imageSrc
  }

  const filterStyle = {
    filter: generateFilterString(filters),
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Apply Filters
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={applyFilters}>
              <Check className="w-4 h-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden mb-6" style={{ height: "300px" }}>
          <img
            src={imageSrc || "/placeholder.svg"}
            alt="Filter preview"
            className="w-full h-full object-contain transition-all duration-200"
            style={filterStyle}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Filter Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {presetFilters.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.filters)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-4">Manual Adjustments</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Brightness</label>
                <span className="text-sm text-muted-foreground">{filters.brightness}%</span>
              </div>
              <Slider
                value={[filters.brightness]}
                onValueChange={(value) => updateFilter("brightness", value[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Contrast</label>
                <span className="text-sm text-muted-foreground">{filters.contrast}%</span>
              </div>
              <Slider
                value={[filters.contrast]}
                onValueChange={(value) => updateFilter("contrast", value[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Saturation</label>
                <span className="text-sm text-muted-foreground">{filters.saturation}%</span>
              </div>
              <Slider
                value={[filters.saturation]}
                onValueChange={(value) => updateFilter("saturation", value[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Blur</label>
                <span className="text-sm text-muted-foreground">{filters.blur}px</span>
              </div>
              <Slider
                value={[filters.blur]}
                onValueChange={(value) => updateFilter("blur", value[0])}
                min={0}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Hue Rotate</label>
                <span className="text-sm text-muted-foreground">{filters.hueRotate}°</span>
              </div>
              <Slider
                value={[filters.hueRotate]}
                onValueChange={(value) => updateFilter("hueRotate", value[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Sepia</label>
                <span className="text-sm text-muted-foreground">{filters.sepia}%</span>
              </div>
              <Slider
                value={[filters.sepia]}
                onValueChange={(value) => updateFilter("sepia", value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Grayscale</label>
                <span className="text-sm text-muted-foreground">{filters.grayscale}%</span>
              </div>
              <Slider
                value={[filters.grayscale]}
                onValueChange={(value) => updateFilter("grayscale", value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Invert</label>
                <span className="text-sm text-muted-foreground">{filters.invert}%</span>
              </div>
              <Slider
                value={[filters.invert]}
                onValueChange={(value) => updateFilter("invert", value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
