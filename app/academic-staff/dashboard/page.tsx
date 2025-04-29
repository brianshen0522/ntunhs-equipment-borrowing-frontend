"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Clock, CheckCircle, Building2, Package, XCircle } from "lucide-react"
import { getRequestsList } from "@/lib/api/requests"
import type { RequestSummary } from "@/lib/types"

export default function AcademicStaffDashboard() {
  const { toast } = useToast()
  const [pendingReviewRequests, setPendingReviewRequests] = useState<RequestSummary[]>([])
  const [pendingBuildingRequests, setPendingBuildingRequests] = useState<RequestSummary[]>([])
  const [pendingAllocationRequests, setPendingAllocationRequests] = useState<RequestSummary[]>([])
  const [completedRequests, setCompletedRequests] = useState<RequestSummary[]>([])
  const [rejectedRequests, setRejectedRequests] = useState<RequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Update the state to include statusCounts
  const [statusCounts, setStatusCounts] = useState({
    pending_review: 0,
    pending_building_response: 0,
    pending_allocation: 0,
    completed: 0,
    rejected: 0,
    closed: 0,
    all: 0,
  })

  // Update the useEffect to extract and set the status counts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Fetch all requests to get status counts
        const allRequestsResponse = await getRequestsList({
          limit: 5,
        })

        if (allRequestsResponse.success && allRequestsResponse.data.statusCounts) {
          setStatusCounts(allRequestsResponse.data.statusCounts)
        }

        // Fetch pending review requests
        const pendingReviewResponse = await getRequestsList({
          status: "pending_review",
          limit: 5,
        })

        if (pendingReviewResponse.success) {
          setPendingReviewRequests(pendingReviewResponse.data.requests)
        }

        // Fetch pending building response requests
        const pendingBuildingResponse = await getRequestsList({
          status: "pending_building_response",
          limit: 5,
        })

        if (pendingBuildingResponse.success) {
          setPendingBuildingRequests(pendingBuildingResponse.data.requests)
        }

        // Fetch pending allocation requests
        const pendingAllocationResponse = await getRequestsList({
          status: "pending_allocation",
          limit: 5,
        })

        if (pendingAllocationResponse.success) {
          setPendingAllocationRequests(pendingAllocationResponse.data.requests)
        }

        // Fetch completed requests
        const completedResponse = await getRequestsList({
          status: "completed",
          limit: 5,
        })

        if (completedResponse.success) {
          setCompletedRequests(completedResponse.data.requests)
        }

        // Fetch rejected requests
        const rejectedResponse = await getRequestsList({
          status: "rejected",
          limit: 5,
        })

        if (rejectedResponse.success) {
          setRejectedRequests(rejectedResponse.data.requests)
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error)
        toast({
          title: "錯誤",
          description: "無法獲取申請資料，請稍後再試",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 whitespace-nowrap">
            待審核
          </span>
        )
      case "pending_building_response":
        return (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 whitespace-nowrap">
            待填表
          </span>
        )
      case "pending_allocation":
        return (
          <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 whitespace-nowrap">
            待分配
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 whitespace-nowrap">
            已完成
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs text-red-800 whitespace-nowrap">
            已駁回
          </span>
        )
      case "closed":
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 whitespace-nowrap">
            已關閉
          </span>
        )
      default:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 whitespace-nowrap">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">總務處儀表板</h1>
      </div>

      {/* Update the card content to use statusCounts */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">待審核申請</CardTitle>
            <CardDescription>等待審核的申請數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.pending_review}</div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">待填表申請</CardTitle>
            <CardDescription>等待大樓管理員回覆的申請</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.pending_building_response}</div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">待分配申請</CardTitle>
            <CardDescription>等待分配器材的申請</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.pending_allocation}</div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">已完成申請</CardTitle>
            <CardDescription>已完成的申請數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.completed}</div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">已駁回申請</CardTitle>
            <CardDescription>已駁回的申請數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.rejected}</div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">快速導覽</CardTitle>
            <CardDescription>常用功能快速連結</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button asChild variant="outline" className="h-24 flex-col gap-2 justify-center">
                <Link href="/academic-staff/requests?status=pending_review">
                  <ClipboardList className="h-8 w-8 text-yellow-500" />
                  <span>待審核申請</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 justify-center">
                <Link href="/academic-staff/requests?status=pending_allocation">
                  <ClipboardList className="h-8 w-8 text-purple-500" />
                  <span>待分配申請</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 justify-center">
                <Link href="/academic-staff/buildings">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <span>大樓管理</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-2 justify-center">
                <Link href="/academic-staff/equipments">
                  <Package className="h-8 w-8 text-green-500" />
                  <span>器材管理</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending_review" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending_review">待審核</TabsTrigger>
            <TabsTrigger value="pending_building_response">待填表</TabsTrigger>
            <TabsTrigger value="pending_allocation">待分配</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="rejected">已駁回</TabsTrigger>
          </TabsList>
          <TabsContent value="pending_review" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">待審核申請</CardTitle>
                <CardDescription>需要您審核的申請</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : pendingReviewRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingReviewRequests.map((request) => (
                      <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">申請 #</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                            <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">沒有待審核的申請</h3>
                    <p className="text-sm text-muted-foreground">目前沒有需要審核的申請</p>
                  </div>
                )}
                {pendingReviewRequests.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button asChild variant="outline">
                      <Link href="/academic-staff/requests?status=pending_review">查看全部</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending_building_response" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">待填表申請</CardTitle>
                <CardDescription>等待大樓管理員回覆的申請</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : pendingBuildingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBuildingRequests.map((request) => (
                      <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">申請 #</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                            <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">沒有待填表的申請</h3>
                    <p className="text-sm text-muted-foreground">目前沒有等待大樓管理員回覆的申請</p>
                  </div>
                )}
                {pendingBuildingRequests.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button asChild variant="outline">
                      <Link href="/academic-staff/requests?status=pending_building_response">查看全部</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending_allocation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">待分配申請</CardTitle>
                <CardDescription>需要您分配器材的申請</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : pendingAllocationRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAllocationRequests.map((request) => (
                      <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">申請 #</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                            <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">沒有待分配的申請</h3>
                    <p className="text-sm text-muted-foreground">目前沒有需要分配器材的申請</p>
                  </div>
                )}
                {pendingAllocationRequests.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button asChild variant="outline">
                      <Link href="/academic-staff/requests?status=pending_allocation">查看全部</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">已完成申請</CardTitle>
                <CardDescription>最近完成的申請</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : completedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {completedRequests.map((request) => (
                      <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">申請 #</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                            <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">沒有已完成的申請</h3>
                    <p className="text-sm text-muted-foreground">目前沒有已完成的申請</p>
                  </div>
                )}
                {completedRequests.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button asChild variant="outline">
                      <Link href="/academic-staff/requests?status=completed">查看全部</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">已駁回申請</CardTitle>
                <CardDescription>已駁回的申請</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : rejectedRequests.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedRequests.map((request) => (
                      <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">申請 #</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                            <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                          <div className="text-sm text-muted-foreground">
                            借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">沒有已駁回的申請</h3>
                    <p className="text-sm text-muted-foreground">目前沒有已駁回的申請</p>
                  </div>
                )}
                {rejectedRequests.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button asChild variant="outline">
                      <Link href="/academic-staff/requests?status=rejected">查看全部</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
