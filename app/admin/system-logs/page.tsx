"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Search, Download, X } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getSystemLogs, type SystemLog } from "@/lib/api/admin"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SystemLogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [level, setLevel] = useState<string>("")
  const [component, setComponent] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await getSystemLogs({
        startDate: startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        level,
        component,
        user_id: userId,
        page,
        limit,
      })

      if (response.success && response.data) {
        setLogs(response.data.logs)
        setTotal(response.data.total)
      } else {
        toast({
          title: "錯誤",
          description: response.error?.message || "無法獲取系統日誌",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch system logs:", error)
      toast({
        title: "錯誤",
        description: "無法獲取系統日誌",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, limit])

  const handleSearch = () => {
    setPage(1)
    // Make sure we're not sending "all" values to the API
    const searchParams = {
      startDate: startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
      level: level === "all" ? "" : level,
      component: component === "all" ? "" : component,
      user_id: userId,
      page,
      limit,
    }

    // Call fetchLogs with the cleaned parameters
    setIsLoading(true)
    getSystemLogs(searchParams)
      .then((response) => {
        if (response.success && response.data) {
          setLogs(response.data.logs)
          setTotal(response.data.total)
        } else {
          toast({
            title: "錯誤",
            description: response.error?.message || "無法獲取系統日誌",
            variant: "destructive",
          })
        }
      })
      .catch((error) => {
        console.error("Failed to fetch system logs:", error)
        toast({
          title: "錯誤",
          description: "無法獲取系統日誌",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleExport = () => {
    // Convert logs to CSV
    const headers = ["ID", "時間戳記", "等級", "元件", "訊息", "使用者ID", "IP位址"]
    const csvRows = [
      headers.join(","),
      ...logs.map((log) => {
        return [
          log.id,
          log.timestamp,
          log.level,
          log.component,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || "",
          log.ipAddress || "",
        ].join(",")
      }),
    ]
    const csvString = csvRows.join("\n")

    // Create a blob and download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `system-logs-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      case "debug":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComponentBadgeColor = (component: string) => {
    switch (component.toLowerCase()) {
      case "auth":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "building":
        return "bg-green-100 text-green-800"
      case "equipment":
        return "bg-amber-100 text-amber-800"
      case "request":
        return "bg-indigo-100 text-indigo-800"
      case "response":
        return "bg-teal-100 text-teal-800"
      case "allocation":
        return "bg-cyan-100 text-cyan-800"
      case "email":
        return "bg-rose-100 text-rose-800"
      case "line":
        return "bg-emerald-100 text-emerald-800"
      case "pdf":
        return "bg-red-100 text-red-800"
      case "database":
        return "bg-slate-100 text-slate-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleLogClick = (log: SystemLog) => {
    setSelectedLog(log)
    setIsLogDetailOpen(true)
  }

  const totalPages = Math.ceil(total / limit)

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setLevel("")
    setComponent("")
    setUserId("")
    setPage(1)
    fetchLogs()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">系統日誌</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            清除篩選
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            匯出日誌
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日誌篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: zhTW }) : "選擇日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">結束日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: zhTW }) : "選擇日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">日誌等級</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="所有等級" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有等級</SelectItem>
                  <SelectItem value="error">錯誤</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                  <SelectItem value="info">資訊</SelectItem>
                  <SelectItem value="debug">除錯</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="component">元件</Label>
              <Select value={component} onValueChange={setComponent}>
                <SelectTrigger id="component">
                  <SelectValue placeholder="所有元件" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有元件</SelectItem>
                  <SelectItem value="auth">認證</SelectItem>
                  <SelectItem value="admin">管理</SelectItem>
                  <SelectItem value="building">建築物</SelectItem>
                  <SelectItem value="equipment">設備</SelectItem>
                  <SelectItem value="request">申請</SelectItem>
                  <SelectItem value="response">回應</SelectItem>
                  <SelectItem value="allocation">分配</SelectItem>
                  <SelectItem value="email">電子郵件</SelectItem>
                  <SelectItem value="line">LINE</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="database">資料庫</SelectItem>
                  <SelectItem value="system">系統</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">使用者ID</Label>
              <Input
                id="userId"
                placeholder="輸入使用者ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            搜尋
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>日誌列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>等級</TableHead>
                  <TableHead>元件</TableHead>
                  <TableHead>訊息</TableHead>
                  <TableHead>使用者</TableHead>
                  <TableHead>IP位址</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      載入中...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      沒有找到日誌記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleLogClick(log)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("zh-TW")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeColor(log.level)}>{log.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getComponentBadgeColor(log.component)}>{log.component}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell>{log.userId || "-"}</TableCell>
                      <TableCell>{log.ipAddress || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              顯示 {logs.length} 個日誌中的 {(page - 1) * limit + 1}-{Math.min(page * limit, total)} 個
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                上一頁
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                下一頁
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={isLogDetailOpen} onOpenChange={setIsLogDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>日誌詳細資訊</DialogTitle>
            <DialogDescription>ID: {selectedLog?.id}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="font-medium">時間</Label>
              <div>{selectedLog && new Date(selectedLog.timestamp).toLocaleString("zh-TW")}</div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">等級</Label>
              <div>
                {selectedLog && <Badge className={getLevelBadgeColor(selectedLog.level)}>{selectedLog.level}</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">元件</Label>
              <div>
                {selectedLog && (
                  <Badge className={getComponentBadgeColor(selectedLog.component)}>{selectedLog.component}</Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">使用者ID</Label>
              <div>{selectedLog?.userId || "-"}</div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">IP位址</Label>
              <div>{selectedLog?.ipAddress || "-"}</div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="font-medium">訊息</Label>
              <div className="rounded-md bg-gray-50 p-2">{selectedLog?.message}</div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="font-medium">詳細資訊</Label>
              <pre className="max-h-60 overflow-auto rounded-md bg-gray-50 p-2 text-xs">
                {selectedLog?.details ? JSON.stringify(selectedLog.details, null, 2) : "無詳細資訊"}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsLogDetailOpen(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
