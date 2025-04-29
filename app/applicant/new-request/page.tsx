"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { getEquipmentsList } from "@/lib/api/equipments"
import { createRequest } from "@/lib/api/requests"
import type { Equipment } from "@/lib/types"

export default function NewRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [venue, setVenue] = useState("")
  const [purpose, setPurpose] = useState("")
  const [items, setItems] = useState<{ equipmentId: string; quantity: number }[]>([{ equipmentId: "", quantity: 1 }])

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await getEquipmentsList()
        if (response.success) {
          setEquipments(response.data.equipments)
        } else {
          toast({
            title: "錯誤",
            description: "無法獲取器材列表，請稍後再試",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch equipments:", error)
        toast({
          title: "錯誤",
          description: "無法獲取器材列表，請稍後再試",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEquipments()
  }, [toast])

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)

    // If end date is before the new start date, clear it
    if (endDate && endDate < newStartDate) {
      setEndDate("")
    }
  }

  const handleAddItem = () => {
    setItems([...items, { equipmentId: "", quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: "equipmentId" | "quantity", value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!startDate || !endDate || !venue || !purpose) {
      toast({
        title: "表單不完整",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate items
    const validItems = items.filter((item) => item.equipmentId && item.quantity > 0)
    if (validItems.length === 0) {
      toast({
        title: "表單不完整",
        description: "請至少選擇一項器材",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await createRequest({
        startDate,
        endDate,
        venue,
        purpose,
        items: validItems,
      })

      if (response.success) {
        toast({
          title: "申請成功",
          description: "您的器材借用申請已提交",
        })
        router.push(`/applicant/requests/${response.data.requestId}`)
      } else {
        // Display the specific error message from the server
        toast({
          title: "申請失敗",
          description: response.error?.message || "無法提交申請，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create request:", error)

      // Try to extract error message if it's a string representation of JSON
      let errorMessage = "無法提交申請，請稍後再試"

      if (error instanceof Error && error.message) {
        try {
          // Try to parse the error message as JSON
          const errorData = JSON.parse(error.message)
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const messages = errorData.detail.map((item: any) => item.msg).filter(Boolean)
            if (messages.length > 0) {
              errorMessage = messages.join("; ")
            }
          }
        } catch (e) {
          // If parsing fails, just use the error message directly
          errorMessage = error.message
        }
      }

      toast({
        title: "申請失敗",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate minimum start date (T+2)
  const calculateMinStartDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 2) // Add 2 days to today
    return minDate.toISOString().split("T")[0] // Format as YYYY-MM-DD
  }

  const minStartDate = calculateMinStartDate()

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增器材借用申請</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>填寫借用資訊</CardTitle>
            <CardDescription>請填寫器材借用的相關資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">借用開始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  min={minStartDate}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  借用開始日期必須至少為 {formatDateForDisplay(minStartDate)} (T+2)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">借用結束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || minStartDate}
                  disabled={!startDate}
                  required
                />
                {!startDate && <p className="text-xs text-muted-foreground mt-1">請先選擇借用開始日期</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">使用場地/使用地點</Label>
              <Input
                id="venue"
                placeholder="請輸入使用場地或地點"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">使用用途說明</Label>
              <Textarea
                id="purpose"
                placeholder="請詳細說明使用用途"
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>借用器材</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增器材
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`equipment-${index}`}>器材種類</Label>
                        <Select
                          value={item.equipmentId}
                          onValueChange={(value) => handleItemChange(index, "equipmentId", value)}
                        >
                          <SelectTrigger id={`equipment-${index}`}>
                            <SelectValue placeholder="選擇器材" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipments
                              .filter(
                                (equipment) =>
                                  // Show this equipment if it's not selected in any other dropdown
                                  // or if it's currently selected in this dropdown
                                  !items.some(
                                    (item, idx) => item.equipmentId === equipment.equipmentId && idx !== index,
                                  ),
                              )
                              .map((equipment) => (
                                <SelectItem key={equipment.equipmentId} value={equipment.equipmentId}>
                                  {equipment.equipmentName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {items[index].equipmentId && (
                          <p className="text-xs text-muted-foreground mt-1">已選擇的器材不會在其他選項中顯示</p>
                        )}
                      </div>
                      <div className="w-24 space-y-2">
                        <Label htmlFor={`quantity-${index}`}>數量</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交申請"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
