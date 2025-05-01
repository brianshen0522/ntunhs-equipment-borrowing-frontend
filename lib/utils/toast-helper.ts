import type React from "react"
import { toast } from "@/components/ui/use-toast"

type ToastOptions = {
  title?: string
  description?: string
  duration?: number
  action?: React.ReactNode
}

export const successToast = (options: ToastOptions) => {
  return toast({
    variant: "success",
    ...options,
  })
}

export const errorToast = (options: ToastOptions) => {
  return toast({
    variant: "error",
    ...options,
  })
}

export const warningToast = (options: ToastOptions) => {
  return toast({
    variant: "warning",
    ...options,
  })
}

export const infoToast = (options: ToastOptions) => {
  return toast({
    variant: "info",
    ...options,
  })
}

// Export a default object for easier imports
const toastHelper = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  info: infoToast,
}

export default toastHelper
