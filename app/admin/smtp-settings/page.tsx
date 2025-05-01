"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSmtpSettings, updateSmtpSettings, testSmtp, type SmtpSettings } from "@/lib/api/admin"
import { getSystemParameters, updateSystemParameters, type SystemParameters } from "@/lib/api/admin"
import { successToast, errorToast, warningToast } from "@/lib/utils/toast-helper"

export default function SmtpSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SmtpSettings>({
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    senderEmail: "",
    senderName: "",
    emailTemplates: {
      approvalNotification: {
        subject: "",
        body: "",
      },
    },
  })
  const [systemSettings, setSystemSettings] = useState<SystemParameters>({
    parameters: {
      requestExpiryDays: 30,
      responseFormValidityHours: 48,
      maxItemsPerRequest: 10,
      enableEmailNotifications: true,
      enableLineNotifications: true,
      systemMaintenanceMode: false,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const [smtpResponse, systemResponse] = await Promise.all([getSmtpSettings(), getSystemParameters()])

        if (smtpResponse.success && smtpResponse.data) {
          setSettings(smtpResponse.data)
        } else {
          errorToast({
            title: "錯誤",
            description: smtpResponse.error?.message || "無法獲取 SMTP 設定",
          })
        }

        if (systemResponse.success && systemResponse.data) {
          setSystemSettings(systemResponse.data)
        } else {
          errorToast({
            title: "錯誤",
            description: systemResponse.error?.message || "無法獲取系統參數",
          })
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
        errorToast({
          title: "錯誤",
          description: "無法獲取設定",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const [smtpResponse, systemResponse] = await Promise.all([
        updateSmtpSettings(settings),
        updateSystemParameters(systemSettings),
      ])

      if (smtpResponse.success && systemResponse.success) {
        successToast({
          title: "成功",
          description: "郵件設定已更新",
        })
      } else {
        errorToast({
          title: "錯誤",
          description: smtpResponse.error?.message || systemResponse.error?.message || "無法更新設定",
        })
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
      errorToast({
        title: "錯誤",
        description: "無法更新設定",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      warningToast({
        title: "錯誤",
        description: "請輸入測試郵件地址",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await testSmtp({ testEmail })
      if (response.success && response.data) {
        if (response.data.connectionStatus === "success" && response.data.messageSent) {
          successToast({
            title: "成功",
            description: `測試郵件已發送至 ${response.data.recipientEmail}`,
          })
        } else {
          errorToast({
            title: "錯誤",
            description: "SMTP 連接測試失敗",
          })
        }
      } else {
        errorToast({
          title: "錯誤",
          description: response.error?.message || "SMTP 連接測試失敗",
        })
      }
    } catch (error) {
      console.error("Failed to test SMTP connection:", error)
      errorToast({
        title: "錯誤",
        description: "SMTP 連接測試失敗",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev }
      const fieldParts = field.split(".")

      if (fieldParts.length === 1) {
        // @ts-ignore
        newSettings[field] = value
      } else if (fieldParts.length === 2) {
        // @ts-ignore
        newSettings[fieldParts[0]] = {
          // @ts-ignore
          ...newSettings[fieldParts[0]],
          // @ts-ignore
          [fieldParts[1]]: value,
        }
      } else if (fieldParts.length === 3) {
        // @ts-ignore
        newSettings[fieldParts[0]][fieldParts[1]] = {
          // @ts-ignore
          ...newSettings[fieldParts[0]][fieldParts[1]],
          // @ts-ignore
          [fieldParts[2]]: value,
        }
      }

      return newSettings
    })
  }

  const handleSystemSettingChange = (field: string, value: any) => {
    setSystemSettings((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [field]: value,
      },
    }))
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SMTP 設定</h1>
      </div>

      <Tabs defaultValue="connection">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">連接與通知設定</TabsTrigger>
          <TabsTrigger value="templates">郵件範本</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP 伺服器設定</CardTitle>
              <CardDescription>設定用於發送郵件通知的 SMTP 伺服器</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP 伺服器地址</Label>
                  <Input
                    id="host"
                    placeholder="smtp.example.com"
                    value={settings.host}
                    onChange={(e) => handleInputChange("host", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">SMTP 埠</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="587"
                    value={settings.port}
                    onChange={(e) => handleInputChange("port", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="secure"
                  checked={settings.secure}
                  onCheckedChange={(checked) => handleInputChange("secure", checked)}
                />
                <Label htmlFor="secure">使用 SSL/TLS 安全連接</Label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">SMTP 使用者名稱</Label>
                  <Input
                    id="username"
                    placeholder="username@example.com"
                    value={settings.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">SMTP 密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={settings.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">寄件者郵箱</Label>
                  <Input
                    id="senderEmail"
                    placeholder="noreply@example.com"
                    value={settings.senderEmail}
                    onChange={(e) => handleInputChange("senderEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">寄件者名稱</Label>
                  <Input
                    id="senderName"
                    placeholder="設備借用系統"
                    value={settings.senderName}
                    onChange={(e) => handleInputChange("senderName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testEmail">測試郵件地址</Label>
                <div className="flex space-x-2">
                  <Input
                    id="testEmail"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button onClick={handleTest} disabled={isTesting}>
                    {isTesting ? "測試中..." : "發送測試郵件"}
                  </Button>
                </div>
              </div>
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium">郵件通知設定</h3>
                <p className="text-sm text-muted-foreground mb-4">設定系統郵件通知功能</p>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    checked={systemSettings.parameters.enableEmailNotifications}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableEmailNotifications", checked)}
                  />
                  <Label htmlFor="enableEmailNotifications">啟用電子郵件通知</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  啟用後，系統將會在申請狀態變更時發送電子郵件通知給相關人員
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "儲存中..." : "儲存設定"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>郵件範本設定</CardTitle>
              <CardDescription>設定系統發送的郵件範本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approvalSubject">審批通知郵件主題</Label>
                <Input
                  id="approvalSubject"
                  placeholder="設備借用申請已審批"
                  value={settings.emailTemplates.approvalNotification.subject}
                  onChange={(e) => handleInputChange("emailTemplates.approvalNotification.subject", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalBody">審批通知郵件內容</Label>
                <Textarea
                  id="approvalBody"
                  placeholder="您的設備借用申請已審批通過..."
                  className="min-h-[200px]"
                  value={settings.emailTemplates.approvalNotification.body}
                  onChange={(e) => handleInputChange("emailTemplates.approvalNotification.body", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  您可以使用以下變數：{"{requestId}"} - 申請編號, {"{username}"} - 使用者名稱, {"{status}"} - 申請狀態,{" "}
                  {"{approvalDate}"} - 審批日期
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "儲存中..." : "儲存設定"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
