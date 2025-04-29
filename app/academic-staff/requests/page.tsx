"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Search, Calendar } from "lucide-react"
import { getRequestsList } from "@/lib/api/requests"
import type { RequestSummary } from "@/lib/types"

export default function AcademicStaffRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDateFrom, setStartDateFrom] = useState<Date | undefined>(undefined)
  const [startDateTo, setStartDateTo] = useState<Date | undefined>(undefined)

  // Add a new state to track counts for each status
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  // Modify the fetchRequests function to also fetch counts
  const fetchRequests = async (pageNum: number, status?: string, query?: string, dateFrom?: Date, dateTo?: Date) => {
    setIsLoading(true)
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: 10,
      }

      if (status && status !== "all") {
        params.status = status
      }

      if (query) {
        params.query = query
      }

      if (dateFrom) {
        params.startDateFrom = dateFrom.toISOString().split("T")[0]
      }

      if (dateTo) {
        params.startDateTo = dateTo.toISOString().split("T")[0]
      }

      const response = await getRequestsList(params)

      if (response.success) {
        setRequests(response.data.requests)
        setTotalPages(Math.ceil(response.data.total / response.data.limit))
      } else {
        toast({
          title: "錯誤",
          description: "無法獲取申請列表，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      toast({
        title: "錯誤",
        description: "無法獲取申請列表，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new function to fetch status counts
  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/counts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setStatusCounts(data.data.counts)
      }
    } catch (error) {
      console.error("Failed to fetch status counts:", error)
    }
  }

  // Update the useEffect to also fetch counts
  useEffect(() => {
    // Get status from URL query params if available
    const urlParams = new URLSearchParams(window.location.search)
    const statusParam = urlParams.get("status")
    if (statusParam) {
      setStatusFilter(statusParam)
    }

    fetchRequests(
      page,
      statusParam || statusFilter !== "all" ? statusParam || statusFilter : undefined,
      searchQuery || undefined,
      startDateFrom,
      startDateTo,
    )

    // Fetch counts for all statuses
    fetchStatusCounts()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRequests(
      1,
      statusFilter !== "all" ? statusFilter : undefined,
      searchQuery || undefined,
      startDateFrom,
      startDateTo,
    )
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
    fetchRequests(1, value !== "all" ? value : undefined, searchQuery || undefined, startDateFrom, startDateTo)
  }

  const handleDateChange = () => {
    setPage(1)
    fetchRequests(
      1,
      statusFilter !== "all" ? statusFilter : undefined,
      searchQuery || undefined,
      startDateFrom,
      startDateTo,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">申請管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申請列表</CardTitle>
          <CardDescription>管理所有器材借用申請</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="搜尋申請..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <div className="w-full md:w-48">
                {/* Update the Select component to show counts */}
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="狀態篩選" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部狀態 {statusCounts.all ? `(${statusCounts.all})` : ""}</SelectItem>
                    <SelectItem value="pending_review">
                      待審核 {statusCounts.pending_review ? `(${statusCounts.pending_review})` : ""}
                    </SelectItem>
                    <SelectItem value="pending_building_response">
                      待填表{" "}
                      {statusCounts.pending_building_response ? `(${statusCounts.pending_building_response})` : ""}
                    </SelectItem>
                    <SelectItem value="pending_allocation">
                      待分配 {statusCounts.pending_allocation ? `(${statusCounts.pending_allocation})` : ""}
                    </SelectItem>
                    <SelectItem value="completed">
                      已完成 {statusCounts.completed ? `(${statusCounts.completed})` : ""}
                    </SelectItem>
                    <SelectItem value="rejected">
                      已駁回 {statusCounts.rejected ? `(${statusCounts.rejected})` : ""}
                    </SelectItem>
                    <SelectItem value="closed">
                      已關閉 {statusCounts.closed ? `(${statusCounts.closed})` : ""}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">開始日期範圍:</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 md:flex-row">
                <div className="flex-1">
                  <DatePicker
                    placeholder="起始日期"
                    value={startDateFrom}
                    onChange={(date) => {
                      setStartDateFrom(date)
                      setTimeout(handleDateChange, 100)
                    }}
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    placeholder="結束日期"
                    value={startDateTo}
                    onChange={(date) => {
                      setStartDateTo(date)
                      setTimeout(handleDateChange, 100)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.requestId} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    {/* Update the request list items to handle small screens better */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium flex-shrink-0">申請 #</span>
                      <span className="truncate max-w-[120px] sm:max-w-[150px]">{request.requestId}</span>
                      <div className="flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto">{getStatusBadge(request.status)}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">申請人: {request.username}</div>
                    <div className="text-sm text-muted-foreground">
                      借用日期: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">使用場地: {request.venue}</div>
                    <div className="text-sm text-muted-foreground">
                      申請時間: {new Date(request.createdAt).toLocaleString("zh-TW")}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/academic-staff/requests/${request.requestId}`}>查看詳情</Link>
                  </Button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  上一頁
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 頁，共 {totalPages} 頁
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  下一頁
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">沒有找到申請</h3>
              <p className="text-sm text-muted-foreground">目前沒有任何符合條件的申請</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
