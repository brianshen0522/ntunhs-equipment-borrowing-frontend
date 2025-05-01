"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, AlertTriangle, Clock, CheckCircle, XCircle, Send, ClipboardCopy } from "lucide-react"
import {
  getRequestDetails,
  approveInquiry,
  getBuildingResponses,
  allocateEquipment,
  resendEmail,
} from "@/lib/api/requests"
import type { RequestDetail, BuildingResponse, TotalAvailable } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/config"
// Update the academic staff request detail page to use the toast helper functions

// First, add the import for toast helper functions
import { successToast, errorToast, warningToast } from "@/lib/utils/toast-helper"

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const requestId = params.id

  const router = useRouter()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [buildingResponses, setBuildingResponses] = useState<BuildingResponse[]>([])
  const [totalAvailable, setTotalAvailable] = useState<TotalAvailable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingResponses, setIsLoadingResponses] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isAllocating, setIsAllocating] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [allocations, setAllocations] = useState<
    Array<{
      itemId: string
      approvedQuantity: number
      buildingAllocations: Array<{
        buildingId: string
        allocatedQuantity: number
      }>
    }>
  >([])
  const [allocationNotes, setAllocationNotes] = useState("")
  const [inquiryFormLink, setInquiryFormLink] = useState<string | null>(null)

  // In the useEffect for fetchRequestDetails
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await getRequestDetails(requestId)

        if (response.success) {
          setRequest(response.data)

          // Generate inquiry form link if the request is in pending_building_response or pending_allocation status
          if (
            (response.data.status === "pending_building_response" || response.data.status === "pending_allocation") &&
            response.data.responseTokens?.length > 0
          ) {
            const baseUrl = window.location.origin
            // Use the token from the first response token in the array
            const token = response.data.responseTokens[0].token
            const formLink = `${baseUrl}/building-manager/respond-token/${token}`
            setInquiryFormLink(formLink)
          } else {
            setInquiryFormLink(null)
          }

          // If the request is in pending_allocation status, fetch building responses
          if (response.data.status === "pending_allocation") {
            fetchBuildingResponses()
          }
        } else {
          errorToast({
            title: "錯誤",
            description: "無法獲取申請詳情，請稍後再試",
          })
          router.push("/academic-staff/requests")
        }
      } catch (error) {
        console.error("Failed to fetch request details:", error)
        errorToast({
          title: "錯誤",
          description: "無法獲取申請詳情，請稍後再試",
        })
        router.push("/academic-staff/requests")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestDetails()
  }, [requestId, router, toast])

  // In the fetchBuildingResponses function
  const fetchBuildingResponses = async () => {
    setIsLoadingResponses(true)
    try {
      const response = await getBuildingResponses(requestId)

      if (response.success) {
        setBuildingResponses(response.data.responses)
        setTotalAvailable(response.data.totalAvailable)

        // Initialize allocations based on total available
        const initialAllocations = response.data.totalAvailable.map((item) => ({
          itemId: item.itemId,
          approvedQuantity: Math.min(item.requestedQuantity, item.totalAvailableQuantity),
          buildingAllocations: response.data.responses
            .filter((resp) =>
              resp.items.some((respItem) => respItem.itemId === item.itemId && respItem.availableQuantity > 0),
            )
            .map((resp) => {
              const respItem = resp.items.find((i) => i.itemId === item.itemId)
              return {
                buildingId: resp.buildingId,
                allocatedQuantity: respItem ? respItem.availableQuantity : 0,
              }
            }),
        }))

        setAllocations(initialAllocations)
      } else {
        errorToast({
          title: "錯誤",
          description: "無法獲取大樓回覆資料，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to fetch building responses:", error)
      errorToast({
        title: "錯誤",
        description: "無法獲取大樓回覆資料，請稍後再試",
      })
    } finally {
      setIsLoadingResponses(false)
    }
  }

  // In the handleApproveInquiry function
  const handleApproveInquiry = async () => {
    setIsApproving(true)
    try {
      const response = await approveInquiry(requestId)

      if (response.success) {
        successToast({
          title: "已同意詢問",
          description: "已成功發送詢問給大樓管理員",
        })

        // Fetch the updated request details to get the latest data including response tokens
        const updatedRequestResponse = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        const updatedRequestData = await updatedRequestResponse.json()

        if (updatedRequestData.success) {
          // Update the request state with the new data
          setRequest(updatedRequestData.data)

          // Set the inquiry form link based on the updated data
          if (updatedRequestData.data.responseTokens?.length > 0) {
            const baseUrl = window.location.origin
            const token = updatedRequestData.data.responseTokens[0].token
            const formLink = `${baseUrl}/building-manager/respond-token/${token}`
            setInquiryFormLink(formLink)
          }
        }
      } else {
        errorToast({
          title: "操作失敗",
          description: response.error?.message || "無法完成操作，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to approve inquiry:", error)
      errorToast({
        title: "操作失敗",
        description: "無法完成操作，請稍後再試",
      })
    } finally {
      setIsApproving(false)
    }
  }

  // In the copyLinkToClipboard function
  const copyLinkToClipboard = () => {
    if (inquiryFormLink) {
      navigator.clipboard.writeText(inquiryFormLink).then(
        () => {
          successToast({
            title: "已複製連結",
            description: "詢問表單連結已複製到剪貼簿",
          })
        },
        (err) => {
          console.error("Could not copy text: ", err)
          errorToast({
            title: "複製失敗",
            description: "無法複製連結，請手動選取並複製",
          })
        },
      )
    }
  }

  // In the handleRejectRequest function
  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      warningToast({
        title: "請輸入駁回原因",
        description: "請提供駁回申請的原因",
      })
      return
    }

    setIsRejecting(true)
    try {
      // Direct API call to ensure proper request format
      const token = localStorage.getItem("token")
      if (!token) {
        errorToast({
          title: "未登入",
          description: "請重新登入後再試",
        })
        setIsRejecting(false)
        return
      }

      // Use the correct API URL directly
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      })

      const data = await response.json()

      if (data.success) {
        successToast({
          title: "已駁回申請",
          description: "申請已成功駁回",
        })

        // Refresh the request details
        const updatedResponse = await getRequestDetails(requestId)
        if (updatedResponse.success) {
          setRequest(updatedResponse.data)
        }
      } else {
        errorToast({
          title: "操作失敗",
          description: data.error?.message || "無法完成操作，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to reject request:", error)
      errorToast({
        title: "操作失敗",
        description: "無法完成操作，請稍後再試",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  // In the handleAllocateEquipment function
  const handleAllocateEquipment = async () => {
    // Validate allocations
    for (const allocation of allocations) {
      const totalAllocated = allocation.buildingAllocations.reduce((sum, ba) => sum + ba.allocatedQuantity, 0)
      if (totalAllocated !== allocation.approvedQuantity) {
        warningToast({
          title: "分配數量錯誤",
          description: `${request?.items.find((i) => i.itemId === allocation.itemId)?.equipmentName} 的分配總數必須等於核准數量`,
        })
        return
      }
    }

    setIsAllocating(true)
    try {
      const response = await allocateEquipment(requestId, allocations, allocationNotes || undefined)

      if (response.success) {
        successToast({
          title: "分配成功",
          description: "器材已成功分配，並已發送借用單給申請人",
        })

        // Refresh the request details
        const updatedResponse = await getRequestDetails(requestId)
        if (updatedResponse.success) {
          setRequest(updatedResponse.data)
        }
      } else {
        errorToast({
          title: "操作失敗",
          description: response.error?.message || "無法完成操作，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to allocate equipment:", error)
      errorToast({
        title: "操作失敗",
        description: "無法完成操作，請稍後再試",
      })
    } finally {
      setIsAllocating(false)
    }
  }

  // In the handleResendEmail function
  const handleResendEmail = async () => {
    setIsResendingEmail(true)
    try {
      const response = await resendEmail(requestId)

      if (response.success) {
        successToast({
          title: "郵件已重新發送",
          description: `已成功重新發送借用單至 ${response.data.sentTo}`,
        })
      } else {
        errorToast({
          title: "操作失敗",
          description: response.error?.message || "無法完成操作，請稍後再試",
        })
      }
    } catch (error) {
      console.error("Failed to resend email:", error)
      errorToast({
        title: "操作失敗",
        description: "無法完成操作，請稍後再試",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleApprovedQuantityChange = (itemId: string, value: number) => {
    setAllocations((prev) =>
      prev.map((alloc) => {
        if (alloc.itemId === itemId) {
          return {
            ...alloc,
            approvedQuantity: value,
            // Reset building allocations when approved quantity changes
            buildingAllocations: alloc.buildingAllocations.map((ba) => ({
              ...ba,
              allocatedQuantity: 0,
            })),
          }
        }
        return alloc
      }),
    )
  }

  const handleBuildingAllocationChange = (itemId: string, buildingId: string, value: number) => {
    setAllocations((prev) =>
      prev.map((alloc) => {
        if (alloc.itemId === itemId) {
          return {
            ...alloc,
            buildingAllocations: alloc.buildingAllocations.map((ba) => {
              if (ba.buildingId === buildingId) {
                return {
                  ...ba,
                  allocatedQuantity: value,
                }
              }
              return ba
            }),
          }
        }
        return alloc
      }),
    )
  }

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
        <Button onClick={() => router.push("/academic-staff/requests")}>返回申請列表</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">申請詳情</h1>
        <Button variant="outline" onClick={() => router.push("/academic-staff/requests")}>
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
            <CardDescription>
              申請人: {request.username} | 申請時間: {formatDateTime(request.createdAt)}
            </CardDescription>
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
          {request.status === "pending_review" && (
            <CardFooter className="flex justify-between">
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="rejectReason">駁回原因</Label>
                  <Textarea
                    id="rejectReason"
                    placeholder="請輸入駁回原因..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="destructive" onClick={handleRejectRequest} disabled={isRejecting}>
                    {isRejecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      "駁回申請"
                    )}
                  </Button>
                  <Button onClick={handleApproveInquiry} disabled={isApproving}>
                    {isApproving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      "同意詢問"
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}

          {/* Show inquiry form link if status is pending_building_response or pending_allocation */}
          {(request.status === "pending_building_response" || request.status === "pending_allocation") &&
            inquiryFormLink && (
              <CardFooter className="flex flex-col items-start space-y-2 border-t pt-4">
                <p className="text-sm font-medium">詢問表單連結：</p>
                <div className="flex w-full items-center gap-2">
                  <Input value={inquiryFormLink} readOnly className="flex-1 bg-muted" />
                  <Button variant="outline" size="icon" onClick={copyLinkToClipboard} title="複製連結">
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">請將此連結分享給大樓管理員，以便他們填寫器材可用數量。</p>
              </CardFooter>
            )}
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
                    {request.status === "pending_review" && "等待審核中"}
                    {request.status === "pending_building_response" && "等待大樓管理員回覆中"}
                    {request.status === "pending_allocation" && "等待分配器材中"}
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
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <a href={`/api/requests/${requestId}/pdf`} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    查看借用單 PDF
                  </a>
                </Button>
                <Button className="w-full" variant="outline" onClick={handleResendEmail} disabled={isResendingEmail}>
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      重新發送借用單郵件
                    </>
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
                      <p className="text-xs text-muted-foreground">操作者: {history.operatorName}</p>
                      {history.notes && <p className="mt-2 text-sm">{history.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {request.status === "pending_allocation" && (
        <Card>
          <CardHeader>
            <CardTitle>分配器材</CardTitle>
            <CardDescription>根據大樓管理員回覆分配器材</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="responses">
              <TabsList className="mb-4">
                <TabsTrigger value="responses">大樓回覆</TabsTrigger>
                <TabsTrigger value="allocation">器材分配</TabsTrigger>
              </TabsList>
              <TabsContent value="responses">
                {isLoadingResponses ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : buildingResponses.length > 0 ? (
                  <div className="space-y-6">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">器材名稱</th>
                            <th className="px-4 py-2 text-center">申請數量</th>
                            <th className="px-4 py-2 text-center">可用總數</th>
                            <th className="px-4 py-2 text-center">狀態</th>
                          </tr>
                        </thead>
                        <tbody>
                          {totalAvailable.map((item, index) => (
                            <tr key={item.itemId} className={index !== totalAvailable.length - 1 ? "border-b" : ""}>
                              <td className="px-4 py-2">{item.equipmentName}</td>
                              <td className="px-4 py-2 text-center">{item.requestedQuantity}</td>
                              <td className="px-4 py-2 text-center">{item.totalAvailableQuantity}</td>
                              <td className="px-4 py-2 text-center">
                                {item.totalAvailableQuantity >= item.requestedQuantity ? (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                    數量足夠
                                  </span>
                                ) : item.totalAvailableQuantity > 0 ? (
                                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                    數量不足
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                                    無可用數量
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-medium">大樓回覆詳情</h3>
                    <div className="space-y-4">
                      {buildingResponses.map((response) => (
                        <Card key={response.responseId}>
                          <CardHeader>
                            <CardTitle className="text-base">{response.buildingName}</CardTitle>
                            <CardDescription>回覆時間: {formatDateTime(response.submittedAt)}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md border">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="px-4 py-2 text-left">器材名稱</th>
                                    <th className="px-4 py-2 text-center">可提供數量</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {response.items.map((item, index) => (
                                    <tr
                                      key={item.itemId}
                                      className={index !== response.items.length - 1 ? "border-b" : ""}
                                    >
                                      <td className="px-4 py-2">{item.equipmentName}</td>
                                      <td className="px-4 py-2 text-center">{item.availableQuantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">尚未收到回覆</h3>
                    <p className="text-sm text-muted-foreground">目前尚未收到任何大樓管理員的回覆</p>
                    <Button className="mt-4" onClick={fetchBuildingResponses}>
                      重新檢查
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="allocation">
                {buildingResponses.length > 0 ? (
                  <div className="space-y-6">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">器材名稱</th>
                            <th className="px-4 py-2 text-center">申請數量</th>
                            <th className="px-4 py-2 text-center">可用總數</th>
                            <th className="px-4 py-2 text-center">核准數量</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.map((allocation, index) => {
                            const item = totalAvailable.find((i) => i.itemId === allocation.itemId)
                            if (!item) return null
                            return (
                              <tr
                                key={allocation.itemId}
                                className={index !== allocations.length - 1 ? "border-b" : ""}
                              >
                                <td className="px-4 py-2">{item.equipmentName}</td>
                                <td className="px-4 py-2 text-center">{item.requestedQuantity}</td>
                                <td className="px-4 py-2 text-center">{item.totalAvailableQuantity}</td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={item.totalAvailableQuantity}
                                    value={allocation.approvedQuantity}
                                    onChange={(e) =>
                                      handleApprovedQuantityChange(
                                        allocation.itemId,
                                        Math.min(
                                          Math.max(0, Number.parseInt(e.target.value) || 0),
                                          item.totalAvailableQuantity,
                                        ),
                                      )
                                    }
                                    className="w-20 rounded-md border px-2 py-1 text-center"
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-medium">大樓分配詳情</h3>

                    {/* Transposed table layout - Buildings as rows, Items as columns */}
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left">大樓</th>
                            {allocations
                              .map((allocation) => {
                                const item = totalAvailable.find((i) => i.itemId === allocation.itemId)
                                if (!item || allocation.approvedQuantity === 0) return null
                                return (
                                  <th key={allocation.itemId} className="px-4 py-3 text-center">
                                    {item.equipmentName}
                                    <div className="text-xs font-normal text-muted-foreground mt-1">
                                      核准: {allocation.approvedQuantity}
                                    </div>
                                  </th>
                                )
                              })
                              .filter(Boolean)}
                            <th className="px-4 py-3 text-center">狀態</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buildingResponses.map((building) => (
                            <tr key={building.buildingId} className="border-b">
                              <td className="px-4 py-3 font-medium">{building.buildingName}</td>

                              {allocations
                                .map((allocation) => {
                                  const item = totalAvailable.find((i) => i.itemId === allocation.itemId)
                                  if (!item || allocation.approvedQuantity === 0) return null

                                  const buildingAllocation = allocation.buildingAllocations.find(
                                    (ba) => ba.buildingId === building.buildingId,
                                  )
                                  const buildingItem = building.items.find((i) => i.itemId === allocation.itemId)
                                  const maxAvailable = buildingItem ? buildingItem.availableQuantity : 0

                                  return (
                                    <td key={allocation.itemId} className="px-4 py-3 text-center">
                                      <div className="flex flex-col items-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max={maxAvailable}
                                          value={buildingAllocation ? buildingAllocation.allocatedQuantity : 0}
                                          onChange={(e) =>
                                            handleBuildingAllocationChange(
                                              allocation.itemId,
                                              building.buildingId,
                                              Math.min(Math.max(0, Number.parseInt(e.target.value) || 0), maxAvailable),
                                            )
                                          }
                                          className="w-16 rounded-md border px-2 py-1 text-center"
                                        />
                                        <span className="mt-1 text-xs text-muted-foreground">可用: {maxAvailable}</span>
                                      </div>
                                    </td>
                                  )
                                })
                                .filter(Boolean)}

                              <td className="px-4 py-3 text-center">
                                {(() => {
                                  const buildingStatus = allocations
                                    .filter((alloc) => {
                                      const item = totalAvailable.find((i) => i.itemId === alloc.itemId)
                                      return item && alloc.approvedQuantity > 0
                                    })
                                    .map((alloc) => {
                                      const ba = alloc.buildingAllocations.find(
                                        (ba) => ba.buildingId === building.buildingId,
                                      )
                                      return ba ? ba.allocatedQuantity : 0
                                    })
                                    .reduce((sum, qty) => sum + qty, 0)

                                  return buildingStatus > 0 ? (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                      已分配 {buildingStatus} 件
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                      未分配
                                    </span>
                                  )
                                })()}
                              </td>
                            </tr>
                          ))}

                          {/* Summary row showing total allocations for each item */}
                          <tr className="border-t-2 border-primary/20 bg-muted/20">
                            <td className="px-4 py-3 font-medium">已分配總數</td>

                            {allocations
                              .map((allocation) => {
                                const item = totalAvailable.find((i) => i.itemId === allocation.itemId)
                                if (!item || allocation.approvedQuantity === 0) return null

                                const totalAllocated = allocation.buildingAllocations.reduce(
                                  (sum, ba) => sum + ba.allocatedQuantity,
                                  0,
                                )

                                const isCorrect = totalAllocated === allocation.approvedQuantity

                                return (
                                  <td key={allocation.itemId} className="px-4 py-3 text-center">
                                    <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                      {totalAllocated} / {allocation.approvedQuantity}
                                    </span>
                                  </td>
                                )
                              })
                              .filter(Boolean)}

                            <td className="px-4 py-3"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">備註說明</h3>
                      <Textarea
                        placeholder="請輸入備註說明（選填）..."
                        value={allocationNotes}
                        onChange={(e) => setAllocationNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleAllocateEquipment} disabled={isAllocating}>
                        {isAllocating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            處理中...
                          </>
                        ) : (
                          "完成分配並生成借用單"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="mb-2 h-10 w-10 text-yellow-500" />
                    <h3 className="mb-1 text-lg font-medium">尚未收到回覆</h3>
                    <p className="text-sm text-muted-foreground">
                      需要先收到大樓管理員的回覆才能進行分配，請先切換到「大樓回覆」標籤檢查回覆狀態
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
