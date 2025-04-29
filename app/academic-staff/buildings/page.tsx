"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Loader2, Plus, Pencil, Trash2, Building2 } from "lucide-react"
import {
  getBuildingsList,
  createBuilding,
  updateBuilding,
  toggleBuildingStatus,
  deleteBuilding,
} from "@/lib/api/buildings"
import type { Building } from "@/lib/types"

export default function BuildingsPage() {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newBuildingName, setNewBuildingName] = useState("")
  const [editBuildingId, setEditBuildingId] = useState("")
  const [editBuildingName, setEditBuildingName] = useState("")
  const [deleteBuildingId, setDeleteBuildingId] = useState("")
  const [deleteBuildingName, setDeleteBuildingName] = useState("")
  const [includeDisabled, setIncludeDisabled] = useState(true)

  const fetchBuildings = async () => {
    setIsLoading(true)
    try {
      const response = await getBuildingsList(includeDisabled)
      if (response.success) {
        setBuildings(response.data.buildings)
      } else {
        toast({
          title: "錯誤",
          description: "無法獲取大樓列表，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch buildings:", error)
      toast({
        title: "錯誤",
        description: "無法獲取大樓列表，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBuildings()
  }, [includeDisabled, toast])

  const handleAddBuilding = async () => {
    if (!newBuildingName.trim()) {
      toast({
        title: "請輸入大樓名稱",
        description: "大樓名稱不能為空",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createBuilding({ buildingName: newBuildingName })
      if (response.success) {
        toast({
          title: "新增成功",
          description: "大樓已成功新增",
        })
        setNewBuildingName("")
        setShowAddDialog(false)
        fetchBuildings()
      } else {
        toast({
          title: "新增失敗",
          description: response.error?.message || "無法新增大樓，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add building:", error)
      toast({
        title: "新增失敗",
        description: "無法新增大樓，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditBuilding = async () => {
    if (!editBuildingName.trim()) {
      toast({
        title: "請輸入大樓名稱",
        description: "大樓名稱不能為空",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await updateBuilding(editBuildingId, { buildingName: editBuildingName })
      if (response.success) {
        toast({
          title: "更新成功",
          description: "大樓資訊已成功更新",
        })
        setShowEditDialog(false)
        fetchBuildings()
      } else {
        toast({
          title: "更新失敗",
          description: response.error?.message || "無法更新大樓資訊，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update building:", error)
      toast({
        title: "更新失敗",
        description: "無法更新大樓資訊，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (buildingId: string, enabled: boolean) => {
    try {
      const response = await toggleBuildingStatus(buildingId, enabled)
      if (response.success) {
        toast({
          title: enabled ? "已啟用" : "已停用",
          description: `大樓已成功${enabled ? "啟用" : "停用"}`,
        })
        fetchBuildings()
      } else {
        toast({
          title: "操作失敗",
          description: response.error?.message || "無法更改大樓狀態，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to toggle building status:", error)
      toast({
        title: "操作失敗",
        description: "無法更改大樓狀態，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBuilding = async () => {
    setIsSubmitting(true)
    try {
      const response = await deleteBuilding(deleteBuildingId)
      if (response.success) {
        toast({
          title: "刪除成功",
          description: "大樓已成功刪除",
        })
        setShowDeleteDialog(false)
        fetchBuildings()
      } else {
        toast({
          title: "刪除失敗",
          description: response.error?.message || "無法刪除大樓，請稍後再試",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete building:", error)
      toast({
        title: "刪除失敗",
        description: "無法刪除大樓，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (building: Building) => {
    setEditBuildingId(building.buildingId)
    setEditBuildingName(building.buildingName)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (building: Building) => {
    setDeleteBuildingId(building.buildingId)
    setDeleteBuildingName(building.buildingName)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">大樓管理</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增大樓
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增大樓</DialogTitle>
              <DialogDescription>請輸入新大樓的名稱</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="buildingName">大樓名稱</Label>
                <Input
                  id="buildingName"
                  placeholder="請輸入大樓名稱"
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
                取消
              </Button>
              <Button onClick={handleAddBuilding} disabled={isSubmitting}>
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
          <CardTitle>大樓列表</CardTitle>
          <CardDescription>管理系統中的所有大樓</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Switch id="includeDisabled" checked={includeDisabled} onCheckedChange={setIncludeDisabled} />
            <Label htmlFor="includeDisabled">顯示已停用的大樓</Label>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : buildings.length > 0 ? (
            <div className="space-y-4">
              {buildings.map((building) => (
                <div
                  key={building.buildingId}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    !building.enabled ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Building2 className={`h-6 w-6 ${!building.enabled ? "text-muted-foreground" : "text-primary"}`} />
                    <div>
                      <p className="font-medium">{building.buildingName}</p>
                      <p className="text-sm text-muted-foreground">
                        建立時間: {new Date(building.createdAt).toLocaleString("zh-TW")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={building.enabled}
                        onCheckedChange={(checked) => handleToggleStatus(building.buildingId, checked)}
                      />
                      <span className="text-sm">{building.enabled ? "啟用" : "停用"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(building)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(building)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">沒有找到大樓</h3>
              <p className="text-sm text-muted-foreground">目前系統中沒有任何大樓，請點擊「新增大樓」按鈕新增</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯大樓</DialogTitle>
            <DialogDescription>修改大樓資訊</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editBuildingName">大樓名稱</Label>
              <Input
                id="editBuildingName"
                placeholder="請輸入大樓名稱"
                value={editBuildingName}
                onChange={(e) => setEditBuildingName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button onClick={handleEditBuilding} disabled={isSubmitting}>
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
            <AlertDialogTitle>確定要刪除此大樓嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              您即將刪除「{deleteBuildingName}」。此操作無法復原，且可能會影響相關的器材借用申請。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBuilding} disabled={isSubmitting}>
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
