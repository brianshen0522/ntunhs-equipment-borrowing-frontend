import { API_BASE_URL } from "@/lib/config"

// User Management
export interface User {
  userId: string
  username: string
  roles: string[]
  createdAt: string
}

export interface UsersListResponse {
  success: boolean
  data?: {
    users: User[]
    total: number
    page: number
    limit: number
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface ManageUserRoleParams {
  action: "grant" | "revoke"
  role: string
}

export interface ManageUserRoleResponse {
  success: boolean
  data?: {
    userId: string
    username: string
    roles: string[]
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// LINE Bot Settings
export interface LineBotSettings {
  channelAccessToken: string
  targetId: string
  notificationTemplates: {
    buildingManagerRequest: string
    allocationComplete: string
  }
}

export interface LineBotSettingsResponse {
  success: boolean
  data?: LineBotSettings
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface LineBotTestResponse {
  success: boolean
  data?: {
    botInfo: {
      displayName: string
    }
    connectionStatus: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// SMTP Settings
export interface SmtpSettings {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  senderEmail: string
  senderName: string
  emailTemplates: {
    approvalNotification: {
      subject: string
      body: string
    }
  }
}

export interface SmtpSettingsResponse {
  success: boolean
  data?: SmtpSettings
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface SmtpTestParams {
  testEmail: string
}

export interface SmtpTestResponse {
  success: boolean
  data?: {
    connectionStatus: string
    messageSent: boolean
    recipientEmail: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// System Parameters
export interface SystemParameters {
  parameters: {
    requestExpiryDays?: number
    responseFormValidityHours?: number
    maxItemsPerRequest?: number
    enableEmailNotifications?: boolean
    enableLineNotifications?: boolean
    systemMaintenanceMode?: boolean
    [key: string]: any
  }
}

export interface SystemParametersResponse {
  success: boolean
  data?: SystemParameters
  error?: {
    code: string
    message: string
    details?: any
  }
}

// System Logs
export interface SystemLog {
  id: string
  timestamp: string
  level: string
  component: string
  message: string
  details?: any
  userId?: string
  ipAddress?: string
}

export interface SystemLogsResponse {
  success: boolean
  data?: {
    logs: SystemLog[]
    total: number
    page: number
    limit: number
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// User Management API
export async function getUsers(params: {
  page?: number
  limit?: number
  query?: string
  role?: string
  sortBy?: string
  sortOrder?: string
}): Promise<UsersListResponse> {
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

    // Build query string
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.query) queryParams.append("query", params.query)
    if (params.role) queryParams.append("role", params.role)
    if (params.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/admin/users${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get users error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function manageUserRole(userId: string, params: ManageUserRoleParams): Promise<ManageUserRoleResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Manage user role error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// LINE Bot Settings API
export async function getLineBotSettings(): Promise<LineBotSettingsResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/line-bot-settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get LINE bot settings error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function updateLineBotSettings(settings: LineBotSettings): Promise<{
  success: boolean
  data?: { updated: boolean }
  error?: {
    code: string
    message: string
    details?: any
  }
}> {
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

    const response = await fetch(`${API_BASE_URL}/admin/line-bot-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    })

    return await response.json()
  } catch (error) {
    console.error("Update LINE bot settings error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function testLineBot(): Promise<LineBotTestResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/line-bot-test`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Test LINE bot error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// SMTP Settings API
export async function getSmtpSettings(): Promise<SmtpSettingsResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/smtp-settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get SMTP settings error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function updateSmtpSettings(settings: SmtpSettings): Promise<{
  success: boolean
  data?: { updated: boolean }
  error?: {
    code: string
    message: string
    details?: any
  }
}> {
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

    const response = await fetch(`${API_BASE_URL}/admin/smtp-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    })

    return await response.json()
  } catch (error) {
    console.error("Update SMTP settings error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function testSmtp(params: SmtpTestParams): Promise<SmtpTestResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/smtp-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Test SMTP error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// System Parameters API
export async function getSystemParameters(): Promise<SystemParametersResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/system-parameters`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get system parameters error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

export async function updateSystemParameters(params: SystemParameters): Promise<{
  success: boolean
  data?: { updated: boolean }
  error?: {
    code: string
    message: string
    details?: any
  }
}> {
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

    const response = await fetch(`${API_BASE_URL}/admin/system-parameters`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    return await response.json()
  } catch (error) {
    console.error("Update system parameters error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// System Logs API
export async function getSystemLogs(params: {
  startDate?: string
  endDate?: string
  start_date?: string
  end_date?: string
  level?: string
  component?: string
  user_id?: string
  page?: number
  limit?: number
}): Promise<SystemLogsResponse> {
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

    // Build query string
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)
    if (params.start_date) queryParams.append("start_date", params.start_date)
    if (params.end_date) queryParams.append("end_date", params.end_date)
    if (params.level && params.level !== "all") queryParams.append("level", params.level)
    if (params.component && params.component !== "all") queryParams.append("component", params.component)
    if (params.user_id && params.user_id !== "all") queryParams.append("user_id", params.user_id)
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/admin/system-logs${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get system logs error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}

// System Status API
export interface ServiceStatus {
  status: "healthy" | "error" | string
  responseTime: number | null
  lastWebhookReceived: string | null
  lastEmailSent: string | null
  lastSuccessfulAuth: string | null
  error: string | null
}

export interface SystemStatusResponse {
  success: boolean
  data?: {
    database: ServiceStatus
    lineBot: ServiceStatus
    emailService: ServiceStatus
    ssoIntegration: ServiceStatus
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
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

    const response = await fetch(`${API_BASE_URL}/admin/system-status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Get system status error:", error)
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "網路連線錯誤，請稍後再試",
      },
    }
  }
}
