"use client"

// Import the useThemePersistence hook at the top of the file
import { useThemePersistence } from "@/hooks/use-theme-persistence"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, CheckCircle, ClipboardList } from "lucide-react"
import { ThemeSwitch } from "@/components/theme-switch"
import { getRequestForBuildingManager, submitBuildingResponse } from "@/lib/api/building-responses"
import type { BuildingResponseItem } from "@/lib/api/building-responses"

export default function BuildingManagerResponsePage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params)
  const requestId = unwrappedParams.id

  // Inside your component, add:
  const { theme } = useThemePersistence()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requestData, setRequestData] = useState<{
    requestId: string
    username: string
    startDate: string
    endDate: string
    venue: string
    purpose: string
    items: Array<{
      itemId: string
      equipmentName: string
      requestedQuantity: number
    }>
    buildings: Array<{
      buildingId: string
      buildingName: string
    }>
  } | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState("")
  const [availableItems, setAvailableItems] = useState<BuildingResponseItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequestData = async () => {
      setIsLoading(true)
      try {
        const response = await getRequestForBuildingManager(requestId)
        if (response.success) {
          setRequestData(response.data)
          // Initialize available items with 0 quantities
          if (response.data.items) {
            setAvailableItems(
              response.data.items.map((item) => ({
                itemId: item.itemId,
                availableQuantity: 0,
              })),
            )
          }
        } else {
          setError(response.error?.message || "無法獲取申請資料，請確認連結是否正確")
        }
      } catch (error) {
        console.error("Failed to fetch request data:", error)
        setError("無法獲取申請資料，請稍後再試")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId])

  const handleQuantityChange = (itemId: string, value: number) => {
    setAvailableItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          return { ...item, availableQuantity: value }
        }
        return item
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBuilding) {
      toast({
        title: "請選擇大樓",
        description: "請選擇您所管理的大樓",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await submitBuildingResponse(requestId, {
        buildingId: selectedBuilding,
        items: availableItems,
      })

      if (response.success) {
        setIsSubmitted(true)
        toast({
          title: "提交成功",
          description: "您的回覆已成功提交",
        })
      } else {
        toast({
          title: "提交失敗",
          description: response.error?.message || "無法提交回覆，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to submit response:", error)
      toast({
        title: "提交失敗",
        description: "無法提交回覆，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>
        <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold">錯誤</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl">回覆已提交</CardTitle>
            <CardDescription>感謝您的回覆，總務處將根據您提供的資訊進行器材分配。</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>您可以關閉此頁面。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>
        <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold">找不到申請</h2>
        <p className="mb-4 text-muted-foreground">無法找到指定的申請資料</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image src="/images/ntunhs_icon.png" alt="NTUNHS Logo" width={80} height={80} className="rounded-md" />
          </div>
          <CardTitle className="text-2xl text-center">器材借用詢問表</CardTitle>
          <CardDescription className="text-center">請填寫您所管理大樓可提供的器材數量</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="rounded-md border p-4 bg-muted/30">
              <h3 className="font-medium mb-2">申請資訊</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">申請 #{requestData.requestId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">申請人：</span>
                    <span>{requestData.username}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">借用日期：</span>
                    <span>
                      {formatDate(requestData.startDate)} - {formatDate(requestData.endDate)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">使用場地：</span>
                  <span>{requestData.venue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">使用用途：</span>
                  <p className="mt-1 whitespace-pre-line">{requestData.purpose}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="building">請選擇您所管理的大樓</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="選擇大樓" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestData.buildings.map((building) => (
                      <SelectItem key={building.buildingId} value={building.buildingId}>
                        {building.buildingName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>請填寫可提供的器材數量</Label>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">器材名稱</th>
                        <th className="px-4 py-2 text-center">申請數量</th>
                        <th className="px-4 py-2 text-center">可提供數量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestData.items.map((item, index) => (
                        <tr key={item.itemId} className={index !== requestData.items.length - 1 ? "border-b" : ""}>
                          <td className="px-4 py-2">{item.equipmentName}</td>
                          <td className="px-4 py-2 text-center">{item.requestedQuantity}</td>
                          <td className="px-4 py-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              value={
                                availableItems.find((i) => i.itemId === item.itemId)?.availableQuantity.toString() ||
                                "0"
                              }
                              onChange={(e) =>
                                handleQuantityChange(item.itemId, Math.max(0, Number.parseInt(e.target.value) || 0))
                              }
                              className="w-20 mx-auto text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  請填寫您所管理大樓可提供的器材數量，如果無法提供某項器材，請填寫 0。
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交回覆"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
