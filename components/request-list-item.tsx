import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardList } from "lucide-react"
import { RequestIdDisplay } from "./request-id-display"
import { StatusBadge } from "./status-badge"

interface RequestListItemProps {
  requestId: string
  status: string
  username?: string
  startDate: string
  endDate: string
  venue: string
  createdAt: string
  detailsUrl: string
}

export function RequestListItem({
  requestId,
  status,
  username,
  startDate,
  endDate,
  venue,
  createdAt,
  detailsUrl,
}: RequestListItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  return (
    <div className="flex flex-wrap items-center justify-between rounded-lg border p-4 gap-2">
      <div className="space-y-1 flex-grow min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <RequestIdDisplay requestId={requestId} showCopyButton />
          <div className="ml-auto flex-shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>
        {username && <div className="text-sm text-muted-foreground">申請人: {username}</div>}
        <div className="text-sm text-muted-foreground">
          借用日期: {formatDate(startDate)} - {formatDate(endDate)}
        </div>
        <div className="text-sm text-muted-foreground">使用場地: {venue}</div>
        <div className="text-sm text-muted-foreground">申請時間: {new Date(createdAt).toLocaleString("zh-TW")}</div>
      </div>
      <Button asChild variant="outline" size="sm" className="flex-shrink-0">
        <Link href={detailsUrl}>查看詳情</Link>
      </Button>
    </div>
  )
}
