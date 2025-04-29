import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export type MessageType = "success" | "error" | "info" | "warning"

interface MessageBoxProps {
  type: MessageType
  title?: string
  message: string
  className?: string
}

export function MessageBox({ type, title, message, className }: MessageBoxProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
  }

  const styles = {
    success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    warning:
      "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  }

  const iconStyles = {
    success: "text-green-500 dark:text-green-400",
    error: "text-red-500 dark:text-red-400",
    info: "text-blue-500 dark:text-blue-400",
    warning: "text-yellow-500 dark:text-yellow-400",
  }

  return (
    <div className={cn("flex items-start gap-3 rounded-md border p-4 text-sm w-full", styles[type], className)}>
      <div className={cn("mt-0.5 flex-shrink-0", iconStyles[type])}>{icons[type]}</div>
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        <p className="text-sm whitespace-pre-line">{message}</p>
      </div>
    </div>
  )
}
