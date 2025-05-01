"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { RoleSelectionDialog } from "@/components/role-selection-dialog"
import { ThemeSwitch } from "@/components/theme-switch"
import { loginUser } from "@/lib/api/auth"
import { THEME_STORAGE_KEY } from "@/components/theme-provider"
import { errorToast } from "@/lib/utils/toast-helper"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [token, setToken] = useState("")
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)

    // Get the stored theme from localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      // Apply the theme to the HTML element directly for immediate effect
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(storedTheme)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await loginUser({ username, password })

      if (response.success) {
        // Preserve the current theme when logging in
        const currentTheme = localStorage.getItem(THEME_STORAGE_KEY)

        if (response.data.needRoleSelection) {
          // User has multiple roles, show role selection dialog
          setToken(response.data.token)
          setAvailableRoles(response.data.roles)
          setShowRoleSelection(true)
        } else {
          // User has a single role, redirect to appropriate dashboard
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("role", response.data.role)

          // Ensure theme is preserved during navigation
          if (currentTheme) {
            localStorage.setItem(THEME_STORAGE_KEY, currentTheme)
          }

          // Determine redirect URL based on role if not provided in response
          const redirectUrl = response.data.redirectUrl || getRedirectUrlForRole(response.data.role)
          router.push(redirectUrl)
        }
      } else {
        errorToast({
          title: "登入失敗",
          description: response.error?.message || "請檢查您的帳號密碼",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      // Check if error has a response property that might contain our API error
      let errorMessage = "連線伺服器時發生錯誤，請稍後再試"

      if (error instanceof Error) {
        // Try to parse the error message if it's JSON
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.detail && errorData.detail.error && errorData.detail.error.message) {
            errorMessage = errorData.detail.error.message
          }
        } catch (e) {
          // If parsing fails, use the original error message
          errorMessage = error.message || errorMessage
        }
      }

      errorToast({
        title: "登入失敗",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRedirectUrlForRole = (role: string): string => {
    const redirectMap: Record<string, string> = {
      applicant: "/applicant/dashboard",
      academic_staff: "/academic-staff/dashboard",
      building_manager: "/building-manager/dashboard",
      system_admin: "/admin/dashboard",
    }
    return redirectMap[role] || "/"
  }

  const handleRoleSelect = (selectedRole: string) => {
    // Preserve the current theme when selecting a role
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY)

    localStorage.setItem("token", token)
    localStorage.setItem("role", selectedRole)

    // Ensure theme is preserved during navigation
    if (currentTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme)
    }

    // Redirect based on selected role
    const redirectMap: Record<string, string> = {
      applicant: "/applicant/dashboard",
      academic_staff: "/academic-staff/dashboard",
      system_admin: "/admin/dashboard",
    }

    router.push(redirectMap[selectedRole] || "/")
    setShowRoleSelection(false)
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}
    >
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/ntunhs_icon.png" alt="NTUNHS Logo" width={80} height={80} className="rounded-md" />
          </div>
          <CardTitle className="text-2xl">總務處器材借用管理系統</CardTitle>
          <CardDescription>請使用學校帳號密碼登入</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">帳號</Label>
              <Input
                id="username"
                placeholder="請輸入帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                "登入"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {showRoleSelection && (
        <RoleSelectionDialog
          roles={availableRoles}
          onSelect={handleRoleSelect}
          open={showRoleSelection}
          onOpenChange={setShowRoleSelection}
        />
      )}
    </div>
  )
}
