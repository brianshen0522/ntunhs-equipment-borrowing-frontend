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
import { getLineBotSettings, updateLineBotSettings, testLineBot, type LineBotSettings } from "@/lib/api/admin"
import { getSystemParameters, updateSystemParameters, type SystemParameters } from "@/lib/api/admin"
import { Eye, EyeOff } from "lucide-react"

// Update the LINE settings page to use the toast helper functions

// First, add the import for toast helper functions
import { successToast, errorToast } from "@/lib/utils/toast-helper"

export default function LineBotSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<LineBotSettings>({
    channelAccessToken: "",
    targetId: "",
    notificationTemplates: {
      buildingManagerRequest: "",
      allocationComplete: "",
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
  const [showToken, setShowToken] = useState(false)

  // In the fetchSettings function
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const [lineBotResponse, systemResponse] = await Promise.all([getLineBotSettings(), getSystemParameters()])

        if (lineBotResponse.success && lineBotResponse.data) {
          setSettings(lineBotResponse.data)
        } else {
          errorToast({
            title: "錯誤",
            description: lineBotResponse.error?.message || "無法獲取 LINE Bot 設定",
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

  // In the handleSave function
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const [lineBotResponse, systemResponse] = await Promise.all([
        updateLineBotSettings(settings),
        updateSystemParameters(systemSettings),
      ])

      if (lineBotResponse.success && systemResponse.success) {
        successToast({
          title: "成功",
          description: "LINE Bot 設定已更新",
        })
      } else {
        errorToast({
          title: "錯誤",
          description: lineBotResponse.error?.message || systemResponse.error?.message || "無法更新設定",
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

  // In the handleTest function
  const handleTest = async () => {
    setIsTesting(true)
    try {
      const response = await testLineBot()
      if (response.success && response.data) {
        if (response.data.connectionStatus === "success") {
          successToast({
            title: "成功",
            description: `已成功連接到 LINE Bot: ${response.data.botInfo.displayName}`,
          })
        } else {
          errorToast({
            title: "錯誤",
            description: "LINE Bot 連接測試失敗",
          })
        }
      } else {
        errorToast({
          title: "錯誤",
          description: response.error?.message || "LINE Bot 連接測試失敗",
        })
      }
    } catch (error) {
      console.error("Failed to test LINE Bot connection:", error)
      errorToast({
        title: "錯誤",
        description: "LINE Bot 連接測試失敗",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
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
        <h1 className="text-3xl font-bold">LINE Bot 設定</h1>
      </div>

      <Tabs defaultValue="connection">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">連接與通知設定</TabsTrigger>
          <TabsTrigger value="templates">通知範本</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>LINE Bot 連接設定</CardTitle>
              <CardDescription>設定用於發送 LINE 通知的 Bot 連接資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channelAccessToken">Channel Access Token</Label>
                <div className="relative">
                  <Input
                    id="channelAccessToken"
                    type={showToken ? "text" : "password"}
                    placeholder="LINE Channel Access Token"
                    value={settings.channelAccessToken}
                    onChange={(e) => handleInputChange("channelAccessToken", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetId">目標 ID (用戶或群組 ID)</Label>
                <Input
                  id="targetId"
                  placeholder="例如：U1234567890abcdef1234567890abcdef"
                  value={settings.targetId}
                  onChange={(e) => handleInputChange("targetId", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">輸入要接收通知的 LINE 用戶 ID 或群組 ID</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLineNotifications"
                  checked={systemSettings.parameters.enableLineNotifications}
                  onCheckedChange={(checked) => handleSystemSettingChange("enableLineNotifications", checked)}
                />
                <Label htmlFor="enableLineNotifications">啟用 LINE 通知</Label>
              </div>
              <p className="text-sm text-muted-foreground">啟用後，系統將會在申請狀態變更時發送 LINE 通知給相關人員</p>

              <Button onClick={handleTest} disabled={isTesting}>
                {isTesting ? "測試中..." : "測試 LINE Bot 連接"}
              </Button>
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
              <CardTitle>通知範本設定</CardTitle>
              <CardDescription>設定系統發送的 LINE 通知範本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buildingManagerRequest">建築物管理員請求通知</Label>
                <Textarea
                  id="buildingManagerRequest"
                  placeholder="您有一個新的設備借用申請需要審批..."
                  className="min-h-[150px]"
                  value={settings.notificationTemplates.buildingManagerRequest}
                  onChange={(e) => handleInputChange("notificationTemplates.buildingManagerRequest", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">您可以使用以下變數：{"{formUrl}"} - 回應表單連結</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allocationComplete">分配完成通知</Label>
                <Textarea
                  id="allocationComplete"
                  placeholder="您的設備借用申請已完成分配..."
                  className="min-h-[150px]"
                  value={settings.notificationTemplates.allocationComplete}
                  onChange={(e) => handleInputChange("notificationTemplates.allocationComplete", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  您可以使用以下變數：{"{requestId}"} - 申請編號, {"{buildingName}"} - 建築物名稱, {"{dates}"} -
                  借用日期
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
