"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react"
import {
  getEquipmentsList,
  createEquipment,
  updateEquipment,
  toggleEquipmentStatus,
  deleteEquipment,
} from "@/lib/api/equipments"
import type { Equipment } from "@/lib/types"

export default function EquipmentsPage() {
  const { toast } = useToast()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newEquipmentName, setNewEquipmentName] = useState("")
  const [newEquipmentDescription, setNewEquipmentDescription] = useState("")
  const [editEquipmentId, setEditEquipmentId] = useState("")
  const [editEquipmentName, setEditEquipmentName] = useState("")
  const [editEquipmentDescription, setEditEquipmentDescription] = useState("")
  const [deleteEquipmentId, setDeleteEquipmentId] = useState("")
  const [deleteEquipmentName, setDeleteEquipmentName] = useState("")
  const [includeDisabled, setIncludeDisabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEquipments = async () => {
    setIsLoading(true)
    try {
      const response = await getEquipmentsList(includeDisabled)
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

  useEffect(() => {
    fetchEquipments()
  }, [includeDisabled, toast])

  const handleAddEquipment = async () => {
    if (!newEquipmentName.trim()) {
      toast({
        title: "請輸入器材名稱",
        description: "器材名稱不能為空",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createEquipment({
        equipmentName: newEquipmentName,
        description: newEquipmentDescription || undefined,
      })
      if (response.success) {
        toast({
          title: "新增成功",
          description: "器材已成功新增",
        })
        setNewEquipmentName("")
        setNewEquipmentDescription("")
        setShowAddDialog(false)
        fetchEquipments()
      } else {
        toast({
          title: "新增失敗",
          description: response.error?.message || "無法新增器材，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add equipment:", error)
      toast({
        title: "新增失敗",
        description: "無法新增器材，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditEquipment = async () => {
    if (!editEquipmentName.trim()) {
      toast({
        title: "請輸入器材名稱",
        description: "器材名稱不能為空",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await updateEquipment(editEquipmentId, {
        equipmentName: editEquipmentName,
        description: editEquipmentDescription || undefined,
      })
      if (response.success) {
        toast({
          title: "更新成功",
          description: "器材資訊已成功更新",
        })
        setShowEditDialog(false)
        fetchEquipments()
      } else {
        toast({
          title: "更新失敗",
          description: response.error?.message || "無法更新器材資訊，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update equipment:", error)
      toast({
        title: "更新失敗",
        description: "無法更新器材資訊，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (equipmentId: string, enabled: boolean) => {
    try {
      const response = await toggleEquipmentStatus(equipmentId, enabled)
      if (response.success) {
        toast({
          title: enabled ? "已啟用" : "已停用",
          description: `器材已成功${enabled ? "啟用" : "停用"}`,
        })
        fetchEquipments()
      } else {
        toast({
          title: "操作失敗",
          description: response.error?.message || "無法更改器材狀態，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to toggle equipment status:", error)
      toast({
        title: "操作失敗",
        description: "無法更改器材狀態，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEquipment = async () => {
    setIsSubmitting(true)
    try {
      const response = await deleteEquipment(deleteEquipmentId)
      if (response.success) {
        toast({
          title: "刪除成功",
          description: "器材已成功刪除",
        })
        setShowDeleteDialog(false)
        fetchEquipments()
      } else {
        toast({
          title: "刪除失敗",
          description: response.error?.message || "無法刪除器材，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete equipment:", error)
      toast({
        title: "刪除失敗",
        description: "無法刪除器材，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (equipment: Equipment) => {
    setEditEquipmentId(equipment.equipmentId)
    setEditEquipmentName(equipment.equipmentName)
    setEditEquipmentDescription(equipment.description || "")
    setShowEditDialog(true)
  }

  const openDeleteDialog = (equipment: Equipment) => {
    setDeleteEquipmentId(equipment.equipmentId)
    setDeleteEquipmentName(equipment.equipmentName)
    setShowDeleteDialog(true)
  }

  const filteredEquipments = searchQuery
    ? equipments.filter(
        (equipment) =>
          equipment.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (equipment.description && equipment.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : equipments

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">器材管理</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增器材
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增器材</DialogTitle>
              <DialogDescription>請輸入新器材的資訊</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentName">器材名稱</Label>
                <Input
                  id="equipmentName"
                  placeholder="請輸入器材名稱"
                  value={newEquipmentName}
                  onChange={(e) => setNewEquipmentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentDescription">器材描述 (選填)</Label>
                <Textarea
                  id="equipmentDescription"
                  placeholder="請輸入器材描述"
                  value={newEquipmentDescription}
                  onChange={(e) => setNewEquipmentDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
                取消
              </Button>
              <Button onClick={handleAddEquipment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  "新增"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>器材列表</CardTitle>
          <CardDescription>管理系統中的所有器材</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="includeDisabled" checked={includeDisabled} onCheckedChange={setIncludeDisabled} />
              <Label htmlFor="includeDisabled">顯示已停用的器材</Label>
            </div>
            <div>
              <Input placeholder="搜尋器材..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredEquipments.length > 0 ? (
            <div className="space-y-4">
              {filteredEquipments.map((equipment) => (
                <div
                  key={equipment.equipmentId}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    !equipment.enabled ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Package className={`h-6 w-6 ${!equipment.enabled ? "text-muted-foreground" : "text-primary"}`} />
                    <div>
                      <p className="font-medium">{equipment.equipmentName}</p>
                      {equipment.description && (
                        <p className="text-sm text-muted-foreground">{equipment.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        更新時間: {new Date(equipment.updatedAt).toLocaleString("zh-TW")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={equipment.enabled}
                        onCheckedChange={(checked) => handleToggleStatus(equipment.equipmentId, checked)}
                      />
                      <span className="text-sm">{equipment.enabled ? "啟用" : "停用"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(equipment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(equipment)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">沒有找到器材</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "沒有符合搜尋條件的器材" : "目前系統中沒有任何器材，請點擊「新增器材」按鈕新增"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯器材</DialogTitle>
            <DialogDescription>修改器材資訊</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editEquipmentName">器材名稱</Label>
              <Input
                id="editEquipmentName"
                placeholder="請輸入器材名稱"
                value={editEquipmentName}
                onChange={(e) => setEditEquipmentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEquipmentDescription">器材描述 (選填)</Label>
              <Textarea
                id="editEquipmentDescription"
                placeholder="請輸入器材描述"
                value={editEquipmentDescription}
                onChange={(e) => setEditEquipmentDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button onClick={handleEditEquipment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                "儲存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此器材嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              您即將刪除「{deleteEquipmentName}」。此操作無法復原，且可能會影響相關的器材借用申請。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                "確定刪除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
