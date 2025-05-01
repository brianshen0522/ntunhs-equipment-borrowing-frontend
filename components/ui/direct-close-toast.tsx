"use client"

import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface DirectCloseToastProps {
  id: string
}

export function DirectCloseToast({ id }: DirectCloseToastProps) {
  const { dismiss } = useToast()

  return (
    <button
      onClick={() => dismiss(id)}
      className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer z-[101]"
      aria-label="Close toast"
    >
      <X className="h-4 w-4" />
    </button>
  )
}
