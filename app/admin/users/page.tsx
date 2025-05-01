"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreHorizontal, UserPlus, UserMinus } from "lucide-react"
import { getUsers, manageUserRole, type User } from "@/lib/api/admin"
import { successToast, errorToast } from "@/lib/utils/toast-helper"

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await getUsers({
        page,
        limit,
        query: searchQuery,
        role: roleFilter,
        sortBy,
        sortOrder,
      })

      if (response.success && response.data) {
        setUsers(response.data.users)
        setTotal(response.data.total)
      } else {
        errorToast({
          title: "錯誤",
          description: response.error?.message || "無法獲取使用者列表",
        })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      errorToast({
        title: "錯誤",
        description: "無法獲取使用者列表",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit, roleFilter, sortBy, sortOrder])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleRoleChange = async (userId: string, action: "grant" | "revoke", role: string) => {
    try {
      const response = await manageUserRole(userId, { action, role })
      if (response.success) {
        successToast({
          title: "成功",
          description: `已${action === "grant" ? "授予" : "撤銷"}使用者角色`,
        })
        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId
              ? {
                  ...user,
                  roles: action === "grant" ? [...user.roles, role] : user.roles.filter((r) => r !== role),
                }
              : user,
          ),
        )
      } else {
        errorToast({
          title: "錯誤",
          description: response.error?.message || "無法更新使用者角色",
        })
      }
    } catch (error) {
      console.error("Failed to manage user role:", error)
      errorToast({
        title: "錯誤",
        description: "無法更新使用者角色",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "system_admin":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "academic_staff":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "applicant":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "system_admin":
        return "系統管理員"
      case "academic_staff":
        return "教務處人員"
      case "applicant":
        return "申請人"
      default:
        return role
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">使用者管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用者列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="搜尋使用者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button type="submit" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full max-w-[200px]">
                <SelectValue placeholder="所有角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="system_admin">系統管理員</SelectItem>
                <SelectItem value="academic_staff">教務處人員</SelectItem>
                <SelectItem value="applicant">申請人</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>使用者 ID</TableHead>
                  <TableHead>使用者名稱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>創建日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      載入中...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      沒有找到使用者
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userId}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {getRoleDisplayName(role)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("zh-TW", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">開啟選單</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!user.roles.includes("system_admin") && (
                              <DropdownMenuItem onClick={() => handleRoleChange(user.userId, "grant", "system_admin")}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span>授予系統管理員角色</span>
                              </DropdownMenuItem>
                            )}
                            {user.roles.includes("system_admin") && (
                              <DropdownMenuItem onClick={() => handleRoleChange(user.userId, "revoke", "system_admin")}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                <span>撤銷系統管理員角色</span>
                              </DropdownMenuItem>
                            )}
                            {!user.roles.includes("academic_staff") && (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.userId, "grant", "academic_staff")}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span>授予教務處人員角色</span>
                              </DropdownMenuItem>
                            )}
                            {user.roles.includes("academic_staff") && (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.userId, "revoke", "academic_staff")}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                <span>撤銷教務處人員角色</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              顯示 {users.length} 個使用者中的 {(page - 1) * limit + 1}-{Math.min(page * limit, total)} 個
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
    </div>
  )
}
