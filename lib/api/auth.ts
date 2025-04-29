import { API_BASE_URL } from "@/lib/config"

export interface LoginParams {
  username: string
  password: string
  selectedRole?: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    role?: string
    roles?: string[]
    needRoleSelection?: boolean
    redirectUrl?: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface UserInfoResponse {
  success: boolean
  data?: {
    userId: string
    username: string
    role: string
    allRoles: string[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function loginUser(params: LoginParams): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return { success: true }
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "使用者未登入",
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get user info error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
