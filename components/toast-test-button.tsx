"use client"

import { Button } from "@/components/ui/button"
import { successToast, errorToast, warningToast, infoToast } from "@/lib/utils/toast-helper"

export function ToastTestButton() {
  const handleSuccessClick = () => {
    successToast({
      title: "Success Toast",
      description: "This is a success toast notification. Click the X to close or swipe right.",
    })
  }

  const handleErrorClick = () => {
    errorToast({
      title: "Error Toast",
      description: "This is an error toast notification. Click the X to close or swipe right.",
    })
  }

  const handleWarningClick = () => {
    warningToast({
      title: "Warning Toast",
      description: "This is a warning toast notification. Click the X to close or swipe right.",
    })
  }

  const handleInfoClick = () => {
    infoToast({
      title: "Info Toast",
      description: "This is an info toast notification. Click the X to close or swipe right.",
    })
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button onClick={handleSuccessClick} className="bg-green-500 hover:bg-green-600">
        Show Success Toast
      </Button>
      <Button onClick={handleErrorClick} className="bg-red-500 hover:bg-red-600">
        Show Error Toast
      </Button>
      <Button onClick={handleWarningClick} className="bg-yellow-500 hover:bg-yellow-600 text-black">
        Show Warning Toast
      </Button>
      <Button onClick={handleInfoClick} className="bg-blue-500 hover:bg-blue-600">
        Show Info Toast
      </Button>
    </div>
  )
}
