"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { DirectCloseToast } from "@/components/ui/direct-close-toast"

export function Toaster() {
  const { toasts, pauseToast, resumeToast } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        // Create handlers for mouse enter/leave
        const handleMouseEnter = () => pauseToast(id)
        const handleMouseLeave = () => resumeToast(id)

        return (
          <Toast key={id} {...props} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="flex items-start gap-2">
              <ToastIcon variant={props.variant} />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
            <DirectCloseToast id={id} />
            {props.duration !== Number.POSITIVE_INFINITY && (
              <div className="absolute bottom-0 left-0 right-0 h-1 !bg-gray-200 dark:!bg-gray-700">
                <div
                  className={`h-full transition-all duration-100 ease-linear ${
                    props.variant === "success"
                      ? "!bg-green-500"
                      : props.variant === "error"
                        ? "!bg-red-500"
                        : props.variant === "warning"
                          ? "!bg-yellow-500"
                          : props.variant === "info"
                            ? "!bg-blue-500"
                            : "!bg-gray-500"
                  }`}
                  style={{
                    width: `${props.progress ?? 100}%`,
                  }}
                />
              </div>
            )}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
