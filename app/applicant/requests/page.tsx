"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Search, Plus } from "lucide-react"
import { getRequestsList } from "@/lib/api/requests"
import type { RequestSummary } from "@/lib/types"

export default function RequestsListPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchRequests = async (pageNum: number, status?: string, query?: string) => {
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

  useEffect(() => {
    fetchRequests(page, statusFilter !== "all" ? statusFilter : undefined, searchQuery || undefined)
  }, [page, statusFilter, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRequests(1, statusFilter !== "all" ? statusFilter : undefined, searchQuery || undefined)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
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
        <h1 className="text-3xl font-bold">我的申請列表</h1>
        <Button asChild>
          <Link href="/applicant/new-request">
            <Plus className="mr-2 h-4 w-4" />
            新增申請
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申請列表</CardTitle>
          <CardDescription>查看您的所有器材借用申請</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
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
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="pending_review">待審核</SelectItem>
                  <SelectItem value="pending_building_response">待填表</SelectItem>
                  <SelectItem value="pending_allocation">待分配</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="rejected">已駁回</SelectItem>
                  <SelectItem value="closed">已關閉</SelectItem>
                </SelectContent>
              </Select>
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
                    <div className="text-sm text-muted-foreground">
                      申請時間: {new Date(request.createdAt).toLocaleString("zh-TW")}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/applicant/requests/${request.requestId}`}>查看詳情</Link>
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
              <p className="text-sm text-muted-foreground">您目前沒有任何符合條件的申請</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
