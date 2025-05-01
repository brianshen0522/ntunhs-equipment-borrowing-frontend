"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Caught error:", event.error)
      setHasError(true)
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-4 dark:text-white">發生錯誤</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            應用程式發生錯誤，請重新整理頁面或聯絡系統管理員。
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>重新整理頁面</Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
