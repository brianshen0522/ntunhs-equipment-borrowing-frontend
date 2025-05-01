"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { successToast, errorToast, warningToast, infoToast } from "@/lib/utils/toast-helper"

export function ToastDemo() {
  const showSuccessToast = () => {
    successToast({
      title: "Success!",
      description: "Your action was completed successfully.",
      duration: 5000,
    })
  }

  const showErrorToast = () => {
    errorToast({
      title: "Error!",
      description: "There was a problem with your request.",
      duration: 5000,
    })
  }

  const showWarningToast = () => {
    warningToast({
      title: "Warning!",
      description: "This action might have consequences.",
      duration: 5000,
    })
  }

  const showInfoToast = () => {
    infoToast({
      title: "Information",
      description: "Here's something you should know.",
      duration: 5000,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast Notifications</CardTitle>
        <CardDescription>Click the buttons below to see different toast types</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button onClick={showSuccessToast} className="bg-green-500 hover:bg-green-600">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} className="bg-red-500 hover:bg-red-600">
          Error Toast
        </Button>
        <Button onClick={showWarningToast} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          Warning Toast
        </Button>
        <Button onClick={showInfoToast} className="bg-blue-500 hover:bg-blue-600">
          Info Toast
        </Button>
      </CardContent>
    </Card>
  )
}
