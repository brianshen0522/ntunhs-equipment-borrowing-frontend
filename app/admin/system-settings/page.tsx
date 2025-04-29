"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getSystemParameters, updateSystemParameters, type SystemParameters } from "@/lib/api/admin"

export default function SystemSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemParameters>({
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

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await getSystemParameters()
        if (response.success && response.data) {
          setSettings(response.data)
        } else {
          toast({
            title: "錯誤",
            description: response.error?.message || "無法獲取系統參數",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch system parameters:", error)
        toast({
          title: "錯誤",
          description: "無法獲取系統參數",
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
      const response = await updateSystemParameters(settings)
      if (response.success) {
        toast({
          title: "成功",
          description: "系統參數已更新",
        })
      } else {
        toast({
          title: "錯誤",
          description: response.error?.message || "無法更新系統參數",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update system parameters:", error)
      toast({
        title: "錯誤",
        description: "無法更新系統參數",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
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
        <h1 className="text-3xl font-bold">系統參數設定</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全域系統參數</CardTitle>
          <CardDescription>設定影響整個系統運作的參數</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requestExpiryDays">申請過期天數</Label>
              <Input
                id="requestExpiryDays"
                type="number"
                min="1"
                max="365"
                placeholder="30"
                value={settings.parameters.requestExpiryDays}
                onChange={(e) => handleInputChange("requestExpiryDays", Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">設定申請在多少天後自動過期</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseFormValidityHours">回應表單有效小時數</Label>
              <Input
                id="responseFormValidityHours"
                type="number"
                min="1"
                max="168"
                placeholder="48"
                value={settings.parameters.responseFormValidityHours}
                onChange={(e) => handleInputChange("responseFormValidityHours", Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">設定建築物管理員回應表單的有效期限</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxItemsPerRequest">每個申請的最大項目數</Label>
              <Input
                id="maxItemsPerRequest"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={settings.parameters.maxItemsPerRequest}
                onChange={(e) => handleInputChange("maxItemsPerRequest", Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">設定每個申請可以包含的最大設備數量</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableEmailNotifications"
                checked={settings.parameters.enableEmailNotifications}
                onCheckedChange={(checked) => handleInputChange("enableEmailNotifications", checked)}
              />
              <Label htmlFor="enableEmailNotifications">啟用電子郵件通知</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enableLineNotifications"
                checked={settings.parameters.enableLineNotifications}
                onCheckedChange={(checked) => handleInputChange("enableLineNotifications", checked)}
              />
              <Label htmlFor="enableLineNotifications">啟用 LINE 通知</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="systemMaintenanceMode"
                checked={settings.parameters.systemMaintenanceMode}
                onCheckedChange={(checked) => handleInputChange("systemMaintenanceMode", checked)}
              />
              <Label htmlFor="systemMaintenanceMode">系統維護模式</Label>
            </div>
            <p className="text-xs text-muted-foreground">啟用維護模式後，除了系統管理員外的所有使用者將無法登入系統</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "儲存中..." : "儲存設定"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
