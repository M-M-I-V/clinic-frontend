"use client"

import { useState } from "react"

type ToothCode = string
type ToothValue = "C" | "X" | "V" | ""

interface DentalChartProps {
  value?: Record<ToothCode, ToothValue>
  onChange?: (data: Record<ToothCode, ToothValue>) => void
}

const UPPER_TEETH = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"]

const LOWER_TEETH = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"]

const options: ToothValue[] = ["C", "X", "V"]

export default function DentalChart({ value = {}, onChange }: DentalChartProps) {
  const [chart, setChart] = useState<Record<ToothCode, ToothValue>>(value)

  const handleSet = (tooth: ToothCode, val: ToothValue) => {
    const newChart = {
      ...chart,
      [tooth]: chart[tooth] === val ? "" : val,
    }
    setChart(newChart)
    onChange?.(newChart)
  }

  const renderRow = (teeth: string[]) => (
    <div className="flex gap-1">
      {teeth.map((t) => (
        <div
          key={t}
          className="border border-gray-400 w-12 h-12 flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-gray-100 rounded"
        >
          <div className="font-medium text-xs">{t}</div>
          <div className="flex gap-0.5 mt-1">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => handleSet(t, o)}
                className={`w-3 h-3 rounded-full text-[8px] flex items-center justify-center transition-colors ${
                  chart[t] === o
                    ? o === "C"
                      ? "bg-red-500 text-white"
                      : o === "X"
                        ? "bg-gray-700 text-white"
                        : "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                title={`${o}: ${o === "C" ? "Caries" : o === "X" ? "Extraction" : "No Caries"}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="inline-block p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="font-semibold mb-3 text-center text-sm">Dental Chart (FDI Numbering)</h3>

      <div className="flex flex-col items-center gap-2">
        <div>
          <p className="text-xs text-gray-600 mb-1 text-center font-medium">Upper Teeth</p>
          {renderRow(UPPER_TEETH)}
        </div>
        <div className="border-t border-gray-300 w-full my-2" />
        <div>
          <p className="text-xs text-gray-600 mb-1 text-center font-medium">Lower Teeth</p>
          {renderRow(LOWER_TEETH)}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <p className="font-semibold mb-1">Legend:</p>
        <div className="space-y-1">
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" /> C - Caries
          </p>
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-700" /> X - Extraction
          </p>
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" /> V - No Caries
          </p>
        </div>
      </div>
    </div>
  )
}