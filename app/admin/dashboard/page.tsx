"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Users, Mail, MessageSquare, Settings, FileText, Activity, Database, Bot, Send, Key } from "lucide-react"
import { getSystemStatus, type ServiceStatus } from "@/lib/api/admin"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [systemStatus, setSystemStatus] = useState<{
    database?: ServiceStatus
    lineBot?: ServiceStatus
    emailService?: ServiceStatus
    ssoIntegration?: ServiceStatus
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await getSystemStatus()
        if (response.success && response.data) {
          setSystemStatus(response.data)
        } else {
          toast({
            title: "錯誤",
            description: "無法獲取系統狀態，請稍後再試",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch system status:", error)
        toast({
          title: "錯誤",
          description: "無法獲取系統狀態，請稍後再試",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [toast])

  // Format date to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未知"
    const date = new Date(dateString)
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "text-gray-500"
    switch (status.toLowerCase()) {
      case "healthy":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-500"
    switch (status.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-700"
      case "error":
        return "bg-red-100 text-red-700"
      case "warning":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-500"
    }
  }

  // Get status text
  const getStatusText = (status: string | undefined) => {
    if (!status) return "未知"
    switch (status.toLowerCase()) {
      case "healthy":
        return "正常"
      case "error":
        return "錯誤"
      case "warning":
        return "警告"
      default:
        return status
    }
  }

  // Get status icon
  const getStatusIcon = (service: string) => {
    switch (service) {
      case "database":
        return <Database className="h-8 w-8" />
      case "lineBot":
        return <Bot className="h-8 w-8" />
      case "emailService":
        return <Send className="h-8 w-8" />
      case "ssoIntegration":
        return <Key className="h-8 w-8" />
      default:
        return <Activity className="h-8 w-8" />
    }
  }

  // Get service name in Chinese
  const getServiceName = (service: string) => {
    switch (service) {
      case "database":
        return "資料庫"
      case "lineBot":
        return "LINE Bot"
      case "emailService":
        return "電子郵件服務"
      case "ssoIntegration":
        return "SSO 整合"
      default:
        return service
    }
  }

  // Count healthy services
  const countHealthyServices = () => {
    if (!systemStatus) return 0
    return Object.values(systemStatus).filter((s) => s?.status === "healthy").length
  }

  // Overall system status
  const getOverallStatus = () => {
    if (!systemStatus) return "未知"
    const services = Object.values(systemStatus)
    if (services.some((s) => s?.status === "error")) return "異常"
    if (services.some((s) => s?.status === "warning")) return "警告"
    if (services.every((s) => s?.status === "healthy")) return "正常運行"
    return "部分服務異常"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">系統管理儀表板</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">使用者管理</CardTitle>
            <CardDescription>管理系統使用者和角色</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-500" />
              <Button asChild>
                <Link href="/admin/users">管理使用者</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">郵件設定</CardTitle>
            <CardDescription>設定 SMTP 郵件伺服器</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Mail className="h-8 w-8 text-green-500" />
              <Button asChild>
                <Link href="/admin/smtp-settings">郵件設定</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">LINE 設定</CardTitle>
            <CardDescription>設定 LINE Bot 通知</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <Button asChild>
                <Link href="/admin/line-settings">LINE 設定</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">系統參數</CardTitle>
            <CardDescription>設定全域系統參數</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Settings className="h-8 w-8 text-purple-500" />
              <Button asChild>
                <Link href="/admin/system-settings">系統參數</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">系統日誌</CardTitle>
            <CardDescription>查看系統日誌記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-orange-500" />
              <Button asChild>
                <Link href="/admin/system-logs">系統日誌</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">系統狀態</CardTitle>
            <CardDescription>查看系統運行狀態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-blue-500" />
              <div className="text-right">
                <p className="text-sm font-medium">{isLoading ? "載入中..." : getOverallStatus()}</p>
                <p className="text-xs text-muted-foreground">
                  {systemStatus
                    ? `${countHealthyServices()} / ${Object.keys(systemStatus).length} 服務正常`
                    : "載入中..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>系統詳細狀態</CardTitle>
            <CardDescription>伺服器運行狀態和資源使用情況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(systemStatus).map(([key, service]) => (
                <Card key={key} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getStatusIcon(key)}
                        {getServiceName(key)}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(service?.status)}`}
                      >
                        {getStatusText(service?.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      {service?.responseTime !== null && service?.responseTime !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">回應時間:</span>
                          <span>{service.responseTime}ms</span>
                        </div>
                      )}
                      {service?.lastWebhookReceived && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">最後 Webhook:</span>
                          <span>{formatDate(service.lastWebhookReceived)}</span>
                        </div>
                      )}
                      {service?.lastEmailSent && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">最後郵件:</span>
                          <span>{formatDate(service.lastEmailSent)}</span>
                        </div>
                      )}
                      {service?.lastSuccessfulAuth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">最後認證:</span>
                          <span>{formatDate(service.lastSuccessfulAuth)}</span>
                        </div>
                      )}
                      {service?.error && (
                        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded border border-red-200">
                          <span className="font-medium">錯誤:</span> {service.error}
                        </div>
                      )}
                      {!service?.lastWebhookReceived &&
                        !service?.lastEmailSent &&
                        !service?.lastSuccessfulAuth &&
                        !service?.responseTime && <div className="text-muted-foreground">無可用資訊</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
