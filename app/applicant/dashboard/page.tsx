"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { getRequestsList } from "@/lib/api/requests"
import type { RequestSummary } from "@/lib/types"

export default function ApplicantDashboard() {
  const { toast } = useToast()
  const [pendingRequests, setPendingRequests] = useState<RequestSummary[]>([])
  const [completedRequests, setCompletedRequests] = useState<RequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState({
    pending_review: 0,
    pending_building_response: 0,
    pending_allocation: 0,
    completed: 0,
    rejected: 0,
    closed: 0,
    all: 0,
  })

  const fetchRequests = async () => {
    try {
      // Fetch all requests to get status counts
      const allRequestsResponse = await getRequestsList({
        limit: 5,
      })

      if (allRequestsResponse.success && allRequestsResponse.data.statusCounts) {
        setStatusCounts(allRequestsResponse.data.statusCounts)
      }

      // Fetch each pending status separately and combine them
      const pendingReviewResponse = await getRequestsList({
        status: "pending_review",
        limit: 5,
      })

      const pendingBuildingResponse = await getRequestsList({
        status: "pending_building_response",
        limit: 5,
      })

      const pendingAllocationResponse = await getRequestsList({
        status: "pending_allocation",
        limit: 5,
      })

      // Combine all pending requests
      const allPendingRequests = [
        ...(pendingReviewResponse.success ? pendingReviewResponse.data.requests : []),
        ...(pendingBuildingResponse.success ? pendingBuildingResponse.data.requests : []),
        ...(pendingAllocationResponse.success ? pendingAllocationResponse.data.requests : []),
      ]

      // Sort by createdAt date (newest first)
      allPendingRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Take only the first 5 items
      setPendingRequests(allPendingRequests.slice(0, 5))

      // Fetch each completed status separately and combine them
      const completedResponse = await getRequestsList({
        status: "completed",
        limit: 5,
      })

      const rejectedResponse = await getRequestsList({
        status: "rejected",
        limit: 5,
      })

      const closedResponse = await getRequestsList({
        status: "closed",
        limit: 5,
      })

      // Combine all completed requests
      const allCompletedRequests = [
        ...(completedResponse.success ? completedResponse.data.requests : []),
        ...(rejectedResponse.success ? rejectedResponse.data.requests : []),
        ...(closedResponse.success ? closedResponse.data.requests : []),
      ]

      // Sort by createdAt date (newest first)
      allCompletedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Take only the first 5 items
      setCompletedRequests(allCompletedRequests.slice(0, 5))
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

  useEffect(() => {
    fetchRequests()
  }, [toast])

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">申請人儀表板</h1>
        <Button asChild>
          <Link href="/applicant/new-request">
            <Plus className="mr-2 h-4 w-4" />
            新增申請
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">待處理申請</CardTitle>
            <CardDescription>等待處理的申請數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {statusCounts.pending_review + statusCounts.pending_building_response + statusCounts.pending_allocation}
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
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
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">已駁回/關閉</CardTitle>
            <CardDescription>已駁回或關閉的申請數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{statusCounts.rejected + statusCounts.closed}</div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">待處理申請</TabsTrigger>
          <TabsTrigger value="completed">已完成申請</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">待處理申請</CardTitle>
              <CardDescription>需要您關注的申請</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium flex-shrink-0">申請 #</span>
                          <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                          <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">{getStatusBadge(request.status)}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </div>
                        <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/applicant/requests/${request.requestId}`}>查看詳情</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">沒有待處理的申請</h3>
                  <p className="text-sm text-muted-foreground">您目前沒有任何待處理的申請</p>
                </div>
              )}
              {pendingRequests.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button asChild variant="outline">
                    <Link href="/applicant/requests">查看全部申請</Link>
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
              <CardDescription>已處理完成的申請</CardDescription>
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
                          <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">{getStatusBadge(request.status)}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </div>
                        <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/applicant/requests/${request.requestId}`}>查看詳情</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">沒有已完成的申請</h3>
                  <p className="text-sm text-muted-foreground">您目前沒有任何已完成的申請</p>
                </div>
              )}
              {completedRequests.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button asChild variant="outline">
                    <Link href="/applicant/requests">查看全部申請</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
