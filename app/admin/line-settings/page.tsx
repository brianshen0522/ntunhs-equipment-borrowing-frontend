"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLineBotSettings, updateLineBotSettings, testLineBot, type LineBotSettings } from "@/lib/api/admin"

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await getLineBotSettings()
        if (response.success && response.data) {
          setSettings(response.data)
        } else {
          toast({
            title: "錯誤",
            description: response.error?.message || "無法獲取 LINE Bot 設定",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch LINE Bot settings:", error)
        toast({
          title: "錯誤",
          description: "無法獲取 LINE Bot 設定",
          variant: "destructive",
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
      const response = await updateLineBotSettings(settings)
      if (response.success) {
        toast({
          title: "成功",
          description: "LINE Bot 設定已更新",
        })
      } else {
        toast({
          title: "錯誤",
          description: response.error?.message || "無法更新 LINE Bot 設定",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update LINE Bot settings:", error)
      toast({
        title: "錯誤",
        description: "無法更新 LINE Bot 設定",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      const response = await testLineBot()
      if (response.success && response.data) {
        if (response.data.connectionStatus === "success") {
          toast({
            title: "成功",
            description: `LINE Bot 連接測試成功，Bot 名稱：${response.data.botInfo.displayName}`,
          })
        } else {
          toast({
            title: "錯誤",
            description: "LINE Bot 連接測試失敗",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "錯誤",
          description: response.error?.message || "LINE Bot 連接測試失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to test LINE Bot connection:", error)
      toast({
        title: "錯誤",
        description: "LINE Bot 連接測試失敗",
        variant: "destructive",
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
          <TabsTrigger value="connection">連接設定</TabsTrigger>
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
                <Input
                  id="channelAccessToken"
                  placeholder="LINE Channel Access Token"
                  value={settings.channelAccessToken}
                  onChange={(e) => handleInputChange("channelAccessToken", e.target.value)}
                />
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
                  您可以使用以下變數：{"{requestId}"} - 申請編號, {"{buildingName}"} - 建築物名稱
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
