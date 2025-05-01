import { ToastTestButton } from "@/components/toast-test-button"

export default function ToastTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Toast Notification Test</h1>
      <p className="text-center mb-8">
        Click the buttons below to test different types of toast notifications.
        <br />
        You can close them by clicking the X button or swiping right.
      </p>
      <ToastTestButton />
    </div>
  )
}
