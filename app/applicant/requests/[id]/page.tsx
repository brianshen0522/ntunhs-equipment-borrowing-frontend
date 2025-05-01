"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import { getRequestDetails, closeRequest } from "@/lib/api/requests"
import type { RequestDetail } from "@/lib/types"

// Update the request detail page to use the toast helper functions

// First, add the import for toast helper functions
import { successToast, errorToast } from "@/lib/utils/toast-helper"

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  // const unwrappedParams = React.use(params)
  const requestId = params.id

  const router = useRouter()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  // Then update the toast calls in the component:

  // In the useEffect for fetchRequestDetails
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await getRequestDetails(requestId)

        if (response.success) {
          setRequest(response.data)
        } else {
          errorToast({
            title: "錯誤",
            description: "無法獲取申請詳情，請稍後再試",
          })
          router.push("/applicant/requests")
        }
      } catch (error) {
        console.error("Failed to fetch request details:", error)
        errorToast({
          title: "錯誤",
          description: "無法獲取申請詳情，請稍後再試",
        })
        router.push("/applicant/requests")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestDetails()
  }, [requestId, router, toast])

  // In the handleCloseRequest function
  const handleCloseRequest = async () => {
    console.log("Closing request:", requestId) // Debug log
    setIsClosing(true)
    try {
      const response = await closeRequest(requestId)
      console.log("Close request response:", response) // Debug log

      if (response.success) {
        successToast({
          title: "申請已關閉",
          description: "您的申請已成功關閉",
        })
        // Refresh the request details
        const updatedResponse = await getRequestDetails(requestId)
        if (updatedResponse.success) {
          setRequest(updatedResponse.data)
        }
      } else {
        errorToast({
          title: "關閉失敗",
          description: response.error?.message || "無法關閉申請，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to close request:", error)
      errorToast({
        title: "關閉失敗",
        description: "無法關閉申請，請稍後再試",
      })
    } finally {
      setIsClosing(false)
    }
  }

  // Rest of the component remains the same
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">待審核</span>
      case "pending_building_response":
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">待填表</span>
      case "pending_allocation":
        return <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">待分配</span>
      case "completed":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">已完成</span>
      case "rejected":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">已駁回</span>
      case "closed":
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">已關閉</span>
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{status}</span>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_review":
      case "pending_building_response":
      case "pending_allocation":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "rejected":
      case "closed":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-TW")
  }

  const canCloseRequest = request?.status === "pending_review"

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold">找不到申請</h2>
        <p className="mb-4 text-muted-foreground">無法找到指定的申請資料</p>
        <Button onClick={() => router.push("/applicant/requests")}>返回申請列表</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">申請詳情</h1>
        <Button variant="outline" onClick={() => router.push("/applicant/requests")}>
          返回列表
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <div className="flex items-center flex-shrink-0 mr-2">申請 #</div>
              <div className="truncate max-w-[200px] sm:max-w-[300px]">{request.requestId}</div>
              <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">{getStatusBadge(request.status)}</div>
            </CardTitle>
            <CardDescription>申請時間: {formatDateTime(request.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">借用日期</h3>
                <p>
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">使用場地</h3>
                <p>{request.venue}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">使用用途</h3>
              <p className="whitespace-pre-line">{request.purpose}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">借用器材</h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">器材名稱</th>
                      <th className="px-4 py-2 text-center">申請數量</th>
                      <th className="px-4 py-2 text-center">核准數量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map((item, index) => (
                      <tr key={item.itemId} className={index !== request.items.length - 1 ? "border-b" : ""}>
                        <td className="px-4 py-2">{item.equipmentName}</td>
                        <td className="px-4 py-2 text-center">{item.requestedQuantity}</td>
                        <td className="px-4 py-2 text-center">
                          {item.approvedQuantity !== null ? item.approvedQuantity : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {request.status === "completed" && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">分配詳情</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">器材名稱</th>
                        <th className="px-4 py-2 text-left">大樓</th>
                        <th className="px-4 py-2 text-center">數量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.items.flatMap((item) =>
                        item.allocations.map((allocation, allocIndex) => (
                          <tr key={`${item.itemId}-${allocIndex}`} className="border-b">
                            <td className="px-4 py-2">{item.equipmentName}</td>
                            <td className="px-4 py-2">{allocation.buildingName}</td>
                            <td className="px-4 py-2 text-center">{allocation.allocatedQuantity}</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          {/* 移除了這裡的關閉申請按鈕 */}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">申請狀態</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(request.status)}
                <div>
                  <p className="font-medium">
                    {request.status === "pending_review" && "待審核"}
                    {request.status === "pending_building_response" && "待填表"}
                    {request.status === "pending_allocation" && "待分配"}
                    {request.status === "completed" && "已完成"}
                    {request.status === "rejected" && "已駁回"}
                    {request.status === "closed" && "已關閉"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.status === "pending_review" && "等待總務處審核中"}
                    {request.status === "pending_building_response" && "等待大樓管理員回覆中"}
                    {request.status === "pending_allocation" && "等待總務處分配器材中"}
                    {request.status === "completed" && "申請已完成處理"}
                    {request.status === "rejected" && "申請已被駁回"}
                    {request.status === "closed" && "申請已被關閉"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {request.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">借用單</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <a href={`/api/requests/${request.requestId}/pdf`} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    查看借用單 PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {canCloseRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">申請操作</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={handleCloseRequest} disabled={isClosing}>
                  {isClosing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    "關閉申請"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">狀態歷程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex items-center justify-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                        {index === 0 ? (
                          <Clock className="h-4 w-4" />
                        ) : history.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : history.status === "rejected" || history.status === "closed" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < request.statusHistory.length - 1 && (
                        <div className="absolute bottom-0 left-1/2 top-8 w-px -translate-x-1/2 bg-border" />
                      )}
                    </div>
                    <div className="space-y-1 pb-8">
                      <p className="text-sm font-medium">
                        {history.status === "pending_review" && "待審核"}
                        {history.status === "pending_building_response" && "待填表"}
                        {history.status === "pending_allocation" && "待分配"}
                        {history.status === "completed" && "已完成"}
                        {history.status === "rejected" && "已駁回"}
                        {history.status === "closed" && "已關閉"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(history.timestamp)}</p>
                      {history.notes && <p className="mt-2 text-sm">{history.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
