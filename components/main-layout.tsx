"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { ThemeSwitch } from "@/components/theme-switch"
import { useTheme } from "next-themes"
import { THEME_STORAGE_KEY } from "@/components/theme-provider"
import {
  Menu,
  User,
  LogOut,
  ChevronDown,
  Home,
  ClipboardList,
  Building2,
  Package,
  Settings,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserInfo, logoutUser } from "@/lib/api/auth"
import type { UserInfo } from "@/lib/types"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null

  const profileRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Apply stored theme on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      // Apply the theme to the HTML element directly for immediate effect
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(storedTheme)

      // Also set it in the theme context
      if (theme !== storedTheme) {
        setTheme(storedTheme)
      }
    }
  }, [setTheme, theme])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await getUserInfo()
        if (response.success) {
          setUserInfo(response.data)
        } else {
          // Token might be invalid or expired
          localStorage.removeItem("token")
          localStorage.removeItem("role")
          router.push("/login")
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error)
        toast({
          title: "錯誤",
          description: "無法獲取使用者資訊，請重新登入",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [router, toast])

  const handleLogout = () => {
    try {
      // Save the current theme before logout
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY)

      logoutUser().then(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")

        // Restore the theme after clearing localStorage
        if (currentTheme) {
          localStorage.setItem(THEME_STORAGE_KEY, currentTheme)
        }

        router.push("/login")
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (role) {
      case "applicant":
        return [
          { href: "/applicant/dashboard", label: "儀表板", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/applicant/requests", label: "我的申請", icon: <ClipboardList className="h-5 w-5" /> },
          { href: "/applicant/new-request", label: "新增申請", icon: <Package className="h-5 w-5" /> },
        ]
      case "academic_staff":
        return [
          { href: "/academic-staff/dashboard", label: "儀表板", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/academic-staff/requests", label: "申請管理", icon: <ClipboardList className="h-5 w-5" /> },
          { href: "/academic-staff/buildings", label: "大樓管理", icon: <Building2 className="h-5 w-5" /> },
          { href: "/academic-staff/equipments", label: "器材管理", icon: <Package className="h-5 w-5" /> },
        ]
      case "system_admin":
        return [
          { href: "/admin/dashboard", label: "儀表板", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/admin/users", label: "使用者管理", icon: <User className="h-5 w-5" /> },
          { href: "/admin/line-settings", label: "LINE 設定", icon: <ClipboardList className="h-5 w-5" /> },
          { href: "/admin/smtp-settings", label: "郵件設定", icon: <ClipboardList className="h-5 w-5" /> },
          { href: "/admin/system-settings", label: "系統設定", icon: <Settings className="h-5 w-5" /> },
          { href: "/admin/system-logs", label: "系統日誌", icon: <ClipboardList className="h-5 w-5" /> },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on profile or dropdown
      if (
        (profileRef.current && profileRef.current.contains(event.target as Node)) ||
        (dropdownRef.current && dropdownRef.current.contains(event.target as Node))
      ) {
        return
      }

      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Determine the home route based on user role
  const getHomeRoute = () => {
    switch (role) {
      case "applicant":
        return "/applicant/dashboard"
      case "academic_staff":
        return "/academic-staff/dashboard"
      case "system_admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">開啟選單</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    <span className="font-semibold">總務處器材借用系統</span>
                  </div>
                </div>
                <nav className="flex flex-col gap-1 p-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 hidden sm:block" />
              <Link href={getHomeRoute()} className="text-base sm:text-lg font-semibold truncate">
                總務處器材借用系統
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitch />
            <div className="relative">
              <div
                ref={profileRef}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted cursor-pointer"
                onClick={toggleDropdown}
              >
                <span className="text-sm font-medium">{userInfo?.username || "使用者"}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-background shadow-md"
                >
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      登出
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) - Fixed width */}
        <aside className="hidden w-64 flex-shrink-0 border-r bg-muted/40 lg:block">
          <nav className="flex flex-col gap-1 p-4 sticky top-16">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : pathname.startsWith(item.href + "/")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
