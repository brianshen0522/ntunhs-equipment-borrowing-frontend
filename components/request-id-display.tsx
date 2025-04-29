"use client"
import { ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface RequestIdDisplayProps {
  requestId: string
  showCopyButton?: boolean
  maxWidth?: string
  className?: string
}

export function RequestIdDisplay({
  requestId,
  showCopyButton = false,
  maxWidth = "max-w-[150px] sm:max-w-[200px]",
  className = "",
}: RequestIdDisplayProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(requestId).then(
      () => {
        toast({
          title: "已複製",
          description: "申請 ID 已複製到剪貼簿",
        })
      },
      (err) => {
        console.error("無法複製: ", err)
        toast({
          title: "複製失敗",
          description: "無法複製申請 ID",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="font-medium flex-shrink-0">申請 #</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`truncate ${maxWidth}`}>{requestId}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{requestId}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full"
          onClick={copyToClipboard}
          title="複製申請 ID"
        >
          <ClipboardCopy className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
