interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      case "pending_building_response":
        return "bg-blue-100 text-blue-800"
      case "pending_allocation":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_review":
        return "待審核"
      case "pending_building_response":
        return "待填表"
      case "pending_allocation":
        return "待分配"
      case "completed":
        return "已完成"
      case "rejected":
        return "已駁回"
      case "closed":
        return "已關閉"
      default:
        return status
    }
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs whitespace-nowrap ${getBadgeStyles(status)} ${className}`}
    >
      {getStatusText(status)}
    </span>
  )
}
